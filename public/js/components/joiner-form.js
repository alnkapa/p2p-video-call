const css = "/js/components/joiner-form.css";

class JoinerForm extends HTMLElement {
    constructor() {
        super();
        this.cssLoadPromise = this.loadCSS();
        this.attachShadow({ mode: 'open' });
        this.isVisible = false;
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
        this.setupEventListeners();
    }

    async render() {
        if (!this.cssContent) {
            this.cssContent = await this.cssLoadPromise;
        }
        
        this.shadowRoot.innerHTML = `
        <style>${this.cssContent}</style>
        <div class="joiner-form ${this.isVisible ? '' : 'hidden'}">
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
                    >
                    <div id="error-message" class="error-message"></div>
                    <div class="paste-hint">You can paste the full invitation link - we'll extract the session ID automatically</div>
                </div>
                
                <button id="join-call" class="btn-primary">
                    <span>Join Video Call</span>
                </button>
                
                <div class="instructions">
                    <h3>How to join a call</h3>
                    <p>Get the session ID or invitation link from the person who created the call and enter it above.</p>
                </div>
                
                <div class="alternative-options">
                    <p class="alternative-text">Don't have a session ID?</p>
                    <button id="create-instead" class="btn-secondary" style="background: transparent; color: var(--color-primary-500); border: none; cursor: pointer;">
                        Create a new call instead
                    </button>
                </div>
            </div>
        </div>`;
    }

    setupEventListeners() {
        this.shadowRoot.addEventListener('click', (event) => {
            if (event.target.matches('#join-call')) {
                this.handleJoinCall();
            } else if (event.target.matches('#create-instead')) {
                this.dispatchEvent(new CustomEvent('create-instead', { 
                    bubbles: true,
                    composed: true
                }));
            }
        });

        const sessionIdInput = this.shadowRoot.querySelector('#session-id');
        if (sessionIdInput) {
            sessionIdInput.addEventListener('input', () => {
                this.clearError();
            });

            sessionIdInput.addEventListener('paste', (event) => {
                setTimeout(() => {
                    this.extractSessionIdFromInput();
                }, 0);
            });
        }
    }

    handleJoinCall() {
        const sessionIdInput = this.shadowRoot.querySelector('#session-id');
        const sessionId = sessionIdInput ? sessionIdInput.value.trim() : '';
        
        if (!sessionId) {
            this.showError('Please enter a session ID or invitation link');
            return;
        }

        const extractedSessionId = this.extractSessionId(sessionId);
        
        this.dispatchEvent(new CustomEvent('join-call', { 
            bubbles: true,
            composed: true,
            detail: { sessionId: extractedSessionId }
        }));
    }

    extractSessionId(input) {
        if (input.includes('?')) {
            const url = new URL(input);
            return url.searchParams.get('session') || input;
        }
        return input;
    }

    extractSessionIdFromInput() {
        const sessionIdInput = this.shadowRoot.querySelector('#session-id');
        if (sessionIdInput) {
            const extracted = this.extractSessionId(sessionIdInput.value);
            sessionIdInput.value = extracted;
        }
    }

    showError(message) {
        const errorElement = this.shadowRoot.getElementById('error-message');
        const inputElement = this.shadowRoot.querySelector('#session-id');
        
        if (errorElement && inputElement) {
            errorElement.textContent = message;
            errorElement.classList.add('visible');
            inputElement.classList.add('input-error');
        }
    }

    clearError() {
        const errorElement = this.shadowRoot.getElementById('error-message');
        const inputElement = this.shadowRoot.querySelector('#session-id');
        
        if (errorElement && inputElement) {
            errorElement.classList.remove('visible');
            inputElement.classList.remove('input-error');
        }
    }

    show() {
        this.isVisible = true;
        const container = this.shadowRoot.querySelector('.joiner-form');
        if (container) {
            container.classList.remove('hidden');
            container.classList.add('fade-in');
        }
    }

    hide() {
        this.isVisible = false;
        const container = this.shadowRoot.querySelector('.joiner-form');
        if (container) {
            container.classList.add('hidden');
            container.classList.remove('fade-in');
        }
    }

    isVisible() {
        return this.isVisible;
    }
    
    clear() {
        const input = this.shadowRoot.querySelector('#session-id');
        if (input) {
            input.value = '';
        }
        this.clearError();
    }

    setLoading(loading) {
        const button = this.shadowRoot.querySelector('#join-call');
        if (button) {
            button.disabled = loading;
            button.innerHTML = loading ? 
                '<span>Connecting...</span>' : 
                '<span>Join Video Call</span>';
        }
    }
}

customElements.define('joiner-form', JoinerForm);