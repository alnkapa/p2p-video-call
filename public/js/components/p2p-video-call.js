import { MediaManager } from "../modules/media-manager.js";
import { WebRTCHandler } from "../modules/webrtc-handler.js";
import { MobileOptimizer } from "../modules/mobile-optimizer.js";
import { debounce } from "../modules/utils.js";

class P2PVideoCall extends HTMLElement {
  constructor() {
    super();
    this.isCaller = false;
    this.sessionId = null;
    this.videoEnabled = true;
    this.audioEnabled = true;

    this.config = {
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
          ],
        },
      ],
    };

    this.mediaManager = new MediaManager();
    this.webrtcHandler = new WebRTCHandler(this.config);
    this.mobileOptimizer = new MobileOptimizer();

    this.attachShadow({ mode: "open" });
    this.setupEventListeners();
  }

  connectedCallback() {
    this.render();
    this.setupComponentListeners();
    this.checkUrlForSession();
  }

  render() {
    this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}
            </style>
            <div class="app-container">
                <video-call-header></video-call-header>
                <initiator-form></initiator-form>
                <joiner-form></joiner-form>
                <video-container></video-container>
                <app-footer></app-footer>
            </div>
        `;
  }

  getStyles() {
    return `
            :host {
                display: block;
                font-family: var(--font-family-primary, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif);
            }

            .app-container {
                background: var(--background-color, #ffffff);
                border-radius: var(--border-radius-lg, 0.5rem);
                padding: var(--spacing-2xl, 2rem);
                box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
                max-width: 900px;
                width: 95%;
                margin: var(--spacing-2xl, 2rem) auto;
                border: 1px solid var(--border-color, #e5e7eb);
            }

            @media (max-width: 768px) {
                .app-container {
                    padding: var(--spacing-xl, 1.5rem);
                    margin: var(--spacing-md, 1rem) auto;
                    border-radius: var(--border-radius-md, 0.375rem);
                }
            }

            @media (max-width: 480px) {
                .app-container {
                    padding: var(--spacing-lg, 1rem);
                    margin: 0;
                    border-radius: 0;
                    width: 100%;
                    min-height: 100vh;
                    border: none;
                    box-shadow: none;
                }
            }

            .hidden {
                display: none !important;
            }

            .fade-in {
                animation: fadeIn var(--transition-normal, 300ms) ease-in;
            }

            @keyframes fadeIn {
                from { 
                    opacity: 0; 
                    transform: translateY(var(--spacing-md, 1rem)); 
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0); 
                }
            }

            .status-message {
                text-align: center;
                padding: var(--spacing-md, 1rem);
                border-radius: var(--border-radius-md, 0.375rem);
                background: var(--surface-color, #f8f9fa);
                margin-bottom: var(--spacing-md, 1rem);
                font-weight: 500;
                font-family: var(--font-family-primary, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
                font-size: var(--font-size-base, 1rem);
                border: 1px solid var(--border-color, #e5e7eb);
                transition: all var(--transition-fast, 150ms) ease;
            }

            .status-message.connected {
                background: rgba(16, 185, 129, 0.1);
                color: var(--success-color, #10b981);
                border-color: rgba(16, 185, 129, 0.2);
            }

            .status-message.error {
                background: rgba(239, 68, 68, 0.1);
                color: var(--error-color, #ef4444);
                border-color: rgba(239, 68, 68, 0.2);
            }

            .status-message.warning {
                background: rgba(245, 158, 11, 0.1);
                color: var(--warning-color, #f59e0b);
                border-color: rgba(245, 158, 11, 0.2);
            }

            .status-message.info {
                background: rgba(59, 130, 246, 0.1);
                color: var(--primary-color, #667eea);
                border-color: rgba(59, 130, 246, 0.2);
            }

            @media (max-width: 480px) {
                .status-message {
                    padding: var(--spacing-sm, 0.75rem);
                    font-size: var(--font-size-sm, 0.875rem);
                    margin-bottom: var(--spacing-sm, 0.75rem);
                }
            }

            /* Loading animation */
            .loading {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid rgba(255,255,255,.3);
                border-radius: var(--border-radius-full, 50%);
                border-top-color: #fff;
                animation: spin 1s ease-in-out infinite;
                margin-right: var(--spacing-xs, 0.25rem);
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Responsive utilities */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }

            /* Focus styles for accessibility */
            :focus-visible {
                outline: 2px solid var(--primary-color, #667eea);
                outline-offset: 2px;
                border-radius: var(--border-radius-sm, 0.25rem);
            }

            /* Print styles */
            @media print {
                .app-container {
                    box-shadow: none;
                    border: 1px solid #ccc;
                    margin: 0;
                    width: 100%;
                }
                
                video-call-header,
                app-footer {
                    display: none;
                }
            }

            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
                
                .fade-in {
                    animation: none;
                }
            }

            /* High contrast mode support */
            @media (prefers-contrast: high) {
                .status-message {
                    border-width: 2px;
                }
                
                .app-container {
                    border-width: 2px;
                }
            }

            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .app-container {
                    background: var(--surface-color, #1f2937);
                }
                
                .status-message {
                    background: var(--background-color, #374151);
                }
            }
        `;
  }

  setupComponentListeners() {
    this.shadowRoot.addEventListener("create-call", () => this.createCall());
    this.shadowRoot.addEventListener("join-call", (e) =>
      this.joinCall(e.detail.sessionId)
    );
    this.shadowRoot.addEventListener("end-call", () => this.endCall());
    this.shadowRoot.addEventListener("toggle-video", () => this.toggleVideo());
    this.shadowRoot.addEventListener("toggle-audio", () => this.toggleAudio());
    this.shadowRoot.addEventListener("switch-camera", () =>
      this.switchCamera()
    );
    this.shadowRoot.addEventListener("copy-link", () => this.copyLink());
    this.shadowRoot.addEventListener("show-qr", () => this.toggleQrCode());
    this.shadowRoot.addEventListener("create-instead", () =>
      this.showInitiatorForm()
    );
    this.shadowRoot.addEventListener("new-call", () =>
      this.showInitiatorForm()
    );

    this.mediaManager.on("streamReady", (stream) =>
      this.handleStreamReady(stream)
    );
    this.mediaManager.on("streamError", (error) =>
      this.handleStreamError(error)
    );

    this.webrtcHandler.on("remoteStream", (stream) =>
      this.handleRemoteStream(stream)
    );
    this.webrtcHandler.on("connectionStateChange", (state) =>
      this.handleConnectionState(state)
    );
    this.webrtcHandler.on("iceConnectionStateChange", (state) =>
      this.handleIceConnectionState(state)
    );
  }

  setupEventListeners() {
    this.mobileOptimizer.initialize();

    window.addEventListener(
      "resize",
      debounce(() => {
        this.handleResize();
      }, 250)
    );

    // Handle page visibility changes
    document.addEventListener("visibilitychange", () => {
      this.handleVisibilityChange();
    });

    // Handle online/offline status
    window.addEventListener("online", () => {
      this.updateStatus("Connection restored", false, false, "info");
    });

    window.addEventListener("offline", () => {
      this.updateStatus("No internet connection", true);
    });
  }

  async createCall() {
    try {
      this.updateStatus(
        "Getting camera and microphone access...",
        false,
        false,
        "info"
      );
      await this.mediaManager.getUserMedia();

      this.isCaller = true;
      this.sessionId = this.generateSessionId();

      const callUrl = `${window.location.origin}${window.location.pathname}?session=${this.sessionId}`;
      this.showShareLink(callUrl);

      this.updateStatus(
        "Establishing secure P2P connection...",
        false,
        false,
        "info"
      );
      await this.webrtcHandler.createPeerConnection(
        this.mediaManager.localStream,
        this.isCaller
      );

      this.showVideoContainer();
      this.updateStatus(
        "Ready for connection - share the link with your friend",
        false,
        false,
        "info"
      );
    } catch (error) {
      console.error("Error creating call:", error);
      this.updateStatus("Failed to start call: " + error.message, true);
    }
  }

  async joinCall(sessionId) {
    try {
      this.sessionId = sessionId;
      if (!this.sessionId) {
        this.showError("Please enter a session ID or invitation link");
        return;
      }

      this.updateStatus(
        "Getting camera and microphone access...",
        false,
        false,
        "info"
      );
      await this.mediaManager.getUserMedia();

      this.isCaller = false;

      this.updateStatus(
        "Connecting to video call session...",
        false,
        false,
        "info"
      );
      await this.webrtcHandler.createPeerConnection(
        this.mediaManager.localStream,
        this.isCaller
      );

      this.showVideoContainer();
      this.updateStatus("Connecting...", false, false, "info");
    } catch (error) {
      console.error("Error joining call:", error);
      this.updateStatus("Failed to join call: " + error.message, true);
    }
  }

  handleStreamReady(stream) {
    this.setLocalVideoStream(stream);
    this.updateStatus("Camera and microphone ready", false, false, "info");
  }

  handleStreamError(error) {
    this.updateStatus("Media access error: " + error.message, true);
  }

  handleRemoteStream(stream) {
    this.setRemoteVideoStream(stream);
    this.updateRemoteStatus("Connected");
    this.updateStatus("Call connected successfully!", false, true);
  }

  handleConnectionState(state) {
    this.updateStatus(`Connection: ${state}`, false, false, "info");

    if (state === "connected") {
      this.updateStatus("Call connected!", false, true);
    } else if (state === "disconnected" || state === "failed") {
      this.updateStatus("Connection lost - attempting to reconnect...", true);
    } else if (state === "connecting") {
      this.updateStatus("Establishing connection...", false, false, "info");
    }
  }

  handleIceConnectionState(state) {
    console.log("ICE connection state:", state);

    if (state === "connected") {
      this.updateStatus("Network connection established", false, false, "info");
    } else if (state === "disconnected") {
      this.updateStatus("Network connection unstable", true);
    } else if (state === "failed") {
      this.updateStatus("Network connection failed", true);
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden - could optimize resources
      console.log("Page visibility changed: hidden");
    } else {
      // Page is visible
      console.log("Page visibility changed: visible");
    }
  }

  toggleVideo() {
    this.videoEnabled = this.mediaManager.toggleVideo();
    this.updateVideoButton(this.videoEnabled);
    this.updateVideoIndicator(this.videoEnabled);
    this.updateStatus(
      this.videoEnabled ? "Video enabled" : "Video disabled",
      false,
      false,
      "info"
    );
  }

  toggleAudio() {
    this.audioEnabled = this.mediaManager.toggleAudio();
    this.updateAudioButton(this.audioEnabled);
    this.updateAudioIndicator(this.audioEnabled);
    this.updateStatus(
      this.audioEnabled ? "Audio enabled" : "Audio disabled",
      false,
      false,
      "info"
    );
  }

  async switchCamera() {
    try {
      await this.mediaManager.switchCamera();
      this.updateStatus("Camera switched", false, false, "info");
    } catch (error) {
      console.error("Error switching camera:", error);
      this.updateStatus("Error switching camera", true);
    }
  }

  endCall() {
    this.mobileOptimizer.cleanup();
    this.mediaManager.cleanup();
    this.webrtcHandler.cleanup();
    this.showInitiatorForm();
    this.updateStatus("Call ended", false, false, "info");

    // Clear URL session parameter
    const url = new URL(window.location);
    url.searchParams.delete("session");
    window.history.replaceState({}, "", url);
  }

  copyLink() {
    const callLink = this.shadowRoot.querySelector("#call-link");
    if (callLink) {
      callLink.select();
      document.execCommand("copy");

      // Show success feedback
      const copyBtn = this.shadowRoot.querySelector("#copy-link");
      if (copyBtn) {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        copyBtn.style.background = "var(--success-color, #10b981)";

        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.style.background = "";
        }, 2000);
      }
    }
  }

  showInitiatorForm() {
    this.hideAll();
    const initiatorForm = this.shadowRoot.querySelector("initiator-form");
    if (initiatorForm) {
      initiatorForm.classList.remove("hidden");
      initiatorForm.classList.add("fade-in");
    }
  }

  showJoinerForm() {
    this.hideAll();
    const joinerForm = this.shadowRoot.querySelector("joiner-form");
    if (joinerForm) {
      joinerForm.classList.remove("hidden");
      joinerForm.classList.add("fade-in");
      joinerForm.show();
    }
  }

  showVideoContainer() {
    console.log("showVideoContainer called");
    this.hideAll();
    const videoContainer = this.shadowRoot.querySelector("video-container");
    if (videoContainer) {
      // Убедитесь, что вызывается метод show()
      if (videoContainer.show) {
        videoContainer.show();
      } else {
        // Fallback: прямая работа с классами
        videoContainer.classList.remove("hidden");
        videoContainer.classList.add("fade-in");
      }
    }
  }

  hideAll() {
    const components = this.shadowRoot.querySelectorAll(
      "initiator-form, joiner-form, video-container"
    );
    components.forEach((comp) => {
      comp.classList.add("hidden");
      comp.classList.remove("fade-in");
      // Также вызываем метод hide если он существует
      if (comp.hide && typeof comp.hide === "function") {
        comp.hide();
      }
    });
  }

  showShareLink(url) {
    const initiatorForm = this.shadowRoot.querySelector("initiator-form");
    if (initiatorForm && initiatorForm.setCallLink) {
      initiatorForm.setCallLink(url);
      initiatorForm.showShareLink();
    }
  }

  setLocalVideoStream(stream) {
    const videoContainer = this.shadowRoot.querySelector("video-container");
    if (videoContainer && videoContainer.setLocalStream) {
      videoContainer.setLocalStream(stream);
    }
  }

  setRemoteVideoStream(stream) {
    const videoContainer = this.shadowRoot.querySelector("video-container");
    if (videoContainer && videoContainer.setRemoteStream) {
      videoContainer.setRemoteStream(stream);
    }
  }

  updateVideoButton(enabled) {
    const videoContainer = this.shadowRoot.querySelector("video-container");
    if (videoContainer && videoContainer.updateVideoButton) {
      videoContainer.updateVideoButton(enabled);
    }
  }

  updateAudioButton(enabled) {
    const videoContainer = this.shadowRoot.querySelector("video-container");
    if (videoContainer && videoContainer.updateAudioButton) {
      videoContainer.updateAudioButton(enabled);
    }
  }

  updateVideoIndicator(enabled) {
    const videoContainer = this.shadowRoot.querySelector("video-container");
    if (videoContainer && videoContainer.updateVideoIndicator) {
      videoContainer.updateVideoIndicator(enabled);
    }
  }

  updateAudioIndicator(enabled) {
    const videoContainer = this.shadowRoot.querySelector("video-container");
    if (videoContainer && videoContainer.updateAudioIndicator) {
      videoContainer.updateAudioIndicator(enabled);
    }
  }

  updateRemoteStatus(status) {
    const videoContainer = this.shadowRoot.querySelector("video-container");
    if (videoContainer && videoContainer.updateRemoteStatus) {
      videoContainer.updateRemoteStatus(status);
    }
  }

  updateStatus(message, isError = false, isConnected = false, type = "info") {
    // Update status in video container if available
    const videoContainer = this.shadowRoot.querySelector("video-container");
    if (videoContainer && videoContainer.updateStatus) {
      videoContainer.updateStatus(message, isError, isConnected);
    }

    // Also update in forms if needed
    const forms = this.shadowRoot.querySelectorAll(
      "initiator-form, joiner-form"
    );
    forms.forEach((form) => {
      if (form.updateStatus) {
        form.updateStatus(message, isError);
      }
    });
  }

  showError(message) {
    const joinerForm = this.shadowRoot.querySelector("joiner-form");
    if (joinerForm && joinerForm.showError) {
      joinerForm.showError(message);
    }
  }

  checkUrlForSession() {
    const urlParams = new URLSearchParams(window.location.search);
    const session = urlParams.get("session");

    if (session) {
      this.showJoinerForm();

      // Auto-fill the session ID in joiner form
      const joinerForm = this.shadowRoot.querySelector("joiner-form");
      if (joinerForm && joinerForm.setSessionId) {
        joinerForm.setSessionId(session);
      }
    } else {
      this.showInitiatorForm();
    }
  }

  handleResize() {
    this.mobileOptimizer.handleResize();

    // Notify video container about resize
    const videoContainer = this.shadowRoot.querySelector("video-container");
    if (videoContainer && videoContainer.handleResize) {
      videoContainer.handleResize();
    }
  }

  generateSessionId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  // Cleanup on disconnect
  disconnectedCallback() {
    this.endCall();
  }
}

customElements.define("p2p-video-call", P2PVideoCall);
