export class WebRTCHandler {
    constructor(config) {
        this.peerConnection = null;
        this.config = config;
        this.listeners = {};
        this.isCaller = false;
        this.remoteDescriptionSet = false;
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

    async createPeerConnection(localStream, isCaller) {
        this.isCaller = isCaller;
        this.remoteDescriptionSet = false;
        
        try {
            this.peerConnection = new RTCPeerConnection(this.config);

            // Add local tracks
            localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, localStream);
            });

            // Handle remote stream
            this.peerConnection.ontrack = (event) => {
                console.log('Remote track received:', event.track.kind);
                this.emit('remoteStream', event.streams[0]);
            };

            // ICE candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('ICE candidate:', event.candidate);
                } else {
                    console.log('ICE gathering complete');
                }
            };

            // Connection state
            this.peerConnection.onconnectionstatechange = () => {
                const state = this.peerConnection.connectionState;
                console.log('Connection state:', state);
                this.emit('connectionStateChange', state);
            };

            this.peerConnection.oniceconnectionstatechange = () => {
                const state = this.peerConnection.iceConnectionState;
                console.log('ICE connection state:', state);
                this.emit('iceConnectionStateChange', state);
            };

            this.peerConnection.onsignalingstatechange = () => {
                console.log('Signaling state:', this.peerConnection.signalingState);
            };

            // Create offer if caller
            if (this.isCaller) {
                await this.createOffer();
            }

        } catch (error) {
            console.error('Error creating peer connection:', error);
            this.emit('error', error);
        }
    }

    async createOffer() {
        try {
            console.log('Creating offer...');
            
            const offer = await this.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });
            
            console.log('Offer created:', offer.type);
            await this.peerConnection.setLocalDescription(offer);
            console.log('Local description set');
            
            // Simulate receiving answer (for demo purposes)
            // In real app, this would come from signaling server
            setTimeout(() => {
                this.simulateAnswer(offer);
            }, 1000);
            
        } catch (error) {
            console.error('Error creating offer:', error);
            this.emit('error', error);
        }
    }

    async simulateAnswer(offer) {
        try {
            console.log('Simulating answer...');
            
            // Create a new peer connection for the "remote" side
            const remotePc = new RTCPeerConnection(this.config);
            
            // Add ontrack handler for remote PC
            remotePc.ontrack = (event) => {
                console.log('Remote PC received track:', event.track.kind);
            };
            
            // Set remote description
            await remotePc.setRemoteDescription(offer);
            console.log('Remote description set on simulated peer');
            
            // Create answer
            const answer = await remotePc.createAnswer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });
            
            console.log('Answer created:', answer.type);
            await remotePc.setLocalDescription(answer);
            
            // Set the answer as remote description on our main PC
            await this.setRemoteAnswer(answer);
            
            // Clean up simulated peer
            setTimeout(() => {
                remotePc.close();
            }, 5000);
            
        } catch (error) {
            console.error('Error simulating answer:', error);
            this.emit('error', error);
        }
    }

    async setRemoteAnswer(answer) {
        try {
            if (this.remoteDescriptionSet) {
                console.log('Remote description already set');
                return;
            }
            
            console.log('Setting remote answer:', answer.type);
            await this.peerConnection.setRemoteDescription(answer);
            this.remoteDescriptionSet = true;
            console.log('Remote description set successfully');
            
        } catch (error) {
            console.error('Error setting remote answer:', error);
            this.emit('error', error);
        }
    }

    async addIceCandidate(candidate) {
        try {
            if (this.peerConnection) {
                await this.peerConnection.addIceCandidate(candidate);
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    }

    cleanup() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        this.remoteDescriptionSet = false;
    }
}