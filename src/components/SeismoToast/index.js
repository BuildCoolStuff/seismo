import { Logger } from '../../utils/Logger.js';
import { TIME, UI, DOM, ERROR_TYPES, TOAST_MODES } from '../../utils/Constants.js';
import { icons } from './icons.js';
import { styles } from './styles.js';

export class SeismoToast {
  constructor() {
    this.styleId = DOM.STYLE_ID;
    this.containerId = DOM.CONTAINER_ID;
    this.icons = icons;
    this.ensureInitialized();
    this.API_URL = 'https://seismo-api.abhigyanbafna7.workers.dev';
    this.clientId = localStorage.getItem('seismo_client_id') || this.generateClientId();
  }

  generateClientId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const id = `${timestamp}-${random}`;
    localStorage.setItem('seismo_client_id', id);
    return id;
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
          z-index: ${DOM.Z_INDEX};
          pointer-events: none;
        `;
      document.body.appendChild(container);
    }
  }

  createStyles() {
    if (!document.getElementById(this.styleId)) {
      const style = document.createElement('style');
      style.id = this.styleId;
      style.innerHTML = styles;

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

  show(errCode, description, url, time, response) {
    try {
      this.ensureInitialized();

      const container = document.getElementById(this.containerId);
      if (!container) {
        Logger.warn('Seismo: Container not ready, retrying...');
        setTimeout(() => this.show(errCode, description, url, time, response), 100);
        return;
      }

      let toastType = 'error';
      let icon = this.icons.error;
      if (errCode.includes(ERROR_TYPES.SERVER)) {
        toastType = 'server';
        icon = this.icons.server;
      } else if (errCode.includes(ERROR_TYPES.FORBIDDEN) || errCode.includes(ERROR_TYPES.UNAUTHORIZED)) {
        toastType = 'warning';
        icon = this.icons.warning;
      }

      const toast = document.createElement('div');
      toast.className = `seismo-toast seismo-toast-${toastType}`;
      toast.setAttribute('data-mode', TOAST_MODES.SIMPLE);

      const simplifiedDescription = this.getSimpleErrorMessage(errCode);
      const tabUrl = new URL(window.location.toString()).hostname;

      toast.innerHTML = `
                <div class="seismo-toast-header">
                    ${icon}
                    <span class="seismo-title">${simplifiedDescription}</span>
                    <div class="seismo-actions">
                        <button class="seismo-btn seismo-settings-btn" title="Exclude Site" data-hostname="${tabUrl}">
                          ${this.icons.settings}
                        </button>
                        <button class="seismo-btn seismo-expand-btn" title="Show Details">
                            ${this.icons.expand}
                        </button>
                        <button class="seismo-btn seismo-close-btn" title="Close">
                            ${this.icons.close}
                        </button>
                    </div>
                </div>
    
                <div class="seismo-details">
                    <div class="seismo-detail-item">
                        <span class="seismo-detail-label">Status:</span>
                        <span>${errCode}</span>
                    </div>
                    <div class="seismo-detail-item">
                        <span class="seismo-detail-label">Time:</span>
                        <span>${time}</span>
                    </div>
                    <div class="seismo-detail-item">
                        <span class="seismo-detail-label">URL:</span>
                        <span class="seismo-url">${url}</span>
                    </div>
                    <div class="seismo-detail-item">
                        <span class="seismo-detail-label">Description:</span>
                        <span>${description}</span>
                    </div>
                    
                    <div class="seismo-actions" style="margin-top: 12px;">
                        <button class="seismo-btn" title="Copy Details">
                            ${this.icons.copy} Copy
                        </button>
                        <button class="seismo-btn seismo-analysis-btn" title="Deep Analysis">
                          ${this.icons.brain} Analyze
                        </button>
                    </div>

                    <div class="seismo-analysis-result" style="display: none;">
                        <div class="seismo-detail-item">
                            <span class="seismo-detail-label">Analysis:</span>
                            <pre class="seismo-analysis"></pre>
                        </div>
                    </div>
    
