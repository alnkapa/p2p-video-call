import { MediaManager } from '../modules/media-manager.js';
import { WebRTCHandler } from '../modules/webrtc-handler.js';
import { MobileOptimizer } from '../modules/mobile-optimizer.js';
import { debounce } from '../modules/utils.js';

class P2PVideoCall extends HTMLElement {
    constructor() {
        super();
        this.isCaller = false;
        this.sessionId = null;
        this.videoEnabled = true;
        this.audioEnabled = true;
        
        this.config = {
            iceServers: [
                {
                    urls: [
                        'stun:stun.l.google.com:19302',
                        'stun:stun1.l.google.com:19302'
                    ]
                }
            ]
        };

        this.mediaManager = new MediaManager();
        this.webrtcHandler = new WebRTCHandler(this.config);
        this.mobileOptimizer = new MobileOptimizer();

        this.attachShadow({ mode: 'open' });
        this.setupEventListeners();
    }

    connectedCallback() {
        this.render();
        this.setupComponentListeners();
        this.checkUrlForSession();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}
            </style>
            <div class="app-container">
                <video-call-header></video-call-header>
                <initiator-form></initiator-form>
                <joiner-form></joiner-form>
                <video-container></video-container>
                <app-footer></app-footer>
            </div>
        `;
    }

    getStyles() {
        return `
            :host {
                display: block;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                --primary-color: #667eea;
                --primary-dark: #5a6fd8;
                --secondary-color: #764ba2;
                --success-color: #27ae60;
                --error-color: #e74c3c;
                --warning-color: #f39c12;
                --bg-color: #f8f9fa;
                --text-color: #333;
                --text-light: #6c757d;
                --border-radius: 12px;
                --shadow: 0 10px 30px rgba(0,0,0,0.1);
                --transition: all 0.3s ease;
            }

            .app-container {
                background: white;
                border-radius: var(--border-radius);
                padding: 2rem;
                box-shadow: var(--shadow);
                max-width: 900px;
                width: 95%;
                margin: 2rem auto;
            }

            @media (max-width: 768px) {
                .app-container {
                    padding: 1.5rem;
                    margin: 0.5rem auto;
                    border-radius: 8px;
                }
            }

            @media (max-width: 480px) {
                .app-container {
                    padding: 1rem;
                    margin: 0;
                    border-radius: 0;
                    width: 100%;
                    min-height: 100vh;
                }
            }

            .hidden {
                display: none !important;
            }

