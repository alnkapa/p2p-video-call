class InitiatorForm extends HTMLElement {
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
            .form-container {
                text-align: center;
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

            .hidden {
                display: none !important;
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

            .btn-primary, .btn-secondary {
                border: none;
                padding: var(--spacing-md, 1rem) var(--spacing-xl, 2rem);
                border-radius: var(--border-radius-md, 0.375rem);
                cursor: pointer;
                font-size: var(--font-size-base, 1rem);
                font-weight: 600;
                transition: all var(--transition-normal, 300ms) ease;
                margin: var(--spacing-xs, 0.25rem);
                min-height: 48px;
                font-family: var(--font-family-primary, 'Inter', 'Arial', sans-serif);
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--spacing-xs, 0.25rem);
            }

            @media (max-width: 768px) {
                .btn-primary, .btn-secondary {
                    padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
                    font-size: var(--font-size-base, 1rem);
                    width: 100%;
                    margin: var(--spacing-xs, 0.25rem) 0;
                }
            }

            .btn-primary {
                background: linear-gradient(135deg, var(--primary-color, #667eea), var(--secondary-color, #764ba2));
                color: white;
                box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
            }

            .btn-primary:hover {
                background: linear-gradient(135deg, var(--secondary-color, #764ba2), var(--primary-color, #667eea));
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
            }

            .btn-primary:active {
                transform: translateY(0);
                box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
            }

            .btn-secondary {
                background: var(--background-color, #ffffff);
                color: var(--text-color, #333333);
                border: 2px solid var(--border-color, #e5e7eb);
                box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
            }

            .btn-secondary:hover {
                border-color: var(--primary-color, #667eea);
                color: var(--primary-color, #667eea);
                transform: translateY(-1px);
                box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
            }

            .btn-secondary:active {
                transform: translateY(0);
            }

            #share-link {
                margin-top: var(--spacing-xl, 1.5rem);
                padding-top: var(--spacing-xl, 1.5rem);
                border-top: 1px solid var(--border-color, #e5e7eb);
            }

            .link-container {
                display: flex;
                gap: var(--spacing-sm, 0.5rem);
                margin: var(--spacing-md, 1rem) 0;
                align-items: stretch;
            }

            @media (max-width: 768px) {
                .link-container {
                    flex-direction: column;
                    gap: var(--spacing-xs, 0.25rem);
                }
            }

            input[type="text"] {
                width: 100%;
                padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
                margin: var(--spacing-md, 1rem) 0;
                border: 2px solid var(--border-color, #e5e7eb);
                border-radius: var(--border-radius-md, 0.375rem);
                font-size: var(--font-size-base, 1rem);
                transition: all var(--transition-fast, 150ms) ease;
                flex: 1;
                font-family: var(--font-family-primary, 'Inter', 'Arial', sans-serif);
                background: var(--background-color, #ffffff);
                color: var(--text-color, #333333);
            }

            input[type="text"]:focus {
                outline: none;
                border-color: var(--primary-color, #667eea);
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            input[type="text"]:read-only {
                background-color: var(--surface-color, #f8f9fa);
                color: var(--text-light, #6c757d);
                cursor: not-allowed;
            }

            @media (max-width: 480px) {
                input[type="text"] {
                    padding: var(--spacing-sm, 0.75rem) var(--spacing-md, 1rem);
                    font-size: var(--font-size-base, 1rem);
                    margin: var(--spacing-sm, 0.75rem) 0;
                }
            }

            .share-section {
                text-align: center;
            }

            .qr-code {
                margin: var(--spacing-md, 1rem) auto;
                padding: var(--spacing-md, 1rem);
                background: var(--background-color, #ffffff);
                border-radius: var(--border-radius-md, 0.375rem);
                display: inline-block;
                border: 1px solid var(--border-color, #e5e7eb);
                box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
            }

            .button-group {
                display: flex;
                gap: var(--spacing-sm, 0.5rem);
                justify-content: center;
                flex-wrap: wrap;
                margin-top: var(--spacing-md, 1rem);
            }

            @media (max-width: 768px) {
                .button-group {
                    flex-direction: column;
                    align-items: stretch;
                }
            }

            .success-message {
                color: var(--success-color, #10b981);
                font-size: var(--font-size-sm, 0.875rem);
                margin-top: var(--spacing-xs, 0.25rem);
                font-weight: 500;
            }

            .error-message {
                color: var(--error-color, #ef4444);
                font-size: var(--font-size-sm, 0.875rem);
                margin-top: var(--spacing-xs, 0.25rem);
                font-weight: 500;
            }
        `;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>${this.getStyles()}</style>
            <div class="form-container">
                <div class="card">
                    <h2>Create Video Call</h2>
                    <p>Start a new secure peer-to-peer video call session and share the invitation link</p>
                    <button id="create-call" class="btn-primary">
                        <span>Create Call</span>
                    </button>
                    <div id="share-link" class="hidden">
                        <div class="share-section">
                            <p>Share this invitation link with your friend:</p>
                            <div class="link-container">
                                <input type="text" id="call-link" readonly placeholder="Call link will appear here...">
                                <button id="copy-link" class="btn-secondary">Copy</button>
                            </div>
                            <div id="copy-message" class="success-message hidden">Link copied to clipboard!</div>
                            <div class="qr-code hidden" id="qr-code"></div>
                            <div class="button-group">
                                <button id="show-qr" class="btn-secondary">Show QR Code</button>
                                <button id="new-call" class="btn-secondary">New Call</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        this.shadowRoot.addEventListener('click', (event) => {
            if (event.target.matches('#create-call')) {
                this.dispatchEvent(new CustomEvent('create-call', { bubbles: true, composed: true }));
            } else if (event.target.matches('#copy-link')) {
                this.dispatchEvent(new CustomEvent('copy-link', { bubbles: true, composed: true }));
            } else if (event.target.matches('#show-qr')) {
                this.dispatchEvent(new CustomEvent('show-qr', { bubbles: true, composed: true }));
            } else if (event.target.matches('#new-call')) {
                this.dispatchEvent(new CustomEvent('new-call', { bubbles: true, composed: true }));
            }
        });
    }

    // Вспомогательные методы для управления UI
    showShareLink() {
        this.shadowRoot.getElementById('share-link').classList.remove('hidden');
    }

    hideShareLink() {
        this.shadowRoot.getElementById('share-link').classList.add('hidden');
    }

    setCallLink(link) {
        this.shadowRoot.getElementById('call-link').value = link;
    }

    showCopySuccess() {
        const message = this.shadowRoot.getElementById('copy-message');
        message.classList.remove('hidden');
        setTimeout(() => message.classList.add('hidden'), 3000);
    }

    showQRCode(qrElement) {
        const qrContainer = this.shadowRoot.getElementById('qr-code');
        qrContainer.innerHTML = '';
        qrContainer.appendChild(qrElement);
        qrContainer.classList.remove('hidden');
    }

    hideQRCode() {
        this.shadowRoot.getElementById('qr-code').classList.add('hidden');
    }
}

customElements.define('initiator-form', InitiatorForm);