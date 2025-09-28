class P2PVideoCall {
    constructor() {
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.isCaller = false;
        this.sessionId = null;
        this.isMobile = this.detectMobile();
        this.currentFacingMode = 'user';
        this.videoEnabled = true;
        this.audioEnabled = true;
        this.wakeLock = null;
        this.waitingForParticipant = false;
        
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
        
        this.initializeElements();
        this.setupEventListeners();
        this.checkUrlForSession();
        this.setupMobileOptimizations();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    setupMobileOptimizations() {
        if (this.isMobile) {
            document.body.classList.add('mobile');
            console.log('Мобильное устройство обнаружено');
        }

        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        this.setupWakeLock();
        this.setupTouchOptimizations();
    }

    setupTouchOptimizations() {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
            }, { passive: true });
            
            btn.addEventListener('touchend', (e) => {
                e.currentTarget.style.transform = '';
            }, { passive: true });
        });
    }

    async setupWakeLock() {
        if ('wakeLock' in navigator && this.isMobile) {
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock активирован');
            } catch (err) {
                console.log('Wake Lock не поддерживается:', err);
            }
        }
    }

    handleResize() {
        const isNowMobile = window.innerWidth <= 768;
        
        if (isNowMobile !== this.isMobile) {
            this.isMobile = isNowMobile;
            document.body.classList.toggle('mobile', this.isMobile);
            console.log(`Режим изменен: ${this.isMobile ? 'мобильный' : 'десктоп'}`);
        }

        if (this.isMobile && this.videoContainer.classList.contains('hidden') === false) {
            this.optimizeVideoLayout();
        }
    }

    optimizeVideoLayout() {
        const isLandscape = window.innerWidth > window.innerHeight;
        
        if (this.isMobile) {
            if (isLandscape) {
                document.querySelector('.video-grid').style.gridTemplateColumns = '1fr 1fr';
            } else {
                document.querySelector('.video-grid').style.gridTemplateColumns = '1fr';
            }
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    initializeElements() {
        this.initiatorForm = document.getElementById('initiator-form');
        this.joinerForm = document.getElementById('joiner-form');
        this.videoContainer = document.getElementById('video-container');
        
        this.createCallBtn = document.getElementById('create-call');
        this.joinCallBtn = document.getElementById('join-call');
        this.endCallBtn = document.getElementById('end-call');
        this.copyLinkBtn = document.getElementById('copy-link');
        this.toggleVideoBtn = document.getElementById('toggle-video');
        this.toggleAudioBtn = document.getElementById('toggle-audio');
        this.switchCameraBtn = document.getElementById('switch-camera');
        this.showQrBtn = document.getElementById('show-qr');
        
        this.localVideo = document.getElementById('local-video');
        this.remoteVideo = document.getElementById('remote-video');
        
        this.callLink = document.getElementById('call-link');
        this.sessionIdInput = document.getElementById('session-id');
        this.shareLink = document.getElementById('share-link');
        this.status = document.getElementById('status');
        this.qrCode = document.getElementById('qr-code');
        
        this.videoIndicator = document.getElementById('video-indicator');
        this.audioIndicator = document.getElementById('audio-indicator');
        this.remoteStatus = document.getElementById('remote-status');
    }

    setupEventListeners() {
        this.createCallBtn.addEventListener('click', () => this.createCall());
        this.joinCallBtn.addEventListener('click', () => this.joinCall());
        this.endCallBtn.addEventListener('click', () => this.endCall());
        this.copyLinkBtn.addEventListener('click', () => this.copyLink());
        this.toggleVideoBtn.addEventListener('click', () => this.toggleVideo());
        this.toggleAudioBtn.addEventListener('click', () => this.toggleAudio());
        this.switchCameraBtn.addEventListener('click', () => this.switchCamera());
        this.showQrBtn.addEventListener('click', () => this.toggleQrCode());

        if (this.isMobile) {
            this.setupMobileSpecificEvents();
        }
    }

    setupMobileSpecificEvents() {
        window.addEventListener('popstate', (e) => {
            if (!this.videoContainer.classList.contains('hidden')) {
                e.preventDefault();
                this.endCall();
            }
        });

        const inputs = document.querySelectorAll('input[type="text"]');
        inputs.forEach(input => {
            input.addEventListener('touchstart', (e) => {
                e.currentTarget.style.fontSize = '16px';
            });
        });
    }

    async getUserMedia(constraints = null) {
        try {
            if (!constraints) {
                constraints = {
                    video: {
                        width: { ideal: this.isMobile ? 640 : 1280 },
                        height: { ideal: this.isMobile ? 480 : 720 },
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
            this.localVideo.srcObject = this.localStream;

            if (this.isMobile) {
                this.setupAudioOptimizations();
            }

        } catch (error) {
            if (error.name === 'OverconstrainedError') {
                console.warn('OverconstrainedError, пробуем базовые constraints');
                return await this.getUserMedia({
                    video: true,
                    audio: true
                });
            }
            throw new Error('Не удалось получить доступ к камере/микрофону: ' + error.message);
        }
    }

    setupAudioOptimizations() {
        const audioTracks = this.localStream.getAudioTracks();
        if (audioTracks.length > 0 && 'applyConstraints' in audioTracks[0]) {
            try {
                audioTracks[0].applyConstraints({
                    volume: 1.0,
                    autoGainControl: true,
                    echoCancellation: true,
                    noiseSuppression: true
                });
            } catch (e) {
                console.log('Audio constraints не поддерживаются');
            }
        }
    }

    async switchCamera() {
        if (!this.localStream) return;

        try {
            this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
            
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                await videoTrack.applyConstraints({
                    facingMode: this.currentFacingMode
                });
                
                this.updateStatus(`Камера переключена: ${this.currentFacingMode === 'user' ? 'фронтальная' : 'задняя'}`);
            }
        } catch (error) {
            console.error('Ошибка переключения камеры:', error);
            this.updateStatus('Ошибка переключения камеры', true);
        }
    }

    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                this.videoEnabled = !videoTrack.enabled;
                videoTrack.enabled = this.videoEnabled;
                
                this.toggleVideoBtn.querySelector('.text').textContent = 
                    this.videoEnabled ? 'Выкл видео' : 'Вкл видео';
                this.toggleVideoBtn.querySelector('.icon').textContent = 
                    this.videoEnabled ? '📹' : '📹🚫';
                
                this.videoIndicator.classList.toggle('video-off', !this.videoEnabled);
                
                this.updateStatus(this.videoEnabled ? 'Видео включено' : 'Видео выключено');
            }
        }
    }

    toggleAudio() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                this.audioEnabled = !audioTrack.enabled;
                audioTrack.enabled = this.audioEnabled;
                
                this.toggleAudioBtn.querySelector('.text').textContent = 
                    this.audioEnabled ? 'Выкл аудио' : 'Вкл аудио';
                this.toggleAudioBtn.querySelector('.icon').textContent = 
                    this.audioEnabled ? '🎤' : '🎤🚫';
                
                this.audioIndicator.classList.toggle('audio-off', !this.audioEnabled);
                
                this.updateStatus(this.audioEnabled ? 'Аудио включено' : 'Аудио выключено');
            }
        }
    }

    toggleQrCode() {
        if (this.qrCode.classList.contains('hidden')) {
            this.generateQrCode();
        } else {
            this.qrCode.classList.add('hidden');
            this.showQrBtn.textContent = 'Показать QR код';
        }
    }

    generateQrCode() {
        if (!this.callLink.value) return;

        this.qrCode.innerHTML = '';
        this.qrCode.classList.remove('hidden');
        this.showQrBtn.textContent = 'Скрыть QR код';

        QRCode.toCanvas(this.callLink.value, { 
            width: 200,
            height: 200,
            margin: 1
        }, (err, canvas) => {
            if (err) {
                console.error('Ошибка генерации QR кода:', err);
                this.qrCode.innerHTML = '<p>Ошибка генерации QR кода</p>';
                return;
            }
            this.qrCode.appendChild(canvas);
        });
    }

    showInitiatorForm() {
        this.initiatorForm.classList.remove('hidden');
        this.joinerForm.classList.add('hidden');
        this.videoContainer.classList.add('hidden');
    }

    showJoinerForm() {
        this.initiatorForm.classList.add('hidden');
        this.joinerForm.classList.remove('hidden');
        this.videoContainer.classList.add('hidden');
    }

    showVideoContainer() {
        this.initiatorForm.classList.add('hidden');
        this.joinerForm.classList.add('hidden');
        this.videoContainer.classList.remove('hidden');
        this.videoContainer.classList.add('fade-in');
        
        if (this.isMobile) {
            this.optimizeVideoLayout();
            this.lockOrientation();
        }
    }

    async lockOrientation() {
        if (screen.orientation && screen.orientation.lock) {
            try {
                await screen.orientation.lock('landscape');
            } catch (e) {
                console.log('Блокировка ориентации не поддерживается');
            }
        }
    }

    unlockOrientation() {
        if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }
    }

    checkUrlForSession() {
        const urlParams = new URLSearchParams(window.location.search);
        const session = urlParams.get('session');
        
        if (session) {
            this.sessionIdInput.value = session;
            this.showJoinerForm();
        }
    }

    async createCall() {
        try {
            this.updateStatus('Получение медиапотока...');
            await this.getUserMedia();
            
            this.isCaller = true;
            this.sessionId = this.generateSessionId();
            
            const callUrl = `${window.location.origin}${window.location.pathname}?session=${this.sessionId}`;
            this.callLink.value = callUrl;
            this.shareLink.classList.remove('hidden');
            
            this.updateStatus('Создание P2P соединения...');
            await this.createPeerConnection();
            
            this.showVideoContainer();
            this.updateStatus('Ожидание участника...');
            
        } catch (error) {
            console.error('Ошибка создания звонка:', error);
            this.updateStatus('Ошибка: ' + error.message, true);
        }
    }

    async joinCall() {
        try {
            this.sessionId = this.sessionIdInput.value.trim();
            if (!this.sessionId) {
                alert('Пожалуйста, введите ID сессии');
                return;
            }

            this.updateStatus('Получение медиапотока...');
            await this.getUserMedia();
            
            this.isCaller = false;
            
            this.updateStatus('Подключение к сессии...');
            await this.createPeerConnection();
            
            this.showVideoContainer();
            this.updateStatus('Подключение установлено');
            
        } catch (error) {
            console.error('Ошибка подключения:', error);
            this.updateStatus('Ошибка: ' + error.message, true);
        }
    }

    async createPeerConnection() {
        this.peerConnection = new RTCPeerConnection(this.config);

        this.localStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, this.localStream);
        });

        this.peerConnection.ontrack = (event) => {
            this.remoteStream = event.streams[0];
            this.remoteVideo.srcObject = this.remoteStream;
            this.remoteStatus.textContent = 'Подключен';
        };

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('ICE candidate:', event.candidate);
            }
        };

        this.peerConnection.onconnectionstatechange = () => {
            this.updateStatus(`Состояние: ${this.peerConnection.connectionState}`);
            
            if (this.peerConnection.connectionState === 'connected') {
                this.updateStatus('Соединение установлено', false, true);
            } else if (this.peerConnection.connectionState === 'disconnected' || 
                       this.peerConnection.connectionState === 'failed') {
                this.updateStatus('Соединение потеряно', true);
            }
        };

        if (this.isCaller) {
            await this.createOffer();
        }
    }

    async createOffer() {
        try {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            
            setTimeout(() => {
                if (this.peerConnection) {
                    this.handleAnswer(offer);
                }
            }, 1000);
            
        } catch (error) {
            console.error('Ошибка создания offer:', error);
        }
    }

    async handleAnswer(offer) {
        try {
            const answer = {
                type: 'answer',
                sdp: offer.sdp
            };
            
            await this.peerConnection.setRemoteDescription(answer);
            
        } catch (error) {
            console.error('Ошибка обработки answer:', error);
        }
    }

    endCall() {
        this.unlockOrientation();

        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        
        this.localVideo.srcObject = null;
        this.remoteVideo.srcObject = null;
        
        this.showInitiatorForm();
        this.updateStatus('Звонок завершен');
    }

    copyLink() {
        this.callLink.select();
        document.execCommand('copy');
        alert('Ссылка скопирована в буфер обмена!');
    }

    updateStatus(message, isError = false, isConnected = false) {
        this.status.textContent = message;
        this.status.className = 'status-message';
        
        if (isError) {
            this.status.classList.add('error');
        } else if (isConnected) {
            this.status.classList.add('connected');
        }
    }

    generateSessionId() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header h1');
    if (header) {
        header.classList.add('mobile-indicator');
    }

    new P2PVideoCall();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
