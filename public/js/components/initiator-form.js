const css = "/js/components/initiator-form.css";
import { EVENTS } from "./events.js";

class InitiatorForm extends HTMLElement {
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
    await this.setupEventListeners();
  }

  async render() {
    if (!this.cssContent) {
      this.cssContent = await this.cssLoadPromise;
    }
    this.shadowRoot.innerHTML = `
    <style>${this.cssContent}</style>
    <div class="form-container">
        <div class="card">
            <h2>Create Video Call</h2>
            <p>Start a new secure peer-to-peer video call session and share the invitation link</p>
            <button id="create-call" class="btn-primary" disabled>
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
                    <div class="button-group">                        
                        <button id="new-call" class="btn-secondary">New Call</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
  }

  async setupEventListeners() {
    const createCallButton = this.shadowRoot.getElementById("create-call");
    createCallButton.disabled = false;
    createCallButton.addEventListener("click", (event) => {
      createCallButton.disabled = true;
      this.dispatchEvent(
        new CustomEvent(EVENTS.CREATE_CALL, { bubbles: true, composed: true })
      );
    });
    // this.shadowRoot.addEventListener("click", (event) => {
    //   console.log("event", event.target);
    //   if (event.target.matches("#create-call")) {
    //     this.dispatchEvent(
    //       new CustomEvent(EVENTS.CREATE_CALL, { bubbles: true, composed: true })
    //     );
    //     this.shadowRoot.getElementById("create-call").disabled = true;
    //   } else if (event.target.matches("#copy-link")) {
    //     this.dispatchEvent(
    //       new CustomEvent("copy-link", { bubbles: true, composed: true })
    //     );
    //   } else if (event.target.matches("#show-qr")) {
    //     this.dispatchEvent(
    //       new CustomEvent("show-qr", { bubbles: true, composed: true })
    //     );
    //   } else if (event.target.matches("#new-call")) {
    //     this.dispatchEvent(
    //       new CustomEvent("new-call", { bubbles: true, composed: true })
    //     );
    //   }
    // });
  }

  // Public methods for parent component
  showCallLink(link) {
    this.shadowRoot.getElementById("share-link").classList.remove("hidden");
    this.shadowRoot.getElementById("create-call").disabled = true;
    this.shadowRoot.getElementById("call-link").value = link;
  }

  //   hideShareLink() {
  //     this.shadowRoot.getElementById("share-link").classList.add("hidden");
  //   }

  //   showCopySuccess() {
  //     const message = this.shadowRoot.getElementById("copy-message");
  //     message.classList.remove("hidden");
  //     setTimeout(() => message.classList.add("hidden"), 3000);
  //   }

  //   showQRCode(qrElement) {
  //     const qrContainer = this.shadowRoot.getElementById("qr-code");
  //     qrContainer.innerHTML = "";
  //     qrContainer.appendChild(qrElement);
  //     qrContainer.classList.remove("hidden");
  //   }

  //   hideQRCode() {
  //     this.shadowRoot.getElementById("qr-code").classList.add("hidden");
  //   }

  //   updateStatus(message, isError = false) {
  //     // Optional: Add status display if needed
  //     console.log("InitiatorForm status:", message, isError);
  //   }
}

customElements.define("initiator-form", InitiatorForm);
