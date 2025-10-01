class JiraStatusRelocator {
    constructor() {
        this.isProcessed = false;
        this.originalParent = null;
        this.originalNextSibling = null;
        this.movedElement = null;
        this.pollInterval = null;
        this.currentUrl = window.location.href;
    }

    async initialize() {
        // Initial attempt
        setTimeout(() => {
            this.moveButton();
        }, 2000);

        // Start continuous monitoring for overlays and URL changes
        this.startPolling();
    }

    startPolling() {
        if (this.pollInterval) return;

        this.pollInterval = setInterval(() => {
            // Check if URL changed (indicating navigation to new issue)
            if (window.location.href !== this.currentUrl) {
                this.currentUrl = window.location.href;
                this.reset();
                setTimeout(() => this.moveButton(), 1000);
                return;
            }

            // Check if we find status buttons that haven't been processed
            if (!this.isProcessed) {
                this.moveButton();
            }
        }, 1000); // Check every second
    }

    reset() {
        this.isProcessed = false;
        // Keep position info for potential restoration
    }

    moveButton() {
        if (this.isProcessed) return;

        const originalContainer =
            document.querySelector('[data-testid="issue.views.issue-base.foundation.status.status-field-wrapper"]') ||
            document.querySelector('[data-testid="ref-spotlight-target-status-and-approval-spotlight"]');

        const targetLocation = document.querySelector('[data-testid="issue.views.issue-base.context.status-and-approvals-wrapper.status-and-approval"] [data-testid="issue.views.issue-base.foundation.status.actions-wrapper"]');

        if (!originalContainer || !targetLocation) {
            setTimeout(() => this.moveButton(), 1000);
            return;
        }

        try {
            this.originalParent = originalContainer.parentNode;
            this.originalNextSibling = originalContainer.nextSibling;
            this.movedElement = originalContainer;

            originalContainer.style.marginRight = '8px';
            targetLocation.insertBefore(originalContainer, targetLocation.firstChild);
            this.isProcessed = true;
        } catch (error) {
            // Silently handle errors
        }
    }

    cleanup() {
        // Stop polling
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }

        // Restore original position
        if (this.movedElement && this.originalParent) {
            this.movedElement.style.marginRight = '';

            if (this.originalNextSibling) {
                this.originalParent.insertBefore(this.movedElement, this.originalNextSibling);
            } else {
                this.originalParent.appendChild(this.movedElement);
            }
        }

        this.isProcessed = false;
        this.originalParent = null;
        this.originalNextSibling = null;
        this.movedElement = null;
    }
}

// Export for use in other modules
window.JiraStatusRelocator = JiraStatusRelocator;