// Settings Form Handler Module for GitHub Helper Extension
class SettingsFormHandler {
    constructor(settingsController) {
        this.controller = settingsController;
        this.formElements = {};
        this.debouncedSave = DOMUtils.debounce(() => {
            this.controller.autoSave();
        }, 1500);
    }

    /**
     * Initialize form elements mapping
     */
    initializeFormElements() {
        this.formElements = DOMUtils.getElementsByIds([
            'button-title',
            'file-filter-enabled-checkbox',
            'expand-all-enabled',
            'expand-button-title',
            'view-resolved-enabled-checkbox',
            'view-resolved-button-title',
            'comment-filter-enabled-checkbox',
            'comment-filter-button-title',
            'scroll-to-top-enabled-checkbox'
        ]);

        this.formElements.scrollToTopPositionRadios = document.querySelectorAll('input[name="scroll-to-top-position"]');
    }

    /**
     * Load settings into form elements
     * @param {Object} settings - Settings object
     */
    loadSettingsIntoForm(settings) {
        const formConfig = [
            { id: 'button-title', property: 'buttonTitle', type: 'text' },
            { id: 'expand-button-title', property: 'expandButtonTitle', type: 'text' },
            { id: 'view-resolved-button-title', property: 'viewResolvedButtonTitle', type: 'text' },
            { id: 'comment-filter-button-title', property: 'commentFilterButtonTitle', type: 'text' },
            { id: 'file-filter-enabled-checkbox', property: 'fileFilterEnabled', type: 'checkbox', toggleId: 'file-filter-enabled' },
            { id: 'expand-all-enabled', property: 'expandAllEnabled', type: 'checkbox', toggleId: 'expand-conversations-enabled' },
            { id: 'view-resolved-enabled-checkbox', property: 'viewResolvedEnabled', type: 'checkbox', toggleId: 'view-resolved-enabled' },
            { id: 'comment-filter-enabled-checkbox', property: 'commentFilterEnabled', type: 'checkbox', toggleId: 'comment-filter-enabled' },
            { id: 'scroll-to-top-everywhere-checkbox', property: 'scrollToTopEverywhere', type: 'checkbox', toggleId: 'scroll-to-top-everywhere' },
            { id: 'scroll-to-top-pr-checkbox', property: 'scrollToTopPR', type: 'checkbox', toggleId: 'scroll-to-top-pr' },
            { id: 'scroll-to-top-issue-checkbox', property: 'scrollToTopIssue', type: 'checkbox', toggleId: 'scroll-to-top-issue' }
        ];

        formConfig.forEach(config => {
            if (config.type === 'text') {
                DOMUtils.setValue(config.id, settings[config.property]);
            } else if (config.type === 'checkbox') {
                DOMUtils.setChecked(config.id, settings[config.property]);
                if (config.toggleId) {
                    this.controller.updateToggleSwitch(config.toggleId, settings[config.property]);
                }
            }
        });

        // Handle radio buttons
        if (this.formElements.scrollToTopPositionRadios.length > 0) {
            DOMUtils.setRadioValue('scroll-to-top-position', settings.scrollToTopPosition || 'bottom-right');
            this.controller.updateRadioButtonsVisualState('scroll-to-top-position');
        }
    }

    /**
     * Setup all form event listeners
     */
    setupEventListeners() {
        this.setupTextInputListeners();
        this.setupCheckboxListeners();
        this.setupRadioListeners();
        this.setupButtonListeners();
    }

    /**
     * Setup text input event listeners
     */
    setupTextInputListeners() {
        const textInputs = [
            { id: 'button-title', property: 'buttonTitle', defaultValue: 'Use custom filter' },
            { id: 'expand-button-title', property: 'expandButtonTitle', defaultValue: 'Expand All Conversations' },
            { id: 'view-resolved-button-title', property: 'viewResolvedButtonTitle', defaultValue: 'Toggle Resolved Comments' },
            { id: 'comment-filter-button-title', property: 'commentFilterButtonTitle', defaultValue: 'Filter Custom Comments' }
        ];

        textInputs.forEach(config => {
            DOMUtils.addEventListener(config.id, 'input', (e) => {
                const value = e.target.value.trim() || config.defaultValue;
                this.controller.currentSettings[config.property] = value;
                this.debouncedSave();
            });
        });
    }