            .fade-in {
                animation: fadeIn 0.3s ease-in;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .status-message {
                text-align: center;
                padding: 1rem;
                border-radius: var(--border-radius);
                background: var(--bg-color);
                margin-bottom: 1rem;
                font-weight: 500;
            }

            .status-message.connected {
                background: rgba(39, 174, 96, 0.1);
                color: var(--success-color);
            }

            .status-message.error {
                background: rgba(231, 76, 60, 0.1);
                color: var(--error-color);
            }

            .status-message.warning {
                background: rgba(243, 156, 18, 0.1);
                color: var(--warning-color);
            }

            @media (max-width: 480px) {
                .status-message {
                    padding: 0.75rem;
                    font-size: 0.9rem;
                }
            }
        `;
    }

    setupComponentListeners() {
        this.shadowRoot.addEventListener('create-call', () => this.createCall());
        this.shadowRoot.addEventListener('join-call', (e) => this.joinCall(e.detail.sessionId));
        this.shadowRoot.addEventListener('end-call', () => this.endCall());
        this.shadowRoot.addEventListener('toggle-video', () => this.toggleVideo());
        this.shadowRoot.addEventListener('toggle-audio', () => this.toggleAudio());
        this.shadowRoot.addEventListener('switch-camera', () => this.switchCamera());
        this.shadowRoot.addEventListener('copy-link', () => this.copyLink());
        this.shadowRoot.addEventListener('show-qr', () => this.toggleQrCode());

        this.mediaManager.on('streamReady', (stream) => this.handleStreamReady(stream));
        this.mediaManager.on('streamError', (error) => this.handleStreamError(error));

        this.webrtcHandler.on('remoteStream', (stream) => this.handleRemoteStream(stream));
        this.webrtcHandler.on('connectionStateChange', (state) => this.handleConnectionState(state));
        this.webrtcHandler.on('iceConnectionStateChange', (state) => this.handleIceConnectionState(state));
    }

    setupEventListeners() {
        this.mobileOptimizer.initialize();
        
        window.addEventListener('resize', debounce(() => {
            this.handleResize();
        }, 250));
    }

    async createCall() {
        try {
            this.updateStatus('Getting media stream...');
            await this.mediaManager.getUserMedia();
            
            this.isCaller = true;
            this.sessionId = this.generateSessionId();
            
            const callUrl = `${window.location.origin}${window.location.pathname}?session=${this.sessionId}`;
            this.showShareLink(callUrl);
            
            this.updateStatus('Creating P2P connection...');
            await this.webrtcHandler.createPeerConnection(this.mediaManager.localStream, this.isCaller);
            
            this.showVideoContainer();
            this.updateStatus('Waiting for participant...');
            
        } catch (error) {
            console.error('Error creating call:', error);
            this.updateStatus('Error: ' + error.message, true);
        }
    }

    async joinCall(sessionId) {
        try {
            this.sessionId = sessionId;
            if (!this.sessionId) {
                alert('Please enter session ID');
                return;
            }

            this.updateStatus('Getting media stream...');
            await this.mediaManager.getUserMedia();
            
            this.isCaller = false;
            
            this.updateStatus('Connecting to session...');
            await this.webrtcHandler.createPeerConnection(this.mediaManager.localStream, this.isCaller);
            
            this.showVideoContainer();
            this.updateStatus('Connection established');
            
        } catch (error) {
            console.error('Error joining call:', error);
            this.updateStatus('Error: ' + error.message, true);
        }
    }

    handleStreamReady(stream) {
        this.setLocalVideoStream(stream);
    }

    handleStreamError(error) {
        this.updateStatus('Media error: ' + error.message, true);
    }

    handleRemoteStream(stream) {
        this.setRemoteVideoStream(stream);
        this.updateRemoteStatus('Connected');
    }

    handleConnectionState(state) {
        this.updateStatus(`Connection state: ${state}`);
        
        if (state === 'connected') {
            this.updateStatus('Connection established', false, true);
        } else if (state === 'disconnected' || state === 'failed') {
            this.updateStatus('Connection lost', true);
        }
    }

    handleIceConnectionState(state) {
        this.updateStatus(`ICE state: ${state}`);
    }

    toggleVideo() {
        this.videoEnabled = this.mediaManager.toggleVideo();
        this.updateVideoButton(this.videoEnabled);
        this.updateVideoIndicator(this.videoEnabled);
        this.updateStatus(this.videoEnabled ? 'Video enabled' : 'Video disabled');
    }

    toggleAudio() {
        this.audioEnabled = this.mediaManager.toggleAudio();
        this.updateAudioButton(this.audioEnabled);
        this.updateAudioIndicator(this.audioEnabled);
        this.updateStatus(this.audioEnabled ? 'Audio enabled' : 'Audio disabled');
    }

    async switchCamera() {
        try {
            await this.mediaManager.switchCamera();
            this.updateStatus('Camera switched');
        } catch (error) {
            console.error('Error switching camera:', error);
            this.updateStatus('Error switching camera', true);
        }
    }

    endCall() {
        this.mobileOptimizer.cleanup();
        this.mediaManager.cleanup();
        this.webrtcHandler.cleanup();
        this.showInitiatorForm();
        this.updateStatus('Call ended');
    }

    copyLink() {
        const callLink = this.shadowRoot.querySelector('#call-link');
        if (callLink) {
            callLink.select();
            document.execCommand('copy');
            alert('Link copied to clipboard!');
        }
    }

    showInitiatorForm() {
        this.hideAll();
        const initiatorForm = this.shadowRoot.querySelector('initiator-form');
        if (initiatorForm) initiatorForm.classList.remove('hidden');
    }

    showJoinerForm() {
        this.hideAll();
        const joinerForm = this.shadowRoot.querySelector('joiner-form');
        if (joinerForm) joinerForm.classList.remove('hidden');
    }

    showVideoContainer() {
        this.hideAll();
        const videoContainer = this.shadowRoot.querySelector('video-container');
        if (videoContainer) {
            videoContainer.classList.remove('hidden');
            videoContainer.classList.add('fade-in');
        }
    }

    hideAll() {
        const components = this.shadowRoot.querySelectorAll('initiator-form, joiner-form, video-container');
        components.forEach(comp => comp.classList.add('hidden'));
    }

    showShareLink(url) {
        const callLink = this.shadowRoot.querySelector('#call-link');
        const shareLink = this.shadowRoot.querySelector('#share-link');
        if (callLink && shareLink) {
            callLink.value = url;
            shareLink.classList.remove('hidden');
        }
        console.log(shareLink)
    }

    setLocalVideoStream(stream) {
        const localVideo = this.shadowRoot.querySelector('#local-video');
        if (localVideo) localVideo.srcObject = stream;
    }

    setRemoteVideoStream(stream) {
        const remoteVideo = this.shadowRoot.querySelector('#remote-video');
        if (remoteVideo) remoteVideo.srcObject = stream;
    }

    updateVideoButton(enabled) {
        const toggleVideoBtn = this.shadowRoot.querySelector('#toggle-video');
        if (toggleVideoBtn) {
            const textElement = toggleVideoBtn.querySelector('.text');
            const iconElement = toggleVideoBtn.querySelector('.icon');
            if (textElement) textElement.textContent = enabled ? 'Turn off video' : 'Turn on video';
            if (iconElement) iconElement.textContent = enabled ? '📹' : '📹🚫';
        }
    }

    updateAudioButton(enabled) {
        const toggleAudioBtn = this.shadowRoot.querySelector('#toggle-audio');
        if (toggleAudioBtn) {
            const textElement = toggleAudioBtn.querySelector('.text');
            const iconElement = toggleAudioBtn.querySelector('.icon');
            if (textElement) textElement.textContent = enabled ? 'Turn off audio' : 'Turn on audio';
            if (iconElement) iconElement.textContent = enabled ? '🎤' : '🎤🚫';
        }
    }

    updateVideoIndicator(enabled) {
        const videoIndicator = this.shadowRoot.querySelector('#video-indicator');
        if (videoIndicator) videoIndicator.classList.toggle('video-off', !enabled);
    }

    updateAudioIndicator(enabled) {
        const audioIndicator = this.shadowRoot.querySelector('#audio-indicator');
        if (audioIndicator) audioIndicator.classList.toggle('audio-off', !enabled);
    }

    updateRemoteStatus(status) {
        const remoteStatus = this.shadowRoot.querySelector('#remote-status');
        if (remoteStatus) remoteStatus.textContent = status;
    }

    updateStatus(message, isError = false, isConnected = false) {
        const status = this.shadowRoot.querySelector('#status');
        if (status) {
            status.textContent = message;
            status.className = 'status-message';
            
            if (isError) {
                status.classList.add('error');
            } else if (isConnected) {
                status.classList.add('connected');
            }
        }
    }

    checkUrlForSession() {
        const urlParams = new URLSearchParams(window.location.search);
        const session = urlParams.get('session');
        
        if (session) {
            const sessionIdInput = this.shadowRoot.querySelector('#session-id');
            if (sessionIdInput) {
                sessionIdInput.value = session;
                this.showJoinerForm();
            }
        }
    }

    handleResize() {
        this.mobileOptimizer.handleResize();
    }

    generateSessionId() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
}

customElements.define('p2p-video-call', P2PVideoCall);