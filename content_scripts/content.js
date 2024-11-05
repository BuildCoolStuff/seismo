// content.js
console.log('Seismo content script loaded');

// Establish connection with background script
const port = chrome.runtime.connect({ name: 'seismo-content' });

class SeismoToast {
  constructor() {
    this.styleId = 'seismo-styles';
    this.containerId = 'seismo-container';
    this.ensureInitialized();
  }

  ensureInitialized() {
    if (document.body) {
      this.initialize();
    } else {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    }
  }

  initialize() {
    this.createStyles();
    this.createContainer();
  }

  createContainer() {
    if (!document.getElementById(this.containerId)) {
      const container = document.createElement('div');
      container.id = this.containerId;
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2147483647;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }
  }

  createStyles() {
    if (!document.getElementById(this.styleId)) {
      const style = document.createElement('style');
      style.id = this.styleId;
      style.innerHTML = `
        .seismo-toast {
          position: relative;
          background-color: #f44336;
          color: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          max-width: 380px;
          word-wrap: break-word;
          margin-bottom: 10px;
          pointer-events: auto;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          font-size: 14px;
          animation: seismo-slide-in 0.3s ease-out forwards;
          overflow: hidden;
        }

        .seismo-toast:hover .seismo-progress-bar::after {
          animation-play-state: paused;
        }

        .seismo-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background-color: rgba(255, 255, 255, 0.5);
        }

        .seismo-progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          background-color: rgba(255, 255, 255, 0.7);
          animation: seismo-progress 5s linear forwards;
        }

        .seismo-close-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          padding: 4px;
          line-height: 1;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .seismo-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .seismo-close-btn svg {
          width: 16px;
          height: 16px;
        }

        @keyframes seismo-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .seismo-toast.removing {
          animation: seismo-slide-out 0.3s ease-in forwards;
        }

        .seismo-toast strong {
          color: #ffffff;
          display: inline-block;
          min-width: 85px;
          margin-right: 4px;
          flex-shrink: 0;
        }

        .seismo-toast-content {
          margin: 4px 0;
          line-height: 1.5;
          display: flex;
          align-items: flex-start;
        }

        .seismo-toast .wrap-text {
          display: inline;
          word-break: break-word;
          color: rgba(255, 255, 255, 0.9);
          flex: 1;
        }

        @keyframes seismo-slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes seismo-slide-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .seismo-toast-error {
          background-color: #f44336;
          border-left: 4px solid #d32f2f;
        }

        .seismo-toast-warning {
          background-color: #ff9800;
          border-left: 4px solid #f57c00;
        }

        .seismo-toast-server {
          background-color: #9c27b0;
          border-left: 4px solid #7b1fa2;
        }

        .seismo-toast-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding-right: 24px;
        }

        .seismo-settings-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          font-size: 12px;
          display: flex;
          align-items: center;
          transition: all 0.2s;
        }

        .seismo-settings-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .seismo-settings-btn svg {
          width: 16px;
          height: 16px;
          margin-right: 4px;
        }
      `;
      
      const appendStyle = () => {
        if (document.head) {
          document.head.appendChild(style);
        } else if (document.body) {
          document.body.appendChild(style);
        } else {
          setTimeout(appendStyle, 100);
        }
      };
      
      appendStyle();
    }
  }

  show(errCode, description, url, time, action) {
    this.ensureInitialized();
    
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.warn('Seismo: Container not ready, retrying...');
      setTimeout(() => this.show(errCode, description, url, time, action), 100);
      return;
    }

    const toast = document.createElement('div');
    
    let toastType = 'error';
    if (errCode.includes('500')) {
      toastType = 'server';
    } else if (errCode.includes('403') || errCode.includes('401')) {
      toastType = 'warning';
    }

    toast.className = `seismo-toast seismo-toast-${toastType}`;
    const hostname = window.location.hostname;
    
    toast.innerHTML = `
      <button class="seismo-close-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div class="seismo-toast-header">
        <div class="seismo-toast-content">
          <strong>Time:</strong> <span class="wrap-text">${time}</span>
        </div>
        <button class="seismo-settings-btn" data-hostname="${hostname}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 15l-3-3h6l-3 3z"/>
          </svg>
          Exclude Site
        </button>
      </div>
      <div class="seismo-toast-content">
        <strong>Error Code:</strong> <span class="wrap-text">${errCode}</span>
      </div>
      <div class="seismo-toast-content">
        <strong>Description:</strong> <span class="wrap-text">${description}</span>
      </div>
      <div class="seismo-toast-content">
        <strong>URL:</strong> <span class="wrap-text">${url}</span>
      </div>
      <div class="seismo-toast-content">
        <strong>Action:</strong> <span class="wrap-text">${action}</span>
      </div>
      <div class="seismo-progress-bar"></div>
    `;

