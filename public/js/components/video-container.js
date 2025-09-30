const css = "js/components/video-container.css";
import { EVENTS } from "./events.js";

class VideoContainer extends HTMLElement {
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
    <div id="video-container" class="hidden">
        <div class="video-grid">
            <div class="video-wrapper">
                <video id="local-video" autoplay muted playsinline></video>
                <div class="video-overlay">
                    <span class="participant-name">You</span>
                    <div class="video-indicators">
                        <span id="video-indicator" class="indicator">📹</span>
                        <span id="audio-indicator" class="indicator">🎤</span>
                    </div>
                </div>
            </div>
            <div class="video-wrapper">
                <video id="remote-video" autoplay playsinline></video>
                <div class="video-overlay">
                    <span class="participant-name">Participant</span>
                    <span id="remote-status" class="remote-status connecting">Connecting...</span>
                </div>
            </div>
        </div>
        
        <div class="controls">
            <button id="toggle-video" class="control-btn" title="Toggle video">
                <span class="icon">📹</span>
                <span class="text">Turn off video</span>
            </button>
            <button id="toggle-audio" class="control-btn" title="Toggle microphone">
                <span class="icon">🎤</span>
                <span class="text">Turn off audio</span>
            </button>
            <button id="switch-camera" class="control-btn" title="Switch camera">
                <span class="icon">📷</span>
                <span class="text">Switch camera</span>
            </button>
            <button id="end-call" class="control-btn" title="End call">
                <span class="icon">📞</span>
                <span class="text">End call</span>
            </button>
        </div>
        
        <div id="status" class="status-message info">Connecting...</div>
    </div>`;
  }

  async setupEventListeners() {
    const toggleVideoButton = this.shadowRoot.getElementById("toggle-video");
    toggleVideoButton.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent(EVENTS.TOGGLE_VIDEO, {
          bubbles: true,
          composed: true,
        })
      );
    });
    const toggleAudioButton = this.shadowRoot.getElementById("toggle-audio");
    toggleAudioButton.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent(EVENTS.TOGGLE_AUDIO, {
          bubbles: true,
          composed: true,
        })
      );
    });
    const switchCameraButton = this.shadowRoot.getElementById("switch-camera");
    switchCameraButton.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent(EVENTS.SWITCH_CAMERA, {
          bubbles: true,
          composed: true,
        })
      );
    });
    const endCallButton = this.shadowRoot.getElementById("end-call");
    endCallButton.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent(EVENTS.END_CALL, {
          bubbles: true,
          composed: true,
        })
      );
    });
    // Double click to enter fullscreen
    this.shadowRoot.addEventListener("dblclick", (event) => {
      if (
        event.target.matches(".video-wrapper") ||
        event.target.matches("video")
      ) {
        this.toggleFullscreen(event.target.closest(".video-wrapper"));
      }
    });
  }

  // Public methods for parent component
  setLocalStream(stream) {
    const localVideo = this.shadowRoot.getElementById("local-video");
    if (localVideo) {
      localVideo.srcObject = stream;
    }
  }

  setRemoteStream(stream) {
    const remoteVideo = this.shadowRoot.getElementById("remote-video");
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
    }
  }

  updateVideoButton(enabled) {
    const toggleVideoBtn = this.shadowRoot.getElementById("toggle-video");
    if (toggleVideoBtn) {
      const textElement = toggleVideoBtn.querySelector(".text");
      const iconElement = toggleVideoBtn.querySelector(".icon");
      if (textElement)
        textElement.textContent = enabled ? "Turn off video" : "Turn on video";
      if (iconElement) iconElement.textContent = enabled ? "📹" : "📹🚫";
    }
  }

  updateAudioButton(enabled) {
    const toggleAudioBtn = this.shadowRoot.getElementById("toggle-audio");
    if (toggleAudioBtn) {
      const textElement = toggleAudioBtn.querySelector(".text");
      const iconElement = toggleAudioBtn.querySelector(".icon");
      if (textElement)
        textElement.textContent = enabled ? "Turn off audio" : "Turn on audio";
      if (iconElement) iconElement.textContent = enabled ? "🎤" : "🎤🚫";
    }
  }

  updateVideoIndicator(enabled) {
    const videoIndicator = this.shadowRoot.getElementById("video-indicator");
    if (videoIndicator) {
      videoIndicator.classList.toggle("video-off", !enabled);
    }
  }

  updateAudioIndicator(enabled) {
    const audioIndicator = this.shadowRoot.getElementById("audio-indicator");
    if (audioIndicator) {
      audioIndicator.classList.toggle("audio-off", !enabled);
    }
  }

  updateRemoteStatus(status) {
    const remoteStatus = this.shadowRoot.getElementById("remote-status");
    if (remoteStatus) {
      remoteStatus.textContent = status;
      remoteStatus.className = "remote-status";

      if (status.toLowerCase().includes("connected")) {
        remoteStatus.classList.add("connected");
      } else if (status.toLowerCase().includes("connecting")) {
        remoteStatus.classList.add("connecting");
      } else if (status.toLowerCase().includes("disconnected")) {
        remoteStatus.classList.add("disconnected");
      }
    }
  }

  updateStatus(message, isError = false, isConnected = false) {
    const status = this.shadowRoot.getElementById("status");
    if (status) {
      status.textContent = message;
      status.className = "status-message";

      if (isError) {
        status.classList.add("error");
      } else if (isConnected) {
        status.classList.add("connected");
      } else {
        status.classList.add("info");
      }
    }
  }

  show() {
    const container = this.shadowRoot.getElementById("video-container");
    if (container) {
      container.classList.remove("hidden");
      container.classList.add("fade-in");
    }
  }

  hide() {
    const container = this.shadowRoot.getElementById("video-container");
    if (container) {
      container.classList.add("hidden");
      container.classList.remove("fade-in");
    }
  }

  toggleFullscreen(videoWrapper) {
    if (!document.fullscreenElement) {
      videoWrapper.requestFullscreen().catch((err) => {
        console.log("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  handleResize() {
    // Handle any resize-specific logic
    const videoWrappers = this.shadowRoot.querySelectorAll(".video-wrapper");
    videoWrappers.forEach((wrapper) => {
      // Adjust layout if needed
    });
  }
}

customElements.define("video-container", VideoContainer);