                    <div class="seismo-expandable">
                      <div class="seismo-detail-item">
                          <span class="seismo-detail-label">Response:</span>
                          <pre class="seismo-response">${response ? JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        url: response.url
      }, null, 2) : 'No response data available'}</pre>
                      </div>
                    </div>
                </div>
                <div class="seismo-progress-bar"></div>
            `;

      // Add event listeners
      const expandBtn = toast.querySelector('.seismo-expand-btn');
      expandBtn.addEventListener('click', () => {
        const currentMode = toast.getAttribute('data-mode');
        toast.setAttribute('data-mode', currentMode === 'simple' ? 'developer' : 'simple');
      });

      const closeBtn = toast.querySelector('.seismo-close-btn');
      closeBtn.addEventListener('click', () => {
        this.removeToast(toast, container);
        if (timeoutId) clearTimeout(timeoutId);
        if (progressInterval) clearInterval(progressInterval);
      });

      // Add copy functionality
      const copyBtn = toast.querySelector('.seismo-btn[title="Copy Details"]');
      copyBtn.addEventListener('click', async () => {
        const copyText = this.formatCopyText(response);
        try {
          await navigator.clipboard.writeText(copyText);
          this.showButtonSuccess(copyBtn, 'Copied!');
        } catch (err) {
          Logger.error('Failed to copy:', err);
        }
      });

           // Add analysis functionality
           const analysisBtn = toast.querySelector('.seismo-analysis-btn');
           analysisBtn.addEventListener('click', async () => {
               const resultDiv = toast.querySelector('.seismo-analysis-result');
               const analysisContent = toast.querySelector('.seismo-analysis');
               
               this.showButtonSuccess(analysisBtn, 'Analyzing...');
               try {
                   const analysis = await this.getErrorAnalysis({
                       status: errCode,
                       url,
                       message: description,
                       response
                   }, 'deep');
                   
                   resultDiv.style.display = 'block';
                   analysisContent.textContent = analysis;
               } catch (err) {
                   Logger.error('Analysis failed:', err);
               }
           });

      // Add exclude site functionality
      const excludeBtn = toast.querySelector('.seismo-settings-btn');
      excludeBtn.addEventListener('click', async () => {
        await this.excludeSite(tabUrl);
        this.showButtonSuccess(excludeBtn, 'Site Excluded');
        setTimeout(() => this.removeToast(toast, container), 1000);
      });

      container.appendChild(toast);

      const totalTime = TIME.TOAST_DISPLAY;
      let startTime = Date.now();
      let remainingTime = totalTime;
      let timeoutId = null;
      let progressInterval = null;
      let isPaused = false;

      const updateProgressBar = (progress) => {
        const progressBar = toast.querySelector('.seismo-progress-bar');
        if (progressBar) {
          progressBar.style.setProperty('--progress', progress);
        }
      };

      const startTimer = () => {
        if (remainingTime <= 0) {
          this.removeToast(toast, container);
          return;
        }

        isPaused = false;
        startTime = Date.now();

        if (timeoutId) clearTimeout(timeoutId);
        if (progressInterval) clearInterval(progressInterval);

        timeoutId = setTimeout(() => {
          this.removeToast(toast, container);
        }, remainingTime);

        progressInterval = setInterval(() => {
          if (!isPaused) {
            const elapsed = Date.now() - startTime;
            remainingTime = Math.max(0, remainingTime - elapsed);
            const progress = remainingTime / totalTime;

            updateProgressBar(progress);

            if (remainingTime <= 0) {
              clearInterval(progressInterval);
              this.removeToast(toast, container);
            } else {
              startTime = Date.now(); // Reset start time for next interval
            }
          }
        }, TIME.PROGRESS_UPDATE);
      };

      const pauseTimer = () => {
        isPaused = true;
        const elapsed = Date.now() - startTime;
        remainingTime = Math.max(0, remainingTime - elapsed);

        if (timeoutId) clearTimeout(timeoutId);
        if (progressInterval) clearInterval(progressInterval);
      };

      // Add hover handlers
      toast.addEventListener('mouseenter', pauseTimer);
      toast.addEventListener('mouseleave', startTimer);

      // Start initial timer
      updateProgressBar(1);  // Start at 100%
      startTimer();

      return toast;
    } catch (error) {
      Logger.error('Seismo: Error displaying toast notification', error);
    }
  }

  async getErrorAnalysis(error, type = 'simple') {
    try {

      // Send message to background script
        const response = await chrome.runtime.sendMessage({
          type: 'analyzeError',
          payload: {
              url: this.API_URL,
              clientId: this.clientId,
              hValue: error.status + error.url,
              error: error,
              analysisType: type
          }
      });

      if (!response.ok) {
        throw new Error(response.error || 'Failed to analyze error');
    }
    return response.analysis;


    } catch (err) {
        Logger.error('Error fetching analysis:', err);
        return this.getSimpleErrorMessage(error.status);
    }
  }

  removeToast(toast, container) {
    if (container.contains(toast)) {
      toast.classList.add('removing');
      toast.addEventListener('animationend', () => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
      });
    }
  }

  showButtonSuccess(button, text) {
    const originalContent = button.innerHTML;
    button.innerHTML = text;
    button.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.style.backgroundColor = '';
    }, TIME.BUTTON_FEEDBACK);
  }

  getSimpleErrorMessage(errCode) {
    // Using ERROR_TYPES constants
    if (errCode.includes(ERROR_TYPES.NOT_FOUND)) return 'Page Not Found';
    if (errCode.includes(ERROR_TYPES.SERVER)) return 'Server Error';
    if (errCode.includes(ERROR_TYPES.FORBIDDEN)) return 'Access Denied';
    if (errCode.includes(ERROR_TYPES.UNAUTHORIZED)) return 'Authentication Required';
    return 'Request Failed';
  }

  formatCopyText(response) {
    return response ? JSON.stringify({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      url: response.url
    }, null, 2) : 'No response data available'
  }

  async excludeSite(url) {
    try {
      const result = await chrome.storage.sync.get('excludedSites');
      const excludedSites = result.excludedSites || [];

      if (!excludedSites.includes(url)) {
        excludedSites.push(url);
        await chrome.storage.sync.set({ excludedSites });
      }

      Logger.info(`Excluded ${url} from error detection`);
    } catch (error) {
      Logger.error('Error excluding site:', error);
    }
  }
}