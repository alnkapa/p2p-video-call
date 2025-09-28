export class MediaManager {
    constructor() {
        this.localStream = null;
        this.currentFacingMode = 'user';
        this.videoEnabled = true;
        this.audioEnabled = true;
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    async getUserMedia(constraints = null) {
        try {
            if (!constraints) {
                constraints = {
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        frameRate: { ideal: 24 },
                        facingMode: this.currentFacingMode
                    },
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                };
            }

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.emit('streamReady', this.localStream);
            
        } catch (error) {
            if (error.name === 'OverconstrainedError') {
                console.warn('OverconstrainedError, trying basic constraints');
                return await this.getUserMedia({
                    video: true,
                    audio: true
                });
            }
            this.emit('streamError', error);
            throw new Error('Failed to access camera/microphone: ' + error.message);
        }
    }

    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                this.videoEnabled = !videoTrack.enabled;
                videoTrack.enabled = this.videoEnabled;
                return this.videoEnabled;
            }
        }
        return false;
    }

    toggleAudio() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                this.audioEnabled = !audioTrack.enabled;
                audioTrack.enabled = this.audioEnabled;
                return this.audioEnabled;
            }
        }
        return false;
    }

    async switchCamera() {
        if (!this.localStream) return;

        this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
        
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
            await videoTrack.applyConstraints({
                facingMode: this.currentFacingMode
            });
        }
    }

    cleanup() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
    }
}