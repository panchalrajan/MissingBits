// Jira Copy Module for Missing Bits Extension
class JiraCopy {
    constructor() {
        this.isInitialized = false;
        this.buttonId = "copy-issue-button";
        this.keyboardManager = null;
        this.addButtonTimeout = null;
        this.statusRelocator = null;
    }

    /**
     * Initialize Jira Copy functionality
     */
    async initialize() {
        // Only initialize on Jira pages
        if (!JiraInterface.isJiraPage) {
            return;
        }

        if (this.isInitialized) {
            return;
        }

        try {
            // Initialize keyboard shortcut manager
            this.keyboardManager = new KeyboardShortcutManager();

            const copyAction = () => JiraInterface.issue?.copyToClipboard();

            // Initialize status relocator if enabled
            const settings = await SettingsManager.load();
            if (settings.jiraStatusRelocatorEnabled) {
                this.statusRelocator = new JiraStatusRelocator();
                await this.statusRelocator.initialize();
            }

            // Setup notifications, keyboard shortcuts, and button observer
            JiraInterface.setupNotifications(copyAction);
            await this.setupKeyboardShortcuts(copyAction);
            this.setupButtonObserver(copyAction);

            // Listen for settings changes
            SettingsManager.subscribe('jira-copy', (changes) => {
                if (changes.keyboardShortcut) {
                    this.setupKeyboardShortcuts(copyAction);
                }
            }, { keys: ['keyboardShortcut'] });

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize Jira Copy:', error);
        }
    }

    /**
     * Setup keyboard shortcuts for copying
     */
    async setupKeyboardShortcuts(copyAction) {
        if (!this.keyboardManager) return;

        try {
            const settings = await SettingsManager.load();

            this.keyboardManager.setupListener(settings.keyboardShortcut, () => {
                if (JiraInterface.issue?.summary) {
                    copyAction();
                }
            });
        } catch (error) {
            console.error('Failed to setup keyboard shortcuts:', error);
        }
    }

    /**
     * Setup button observer to add copy button when needed
     */
    setupButtonObserver(copyAction) {
        const addButtonIfNeeded = async () => {
            // Clear any pending timeout to debounce calls
            if (this.addButtonTimeout) {
                clearTimeout(this.addButtonTimeout);
            }

            this.addButtonTimeout = setTimeout(async () => {
                try {
                    // Load settings to check if features are enabled
                    const settings = await SettingsManager.load();

                    // Check if primary copy is disabled - if so, remove button and return
                    if (!settings.jiraCopyPrimaryEnabled) {
                        const existingButton = document.getElementById(this.buttonId);
                        if (existingButton) {
                            existingButton.remove();
                        }
                        return;
                    }

                    // More robust button checking
                    const existingButton = document.getElementById(this.buttonId);
                    if (existingButton && document.contains(existingButton)) {
                        return;
                    }

                    // Remove any orphaned buttons first
                    const orphanedButtons = document.querySelectorAll(`#${this.buttonId}`);
                    orphanedButtons.forEach(button => button.remove());

                    if (!JiraInterface.buttonContainer || !JiraInterface.issue?.summary) return;

                    // Create dropdown options only if dropdown is enabled
                    let dropdownOptions = [];
                    if (settings.jiraCopyDropdownEnabled) {
                        dropdownOptions = settings.dropdownOptions
                            .filter(option => option.enabled)
                            .map(option => ({
                                text: option.text,
                                action: () => {
                                    const issue = JiraInterface.issue;
                                    if (issue && issue.copyOps) {
                                        issue.copyOps.copyWithDropdownOption(option.id);
                                    }
                                }
                            }));
                    }

                    const splitButton = JiraInterface.createSplitButton(
                        this.buttonId,
                        settings.copyIssueButtonTitle,
                        copyAction,
                        dropdownOptions
                    );

                    this.insertButton(splitButton);
                } catch (error) {
                    console.error('Failed to add button:', error);
                }
            }, 150);
        };

        const observer = new MutationObserver(() => {
            addButtonIfNeeded();
        });

        observer.observe(document, { childList: true, subtree: true });

        // Store observer reference for cleanup
        this.observer = observer;
    }

    /**
     * Insert the split button into the Jira interface
     */
    insertButton(splitButton) {
        try {
            // Hide button initially
            splitButton.style.visibility = 'hidden';

            // Try to find the existing buttons container to add our button next to them
            const appsButton = document.querySelector('[data-testid="issue-view-foundation.quick-add.quick-add-items-compact.apps-button-dropdown--trigger"]');

            if (appsButton && appsButton.parentElement) {
                // Primary position: Create a wrapper div to hold our button with proper styling
                const buttonWrapper = document.createElement('div');
                buttonWrapper.style.cssText = 'display: inline-flex; align-items: center; margin-left: 8px;';
                buttonWrapper.appendChild(splitButton);

                // Add our button after the apps button (at the end of the primary button group)
                appsButton.parentElement.insertAdjacentElement('afterend', buttonWrapper);
            } else if (JiraInterface.buttonContainer) {
                // Fallback position: Insert button as first child in the container
                JiraInterface.buttonContainer.insertBefore(splitButton, JiraInterface.buttonContainer.firstChild);
            }

            setTimeout(() => {
                splitButton.style.visibility = 'visible';
            }, 300);
        } catch (error) {
            console.error('Failed to insert button:', error);
        }
    }

    /**
     * Refresh the button based on current settings
     */
    async refreshButton() {
        if (!this.isInitialized) return;

        try {
            const settings = await SettingsManager.load();
            const copyAction = () => JiraInterface.issue?.copyToClipboard();

            // Remove existing button first
            const existingButton = document.getElementById(this.buttonId);
            if (existingButton) {
                existingButton.remove();
            }

            // Check if primary copy is disabled
            if (!settings.jiraCopyPrimaryEnabled) {
                return;
            }

            if (!JiraInterface.buttonContainer || !JiraInterface.issue?.summary) return;

            // Create dropdown options only if dropdown is enabled
            let dropdownOptions = [];
            if (settings.jiraCopyDropdownEnabled) {
                dropdownOptions = settings.dropdownOptions
                    .filter(option => option.enabled)
                    .map(option => ({
                        text: option.text,
                        action: () => {
                            const issue = JiraInterface.issue;
                            if (issue && issue.copyOps) {
                                issue.copyOps.copyWithDropdownOption(option.id);
                            }
                        }
                    }));
            }

            const splitButton = JiraInterface.createSplitButton(
                this.buttonId,
                settings.copyIssueButtonTitle,
                copyAction,
                dropdownOptions
            );

            this.insertButton(splitButton);
        } catch (error) {
            console.error('Failed to refresh button:', error);
        }
    }

    /**
     * Cleanup method to stop observers and remove buttons
     */
    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        if (this.addButtonTimeout) {
            clearTimeout(this.addButtonTimeout);
            this.addButtonTimeout = null;
        }

        // Cleanup status relocator
        if (this.statusRelocator) {
            this.statusRelocator.cleanup();
            this.statusRelocator = null;
        }

        // Remove any existing buttons
        const existingButtons = document.querySelectorAll(`#${this.buttonId}`);
        existingButtons.forEach(button => button.remove());

        this.isInitialized = false;
    }
}

window.JiraCopy = JiraCopy;
