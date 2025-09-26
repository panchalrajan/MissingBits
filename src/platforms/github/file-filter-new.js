// File Filter Module for New GitHub UI
class FileFilterNew {
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
     * Applies file filter to the new GitHub UI
     * @param {boolean} isEnabled - Whether filter is enabled
     * @param {Object} settings - Settings object
     */
    static applyFilter(isEnabled, settings) {
        if (!isEnabled) {
            // Show all files - remove hidden attribute from outermost div
            const allFiles = document.querySelectorAll('.Diff-module__diffTargetable--kW3Cm');
            allFiles.forEach(container => {
                const outerDiv = container.parentElement;
                if (outerDiv) {
                    outerDiv.removeAttribute('hidden');
                }
            });

            // Also handle sidebar filtering when disabled
            this.applySidebarFilter(false, []);
            return;
        }

        const enabledFiles = this.getEnabledFiles(settings);
        if (!enabledFiles.length) return;

        // Find all file containers
        const fileContainers = document.querySelectorAll('.Diff-module__diffTargetable--kW3Cm');

        fileContainers.forEach(container => {
            // Get file name from the code element inside h3
            const codeElement = container.querySelector('.DiffFileHeader-module__file-name--ryaCb a code');

            if (codeElement) {
                // Clean file name - remove invisible Unicode characters
                const filePath = codeElement.textContent.replace(/[\u200E\u200F]/g, '').trim();

                // Hide the parent div (outermost div)
                const outerDiv = container.parentElement;
                if (outerDiv && this.shouldHideFile(filePath, enabledFiles)) {
                    outerDiv.setAttribute('hidden', '');
                } else if (outerDiv) {
                    outerDiv.removeAttribute('hidden');
                }
            }
        });

        // Handle sidebar filtering for new UI
        this.applySidebarFilter(isEnabled, enabledFiles);
    }

    /**
     * Applies filtering to the sidebar file tree
     * @param {boolean} isEnabled - Whether filter is enabled
     * @param {Array} enabledFiles - Array of enabled file filter objects
     */
    static applySidebarFilter(isEnabled, enabledFiles) {
        if (!isEnabled) {
            // Show all sidebar items by removing hidden attribute
            const hiddenSidebarItems = document.querySelectorAll('.PRIVATE_TreeView-item[hidden]');
            hiddenSidebarItems.forEach(item => {
                item.removeAttribute('hidden');
            });
            return;
        }

        if (!enabledFiles.length) return;

        // Find all file items in sidebar - they have DiffFileTree-module__file-tree-row class
        const fileItems = document.querySelectorAll('.DiffFileTree-module__file-tree-row--GJi_6');

        fileItems.forEach(fileItem => {
            // Get file name from the link text
            const linkElement = fileItem.querySelector('.PRIVATE_TreeView-item-content-text a');
            if (linkElement) {
                const fileName = linkElement.textContent.trim();

                if (this.shouldHideFile(fileName, enabledFiles)) {
                    fileItem.setAttribute('hidden', '');
                } else {
                    fileItem.removeAttribute('hidden');
                }
            }
        });

        // Hide parent folders if all children are hidden
        const parentFolders = document.querySelectorAll('.PRIVATE_TreeView-item:not(.DiffFileTree-module__file-tree-row--GJi_6)');

        parentFolders.forEach(folder => {
            // Check if folder has a nested ul (group of files)
            const fileGroup = folder.querySelector('ul[role="group"]');
            if (fileGroup) {
                // Get all file items in this folder
                const childFiles = fileGroup.querySelectorAll('.DiffFileTree-module__file-tree-row--GJi_6');

                // Check if all child files are hidden
                let allChildrenHidden = true;
                let hasChildren = false;

                childFiles.forEach(childFile => {
                    hasChildren = true;
                    if (!childFile.hasAttribute('hidden')) {
                        allChildrenHidden = false;
                    }
                });

                // Hide parent folder if all children are hidden
                if (hasChildren && allChildrenHidden) {
                    folder.setAttribute('hidden', '');
                } else {
                    folder.removeAttribute('hidden');
                }
            }
        });
    }

    /**
     * Creates the custom filter button for new GitHub UI
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
            const existingButton = document.getElementById('custom-filter-button-new');
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
            const existingButton = document.getElementById('custom-filter-button-new');
            if (existingButton) {
                existingButton.remove();
            }

            const tryAddButton = () => {
                // Target the new GitHub toolbar
                const toolbar = document.querySelector('.prc-Stack-Stack-WJVsK[data-direction="horizontal"][data-align="center"][data-wrap="nowrap"][data-justify="start"]');

                if (!toolbar) {
                    setTimeout(() => {
                        FileFilterNew.isAddingButton = false;
                        FileFilterNew.createFilterButton(settings);
                    }, 1000);
                    return;
                }

                // Create the container div for new UI
                const container = document.createElement('div');
                container.className = 'd-flex flex-items-center ml-2';
                container.id = 'custom-filter-button-new';

                // Create the button matching GitHub's new design
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
                checkbox.id = 'custom-filter-checkbox-new';
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
                    FileFilterNew.applyFilter(checkbox.checked, settings);

                    // Update button text temporarily
                    const originalText = settings.buttonTitle || 'Use custom filter';
                    if (checkbox.checked) {
                        // Count hidden files by looking for containers whose parent has hidden attribute
                        const allContainers = document.querySelectorAll('.Diff-module__diffTargetable--kW3Cm');
                        let hiddenCount = 0;
                        allContainers.forEach(container => {
                            if (container.parentElement && container.parentElement.hasAttribute('hidden')) {
                                hiddenCount++;
                            }
                        });
                        buttonLabel.textContent = `${hiddenCount} files hidden`;
                        setTimeout(() => {
                            buttonLabel.textContent = originalText;
                        }, 2000);
                    } else {
                        buttonLabel.textContent = 'Filter disabled';
                        setTimeout(() => {
                            buttonLabel.textContent = originalText;
                        }, 2000);
                    }
                });

                // Append at the very end of the toolbar
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
     * Detects if we're on the new GitHub UI
     * @returns {boolean} True if new UI is detected
     */
    static isNewGitHubUI() {
        return !!document.querySelector('.prc-Stack-Stack-WJVsK[data-direction="horizontal"][data-align="center"][data-wrap="nowrap"][data-justify="start"]');
    }
}

window.FileFilterNew = FileFilterNew;