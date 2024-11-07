// src/utils/Logger.js

export const Logger = {
    levels: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    },
    
    currentLevel: 1, // INFO by default

    formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    },
    
    log(level, message, ...args) {
        if (level >= this.currentLevel) {
            const timestamp = this.formatTime(new Date());
            const prefix = `[Seismo ${timestamp}]`;
            
            switch (level) {
                case this.levels.DEBUG:
                    console.debug(prefix, message, ...args);
                    break;
                case this.levels.INFO:
                    console.log(prefix, message, ...args);
                    break;
                case this.levels.WARN:
                    console.warn(prefix, message, ...args);
                    break;
                case this.levels.ERROR:
                    console.error(prefix, message, ...args);
                    break;
            }
        }
    },
    
    debug(message, ...args) {
        this.log(this.levels.DEBUG, message, ...args);
    },

    info(message, ...args) {
        this.log(this.levels.INFO, message, ...args);
    },
    
    warn(message, ...args) {
        this.log(this.levels.WARN, message, ...args);
    },
    
    error(message, error, ...args) {
        this.log(this.levels.ERROR, message, error, ...args);
        this.reportErrorToBackground(message, error);
    },

    reportErrorToBackground(message, error) {
        try {
            chrome.runtime.sendMessage({
                type: 'ERROR_LOGGED',
                payload: {
                    message,
                    error: {
                        message: error.message,
                        stack: error.stack,
                        name: error.name
                    },
                    timestamp: new Date().toISOString()
                }
            });
        } catch (e) {
            console.error('Failed to report error to background script:', e);
        }
    },

    // Utility method to change log level
    setLevel(level) {
        if (this.levels[level] !== undefined) {
            this.currentLevel = this.levels[level];
        }
    }
};