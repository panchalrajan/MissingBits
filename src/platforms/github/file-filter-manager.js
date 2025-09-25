// File Filter Manager - Handles both old and new GitHub UI
class FileFilterManager {
    /**
     * Detects which GitHub UI is being used and creates the appropriate filter button
     * @param {Object} settings - Settings object
     * @returns {Promise<boolean>} True if button was created successfully
     */
    static async createFilterButton(settings) {
        // Check if we're on a PR files page
        if (!window.location.pathname.match(/\/pull\/\d+\/files/)) {
            return false;
        }

        // Check if feature is enabled
        if (!settings.fileFilterEnabled) {
            // Remove any existing buttons
            const existingOldButton = document.getElementById('custom-filter-button');
            const existingNewButton = document.getElementById('custom-filter-button-new');
            if (existingOldButton) existingOldButton.remove();
            if (existingNewButton) existingNewButton.remove();
            return false;
        }

        // Detect which UI we're dealing with
        const isNewUI = this.isNewGitHubUI();

        if (isNewUI) {
            // Remove old button if it exists
            const existingOldButton = document.getElementById('custom-filter-button');
            if (existingOldButton) existingOldButton.remove();

            // Use new UI handler
            if (window.FileFilterNew) {
                return await window.FileFilterNew.createFilterButton(settings);
            }
        } else {
            // Remove new button if it exists
            const existingNewButton = document.getElementById('custom-filter-button-new');
            if (existingNewButton) existingNewButton.remove();

            // Use old UI handler
            if (window.FileFilter) {
                return await window.FileFilter.createFilterButton(settings);
            }
        }

        return false;
    }

    /**
     * Applies filter using the appropriate handler
     * @param {boolean} isEnabled - Whether filter is enabled
     * @param {Object} settings - Settings object
     */
    static applyFilter(isEnabled, settings) {
        const isNewUI = this.isNewGitHubUI();

        if (isNewUI && window.FileFilterNew) {
            window.FileFilterNew.applyFilter(isEnabled, settings);
        } else if (!isNewUI && window.FileFilter) {
            window.FileFilter.applyFilter(isEnabled, settings);
        }
    }

    /**
     * Detects if we're on the new GitHub UI
     * @returns {boolean} True if new UI is detected
     */
    static isNewGitHubUI() {
        return !!document.querySelector('.prc-Stack-Stack-WJVsK[data-direction="horizontal"][data-align="center"][data-wrap="nowrap"][data-justify="start"]');
    }

    /**
     * Initialize the file filter system
     * @param {Object} settings - Settings object
     */
    static async initialize(settings) {
        // Wait a bit for the page to load
        setTimeout(async () => {
            await this.createFilterButton(settings);
        }, 500);

        // Also try again after a longer delay in case of slow loading
        setTimeout(async () => {
            await this.createFilterButton(settings);
        }, 2000);
    }
}

window.FileFilterManager = FileFilterManager;