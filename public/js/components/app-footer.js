class AppFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }
  getStyles() {
    return `
        .footer {
            text-align: center;
            margin-top: var(--spacing-2xl, 2rem);
            padding-top: var(--spacing-xl, 2rem);
            border-top: 1px solid var(--border-color, #e9ecef);
            color: var(--text-light, #6c757d);
            font-size: var(--font-size-sm, 0.9rem);
            font-family: var(--font-family-primary, 'Inter', 'Arial', sans-serif);
            background-color: var(--surface-color, #f8f9fa);
            padding-bottom: var(--spacing-lg, 1.5rem);
        }
       .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 var(--spacing-md, 1rem);
        }
       .footer p {
            margin: 0;
            line-height: 1.6;
        }
       .footer-links {
            margin-top: var(--spacing-sm, 0.5rem);
            display: flex;
            justify-content: center;
            gap: var(--spacing-lg, 1.5rem);
            flex-wrap: wrap;
        }
       @media (max-width: 768px) {
            .footer {
                margin-top: var(--spacing-xl, 1.5rem);
                padding-top: var(--spacing-lg, 1.5rem);
                font-size: var(--font-size-sm, 0.875rem);
            }
           .footer-links {
                    gap: var(--spacing-md, 1rem);
                    flex-direction: column;
                    align-items: center;
                }
            }

            @media (max-width: 480px) {
                .footer {
                    margin-top: var(--spacing-lg, 1rem);
                    padding-top: var(--spacing-md, 1rem);
                    font-size: var(--font-size-xs, 0.8rem);
                    padding-bottom: var(--spacing-md, 1rem);
                }
                .footer-content {
                    padding: 0 var(--spacing-sm, 0.5rem);
                }
            }

            a {
                color: var(--primary-color, #667eea);
                text-decoration: none;
                transition: color var(--transition-fast, 150ms) ease;
                font-weight: 500;
            }
            a:hover {
                color: var(--secondary-color, #764ba2);
                text-decoration: underline;
                text-underline-offset: 2px;
            }
            a:focus {
                outline: 2px solid var(--accent-color, #f093fb);
                outline-offset: 2px;
                border-radius: var(--border-radius-sm, 0.25rem);
            }

            .github-link {
                display: inline-flex;
                align-items: center;
                gap: var(--spacing-xs, 0.25rem);
            }
            .github-link::before {
                content: "🔗";
                font-size: var(--font-size-base, 1rem);
            }
            .tech-stack {
                margin-top: var(--spacing-sm, 0.5rem);
                font-size: var(--font-size-xs, 0.75rem);
                color: var(--text-lighter, #9ca3af);
            }
            .separator {
                margin: 0 var(--spacing-sm, 0.5rem);
                color: var(--border-color, #e9ecef);
            }
            @media (max-width: 480px) {
                .footer-links {
                    flex-direction: column;
                    gap: var(--spacing-xs, 0.25rem);
                }
                .separator {
                    display: none;
                }
            }
        `;
  }
  render() {
    this.shadowRoot.innerHTML = `
            <style>${this.getStyles()}</style>
            <footer class="footer">
                <p>Uses WebRTC for P2P connection. Source code on 
                    <a href="https://github.com/yourusername/p2p-video-call" target="_blank">GitHub</a>
                </p>
            </footer>
        `;
  }
}

customElements.define("app-footer", AppFooter);
