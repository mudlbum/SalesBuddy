/**
 * This module provides simple logging functionality for the application.
 * It stores logs in memory and allows them to be downloaded as a file.
 */

// In-memory array to store log entries
const appLog = [];

/**
 * Adds a new entry to the log.
 * @param {string} message - The log message.
 * @param {string} [level='INFO'] - The log level (e.g., INFO, WARN, ERROR).
 */
export function logEvent(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [${level}]: ${message}`;
    appLog.push(logEntry);
    
    // Also output to the browser console for real-time debugging
    switch(level) {
        case 'ERROR':
            console.error(logEntry);
            break;
        case 'WARN':
            console.warn(logEntry);
            break;
        default:
            console.log(logEntry);
    }
}

/**
 * Creates and triggers a download for the collected log data.
 */
export function downloadLogFile() {
    if (appLog.length === 0) {
        alert('There are no log entries to download.');
        return;
    }

    const logData = appLog.join('\n');
    const blob = new Blob([logData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const dateStamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `ai-sales-forecast-log-${dateStamp}.txt`);
    
    // Append, click, and remove the link to trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    logEvent('Log file downloaded.');
}
