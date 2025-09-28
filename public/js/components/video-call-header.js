class VideoCallHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .header h1 {
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .header p {
                    color: var(--text-light);
                    font-size: 1.1rem;
                }

                @media (max-width: 768px) {
                    .header {
                        margin-bottom: 1.5rem;
                    }
                    
                    .header h1 {
                        font-size: 2rem;
                    }
                    
                    .header p {
                        font-size: 1rem;
                    }
                }

                @media (max-width: 480px) {
                    .header h1 {
                        font-size: 1.75rem;
                    }
                    
                    .header p {
                        font-size: 0.9rem;
                    }
                }

                .mobile-indicator::after {
                    content: "📱";
                    margin-left: 0.5rem;
                }

                @media (min-width: 769px) {
                    .mobile-indicator::after {
                        content: "💻";
                    }
                }
            </style>
            <header class="header">
                <h1 class="mobile-indicator">📞 P2P Video Call</h1>
                <p>Secure peer-to-peer video calls directly in your browser</p>
            </header>
        `;
    }
}

customElements.define('video-call-header', VideoCallHeader);