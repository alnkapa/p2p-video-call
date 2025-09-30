const css = "/js/components/app-header.css";

class AppHeader extends HTMLElement {
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
    <header class="header">
        <h1 class="mobile-indicator">📞 P2P Video Call</h1>
        <p>Peer-to-peer video calls directly in your browser</p>
    </header>
    `;
  }
}

customElements.define("app-header", AppHeader);
