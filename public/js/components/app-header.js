class VideoCallHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }
  getStyles() {
    return `
        .header {
            text-align: center;
            margin-bottom: var(--header-margin-bottom, 2rem);
            font-family: var(--font-family-primary, 'Arial', sans-serif);
        }
        .header h1 {
            font-size: var(--font-size-h1, 2.5rem);
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--primary-color, #667eea), var(--secondary-color, #764ba2));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-family: var(--font-family-primary, 'Arial', sans-serif);
        }
        .header p {
            color: var(--text-light, #6c757d);
            font-size: var(--font-size-p, 1.1rem);
            font-family: var(--font-family-primary, 'Arial', sans-serif);
        }
        @media (max-width: 768px) {
            .header {
                margin-bottom: var(--header-margin-bottom-mobile, 1.5rem);
            }

            .header h1 {
                font-size: var(--font-size-h1-mobile, 2rem);
            }
    
            .header p {
                font-size: var(--font-size-p-mobile, 1rem);
            }
        }
        @media (max-width: 480px) {
            .header h1 {
                    font-size: var(--font-size-h1-small, 1.75rem);
            }
                
            .header p {
                font-size: var(--font-size-p-small, 0.9rem);
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
        `;
  }
  render() {
    this.shadowRoot.innerHTML = `
            <style>${this.getStyles()}</style>
            <header class="header">
                <h1 class="mobile-indicator">📞 P2P Video Call</h1>
                <p>Peer-to-peer video calls directly in your browser</p>
            </header>
        `;
  }
}

customElements.define("video-call-header", VideoCallHeader);
