// Copy Utilities - Shared functions for copy operations
class CopyUtils {
    /**
     * Performs copy operation with notification and history tracking
     * @param {string} content - Content to copy
     * @param {string} notificationTitle - Title for success notification
     * @param {string} historyType - Type for history tracking
     * @param {string} issueKey - Issue key for history
     * @returns {Promise<boolean>} - Success status
     */
    static async copyWithNotification(content, notificationTitle, historyType, issueKey) {
        if (!content) return false;

        const success = await ClipboardHelper.copy(content, content);
        if (success) {
            this.showNotification(notificationTitle, content);

            // Save to history if HistoryManager is available
            if (typeof HistoryManager !== 'undefined') {
                await HistoryManager.addToHistory(content, historyType, issueKey);
            }
        }
        return success;
    }

    /**
     * Shows notification message
     * @param {string} title - Notification title
     * @param {string} body - Notification body
     */
    static showNotification(title, body) {
        window.postMessage({
            type: "jira_success_copied_to_clipboard",
            options: { title, body },
        });
    }

    /**
     * Helper for copying extracted data with fallback error handling
     * @param {Function} extractorFn - Function that extracts the data
     * @param {string} dataType - Type of data being copied (for error messages)
     * @param {string} issueKey - Issue key for history
     * @returns {Promise<boolean>} - Success status
     */
    static async copyExtractedData(extractorFn, dataType, issueKey) {
        const data = extractorFn();
        if (!data) {
            this.showNotification(
                `${dataType} not found`,
                `Could not find ${dataType.toLowerCase()} information`
            );
            return false;
        }

        return this.copyWithNotification(
            data,
            `Copied ${dataType.toLowerCase()}`,
            dataType.toLowerCase().replace(' ', '-'),
            issueKey
        );
    }
}
window.CopyUtils = CopyUtils;
