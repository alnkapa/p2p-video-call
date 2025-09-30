const css = "/js/components/p2p-video-call.css";
import { MediaManager } from "../modules/media-manager.js";
import { WebRTCHandler } from "../modules/webrtc-handler.js";
import { MobileOptimizer } from "../modules/mobile-optimizer.js";
import { generateSessionId, callUrl, debounce } from "../modules/utils.js";
import { EVENTS } from "./events.js";
import "./app-header.js";
import "./initiator-form.js";
import "./joiner-form.js";
import "./video-container.js";
import "./app-footer.js";

class P2PVideoCall extends HTMLElement {
  constructor() {
    super();
    this.cssLoadPromise = this.loadCSS();
    this.isCaller = false;
    this.sessionId = null;
    this.isOnline = false;
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
    this.webRtcHandler = new WebRTCHandler(this.config);
    this.mobileOptimizer = new MobileOptimizer();
    this.attachShadow({ mode: "open" });
    this.setupEventListeners();
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
    await this.setupComponentListeners();
    await this.checkUrlForSession();
  }

  async render() {
    if (!this.cssContent) {
      this.cssContent = await this.cssLoadPromise;
    }
    this.shadowRoot.innerHTML = `
    <style>${this.cssContent}</style>
    <div class="app-container">
      <app-header></app-header>
      <video-container></video-container>
      <joiner-form></joiner-form>
      <initiator-form></initiator-form>      
      <app-footer></app-footer>
    </div>`;
  }

  async setupComponentListeners() {
    this.shadowRoot.addEventListener(EVENTS.CREATE_CALL, () =>
      this.createCall()
    );

    this.shadowRoot.addEventListener(EVENTS.JOIN_CALL, (e) =>
      this.joinCall(e.detail.sessionId)
    );

    this.mediaManager.on("streamReady", (stream) =>
      this.handleStreamReady(stream)
    );
    this.mediaManager.on("streamError", (error) =>
      this.handleStreamError(error)
    );

    this.shadowRoot.addEventListener("end-call", () => this.endCall());
    this.shadowRoot.addEventListener("toggle-video", () => this.toggleVideo());
    this.shadowRoot.addEventListener("toggle-audio", () => this.toggleAudio());
    this.shadowRoot.addEventListener("switch-camera", () =>
      this.switchCamera()
    );

    this.webRtcHandler.on("remoteStream", (stream) =>
      this.handleRemoteStream(stream)
    );
    this.webRtcHandler.on("connectionStateChange", (state) =>
      this.handleConnectionState(state)
    );
    this.webRtcHandler.on("iceConnectionStateChange", (state) =>
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
    document.addEventListener("visibilitychange", () => {
      this.handleVisibilityChange();
    });
    window.addEventListener("online", () => {
      this.updateStatus("Connection restored", false);
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
        false
      );
      await this.mediaManager.getUserMedia();

      this.isCaller = true;
      this.sessionId = generateSessionId();
      this.showShareLink(callUrl(this.sessionId));

      this.updateStatus("Establishing secure P2P connection...", false);
      await this.webRtcHandler.createPeerConnection(
        this.mediaManager.localStream,
        this.isCaller
      );

      this.showVideoContainer();
      this.updateStatus(
        "Ready for connection - share the link with your friend",
        false,
        false
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
        false
      );
      await this.mediaManager.getUserMedia();

      this.isCaller = false;

      this.updateStatus("Connecting to video call session...", false, false);
      await this.webRtcHandler.createPeerConnection(
        this.mediaManager.localStream,
        this.isCaller
      );

      this.showVideoContainer();
      this.updateStatus("Connecting...", false, false);
    } catch (error) {
      console.error("Error joining call:", error);
      this.updateStatus("Failed to join call: " + error.message, true);
    }
  }

  handleStreamReady(stream) {
    this.setLocalVideoStream(stream);
    this.updateStatus("Camera and microphone ready", false);
  }

  handleStreamError(error) {
    this.updateStatus("Media access error: " + error.message, true);
  }

  handleRemoteStream(stream) {
    this.setRemoteVideoStream(stream);
    this.updateRemoteStatus("Connected");
    this.updateStatus("Call connected successfully!", false);
  }

  handleConnectionState(state) {
    this.updateStatus(`Connection: ${state}`, false);
    if (state === "connected") {
      this.isOnline = true;
      this.updateStatus("Call connected!", false);
    } else if (state === "disconnected" || state === "failed") {
      this.isOnline = false;
      this.updateStatus("Connection lost - attempting to reconnect...", true);
    } else if (state === "connecting") {
      this.isOnline = false;
      this.updateStatus("Establishing connection...", false);
    }
  }

  handleIceConnectionState(state) {
    console.log("ICE connection state:", state);
    if (state === "connected") {
      this.isOnline = true;
      this.updateStatus("Network connection established", false);
    } else if (state === "disconnected") {
      this.isOnline = false;
      this.updateStatus("Network connection unstable", true);
    } else if (state === "failed") {
      this.isOnline = false;
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
      false
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
    this.webRtcHandler.cleanup();
    this.showInitiatorForm();
    this.updateStatus("Call ended", false);

    // Clear URL session parameter
    const url = new URL(window.location);
    url.searchParams.delete("session");
    window.history.replaceState({}, "", url);
  }

  showInitiatorForm() {
    this.hideAll();
    const initiatorForm = this.shadowRoot.querySelector("initiator-form");
    if (initiatorForm) {
      initiatorForm.classList.remove("hidden");
      initiatorForm.classList.add("fade-in");
      initiatorForm.show();
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
    const videoContainer = this.shadowRoot.querySelector("video-container");
    if (videoContainer) {
      if (videoContainer.show) {
        videoContainer.show();
      }
    }
  }

  hideAll() {
    const components = this.shadowRoot.querySelectorAll(
      "initiator-form, joiner-form, video-container"
    );
    components.forEach((comp) => {
      if (comp.hide && typeof comp.hide === "function") {
        comp.hide();
      }
    });
  }

  showShareLink(url) {
    const initiatorForm = this.shadowRoot.querySelector("initiator-form");
    if (initiatorForm && initiatorForm.showCallLink) {
      initiatorForm.showCallLink(url);
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

  updateStatus(message, isError = false) {
    // Update status in video container if available
    const videoContainer = this.shadowRoot.querySelector("video-container");
    if (videoContainer && videoContainer.updateStatus) {
      videoContainer.updateStatus(message, isError, this.isOnline);
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

  async checkUrlForSession() {
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

  // Cleanup on disconnect
  disconnectedCallback() {
    this.endCall();
  }
}

customElements.define("p2p-video-call", P2PVideoCall);
