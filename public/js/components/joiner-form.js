const css = "/js/components/joiner-form.css";
import { EVENTS } from "./events.js";

class JoinerForm extends HTMLElement {
  constructor() {
    super();
    this.cssLoadPromise = this.loadCSS();
    this.isVisible = false;
    this.attachShadow({ mode: "open" });
    this.id = "";
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
        <div class="joiner-form ${this.isVisible ? "" : "hidden"}">
            <div class="card">
                <h2>Join Video Call</h2>
                <p>Enter the session ID or invitation link to join an existing call</p>                
                <div class="input-group">
                    <label for="session-id" class="input-label">Session ID or Invitation Link</label>
                    <input 
                        type="text" 
                        id="session-id" 
                        placeholder="Enter session ID or paste full invitation link"
                        autocomplete="off"
                        value="${this.id}"
                    />
                    <div id="error-message" class="error-message"></div>
                    <div class="paste-hint">You can paste the full invitation link - we'll extract the session ID automatically</div>
                </div>                
                <button id="join-call" class="btn-primary">
                    <span>Join Video Call</span>
                </button>                
            </div>
        </div>`;
  }

  async setupEventListeners() {
    const joinCallButton = this.shadowRoot.getElementById("join-call");
    joinCallButton.addEventListener("click", () => {
      this.handleJoinCall();
    });
    const sessionIdInput = this.shadowRoot.getElementById("session-id");
    if (sessionIdInput) {
      sessionIdInput.addEventListener("input", () => {
        this.clearError();
      });
      sessionIdInput.addEventListener("paste", (event) => {
        setTimeout(() => {
          this.extractSessionIdFromInput();
        }, 0);
      });
    }
  }

  handleJoinCall() {
    const sessionIdInput = this.shadowRoot.querySelector("#session-id");
    const sessionId = sessionIdInput ? sessionIdInput.value.trim() : "";

    if (!sessionId) {
      this.showError("Please enter a session ID or invitation link");
      return;
    }

    const extractedSessionId = this.extractSessionId(sessionId);

    this.dispatchEvent(
      new CustomEvent(EVENTS.JOIN_CALL, {
        bubbles: true,
        composed: true,
        detail: { sessionId: extractedSessionId },
      })
    );
  }

  extractSessionId(input) {
    if (input.includes("?")) {
      const url = new URL(input);
      return url.searchParams.get("session") || input;
    }
    return input;
  }

  extractSessionIdFromInput() {
    const sessionIdInput = this.shadowRoot.querySelector("#session-id");
    if (sessionIdInput) {
      const extracted = this.extractSessionId(sessionIdInput.value);
      sessionIdInput.value = extracted;
    }
  }

  showError(message) {
    const errorElement = this.shadowRoot.getElementById("error-message");
    const inputElement = this.shadowRoot.querySelector("#session-id");

    if (errorElement && inputElement) {
      errorElement.textContent = message;
      errorElement.classList.add("visible");
      inputElement.classList.add("input-error");
    }
  }

  clearError() {
    const errorElement = this.shadowRoot.getElementById("error-message");
    const inputElement = this.shadowRoot.querySelector("#session-id");

    if (errorElement && inputElement) {
      errorElement.classList.remove("visible");
      inputElement.classList.remove("input-error");
    }
  }

  setSessionId(id) {
    this.id = id;
    const sessionIdInput = this.shadowRoot.getElementById("session-id");
    if (sessionIdInput) {
      sessionIdInput.value = this.id;
      sessionIdInput.select();
    }
  }

  show() {
    this.isVisible = true;
    const container = this.shadowRoot.querySelector(".joiner-form");
    if (container) {
      container.classList.remove("hidden");
      container.classList.add("fade-in");
    }
  }

  hide() {
    this.isVisible = false;
    const container = this.shadowRoot.querySelector(".joiner-form");
    if (container) {
      container.classList.add("hidden");
      container.classList.remove("fade-in");
    }
  }  
}

customElements.define("joiner-form", JoinerForm);
