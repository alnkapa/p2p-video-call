class AppFooter extends HTMLElement {
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
                .footer {
                    text-align: center;
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 1px solid #e9ecef;
                    color: var(--text-light);
                    font-size: 0.9rem;
                }

                @media (max-width: 480px) {
                    .footer {
                        margin-top: 1.5rem;
                        padding-top: 1.5rem;
                        font-size: 0.8rem;
                    }
                }

                a {
                    color: var(--primary-color);
                    text-decoration: none;
                }

                a:hover {
                    text-decoration: underline;
                }
            </style>
            <footer class="footer">
                <p>Uses WebRTC for P2P connection. Source code on 
                    <a href="https://github.com/yourusername/p2p-video-call" target="_blank">GitHub</a>
                </p>
            </footer>
        `;
    }
}

customElements.define('app-footer', AppFooter);