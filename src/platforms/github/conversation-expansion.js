// Conversation Expansion Module for GitHub Helper Extension
class ConversationExpansion {
    static isExpandingAll = false;

    // Load settings using centralized SettingsManager
    static async loadSettings() {
        try {
            const settings = await SettingsManager.load();
            return {
                expandButtonTitle: settings.expandButtonTitle || "Expand All Conversations"
            };
        } catch (error) {
            return {
                expandButtonTitle: "Expand All Conversations"
            };
        }
    }

    /**
     * Expands all paginated conversations in the current PR
     */
    static async expandAll() {
        if (this.isExpandingAll) {
            return;
        }

        this.isExpandingAll = true;

        try {
            // Load settings to get custom button title
            const settings = await this.loadSettings();
            const customTitle = settings.expandButtonTitle || 'Expand All Conversations';

            const expandButton = document.getElementById('expand-all-comments-btn');
            const buttonLabel = expandButton?.querySelector('.Button-label');
            if (expandButton && buttonLabel) {
                ButtonUtils.setButtonText(expandButton, 'Expanding...');
                ButtonUtils.setButtonEnabled(expandButton, false);
            }

            let attempts = 0;
            const SAFETY_LIMIT = 500; // Very high safety limit to prevent infinite loops

            while (attempts < SAFETY_LIMIT) {
                attempts++;

                // Find all pagination forms
                const paginationForms = document.querySelectorAll('.ajax-pagination-form');

                if (paginationForms.length === 0) {
                    break;
                }

                // Click the first pagination form's "Load more" button
                const firstForm = paginationForms[0];
                const loadMoreBtn = firstForm.querySelector('.ajax-pagination-btn');

                if (!loadMoreBtn) {
                    break;
                }

                if (loadMoreBtn.disabled) {
                    break;
                }

                // Create a promise that resolves when new content is loaded
                const waitForLoad = new Promise((resolve) => {
                    const observer = new MutationObserver((mutations) => {
                        // Check if the specific form was removed or replaced
                        if (!document.contains(firstForm)) {
                            observer.disconnect();
                            resolve();
                        }
                    });

                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });

                    // Fallback timeout
                    setTimeout(() => {
                        observer.disconnect();
                        resolve();
                    }, 10000); // Increased timeout for slower connections
                });

                // Click the button
                loadMoreBtn.click();

                // Wait for the content to load
                await waitForLoad;

                // Small delay between iterations to prevent overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 500));
            }


            // Update button to completion state
            if (expandButton && buttonLabel) {
                ButtonUtils.setButtonText(expandButton, 'Expansion Complete');
                expandButton.setAttribute('data-state', 'completed');
                ButtonUtils.setButtonEnabled(expandButton, true);

                setTimeout(() => {
                    ButtonUtils.setButtonText(expandButton, customTitle);
                    expandButton.removeAttribute('data-state');
                }, 3000);
            }

        } catch (error) {

            const expandButton = document.getElementById('expand-all-comments-btn');
            if (expandButton) {
                ButtonUtils.updateButtonText(expandButton, 'Expansion Error', 'Expand All Conversations');
                ButtonUtils.setButtonEnabled(expandButton, true);
            }
        } finally {
            this.isExpandingAll = false;
        }
    }

    /**
     * Handles expand button click
     * @param {HTMLElement} button - Button element
     * @param {Object} settings - Settings object
     */
    static async handleExpandClick(button, settings) {
        const currentState = button.getAttribute('data-state');
        const customTitle = settings.expandButtonTitle || 'Expand All Conversations';

        if (currentState === 'completed') {
            // Reset button to allow re-checking for more pagination
            const buttonLabel = button.querySelector('.Button-label');
            if (buttonLabel) {
                ButtonUtils.setButtonText(button, customTitle);
                button.removeAttribute('data-state');
            }

            // Check for new pagination immediately
            const paginationForms = document.querySelectorAll('.ajax-pagination-form');
            if (paginationForms.length === 0) {
                ButtonUtils.setButtonText(button, 'No More Conversations');
                ButtonUtils.setButtonEnabled(button, false);
                setTimeout(() => {
                    ButtonUtils.setButtonText(button, customTitle);
                    ButtonUtils.setButtonEnabled(button, true);
                }, 3000);
                return;
            }
        }

        this.expandAll();
    }
}

window.ConversationExpansion = ConversationExpansion;
