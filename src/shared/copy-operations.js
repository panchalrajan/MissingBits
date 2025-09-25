// Unified Copy Operations using Template-based approach
class CopyOperations {
    constructor(jiraIssue) {
        this.issue = jiraIssue;
    }

    /**
     * Primary copy method - uses the main template from settings
     */
    async copyToClipboard() {
        if (!this.issue.summary) return;

        // Load settings to get custom template
        const settings = await SettingsManager.load();
        const customTemplate = settings.customTemplate;

        if (customTemplate && customTemplate.trim()) {
            // Use custom template
            return this.copyWithTemplate(customTemplate, 'custom-template');
        } else {
            // Fallback to default behavior
            const htmlContent = `<a href="${this.issue.url}" target="_blank">[${this.issue.key}] - ${this.issue.summary}</a>`;
            const plainTextContent = `[${this.issue.key}] - ${this.issue.summary}`;

            if (await ClipboardHelper.copy(htmlContent, plainTextContent)) {
                CopyUtils.showNotification("Copied to clipboard", htmlContent);
                // Save to history
                if (typeof HistoryManager !== 'undefined') {
                    await HistoryManager.addToHistory(plainTextContent, 'issue', this.issue.key);
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Unified copy method using templates
     * @param {string} template - Template string to render
     * @param {string} historyType - Type for history tracking
     * @returns {Promise<boolean>} - Success status
     */
    async copyWithTemplate(template, historyType = 'template') {
        if (!template || !this.issue) return false;

        try {
            const templateData = await TemplateProcessor.gatherTemplateData(this.issue);
            const result = TemplateProcessor.renderCustomTemplate(template, templateData);

            if (!result || result.trim() === '') {
                CopyUtils.showNotification("Template Error", "Template produced empty result");
                return false;
            }

            // Check if template uses missing data
            if (this._hasUnresolvedVariables(result)) {
                CopyUtils.showNotification("Data Not Available", "Some required data could not be found on this page");
                return false;
            }

            if (await ClipboardHelper.copy(result, result)) {
                CopyUtils.showNotification("Copied to clipboard", result);
                // Save to history
                if (typeof HistoryManager !== 'undefined') {
                    await HistoryManager.addToHistory(result, historyType, this.issue.key);
                }
                return true;
            } else {
                CopyUtils.showNotification("Copy Failed", "Could not copy to clipboard");
            }
        } catch (error) {
            console.error('Copy with template error:', error);
            CopyUtils.showNotification("Copy Error", "Failed to process template: " + error.message);
        }
        return false;
    }

    /**
     * Copy using dropdown option template
     * @param {string} optionId - ID of the dropdown option
     * @returns {Promise<boolean>} - Success status
     */
    async copyWithDropdownOption(optionId) {
        try {
            const settings = await SettingsManager.load();
            const option = settings.dropdownOptions.find(opt => opt.id === optionId);

            if (!option || !option.enabled) {
                CopyUtils.showNotification("Option Not Available", "The requested copy option is not enabled");
                return false;
            }

            return this.copyWithTemplate(option.template, optionId);
        } catch (error) {
            console.error('Error in copyWithDropdownOption:', error);
            CopyUtils.showNotification("Error", "Failed to copy: " + error.message);
            return false;
        }
    }

    /**
     * Check if result has unresolved template variables
     * @param {string} result - Rendered template result
     * @returns {boolean} - True if has unresolved variables
     */
    _hasUnresolvedVariables(result) {
        // Check for variables that weren't replaced (still have {{ }} format)
        const unresolvedPattern = /\{\{[^}]+\}\}/;
        return unresolvedPattern.test(result);
    }

}
window.CopyOperations = CopyOperations;
