class InitiatorForm extends HTMLElement {
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
                .form-container {
                    text-align: center;
                }

                .card {
                    background: var(--bg-color);
                    padding: 2rem;
                    border-radius: var(--border-radius);
                    text-align: center;
                }

                @media (max-width: 768px) {
                    .card {
                        padding: 1.5rem;
                    }
                }

                @media (max-width: 480px) {
                    .card {
                        padding: 1rem;
                    }
                }

                .hidden {
                    display: none !important;
                }

                h2 {
                    margin-bottom: 1rem;
                    color: var(--text-color);
                }

                p {
                    color: var(--text-light);
                    margin-bottom: 1.5rem;
                }

                .btn-primary, .btn-secondary {
                    border: none;
                    padding: 12px 24px;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                    transition: var(--transition);
                    margin: 0.5rem;
                    min-height: 48px;
                }

                @media (max-width: 768px) {
                    .btn-primary, .btn-secondary {
                        padding: 14px 20px;
                        font-size: 16px;
                        width: 100%;
                        margin: 0.5rem 0;
                    }
                }

                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                }

                .btn-primary:hover {
                    background: var(--primary-dark);
                    transform: translateY(-2px);
                }

                .btn-secondary {
                    background: white;
                    color: var(--text-color);
                    border: 2px solid #e9ecef;
                }

                .btn-secondary:hover {
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                }

                #share-link {
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e9ecef;
                }

                .link-container {
                    display: flex;
                    gap: 0.5rem;
                    margin: 1rem 0;
                }

                @media (max-width: 768px) {
                    .link-container {
                        flex-direction: column;
                    }
                }

                input[type="text"] {
                    width: 100%;
                    padding: 12px 16px;
                    margin: 1rem 0;
                    border: 2px solid #e9ecef;
                    border-radius: var(--border-radius);
                    font-size: 16px;
                    transition: var(--transition);
                    flex: 1;
                }

                input[type="text"]:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                @media (max-width: 480px) {
                    input[type="text"] {
                        padding: 10px 14px;
                        font-size: 16px;
                        margin: 0.75rem 0;
                    }
                }

                .share-section {
                    text-align: center;
                }

                .qr-code {
                    margin: 1rem auto;
                    padding: 1rem;
                    background: white;
                    border-radius: var(--border-radius);
                    display: inline-block;
                }
            </style>
            <div class="form-container">
                <div class="card">
                    <h2>Create Video Call</h2>
                    <p>Create a new session and invite a friend</p>
                    <button id="create-call" class="btn-primary">Create Call</button>
                    <div id="share-link" class="hidden">
                        <div class="share-section">
                            <p>Share this link:</p>
                            <div class="link-container">
                                <input type="text" id="call-link" readonly>
                                <button id="copy-link" class="btn-secondary">Copy</button>
                            </div>
                            <div class="qr-code hidden" id="qr-code"></div>
                            <button id="show-qr" class="btn-secondary">Show QR Code</button>
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
            }
        });
    }
}

customElements.define('initiator-form', InitiatorForm);