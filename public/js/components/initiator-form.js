const css = "js/components/initiator-form.css";
import { EVENTS } from "./events.js";

class InitiatorForm extends HTMLElement {
  constructor() {
    super();
    this.cssLoadPromise = this.loadCSS();
    this.isVisible = false;
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
    await this.setupEventListeners();
  }

  async render() {
    if (!this.cssContent) {
      this.cssContent = await this.cssLoadPromise;
    }
    this.shadowRoot.innerHTML = `
    <style>${this.cssContent}</style>
    <div class="form-container ${this.isVisible ? '' : 'hidden'}">
      <div id="create-link">
        <h2>Create Video Call</h2>
        <p>Start a new secure peer-to-peer video call session and share the invitation link</p>
        <button id="create-call" class="btn-primary">
          <span>Create Call</span>
        </button>
      </div>
      <div id="share-link" class="hidden">
        <div class="share-section">
          <p>Share this invitation link with your friend:</p>
          <div class="link-container">
            <input type="text" id="call-link" readonly placeholder="Call link will appear here...">
            <button id="copy-link" class="btn-secondary">Copy</button>
          </div>                    
        </div>
      </div>        
    </div>`;
  }

  async setupEventListeners() {
    const createCallButton = this.shadowRoot.getElementById("create-call");
    createCallButton.addEventListener("click", () => {
      createCallButton.disabled = true;
      this.dispatchEvent(
        new CustomEvent(EVENTS.CREATE_CALL, {
          bubbles: true,
          composed: true,
        })
      );
    });
    const copyLinkButton = this.shadowRoot.getElementById("copy-link");
    copyLinkButton.addEventListener("click", () => this.copyLink());    
  }
  copyLink() {
    const callLink = this.shadowRoot.getElementById("call-link");
    if (callLink) {
      callLink.select();
      document.execCommand("copy");
      // Show success feedback
      const copyLinkButton = this.shadowRoot.getElementById("copy-link");
      if (copyLinkButton) {
        const originalText = copyLinkButton.textContent;
        copyLinkButton.textContent = "Copied!";
        copyLinkButton.style.background = "var(--success-color, #10b981)";

        setTimeout(() => {
          copyLinkButton.textContent = originalText;
          copyLinkButton.style.background = "";
        }, 2000);
      }
    }
  }

  show() {
    this.isVisible = true;
    const container = this.shadowRoot.querySelector(".form-container");
    if (container) {
      container.classList.remove("hidden");
      container.classList.add("fade-in");
    }
  }

  hide() {
    this.isVisible = false;
    const container = this.shadowRoot.querySelector(".form-container");
    if (container) {
      container.classList.add("hidden");
      container.classList.remove("fade-in");
    }
  }

  showCallLink(link) {
    this.shadowRoot.getElementById("share-link").classList.remove("hidden");
    this.shadowRoot.getElementById("create-call").disabled = true;
    this.shadowRoot.getElementById("call-link").value = link;
    this.shadowRoot.getElementById("create-link").classList.add("hidden");
  }
}

customElements.define("initiator-form", InitiatorForm);
