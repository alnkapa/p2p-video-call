class JoinerForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isVisible = false;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    getStyles() {
        return `
            .video-container {
                display: block;
                width: 100%;
            }

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

            .form-container {
                text-align: center;
            }

            .hidden {
                display: none !important;
            }

            .card {
                background: var(--surface-color, #ffffff);
                padding: var(--spacing-2xl, 2rem);
                border-radius: var(--border-radius-lg, 0.5rem);
                text-align: center;
                box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
                border: 1px solid var(--border-color, #e5e7eb);
                max-width: 500px;
                margin: 0 auto;
            }

            @media (max-width: 768px) {
                .card {
                    padding: var(--spacing-xl, 1.5rem);
                    margin: 0 var(--spacing-md, 1rem);
                }
            }

            @media (max-width: 480px) {
                .card {
                    padding: var(--spacing-lg, 1rem);
                    margin: 0 var(--spacing-sm, 0.5rem);
                    border-radius: var(--border-radius-md, 0.375rem);
                }
            }

            h2 {
                margin-bottom: var(--spacing-md, 1rem);
                color: var(--text-color, #333333);
                font-family: var(--font-family-primary, 'Inter', 'Arial', sans-serif);
                font-size: var(--font-size-2xl, 1.5rem);
                font-weight: 600;
                margin-top: 0;
            }

            p {
                color: var(--text-light, #6c757d);
                margin-bottom: var(--spacing-xl, 1.5rem);
                font-family: var(--font-family-primary, 'Inter', 'Arial', sans-serif);
                font-size: var(--font-size-base, 1rem);
                line-height: 1.5;
            }

            .input-group {
                margin-bottom: var(--spacing-lg, 1.5rem);
                text-align: left;
            }

            .input-label {
                display: block;
                margin-bottom: var(--spacing-xs, 0.25rem);
                color: var(--text-color, #333333);
                font-family: var(--font-family-primary, 'Inter', 'Arial', sans-serif);
                font-size: var(--font-size-sm, 0.875rem);
                font-weight: 500;
            }

            input[type="text"] {
                width: 100%;
                padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
                border: 2px solid var(--border-color, #e5e7eb);
                border-radius: var(--border-radius-md, 0.375rem);
                font-size: var(--font-size-base, 1rem);
                transition: all var(--transition-fast, 150ms) ease;
                font-family: var(--font-family-primary, 'Inter', 'Arial', sans-serif);
                background: var(--background-color, #ffffff);
                color: var(--text-color, #333333);
                box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
            }

            input[type="text"]:focus {
                outline: none;
                border-color: var(--primary-color, #667eea);
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            input[type="text"]::placeholder {
                color: var(--text-lighter, #9ca3af);
            }

            @media (max-width: 480px) {
                input[type="text"] {
                    padding: var(--spacing-sm, 0.75rem) var(--spacing-md, 1rem);
                    font-size: var(--font-size-base, 1rem);
                }
            }

            .btn-primary {
                border: none;
                padding: var(--spacing-md, 1rem) var(--spacing-xl, 2rem);
                border-radius: var(--border-radius-md, 0.375rem);
                cursor: pointer;
                font-size: var(--font-size-base, 1rem);
                font-weight: 600;
                transition: all var(--transition-normal, 300ms) ease;
                background: linear-gradient(135deg, var(--primary-color, #667eea), var(--secondary-color, #764ba2));
                color: white;
                width: 100%;
                min-height: 48px;
                font-family: var(--font-family-primary, 'Inter', 'Arial', sans-serif);
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--spacing-xs, 0.25rem);
                box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
            }

            .btn-primary:hover:not(:disabled) {
                background: linear-gradient(135deg, var(--secondary-color, #764ba2), var(--primary-color, #667eea));
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
            }

            .btn-primary:active:not(:disabled) {
                transform: translateY(0);
                box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
            }

            .btn-primary:disabled {
                background: var(--text-lighter, #9ca3af);
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
                opacity: 0.6;
            }

            @media (max-width: 768px) {
                .btn-primary {
                    padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
                    font-size: var(--font-size-base, 1rem);
                }
            }

            .instructions {
                background: var(--surface-color, #f8f9fa);
                padding: var(--spacing-md, 1rem);
                border-radius: var(--border-radius-md, 0.375rem);
                margin-top: var(--spacing-lg, 1.5rem);
                border-left: 4px solid var(--primary-color, #667eea);
                text-align: left;
            }

            .instructions h3 {
                color: var(--text-color, #333333);
                font-size: var(--font-size-sm, 0.875rem);
                font-weight: 600;
                margin: 0 0 var(--spacing-xs, 0.25rem) 0;
                font-family: var(--font-family-primary, 'Inter', 'Arial', sans-serif);
            }

            .instructions p {
                color: var(--text-light, #6c757d);
                font-size: var(--font-size-sm, 0.875rem);
                margin: 0;
                line-height: 1.4;
            }

            .error-message {
                color: var(--error-color, #ef4444);
                font-size: var(--font-size-sm, 0.875rem);
                margin-top: var(--spacing-xs, 0.25rem);
                text-align: left;
                font-weight: 500;
                display: none;
            }

            .error-message.visible {
                display: block;
            }

            .input-error {
                border-color: var(--error-color, #ef4444) !important;
            }

            .input-error:focus {
                border-color: var(--error-color, #ef4444) !important;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
            }

            .alternative-options {
                margin-top: var(--spacing-lg, 1.5rem);
                padding-top: var(--spacing-lg, 1.5rem);
                border-top: 1px solid var(--border-color, #e5e7eb);
            }

            .alternative-text {
                color: var(--text-light, #6c757d);
                font-size: var(--font-size-sm, 0.875rem);
                margin-bottom: var(--spacing-sm, 0.5rem);
            }

            .paste-hint {
                color: var(--text-lighter, #9ca3af);
                font-size: var(--font-size-xs, 0.75rem);
                margin-top: var(--spacing-xs, 0.25rem);
                text-align: left;
            }
        `;
    }

  render() {
        this.shadowRoot.innerHTML = `
            <style>${this.getStyles()}</style>
            <div class="video-container ${this.isVisible ? '' : 'hidden'}">
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
                
                <div id="status" class="status-message info">Ready to connect</div>
            </div>
        `;
    }

    setupEventListeners() {
        this.shadowRoot.addEventListener('click', (event) => {
            if (event.target.matches('#join-call')) {
                this.handleJoinCall();
            } else if (event.target.matches('#create-instead')) {
                this.dispatchEvent(new CustomEvent('create-instead', { 
                    bubbles: true,
                    composed: true
                }));
            }
        });

        // Добавляем обработчик для input
        const sessionIdInput = this.shadowRoot.querySelector('#session-id');
        if (sessionIdInput) {
            sessionIdInput.addEventListener('input', () => {
                this.clearError();
            });

            sessionIdInput.addEventListener('paste', (event) => {
                setTimeout(() => {
                    this.extractSessionIdFromInput();
                }, 0);
            });
        }
    }

    handleJoinCall() {
        const sessionIdInput = this.shadowRoot.querySelector('#session-id');
        const sessionId = sessionIdInput ? sessionIdInput.value.trim() : '';
        
        if (!sessionId) {
            this.showError('Please enter a session ID or invitation link');
            return;
        }

        // Извлекаем session ID из полной ссылки если необходимо
        const extractedSessionId = this.extractSessionId(sessionId);
        
        this.dispatchEvent(new CustomEvent('join-call', { 
            bubbles: true,
            composed: true,
            detail: { sessionId: extractedSessionId }
        }));
    }

    extractSessionId(input) {
        // Если это URL, извлекаем session ID из параметра
        if (input.includes('?')) {
            const url = new URL(input);
            return url.searchParams.get('session') || input;
        }
        return input;
    }

    extractSessionIdFromInput() {
        const sessionIdInput = this.shadowRoot.querySelector('#session-id');
        if (sessionIdInput) {
            const extracted = this.extractSessionId(sessionIdInput.value);
            sessionIdInput.value = extracted;
        }
    }

    showError(message) {
        const errorElement = this.shadowRoot.getElementById('error-message');
        const inputElement = this.shadowRoot.querySelector('#session-id');
        
        if (errorElement && inputElement) {
            errorElement.textContent = message;
            errorElement.classList.add('visible');
            inputElement.classList.add('input-error');
        }
    }

    clearError() {
        const errorElement = this.shadowRoot.getElementById('error-message');
        const inputElement = this.shadowRoot.querySelector('#session-id');
        
        if (errorElement && inputElement) {
            errorElement.classList.remove('visible');
            inputElement.classList.remove('input-error');
        }
    }

    show() {
        this.isVisible = true;
        const container = this.shadowRoot.querySelector('.video-container');
        if (container) {
            container.classList.remove('hidden');
            container.classList.add('fade-in');
        }
    }

    hide() {
        this.isVisible = false;
        const container = this.shadowRoot.querySelector('.video-container');
        if (container) {
            container.classList.add('hidden');
            container.classList.remove('fade-in');
        }
    }

    // Добавьте метод для проверки видимости
    isVisible() {
        return this.isVisible;
    }
    
    clear() {
        const input = this.shadowRoot.querySelector('#session-id');
        if (input) {
            input.value = '';
        }
        this.clearError();
    }

    setLoading(loading) {
        const button = this.shadowRoot.querySelector('#join-call');
        if (button) {
            button.disabled = loading;
            button.innerHTML = loading ? 
                '<span>Connecting...</span>' : 
                '<span>Join Video Call</span>';
        }
    }
}

customElements.define('joiner-form', JoinerForm);