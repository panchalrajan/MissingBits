// Simple Native Button Relocator - Just moves the element
class JiraStatusRelocator {
    constructor() {
        this.isProcessed = false;
        this.originalParent = null;
        this.originalNextSibling = null;
        this.movedElement = null;
    }

    /**
     * Initialize and move button
     */
    async initialize() {
        console.log("🚀 JiraStatusRelocator: Starting native relocation...");

        setTimeout(() => {
            this.moveButton();
        }, 2000);
    }

    /**
     * Simply move the original button to new location
     */
    moveButton() {
        if (this.isProcessed) return;

        // Try multiple selectors for different Jira versions
        let originalContainer =
            // New structure (your current account)
            document.querySelector('[data-testid="issue.views.issue-base.foundation.status.status-field-wrapper"]') ||
            // Old structure (previous working account)
            document.querySelector('[data-testid="ref-spotlight-target-status-and-approval-spotlight"]');

        const targetLocation = document.querySelector('[data-testid="issue.views.issue-base.context.status-and-approvals-wrapper.status-and-approval"] [data-testid="issue.views.issue-base.foundation.status.actions-wrapper"]');

        if (!originalContainer || !targetLocation) {
            console.log("❌ JiraStatusRelocator: Required elements not found", {
                originalContainer: !!originalContainer,
                targetLocation: !!targetLocation,
                statusButton: !!document.querySelector('#issue\\.fields\\.status-view\\.status-button')
            });
            setTimeout(() => this.moveButton(), 1000);
            return;
        }

        console.log("✅ JiraStatusRelocator: Moving button natively...");

        try {
            // Store original position for potential restoration
            this.originalParent = originalContainer.parentNode;
            this.originalNextSibling = originalContainer.nextSibling;
            this.movedElement = originalContainer;

            // Add spacing
            originalContainer.style.marginRight = '8px';

            // Simply move the element
            targetLocation.insertBefore(originalContainer, targetLocation.firstChild);

            this.isProcessed = true;
            console.log("✅ JiraStatusRelocator: Button moved successfully!");

        } catch (error) {
            console.error("❌ JiraStatusRelocator: Error moving button:", error);
        }
    }

    /**
     * Cleanup - restore to original position
     */
    cleanup() {
        console.log("🧹 JiraStatusRelocator: Restoring button to original position...");

        if (this.movedElement && this.originalParent) {
            // Remove added styling
            this.movedElement.style.marginRight = '';

            // Move back to original position
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