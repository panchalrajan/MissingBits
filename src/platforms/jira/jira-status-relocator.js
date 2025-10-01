class JiraStatusRelocator {
    constructor() {
        this.isProcessed = false;
        this.originalParent = null;
        this.originalNextSibling = null;
        this.movedElement = null;
    }

    async initialize() {
        setTimeout(() => {
            this.moveButton();
        }, 2000);
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