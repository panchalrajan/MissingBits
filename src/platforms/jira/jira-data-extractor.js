// Jira Data Extraction Utilities
class JiraDataExtractor {
    static extractReporter() {
        const reporterElement = document.querySelector('[data-testid="issue.views.field.user.reporter"]');
        if (!reporterElement) return null;

        // Look for the name in the span element
        const nameSpan = reporterElement.querySelector('span[class*="_1reo15vq _18m915vq _o5721q9c _1bto1l2s"] span');
        if (nameSpan && nameSpan.textContent.trim()) {
            return nameSpan.textContent.trim();
        }

        return null;
    }

    static extractAssignee() {
        const assigneeElement = document.querySelector('[data-testid="issue.views.field.user.assignee"]');
        if (!assigneeElement) return null;

        // Check if it shows "Unassigned"
        const unassignedSpan = assigneeElement.querySelector('span[class*="_1reo15vq _18m915vq _o5721q9c _1bto1l2s"] span');
        if (unassignedSpan && unassignedSpan.textContent.trim() === 'Unassigned') {
            return null; // Don't copy if unassigned
        }

        // Look for the assigned person's name
        if (unassignedSpan && unassignedSpan.textContent.trim() && unassignedSpan.textContent.trim() !== 'Unassigned') {
            return unassignedSpan.textContent.trim();
        }

        return null;
    }

    static extractPriority() {
        const priorityElement = document.querySelector('[data-testid="issue-field-priority-readview-full.ui.priority.wrapper"]');
        if (!priorityElement) return null;

        // Look for the priority text in the span element
        const prioritySpan = priorityElement.querySelector('span[class*="_1reo15vq _18m915vq"]');
        if (prioritySpan && prioritySpan.textContent.trim()) {
            return prioritySpan.textContent.trim();
        }

        return null;
    }

    static extractTicketType() {
        const issueTypeButton = document.querySelector('[data-testid="issue.views.issue-base.foundation.change-issue-type.button"]');
        if (issueTypeButton) {
            const imgElement = issueTypeButton.querySelector('img');
            if (imgElement && imgElement.alt) {
                // Return the clean issue type from the alt attribute
                return imgElement.alt;
            }
        }
        return null;
    }

    static extractStatus() {
        const statusButton = document.querySelector('[data-testid="issue-field-status.ui.status-view.status-button.status-button"]');
        if (statusButton) {
            const statusSpan = statusButton.querySelector('span.css-178ag6o');
            if (statusSpan && statusSpan.textContent.trim()) {
                return statusSpan.textContent.trim();
            }
        }
        return null;
    }
}
window.JiraDataExtractor = JiraDataExtractor;
