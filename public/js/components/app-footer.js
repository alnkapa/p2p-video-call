const css = "js/components/app-footer.css";

class AppFooter extends HTMLElement {
  constructor() {
    super();
    this.cssLoadPromise = this.loadCSS();
    this.attachShadow({ mode: "open" });
  }

  async loadCSS() {
    try {
      return await (await fetch(css)).text();
    } catch (error) {
      return "error load css from: " + css + " with error:" + error.message;
    }
  }

  async connectedCallback() {
    await this.render();
  }

  async render() {
    if (!this.cssContent) {
      this.cssContent = await this.cssLoadPromise;
    }
    this.shadowRoot.innerHTML = `
    <style>${this.cssContent}</style>
    <footer class="footer">
        <div class="footer-content">
            <p>Uses WebRTC for P2P connection. Source code on 
                <a href="https://github.com/yourusername/p2p-video-call" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="github-link">
                    GitHub
                </a>
            </p>
        </div>
    </footer>`;
  }
}

customElements.define("app-footer", AppFooter);
