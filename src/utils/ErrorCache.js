// src/utils/ErrorCache.js
import { Logger } from './Logger.js';
import { TIME } from './Constants.js';

export class ErrorCache {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Checks if an error should be shown based on the URL and status code
     */
    shouldShowError(url, statusCode) {
        const baseUrl = this.getUrlWithoutParams(url);
        const host = new URL(baseUrl).hostname;

        const key = `${host}-${statusCode}`;
        const now = Date.now();
        const lastShown = this.cache.get(key);
        
        if (lastShown && (now - lastShown) < TIME.DEBOUNCE) {
            Logger.debug(`Debouncing error for ${host} with status ${statusCode}`);
            return false;
        }
        
        this.cache.set(key, now);
        return true;
    }

    /**
     * Gets the base URL without query parameters
     */
    getUrlWithoutParams(url) {
        try {
            const urlObj = new URL(url);
            return `${urlObj.origin}${urlObj.pathname}`;
        } catch (e) {
            Logger.error('Error parsing URL', e);
            return url;
        }
    }

    /**
     * Clears the error cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Gets the size of the cache
     */
    get size() {
        return this.cache.size;
    }
}