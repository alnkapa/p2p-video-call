class VideoContainer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    getStyles() {
        return `
            .hidden {
                display: none !important;
            }

            .fade-in {
                animation: fadeIn var(--transition-normal, 300ms) ease-in;
            }

            @keyframes fadeIn {
                from { 
                    opacity: 0; 
                    transform: translateY(var(--spacing-md, 1rem)); 
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0); 
                }
            }

            .video-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: var(--spacing-md, 1rem);
                margin-bottom: var(--spacing-2xl, 2rem);
            }

            @media (max-width: 768px) {
                .video-grid {
                    grid-template-columns: 1fr;
                    gap: var(--spacing-sm, 0.5rem);
                    margin-bottom: var(--spacing-xl, 1.5rem);
                }
                
                .video-wrapper {
                    aspect-ratio: 4/3;
                    max-height: 50vh;
                }
            }

            @media (max-width: 480px) {
                .video-grid {
                    gap: var(--spacing-xs, 0.25rem);
                margin-bottom: var(--spacing-lg, 1rem);
                padding: 0 var(--spacing-xs, 0.25rem);
                max-width: 100vw;
                    margin-left: calc(-1 * var(--spacing-lg, 1rem));
                    margin-right: calc(-1 * var(--spacing-lg, 1rem));
                    width: calc(100% + 2 * var(--spacing-lg, 1rem));
                }
                
                .video-wrapper {
                    max-height: 45vh;
                    border-radius: 0;
                }
            }

            @media (max-width: 768px) and (orientation: landscape) {
                .video-grid {
                    grid-template-columns: 1fr 1fr;
                    gap: var(--spacing-sm, 0.5rem);
                }
                
                .video-wrapper {
                    max-height: 60vh;
                }
            }

            .video-wrapper {
                position: relative;
                background: var(--text-color, #000000);
                border-radius: var(--border-radius-lg, 0.5rem);
                overflow: hidden;
                aspect-ratio: 4/3;
                box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
                border: 1px solid var(--border-color, #e5e7eb);
            }

            video {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: var(--border-radius-lg, 0.5rem);
                background: var(--surface-color, #f8f9fa);
                transition: all var(--transition-fast, 150ms) ease;
            }

            .video-overlay {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(0,0,0,0.8));
                color: var(--background-color, #ffffff);
                padding: var(--spacing-md, 1rem);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-family: var(--font-family-primary, 'Inter', 'Arial', sans-serif);
                font-size: var(--font-size-sm, 0.875rem);
                font-weight: 500;
            }

            @media (max-width: 480px) {
                .video-overlay {
                    padding: var(--spacing-sm, 0.75rem);
                    font-size: var(--font-size-xs, 0.75rem);
                }
            }

            .video-indicators {
                display: flex;
                gap: var(--spacing-xs, 0.25rem);
            }

            .indicator {
                font-size: var(--font-size-sm, 0.875rem);
                padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
                border-radius: var(--border-radius-full, 9999px);
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .video-off {
                opacity: 0.5;
                position: relative;
            }

            .video-off::before {
                content: "🚫";
                margin-right: var(--spacing-xs, 0.25rem);
            }

            .audio-off {
                opacity: 0.5;
                position: relative;
            }

            .audio-off::before {
                content: "🚫";
                margin-right: var(--spacing-xs, 0.25rem);
            }

            .controls {
                display: flex;
                justify-content: center;
                gap: var(--spacing-md, 1rem);
                margin-bottom: var(--spacing-xl, 1.5rem);
                flex-wrap: wrap;
                padding: 0 var(--spacing-md, 1rem);
            }

            @media (max-width: 768px) {
                .controls {
                    gap: var(--spacing-sm, 0.5rem);
                    margin-bottom: var(--spacing-lg, 1rem);
                    padding: 0 var(--spacing-sm, 0.5rem);
                }
                
                .control-btn {
                    flex: 1;
                    min-width: 120px;
                    justify-content: center;
                }
            }

            @media (max-width: 480px) {
                .controls {
                    gap: var(--spacing-xs, 0.25rem);
                    margin-bottom: var(--spacing-md, 1rem);
                }
                
                .control-btn {
                    min-width: 80px;
                    padding: var(--spacing-sm, 0.75rem) var(--spacing-xs, 0.5rem);
                    flex-direction: column;
                    gap: var(--spacing-xs, 0.25rem);
                }
                
                .control-btn .text {
                    font-size: var(--font-size-xs, 0.75rem);
                }
            }

            @media (max-width: 360px) {
                .control-btn .text {
                    display: none;
                }
                
                .control-btn {
                    min-width: 60px;
                    padding: var(--spacing-sm, 0.75rem);
                }
                
                .control-btn .icon {
                    font-size: 1.6rem;
                    margin: 0;
                }
            }

            .control-btn {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs, 0.25rem);
                padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
                border: none;
                border-radius: var(--border-radius-md, 0.375rem);
                background: var(--surface-color, #f8f9fa);
                color: var(--text-color, #333333);
                cursor: pointer;
                transition: all var(--transition-normal, 300ms) ease;
                font-size: var(--font-size-sm, 0.875rem);
                font-weight: 600;
                font-family: var(--font-family-primary, 'Inter', 'Arial', sans-serif);
                box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
                border: 1px solid var(--border-color, #e5e7eb);
            }

            .control-btn:hover:not(:disabled) {
                background: var(--background-color, #ffffff);
                transform: translateY(-2px);
                box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
                border-color: var(--primary-color, #667eea);
            }

            .control-btn:active:not(:disabled) {
                transform: translateY(0);
                box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
            }

            .control-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            .control-btn.end-call {
                background: linear-gradient(135deg, var(--error-color, #ef4444), #dc2626);
                color: var(--background-color, #ffffff);
                border-color: var(--error-color, #ef4444);
            }

            .control-btn.end-call:hover:not(:disabled) {
                background: linear-gradient(135deg, #dc2626, var(--error-color, #ef4444));
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
            }

            .control-btn .icon {
                font-size: 1.2rem;
                transition: transform var(--transition-fast, 150ms) ease;
            }

            .control-btn:hover .icon {
                transform: scale(1.1);
            }

            @media (max-width: 480px) {
                .control-btn .icon {
                    font-size: 1.4rem;
                }
            }

            .status-message {
                text-align: center;
                padding: var(--spacing-md, 1rem);
                border-radius: var(--border-radius-md, 0.375rem);
                background: var(--surface-color, #f8f9fa);
                margin: 0 var(--spacing-md, 1rem) var(--spacing-md, 1rem);
                font-weight: 500;
                font-family: var(--font-family-primary, 'Inter', 'Arial', sans-serif);
                font-size: var(--font-size-base, 1rem);
                border: 1px solid var(--border-color, #e5e7eb);
                transition: all var(--transition-fast, 150ms) ease;
            }

            .status-message.connected {
                background: rgba(16, 185, 129, 0.1);
                color: var(--success-color, #10b981);
                border-color: rgba(16, 185, 129, 0.2);
            }

            .status-message.error {
                background: rgba(239, 68, 68, 0.1);
                color: var(--error-color, #ef4444);
                border-color: rgba(239, 68, 68, 0.2);
            }

            .status-message.warning {
                background: rgba(245, 158, 11, 0.1);
                color: var(--warning-color, #f59e0b);
                border-color: rgba(245, 158, 11, 0.2);
            }

            .status-message.info {
                background: rgba(59, 130, 246, 0.1);
                color: var(--primary-color, #667eea);
                border-color: rgba(59, 130, 246, 0.2);
            }

            .remote-status {
                padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
                border-radius: var(--border-radius-sm, 0.25rem);
                background: rgba(255, 255, 255, 0.2);
                font-size: var(--font-size-xs, 0.75rem);
                backdrop-filter: blur(10px);
            }

            .remote-status.connected {
                background: rgba(16, 185, 129, 0.3);
                color: #ffffff;
            }

            .remote-status.connecting {
                background: rgba(245, 158, 11, 0.3);
                color: #ffffff;
            }

            .remote-status.disconnected {
                background: rgba(239, 68, 68, 0.3);
                color: #ffffff;
            }

            /* Touch device optimizations */
            @supports (-webkit-touch-callout: none) {
                .control-btn {
                    -webkit-tap-highlight-color: transparent;
                    min-height: 44px; /* Apple's recommended touch target size */
                }
                
                video {
                    /* Improve video performance on iOS */
                    -webkit-transform: translateZ(0);
                    transform: translateZ(0);
                }
            }

            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .control-btn,
                .fade-in,
                video {
                    transition: none;
                    animation: none;
                }
                
                .control-btn:hover {
                    transform: none;
                }
            }

            /* High contrast mode */
            @media (prefers-contrast: high) {
                .control-btn {
                    border-width: 2px;
                }
                
                .video-wrapper {
                    border-width: 2px;
                }
                
                .status-message {
                    border-width: 2px;
                }
            }

            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .video-wrapper {
                    background: var(--text-color, #000000);
                }
                
                .control-btn {
                    background: var(--surface-color, #374151);
                    color: var(--text-color, #f9fafb);
                    border-color: var(--border-color, #4b5563);
                }
                
                .control-btn:hover:not(:disabled) {
                    background: var(--background-color, #1f2937);
                }
                
                .status-message {
                    background: var(--surface-color, #374151);
                    color: var(--text-color, #f9fafb);
                }
            }

            /* Fullscreen video support */
            .video-wrapper:fullscreen {
                border-radius: 0;
                width: 100vw;
                height: 100vh;
                max-height: 100vh;
            }
            
            .video-wrapper:fullscreen video {
                border-radius: 0;
            }
        `;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>${this.getStyles()}</style>
            <div class="video-container hidden">
                <div class="video-grid">
                    <div class="video-wrapper">
                        <video id="local-video" autoplay muted playsinline></video>
                        <div class="video-overlay">
                            <span class="participant-name">You</span>
                            <div class="video-indicators">
                                <span id="video-indicator" class="indicator">📹</span>
                                <span id="audio-indicator" class="indicator">🎤</span>
                            </div>
                        </div>
                    </div>
                    <div class="video-wrapper">
                        <video id="remote-video" autoplay playsinline></video>
                        <div class="video-overlay">
                            <span class="participant-name">Participant</span>
                            <span id="remote-status" class="remote-status connecting">Connecting...</span>
                        </div>
                    </div>
                </div>
                
                <div class="controls">
                    <button id="toggle-video" class="control-btn" title="Toggle video">
                        <span class="icon">📹</span>
                        <span class="text">Turn off video</span>
                    </button>
                    <button id="toggle-audio" class="control-btn" title="Toggle microphone">
                        <span class="icon">🎤</span>
                        <span class="text">Turn off audio</span>
                    </button>
                    <button id="switch-camera" class="control-btn" title="Switch camera">
                        <span class="icon">📷</span>
                        <span class="text">Switch camera</span>
                    </button>
                    <button id="end-call" class="control-btn end-call" title="End call">
                        <span class="icon">📞</span>
                        <span class="text">End call</span>
                    </button>
                </div>
                
                <div id="status" class="status-message info">Connecting...</div>
            </div>
        `;
    }

    setupEventListeners() {
        this.shadowRoot.addEventListener('click', (event) => {
            if (event.target.matches('#toggle-video')) {
                this.dispatchEvent(new CustomEvent('toggle-video', { bubbles: true, composed: true }));
            } else if (event.target.matches('#toggle-audio')) {
                this.dispatchEvent(new CustomEvent('toggle-audio', { bubbles: true, composed: true }));
            } else if (event.target.matches('#switch-camera')) {
                this.dispatchEvent(new CustomEvent('switch-camera', { bubbles: true, composed: true }));
            } else if (event.target.matches('#end-call')) {
                this.dispatchEvent(new CustomEvent('end-call', { bubbles: true, composed: true }));
            }
        });

        // Double click to enter fullscreen
        this.shadowRoot.addEventListener('dblclick', (event) => {
            if (event.target.matches('.video-wrapper') || event.target.matches('video')) {
                this.toggleFullscreen(event.target.closest('.video-wrapper'));
            }
        });
    }

    // Public methods for parent component
    setLocalStream(stream) {
        const localVideo = this.shadowRoot.getElementById('local-video');
        if (localVideo) {
            localVideo.srcObject = stream;
        }
    }

    setRemoteStream(stream) {
        const remoteVideo = this.shadowRoot.getElementById('remote-video');
        if (remoteVideo) {
            remoteVideo.srcObject = stream;
        }
    }

    updateVideoButton(enabled) {
        const toggleVideoBtn = this.shadowRoot.getElementById('toggle-video');
        if (toggleVideoBtn) {
            const textElement = toggleVideoBtn.querySelector('.text');
            const iconElement = toggleVideoBtn.querySelector('.icon');
            if (textElement) textElement.textContent = enabled ? 'Turn off video' : 'Turn on video';
            if (iconElement) iconElement.textContent = enabled ? '📹' : '📹🚫';
        }
    }

    updateAudioButton(enabled) {
        const toggleAudioBtn = this.shadowRoot.getElementById('toggle-audio');
        if (toggleAudioBtn) {
            const textElement = toggleAudioBtn.querySelector('.text');
            const iconElement = toggleAudioBtn.querySelector('.icon');
            if (textElement) textElement.textContent = enabled ? 'Turn off audio' : 'Turn on audio';
            if (iconElement) iconElement.textContent = enabled ? '🎤' : '🎤🚫';
        }
    }

    updateVideoIndicator(enabled) {
        const videoIndicator = this.shadowRoot.getElementById('video-indicator');
        if (videoIndicator) {
            videoIndicator.classList.toggle('video-off', !enabled);
        }
    }

    updateAudioIndicator(enabled) {
        const audioIndicator = this.shadowRoot.getElementById('audio-indicator');
        if (audioIndicator) {
            audioIndicator.classList.toggle('audio-off', !enabled);
        }
    }

    updateRemoteStatus(status) {
        const remoteStatus = this.shadowRoot.getElementById('remote-status');
        if (remoteStatus) {
            remoteStatus.textContent = status;
            remoteStatus.className = 'remote-status';
            
            if (status.toLowerCase().includes('connected')) {
                remoteStatus.classList.add('connected');
            } else if (status.toLowerCase().includes('connecting')) {
                remoteStatus.classList.add('connecting');
            } else if (status.toLowerCase().includes('disconnected')) {
                remoteStatus.classList.add('disconnected');
            }
        }
    }

    updateStatus(message, isError = false, isConnected = false) {
        const status = this.shadowRoot.getElementById('status');
        if (status) {
            status.textContent = message;
            status.className = 'status-message';
            
            if (isError) {
                status.classList.add('error');
            } else if (isConnected) {
                status.classList.add('connected');
            } else {
                status.classList.add('info');
            }
        }
    }

    show() {
        const container = this.shadowRoot.querySelector('.video-container');
        if (container) {
            container.classList.remove('hidden');
            container.classList.add('fade-in');
        }
    }

    hide() {
        const container = this.shadowRoot.querySelector('.video-container');
        if (container) {
            container.classList.add('hidden');
            container.classList.remove('fade-in');
        }
    }

    toggleFullscreen(videoWrapper) {
        if (!document.fullscreenElement) {
            videoWrapper.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    handleResize() {
        // Handle any resize-specific logic
        const videoWrappers = this.shadowRoot.querySelectorAll('.video-wrapper');
        videoWrappers.forEach(wrapper => {
            // Adjust layout if needed
        });
    }
}

customElements.define('video-container', VideoContainer);