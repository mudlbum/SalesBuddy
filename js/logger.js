/**
 * A singleton logger class for consistent logging throughout the application.
 * This ensures that all parts of the app write to the same log instance.
 */
class AppLogger {
    constructor() {
        if (AppLogger.instance) {
            return AppLogger.instance;
        }
        this.logEntries = [];
        AppLogger.instance = this;
    }

    /**
     * Adds a formatted log entry to the internal log array and outputs to the console.
     * @param {string} level - The severity level of the log (e.g., INFO, WARN, ERROR).
     * @param {string} message - The primary log message.
     * @param {*} [data] - Optional data to include in the console output.
     */
    _log(level, message, data) {
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} [${level}]: ${message}`;
        this.logEntries.push(logEntry);

        switch (level) {
            case 'ERROR':
                console.error(logEntry, data || '');
                break;
            case 'WARN':
                console.warn(logEntry, data || '');
                break;
            default:
                console.log(logEntry, data || '');
        }
    }

    /**
     * Logs an informational message.
     * @param {string} message - The message to log.
     * @param {*} [data] - Optional data to accompany the message.
     */
    info(message, data) {
        this._log('INFO', message, data);
    }

    /**
     * Logs a warning message.
     * @param {string} message - The message to log.
     * @param {*} [data] - Optional data to accompany the message.
     */
    warn(message, data) {
        this._log('WARN', message, data);
    }

    /**
     * Logs an error message.
     * @param {string} message - The message to log.
     * @param {*} [data] - Optional error object or additional data.
     */
    error(message, data) {
        this._log('ERROR', message, data);
    }

    /**
     * Creates and triggers a download for the collected log data as a .txt file.
     */
    downloadLogFile() {
        if (this.logEntries.length === 0) {
            alert('The log is empty. No file to download.');
            return;
        }

        try {
            const logData = this.logEntries.join('\n');
            const blob = new Blob([logData], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            const dateStamp = new Date().toISOString().split('T')[0];
            link.href = url;
            link.download = `ai-sales-forecast-log-${dateStamp}.txt`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url); // Clean up the object URL
            this.info('Log file downloaded successfully.');
        } catch (e) {
            this.error('Failed to download log file.', e);
            alert('An error occurred while trying to download the log file.');
        }
    }
}

// Export a single instance of the logger for the entire application to use.
export const Logger = new AppLogger();

