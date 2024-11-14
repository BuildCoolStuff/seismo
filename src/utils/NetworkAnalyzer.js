// src/utils/NetworkAnalyzer.js
import { Logger } from './Logger.js';
import { UI } from './Constants.js';

export class NetworkAnalyzer {
    constructor(errorCache, toastManager) {
        this.errorCache = errorCache;
        this.toastManager = toastManager;
    }

    /**
     * Analyzes network errors and shows toast notifications
     */
    analyzeError(request) {
        try {
            const { method, url, statusCode, timeStamp, responseHeaders } = request.details;

            const snipUrl = this.truncateUrl(url);
            
            if (!this.errorCache.shouldShowError(url, statusCode)) {
                return;
            }
          
            const time = this.formatTimestamp(timeStamp);
            const errCode = `${method} ${statusCode}`;
            let description = this.toastManager.getSimpleErrorMessage(errCode);
            
            const response = this.formatResponse(request, responseHeaders);

            this.toastManager.show(errCode, description, snipUrl, time, response, request.details);
        } catch (error) {
            Logger.error('Error analyzing network request', error);
        }
    }

    /**
     * Truncates URL if it exceeds maximum length
     */
    truncateUrl(url) {
        return url.length > UI.MAX_URL_LENGTH ? 
            `${url.substring(0, UI.MAX_URL_LENGTH)}...` : url;
    }

    /**
     * Formats timestamp into readable string
     */
    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    /**
     * Formats response object for display
     */
    formatResponse(request, responseHeaders) {
        return {
            status: request.details.statusCode,
            statusText: request.message,
            headers: responseHeaders,
            url: request.details.url
        };
    }
}