    // Add click handler for the exclude button
    const excludeBtn = toast.querySelector('.seismo-settings-btn');
    excludeBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const hostname = e.currentTarget.dataset.hostname;
      await this.excludeSite(hostname);
      toast.classList.add('removing');
    });

    // Add click handler for the close button
    const closeBtn = toast.querySelector('.seismo-close-btn');
    closeBtn.addEventListener('click', () => {
      removeToast();
    });

    container.appendChild(toast);

    // Initialize toast removal handler
    const removeToast = () => {
      if (container.contains(toast)) {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => {
          if (container.contains(toast)) {
            container.removeChild(toast);
          }
        });
      }
    };

    // Handle toast timeout and hover pause
    const TOTAL_TIME = 5000; // 5 seconds
    let startTime = Date.now();
    let timeoutId = null;
    let remainingTime = TOTAL_TIME;
    let progressInterval = null;

    const updateProgressBar = () => {
      const progressBar = toast.querySelector('.seismo-progress-bar::after');
      if (progressBar) {
        const progress = 1 - (remainingTime / TOTAL_TIME);
        progressBar.style.transform = `scaleX(${1 - progress})`;
      }
    };

    const startTimer = () => {
      startTime = Date.now();
      
      // Clear any existing intervals/timeouts
      if (timeoutId) clearTimeout(timeoutId);
      if (progressInterval) clearInterval(progressInterval);
      
      // Set up the removal timeout
      timeoutId = setTimeout(removeToast, remainingTime);

      // Set up progress bar updates
      progressInterval = setInterval(() => {
        remainingTime = Math.max(0, remainingTime - 100);
        updateProgressBar();
        if (remainingTime <= 0) {
          clearInterval(progressInterval);
        }
      }, 100);
    };

    const pauseTimer = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      const elapsedTime = Date.now() - startTime;
      remainingTime = Math.max(0, remainingTime - elapsedTime);
    };

    // Start initial timer
    startTimer();

    // Pause timer on hover
    toast.addEventListener('mouseenter', () => {
      pauseTimer();
    });

    // Resume timer when mouse leaves
    toast.addEventListener('mouseleave', () => {
      if (remainingTime > 0) {
        startTimer();
      }
    });

    // Clear timeout if toast is manually closed
    closeBtn.addEventListener('click', () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (progressInterval) clearInterval(progressInterval);
    });

    return toast;
  }

  async excludeSite(hostname) {
    try {
      const result = await chrome.storage.sync.get('excludedSites');
      const excludedSites = result.excludedSites || [];
      
      if (!excludedSites.includes(hostname)) {
        excludedSites.push(hostname);
        await chrome.storage.sync.set({ excludedSites });
      }
      
      console.log(`Excluded ${hostname} from error detection`);
    } catch (error) {
      console.error('Error excluding site:', error);
    }
  }
}

const errorCache = new Map();
const DEBOUNCE_TIME = 1000; // 1 second

function getUrlWithoutParams(url) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}${urlObj.pathname}`;
  } catch (e) {
    return url;
  }
}

function shouldShowError(url, statusCode) {
    const baseUrl = getUrlWithoutParams(url);
    const host = new URL(baseUrl).hostname;

    const key = `${host}-${statusCode}`;
    const now = Date.now();
    const lastShown = errorCache.get(key);
    
    if (lastShown && (now - lastShown) < DEBOUNCE_TIME) {
      console.log(`Debouncing error for ${host} with status ${statusCode}`);
      return false;
    }
    
    errorCache.set(key, now);
    return true;
}

const seismoToast = new SeismoToast();

function analyseNetworkError(request) {
    const { method, url, statusCode, timeStamp} = request.details;

    const maxUrlLength = 100;
    const snipUrl = url.length > maxUrlLength ? `${url.substring(0, maxUrlLength)}...` : url;
    tp = !shouldShowError(url, statusCode)
    
    if (tp) {
      return;
    }
  
    let description, time, action, errCode;
    const date = new Date(timeStamp);
    time = date.toLocaleString();
    errCode = `Method: ${method}, Status Code: ${statusCode}`;
  
    if (statusCode === 404) {
        description = "The webpage you are looking for does not exist.";
        action = "Check the URL and try again.";
    } else if (statusCode === 500) {
        description = "The server was confused by your request. Most likely, not your fault.";
        action = "Inform the website admin or check if you made a mistake. If nothing worked, try again later.";
    } else if (statusCode === 401) {
        description = "You are not authorized to visit this page!";
        action = "Check if you are logged in or have the right permissions.";
    } else if (statusCode === 403) {
        description = "You are not authorized to access this resource!";
        action = "Check if you have specified the right key or token and have permissions to access this resource.";
    } else if (statusCode >= 500 && statusCode < 600) {
        description = "The server was confused by your request. Most likely, not your fault.";
        action = "Inform the website admin or check if you made a mistake. If nothing worked, try again later.";
    } else {
        description = "Hmm... This is new to me. Something went wrong for sure though!";  
        action = "Well this is new to me, so let's just google";
    }

    seismoToast.show(errCode, description, snipUrl, time, action);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "NETWORK_ERROR") {
    console.log(request);
    analyseNetworkError(request);
  }
  return true;
});