    /**
     * Setup checkbox event listeners
     */
    setupCheckboxListeners() {
        const checkboxes = [
            { id: 'file-filter-enabled-checkbox', property: 'fileFilterEnabled', toggleId: 'file-filter-enabled' },
            { id: 'expand-all-enabled', property: 'expandAllEnabled', toggleId: 'expand-conversations-enabled' },
            { id: 'view-resolved-enabled-checkbox', property: 'viewResolvedEnabled', toggleId: 'view-resolved-enabled' },
            { id: 'comment-filter-enabled-checkbox', property: 'commentFilterEnabled', toggleId: 'comment-filter-enabled' },
            { id: 'scroll-to-top-everywhere-checkbox', property: 'scrollToTopEverywhere', toggleId: 'scroll-to-top-everywhere' },
            { id: 'scroll-to-top-pr-checkbox', property: 'scrollToTopPR', toggleId: 'scroll-to-top-pr' },
            { id: 'scroll-to-top-issue-checkbox', property: 'scrollToTopIssue', toggleId: 'scroll-to-top-issue' }
        ];

        checkboxes.forEach(config => {
            DOMUtils.addEventListener(config.id, 'change', (e) => {
                this.controller.currentSettings[config.property] = e.target.checked;
                this.controller.updateToggleSwitch(config.toggleId, e.target.checked);

                // Special handling for the master scroll to top toggle
                if (config.property === 'scrollToTopEverywhere') {
                    this.controller.handleScrollToTopEverywhereChange(e.target.checked);
                }

                this.controller.autoSave();
            });
        });
    }

    /**
     * Setup radio button event listeners
     */
    setupRadioListeners() {
        if (this.formElements.scrollToTopPositionRadios) {
            this.formElements.scrollToTopPositionRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.controller.currentSettings.scrollToTopPosition = e.target.value;
                        this.controller.updateRadioButtonsVisualState('scroll-to-top-position');
                        this.controller.autoSave();
                    }
                });
            });
        }
    }

    /**
     * Setup button event listeners
     */
    setupButtonListeners() {
        DOMUtils.addEventListener('reset-defaults', 'click', (e) => {
            e.preventDefault();
            this.controller.handleReset();
        });

        DOMUtils.addEventListener('add-file-btn', 'click', () => {
            this.controller.showAddFileModal();
        });

        DOMUtils.addEventListener('add-username-btn', 'click', () => {
            this.controller.showAddUsernameModal();
        });
    }

    /**
     * Update form with current settings
     * @param {Object} settings - Settings object
     */
    updateFormFromSettings(settings) {
        this.loadSettingsIntoForm(settings);
    }

    /**
     * Validate form data
     * @returns {Object} Validation result
     */
    validateForm() {
        const errors = [];

        // Validate button titles are not empty
        const buttonTitle = DOMUtils.getValue('button-title').trim();
        if (!buttonTitle) {
            errors.push('Button title cannot be empty');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Get current form data as settings object
     * @returns {Object} Settings object
     */
    getFormData() {
        return {
            buttonTitle: DOMUtils.getValue('button-title') || 'Use custom filter',
            fileFilterEnabled: DOMUtils.getChecked('file-filter-enabled-checkbox'),
            expandAllEnabled: DOMUtils.getChecked('expand-all-enabled'),
            expandButtonTitle: DOMUtils.getValue('expand-button-title') || 'Expand All Conversations',
            viewResolvedEnabled: DOMUtils.getChecked('view-resolved-enabled-checkbox'),
            viewResolvedButtonTitle: DOMUtils.getValue('view-resolved-button-title') || 'Toggle Resolved Comments',
            commentFilterEnabled: DOMUtils.getChecked('comment-filter-enabled-checkbox'),
            commentFilterButtonTitle: DOMUtils.getValue('comment-filter-button-title') || 'Filter Custom Comments',
            scrollToTopEverywhere: DOMUtils.getChecked('scroll-to-top-everywhere-checkbox'),
            scrollToTopPR: DOMUtils.getChecked('scroll-to-top-pr-checkbox'),
            scrollToTopIssue: DOMUtils.getChecked('scroll-to-top-issue-checkbox'),
            scrollToTopPosition: DOMUtils.getRadioValue('scroll-to-top-position', 'bottom-right')
        };
    }

    /**
     * Reset form to default values
     * @param {Object} defaults - Default settings
     */
    resetForm(defaults) {
        this.loadSettingsIntoForm(defaults);
    }
}

window.SettingsFormHandler = SettingsFormHandler;
