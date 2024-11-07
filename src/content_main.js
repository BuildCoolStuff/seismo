// content.js
import { Logger } from './utils/Logger.js'; 
import { SeismoToast } from './components/SeismoToast/index.js';
import { ErrorCache } from './utils/ErrorCache.js';
import { NetworkAnalyzer } from './utils/NetworkAnalyzer.js';

// Main function that will be called by the loader
export function main() {
  Logger.info('Seismo content script loaded')

  // Establish connection with background script
  const port = chrome.runtime.connect({ name: 'seismo-content' });

  const errorCache = new ErrorCache();
  const seismoToast = new SeismoToast();
  const networkAnalyzer = new NetworkAnalyzer(errorCache, seismoToast);

  // Setup message listener
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "NETWORK_ERROR") {
        Logger.debug('Network error received:', request);
        networkAnalyzer.analyzeError(request);
    }
    return true;
  });

}