// File Filter Module for GitHub Helper Extension
class FileFilter {
    static isAddingButton = false;
    /**
     * Gets enabled files from settings
     * @param {Object} settings - Settings object
     * @returns {Array} Array of enabled file objects
     */
    static getEnabledFiles(settings) {
        return FilterUtils.getEnabledItems(settings.files);
    }

    /**
     * Checks if a file should be hidden based on filter rules
     * @param {string} filePath - File path to check
     * @param {Array} enabledFiles - Array of enabled file filter objects
     * @returns {boolean} True if file should be hidden
     */
    static shouldHideFile(filePath, enabledFiles) {
        return FilterUtils.shouldHideFile(filePath, enabledFiles);
    }

    /**
     * Applies file filter to the current page
     * @param {boolean} isEnabled - Whether filter is enabled
     * @param {Object} settings - Settings object
     */
    static applyFilter(isEnabled, settings) {
        if (!isEnabled) {
            // Show all files in main view
            const hiddenFiles = document.querySelectorAll('.file[hidden]');
            hiddenFiles.forEach(file => {
                file.removeAttribute('hidden');
            });

            // Show all files and directories in sidebar
            const hiddenSidebarItems = document.querySelectorAll('.js-tree-node[hidden]');
            hiddenSidebarItems.forEach(item => {
                item.removeAttribute('hidden');
                item.removeAttribute('data-skip-substring-filter');
            });
            return;
        }

        const enabledFiles = this.getEnabledFiles(settings);
        if (!enabledFiles.length) return;

        // Find all main file containers
        const fileContainers = document.querySelectorAll('.file[data-tagsearch-path]');
        fileContainers.forEach(container => {
            const filePath = container.getAttribute('data-tagsearch-path');
            if (filePath && this.shouldHideFile(filePath, enabledFiles)) {
                container.setAttribute('hidden', '');
            } else {
                container.removeAttribute('hidden');
            }
        });

        // Find all sidebar file tree items
        const sidebarItems = document.querySelectorAll('.js-tree-node[data-file-type]');
        sidebarItems.forEach(item => {
            const fileType = item.getAttribute('data-file-type');
            const fileNameSpan = item.querySelector('[data-filterable-item-text]');

            if (fileNameSpan && fileType) {
                const fullPath = fileNameSpan.textContent.trim();
                if (this.shouldHideFile(fullPath, enabledFiles)) {
                    item.setAttribute('hidden', '');
                    item.setAttribute('data-skip-substring-filter', '');
                } else {
                    item.removeAttribute('hidden');
                    item.removeAttribute('data-skip-substring-filter');
                }
            }
        });

        // Hide empty directories (folders with no visible files)
        const directoryItems = document.querySelectorAll('.js-tree-node[data-tree-entry-type="directory"]');
        directoryItems.forEach(directory => {
            const subList = directory.querySelector('.ActionList--subGroup');
            if (subList) {
                const visibleFiles = subList.querySelectorAll('.js-tree-node[data-tree-entry-type="file"]:not([hidden])');
                if (visibleFiles.length === 0) {
                    directory.setAttribute('hidden', '');
                    directory.setAttribute('data-skip-substring-filter', '');
                } else {
                    directory.removeAttribute('hidden');
                    directory.removeAttribute('data-skip-substring-filter');
                }
            }
        });
    }

    /**
     * Creates the custom filter button for PR files page
     * @param {Object} settings - Settings object
     * @returns {Promise<boolean>} True if button was created successfully
     */
    static async createFilterButton(settings) {
        // Only add on PR files pages
        if (!window.location.pathname.match(/\/pull\/\d+\/files/)) {
            return false;
        }

        // Check if feature is enabled
        if (!settings.fileFilterEnabled) {
            const existingButton = document.getElementById('custom-filter-button');
            if (existingButton) {
                existingButton.remove();
            }
            return false;
        }

        // Prevent multiple simultaneous calls
        if (this.isAddingButton) {
            return false;
        }

        this.isAddingButton = true;

        try {
            // Remove existing button first
            const existingButton = document.getElementById('custom-filter-button');
            if (existingButton) {
                existingButton.remove();
            }

            const tryAddButton = () => {
                // Try new GitHub view first
                let toolbar = document.querySelector('.prc-Stack-Stack-WJVsK[data-direction="horizontal"][data-align="center"][data-wrap="nowrap"][data-justify="start"]');
                let isNewView = true;

                // Fallback to old GitHub view
                if (!toolbar) {
                    toolbar = document.querySelector('.flex-grow-0.flex-shrink-0.pr-review-tools');
                    isNewView = false;
                }

                if (!toolbar) {
                    setTimeout(() => {
                        FileFilter.isAddingButton = false;
                        FileFilter.createFilterButton(settings);
                    }, 1000);
                    return;
                }

            // Create the container div
            const container = document.createElement('div');
            if (isNewView) {
                container.className = 'd-flex flex-items-center ml-2';
            } else {
                container.className = 'diffbar-item dropdown js-reviews-container ml-2';
            }
            container.id = 'custom-filter-button';

            // Create the button
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'Button--secondary Button--small Button';
            button.setAttribute('data-view-component', 'true');

            // Create button content
            const buttonContent = document.createElement('span');
            buttonContent.className = 'Button-content';

            // Create visible checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'custom-filter-checkbox';
            checkbox.style.marginRight = '8px';

            // Create button label
            const buttonLabel = document.createElement('span');
            buttonLabel.className = 'Button-label';
            buttonLabel.textContent = settings.buttonTitle || 'Use custom filter';

            // Assemble the button
            buttonContent.appendChild(checkbox);
            buttonContent.appendChild(buttonLabel);
            button.appendChild(buttonContent);
            container.appendChild(button);

            // Function to update button style
            function updateButtonStyle() {
                if (checkbox.checked) {
                    button.className = 'Button--primary Button--small Button';
                } else {
                    button.className = 'Button--secondary Button--small Button';
                }
            }

            // Add click handler
            button.addEventListener('click', function() {
                checkbox.checked = !checkbox.checked;
                updateButtonStyle();
                FileFilter.applyFilter(checkbox.checked, settings);
            });

            toolbar.appendChild(container);
            return true;
            };

            tryAddButton();
        } finally {
            this.isAddingButton = false;
        }
        return true;
    }

    /**
     * Handles filter toggle button click
     * @param {Object} settings - Settings object
     */
    static handleFilterToggle(settings) {
        const container = document.getElementById('custom-filter-button');
        if (!container) return;

        const checkbox = container.querySelector('#custom-filter-checkbox');
        const buttonLabel = container.querySelector('.Button-label');
        if (!checkbox || !buttonLabel) return;

        const originalText = settings.buttonTitle || 'Use custom filter';

        if (checkbox.checked) {
            this.applyFilter(true, settings);
            const hiddenCount = document.querySelectorAll('.file[hidden]').length;
            buttonLabel.textContent = `${hiddenCount} files hidden`;
            setTimeout(() => {
                buttonLabel.textContent = originalText;
            }, 2000);
        } else {
            this.applyFilter(false, settings);
            buttonLabel.textContent = 'Filter disabled';
            setTimeout(() => {
                buttonLabel.textContent = originalText;
            }, 2000);
        }
    }
}

window.FileFilter = FileFilter;
