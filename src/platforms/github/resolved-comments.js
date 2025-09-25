// Resolved Comments Module for GitHub Helper Extension
class ResolvedComments {
    /**
     * Toggles resolved comment threads visibility in batches
     * @returns {Promise<Object>} Result object with toggle status and count
     */
    static async toggleVisibility() {
        const resolvedComments = document.querySelectorAll('details[data-resolved="true"]');

        if (resolvedComments.length === 0) {
            return { toggled: false, count: 0 };
        }

        // Check current state - if any are closed, open all; if all are open, close all
        const closedComments = Array.from(resolvedComments).filter(details => !details.hasAttribute('open'));
        const shouldOpen = closedComments.length > 0;

        // Process in batches of 10
        const BATCH_SIZE = 10;
        const commentsArray = Array.from(resolvedComments);

        for (let i = 0; i < commentsArray.length; i += BATCH_SIZE) {
            const batch = commentsArray.slice(i, i + BATCH_SIZE);

            batch.forEach(details => {
                if (shouldOpen) {
                    details.setAttribute('open', '');
                } else {
                    details.removeAttribute('open');
                }
            });

            // Add a small delay between batches to prevent blocking the UI
            if (i + BATCH_SIZE < commentsArray.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return { toggled: true, count: resolvedComments.length, opened: shouldOpen };
    }

    /**
     * Handles resolved comments button click
     * @param {HTMLElement} button - Button element
     */
    static async handleToggleClick(button) {
        const buttonLabel = button.querySelector('.Button-label');
        const originalText = buttonLabel.textContent;

        ButtonUtils.setButtonText(button, 'Toggling...');
        ButtonUtils.setButtonEnabled(button, false);

        try {
            const result = await this.toggleVisibility();

            if (result.toggled) {
                const actionText = result.opened ? 'Showing' : 'Hiding';
                ButtonUtils.updateButtonText(button, `${actionText} ${result.count} Resolved`, originalText);
            } else {
                ButtonUtils.updateButtonText(button, 'No Resolved Comments', originalText);
            }

            ButtonUtils.setButtonEnabled(button, true);
        } catch (error) {
            ButtonUtils.updateButtonText(button, 'Error', originalText);
            ButtonUtils.setButtonEnabled(button, true);
        }
    }
}

window.ResolvedComments = ResolvedComments;
