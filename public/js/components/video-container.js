class VideoContainer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
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

                .video-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                @media (max-width: 768px) {
                    .video-grid {
                        grid-template-columns: 1fr;
                        gap: 0.5rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .video-wrapper {
                        aspect-ratio: 4/3;
                        max-height: 50vh;
                    }
                }

                @media (max-width: 480px) {
                    .video-grid {
                        gap: 0.25rem;
                    }
                    
                    .video-wrapper {
                        max-height: 45vh;
                    }
                }

                @media (max-width: 768px) and (orientation: landscape) {
                    .video-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 0.5rem;
                    }
                    
                    .video-wrapper {
                        max-height: 60vh;
                    }
                }

                .video-wrapper {
                    position: relative;
                    background: #000;
                    border-radius: var(--border-radius);
                    overflow: hidden;
                    aspect-ratio: 4/3;
                }

                video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: var(--border-radius);
                }

                .video-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(0,0,0,0.7));
                    color: white;
                    padding: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                @media (max-width: 480px) {
                    .video-overlay {
                        padding: 0.75rem;
                        font-size: 0.9rem;
                    }
                }

                .video-indicators {
                    display: flex;
                    gap: 0.5rem;
                }

                .indicator {
                    font-size: 0.9rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 20px;
                    background: rgba(255,255,255,0.2);
                }

                .video-off {
                    opacity: 0.5;
                }

                .audio-off::after {
                    content: "🚫";
                    margin-left: 0.25rem;
                }

                .controls {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                }

                @media (max-width: 768px) {
                    .controls {
                        gap: 0.5rem;
                        margin-bottom: 1rem;
                    }
                    
                    .control-btn {
                        flex: 1;
                        min-width: 120px;
                        justify-content: center;
                    }
                }

                @media (max-width: 480px) {
                    .controls {
                        gap: 0.25rem;
                    }
                    
                    .control-btn {
                        min-width: 80px;
                        padding: 12px 8px;
                        flex-direction: column;
                        gap: 0.25rem;
                    }
                    
                    .control-btn .text {
                        font-size: 0.75rem;
                    }
                }

                @media (max-width: 360px) {
                    .control-btn .text {
                        display: none;
                    }
                    
                    .control-btn {
                        min-width: 60px;
                        padding: 12px;
                    }
                    
                    .control-btn .icon {
                        font-size: 1.6rem;
                        margin: 0;
                    }
                }

                .control-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 12px 20px;
                    border: none;
                    border-radius: var(--border-radius);
                    background: var(--bg-color);
                    color: var(--text-color);
                    cursor: pointer;
                    transition: var(--transition);
                    font-size: 14px;
                    font-weight: 600;
                }

                .control-btn:hover {
                    background: #e9ecef;
                    transform: translateY(-2px);
                }

                .control-btn.end-call {
                    background: var(--error-color);
                    color: white;
                }

                .control-btn.end-call:hover {
                    background: #c0392b;
                }

                .control-btn .icon {
                    font-size: 1.2rem;
                }

                @media (max-width: 480px) {
                    .control-btn .icon {
                        font-size: 1.4rem;
                    }
                }

                .control-btn:active {
                    transform: scale(0.95);
                }

                @supports (-webkit-touch-callout: none) {
                    .control-btn {
                        -webkit-tap-highlight-color: transparent;
                    }
                }
            </style>
            <div class="hidden">
                <div class="video-grid">
                    <div class="video-wrapper">
                        <video id="local-video" autoplay muted playsinline></video>
                        <div class="video-overlay">
                            <span>You</span>
                            <div class="video-indicators">
                                <span id="video-indicator" class="indicator video-on">📹</span>
                                <span id="audio-indicator" class="indicator audio-on">🎤</span>
                            </div>
                        </div>
                    </div>
                    <div class="video-wrapper">
                        <video id="remote-video" autoplay playsinline></video>
                        <div class="video-overlay">
                            <span>Participant</span>
                            <span id="remote-status" class="status">Connecting...</span>
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
                
                <div id="status" class="status-message">Connecting...</div>
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
    }
}

customElements.define('video-container', VideoContainer);