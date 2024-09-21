// File: content_scripts/inject.js

(function() {
    const originalConsoleError = console.error;
    console.error = function(...args) {
        window.dispatchEvent(new CustomEvent('customConsoleError', { detail: args.join(' ') }));
        originalConsoleError.apply(console, args);
    };
})();