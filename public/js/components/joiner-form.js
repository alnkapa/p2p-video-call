class JoinerForm extends HTMLElement {
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

                .hidden {
                    display: none !important;
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

                h2 {
                    margin-bottom: 1rem;
                    color: var(--text-color);
                }

                p {
                    color: var(--text-light);
                    margin-bottom: 1.5rem;
                }

                input[type="text"] {
                    width: 100%;
                    padding: 12px 16px;
                    margin: 1rem 0;
                    border: 2px solid #e9ecef;
                    border-radius: var(--border-radius);
                    font-size: 16px;
                    transition: var(--transition);
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

                .btn-primary {
                    border: none;
                    padding: 12px 24px;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                    transition: var(--transition);
                    margin: 0.5rem;
                    min-height: 48px;
                    background: var(--primary-color);
                    color: white;
                    width: 100%;
                }

                .btn-primary:hover {
                    background: var(--primary-dark);
                    transform: translateY(-2px);
                }

                @media (max-width: 768px) {
                    .btn-primary {
                        padding: 14px 20px;
                        font-size: 16px;
                    }
                }
            </style>
            <div class="form-container hidden">
                <div class="card">
                    <h2>Join Call</h2>
                    <p>Enter session ID or use invitation link</p>
                    <input type="text" id="session-id" placeholder="Enter session ID">
                    <button id="join-call" class="btn-primary">Join Call</button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        this.shadowRoot.addEventListener('click', (event) => {
            if (event.target.matches('#join-call')) {
                const sessionIdInput = this.shadowRoot.querySelector('#session-id');
                const sessionId = sessionIdInput ? sessionIdInput.value.trim() : '';
                
                this.dispatchEvent(new CustomEvent('join-call', { 
                    bubbles: true,
                    composed: true,
                    detail: { sessionId }
                }));
            }
        });
    }
}

customElements.define('joiner-form', JoinerForm);