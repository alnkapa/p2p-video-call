export class MobileOptimizer {
  constructor() {
    this.isMobile = this.detectMobile();
    this.wakeLock = null;
  }

  detectMobile() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
    );
  }

  initialize() {
    if (this.isMobile) {
      document.body.classList.add("mobile");
      console.log("Mobile device detected");
    }

    this.setupWakeLock();
    this.setupTouchOptimizations();
  }

  setupTouchOptimizations() {
    document.addEventListener(
      "touchstart",
      (e) => {
        if (e.target.matches("button")) {
          e.target.style.transform = "scale(0.95)";
        }
      },
      { passive: true }
    );

    document.addEventListener(
      "touchend",
      (e) => {
        if (e.target.matches("button")) {
          e.target.style.transform = "";
        }
      },
      { passive: true }
    );
  }

  async setupWakeLock() {
    if ("wakeLock" in navigator && this.isMobile) {
      try {
        this.wakeLock = await navigator.wakeLock.request("screen");
        console.log("Wake Lock activated");
      } catch (err) {
        console.log("Wake Lock not supported:", err);
      }
    }
  }

  handleResize() {
    const isNowMobile = window.innerWidth <= 768;

    if (isNowMobile !== this.isMobile) {
      this.isMobile = isNowMobile;
      document.body.classList.toggle("mobile", this.isMobile);
      console.log(`Mode changed: ${this.isMobile ? "mobile" : "desktop"}`);
    }
  }

  async lockOrientation() {
    if (screen.orientation && screen.orientation.lock) {
      try {
        await screen.orientation.lock("landscape");
      } catch (e) {
        console.log("Orientation lock not supported");
      }
    }
  }

  unlockOrientation() {
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    }
  }

  cleanup() {
    this.unlockOrientation();

    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
    }
  }
}
