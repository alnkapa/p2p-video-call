// Import all components
import './components/p2p-video-call.js';
import './components/app-header.js';
import './components/initiator-form.js';
import './components/joiner-form.js';
import './components/video-container.js';
import './components/app-footer.js';

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
