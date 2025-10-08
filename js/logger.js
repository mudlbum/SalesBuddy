/**
 * A static class to provide a structured logging system for the application.
 * Logs are stored in memory and can be downloaded as a text file.
 */
export class Logger {
    // Private static property to hold the log entries.
    static #logEntries = [];

    /**
     * Adds an informational log entry.
     * @param {string} message - The main log message.
     * @param {any} [details] - Optional details object to be stringified.
     */
    static info(message, details) {
        this.#addEntry(message, 'INFO', details);
    }

    /**
     * Adds a warning log entry.
     * @param {string} message - The main log message.
     * @param {any} [details] - Optional details object to be stringified.
     */
    static warn(message, details) {
        this.#addEntry(message, 'WARN', details);
    }

    /**
     * Adds an error log entry.
     * @param {string} message - The main log message.
     * @param {any} [error] - The error object or details.
     */
    static error(message, error) {
        this.#addEntry(message, 'ERROR', error);
    }

    /**
     * Private helper method to format and add a log entry.
     * @param {string} message - The message.
     * @param {string} level - The log level (INFO, WARN, ERROR).
     * @param {any} [details] - Optional details.
     */
    static #addEntry(message, level, details) {
        const timestamp = new Date().toISOString();
        let logString = `${timestamp} [${level}]: ${message}`;

        if (details) {
            if (details instanceof Error) {
                logString += ` | Details: ${details.message}`;
                if (details.stack) {
                     logString += `\n${details.stack}`;
                }
            } else {
                try {
                    logString += ` | Details: ${JSON.stringify(details, null, 2)}`;
                } catch {
                    logString += ` | Details: [Unserializable object]`;
                }
            }
        }

        this.#logEntries.push(logString);
        
        // Output to console for live debugging
        const consoleMethod = level.toLowerCase() === 'info' ? 'log' : level.toLowerCase();
        console[consoleMethod](`${timestamp} [${level}]: ${message}`, details || '');
    }

    /**
     * Triggers a browser download for the collected log data.
     */
    static downloadLogFile() {
        if (this.#logEntries.length === 0) {
            alert('There are no log entries to download.');
            return;
        }

        const logData = this.#logEntries.join('\n\n');
        const blob = new Blob([logData], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const dateStamp = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `ai-sales-forecast-log-${dateStamp}.txt`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.info('Log file downloaded.');
    }
}

