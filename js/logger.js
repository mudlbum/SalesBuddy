/**
 * @fileoverview A singleton logging service for the application.
 * It captures structured log data in memory and provides a method to download it as a file.
 * This ensures all parts of the application share a single, consistent log.
 */

class LoggingService {
    /**
     * The single instance of the LoggingService.
     * @private
     */
    static instance;

    constructor() {
        if (LoggingService.instance) {
            return LoggingService.instance;
        }
        this.logEntries = [];
        LoggingService.instance = this;
    }

    /**
     * The core logging method.
     * @private
     * @param {string} level - The log level (e.g., 'INFO', 'WARN', 'ERROR').
     * @param {string} message - The primary log message.
     * @param {any} [data=null] - Optional data payload to include with the log.
     */
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, level, message, data };
        this.logEntries.push(logEntry);

        // Output to the browser's console for real-time debugging.
        // This uses the appropriate console method (log, warn, error) for better filtering.
        const consoleMessage = `${timestamp} [${level}]: ${message}`;
        const consoleMethod = console[level.toLowerCase()] || console.log;

        if (data) {
            consoleMethod(consoleMessage, data);
        } else {
            consoleMethod(consoleMessage);
        }
    }

    /**
     * Logs an informational message.
     * @param {string} message - The message to log.
     * @param {any} [data=null] - Optional data.
     */
    info(message, data = null) {
        this.log('INFO', message, data);
    }

    /**
     * Logs a warning message.
     * @param {string} message - The message to log.
     * @param {any} [data=null] - Optional data.
     */
    warn(message, data = null) {
        this.log('WARN', message, data);
    }

    /**
     * Logs an error message. It can handle both plain strings and Error objects.
     * @param {string} message - A descriptive message for the error context.
     * @param {Error|any} [error=null] - The error object or additional data.
     */
    error(message, error = null) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const data = error instanceof Error ? { stack: error.stack } : error;
        this.log('ERROR', `${message}. Reason: ${errorMessage}`, data);
    }

    /**
     * Creates a formatted text file from the log entries and triggers a download.
     * @returns {boolean} - Returns true if download was initiated, false if there were no logs.
     */
    downloadLogFile() {
        if (this.logEntries.length === 0) {
            this.warn("Log download requested, but there are no log entries.");
            return false;
        }
        
        const logData = this.logEntries.map(entry => {
            let line = `${entry.timestamp} [${entry.level}]: ${entry.message}`;
            if (entry.data) {
                try {
                    // Pretty-print JSON for readability in the log file
                    const dataString = JSON.stringify(entry.data, null, 2);
                    line += `\n--- Data Payload ---\n${dataString}\n--------------------`;
                } catch (e) {
                    line += `\n--- Data Payload ---\n[Unserializable data]\n--------------------`;
                }
            }
            return line;
        }).join('\n\n'); // Add extra space between log entries for readability

        const blob = new Blob([logData], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const dateStamp = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `ai-planner-log-${dateStamp}.txt`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.info('Log file downloaded.');
        return true;
    }
}

// Export a single, shared instance of the logger for the entire application.
export const Logger = new LoggingService();
