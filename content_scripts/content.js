// File: content_scripts/content.js

function showNotification(message, details) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #f44336;
        color: white;
        padding: 16px;
        border-radius: 4px;
        z-index: 1000;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 5000);
}

// Listen for custom events from the injected script (console errors)
window.addEventListener('customConsoleError', function(event) {
    showNotification('Console Error: ' + event.detail);
});

// Listen for messages from the background script (network errors)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "ERROR") {
        showNotification(request.message, request.details);
    }
});

// Inject the script file instead of inline script
const scriptElem = document.createElement('script');
scriptElem.src = chrome.runtime.getURL('content_scripts/inject.js');
scriptElem.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(scriptElem);

console.log('Seismo content script loaded');