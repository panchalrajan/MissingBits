// Comment Filter Module for GitHub Helper Extension
class CommentFilter {
    /**
     * Gets enabled usernames from settings
     * @param {Object} settings - Settings object
     * @returns {Array} Array of enabled username objects
     */
    static getEnabledUsernames(settings) {
        return FilterUtils.getEnabledItems(settings.usernames);
    }

    /**
     * Checks if a comment should be hidden based on author username
     * @param {HTMLElement} commentContainer - Comment container element
     * @param {Array} enabledUsernames - Array of enabled username filter objects
     * @returns {boolean} True if comment should be hidden
     */
    static shouldHideComment(commentContainer, enabledUsernames) {
        return FilterUtils.shouldHideComment(commentContainer, enabledUsernames);
    }

    /**
     * Applies comment filter to the current page
     * @param {boolean} isEnabled - Whether filter is enabled
     * @param {Object} settings - Settings object
     */
    static applyFilter(isEnabled, settings) {
        if (!isEnabled) {
            // Show all comments (both timeline items and review thread turbo-frames)
            const hiddenComments = document.querySelectorAll('.js-timeline-item[hidden], turbo-frame[id*="review-thread"][hidden], turbo-frame[id*="comment-id"][hidden]');
            hiddenComments.forEach(comment => {
                comment.removeAttribute('hidden');
                // Also remove clean timeline markers
                comment.removeAttribute('data-clean-timeline-hidden');
            });
            return;
        }

        const enabledUsernames = this.getEnabledUsernames(settings);
        const hideResolvedComments = settings.hideResolvedComments || false;

        // Skip if no filters are enabled
        if (!enabledUsernames.length && !hideResolvedComments && !settings.cleanTimeline) return;

        // Apply username filter to timeline items
        if (enabledUsernames.length > 0) {
            const commentContainers = document.querySelectorAll('.js-timeline-item.js-timeline-progressive-focus-container');
            commentContainers.forEach(container => {
                if (this.shouldHideComment(container, enabledUsernames)) {
                    container.setAttribute('hidden', '');
                } else {
                    container.removeAttribute('hidden');
                }
            });
        }

        // Apply resolved comments filter to turbo-frames
        if (hideResolvedComments) {
            // Only target turbo-frame elements that are review threads/comments
            // Using the specific ID pattern you provided: "review-thread-or-comment-id-"
            const reviewThreadFrames = document.querySelectorAll('turbo-frame[id*="review-thread"], turbo-frame[id*="comment-id"]');
            reviewThreadFrames.forEach(frame => {
                // Check if this turbo-frame contains a details element with data-resolved="true"
                const resolvedDetails = frame.querySelector('details[data-resolved="true"]');
                if (resolvedDetails) {
                    frame.setAttribute('hidden', '');
                } else {
                    frame.removeAttribute('hidden');
                }
            });
        }

        // Apply clean timeline logic - hide timeline containers if all turbo-frames inside are hidden
        // or if they lack 'TimelineItem pt-0' class and don't have open comments
        if (settings.cleanTimeline) {
            this.applyCleanTimeline();
        }
    }

    /**
     * Applies clean timeline logic - hides timeline containers if all their turbo-frames are hidden
     * Also hides containers that don't have 'TimelineItem pt-0' class unless they have open comments
     */
    static applyCleanTimeline() {
        // Find all timeline item containers
        const timelineContainers = document.querySelectorAll('.js-timeline-item.js-timeline-progressive-focus-container');

        timelineContainers.forEach(container => {
            let shouldHide = false;

            // Find all turbo-frames within this container
            const turboFrames = container.querySelectorAll('turbo-frame[id*="review-thread"], turbo-frame[id*="comment-id"]');

            if (turboFrames.length > 0) {
                // Check if ALL turbo-frames in this container are hidden
                const allTurboFramesHidden = Array.from(turboFrames).every(frame => frame.hasAttribute('hidden'));
                if (allTurboFramesHidden) {
                    shouldHide = true;
                }
            }

            // Check if container lacks 'TimelineItem pt-0' class but has open comments or regular comments
            const hasTimelineItemPt0 = container.querySelector('.TimelineItem.pt-0');
            if (!hasTimelineItemPt0) {
                // Check for open (unresolved) comments - data-resolved="false" or open details
                const hasOpenComments = container.querySelector('details[data-resolved="false"], details[open]:not([data-resolved="true"])');

                // Check for regular comments (with TimelineItem js-comment-container)
                const hasRegularComments = container.querySelector('.TimelineItem.js-comment-container');

                // Don't hide if it has open comments OR regular comments
                if (!hasOpenComments && !hasRegularComments) {
                    shouldHide = true;
                }
            }

            if (shouldHide) {
                // Hide the entire timeline container
                container.setAttribute('hidden', '');
                container.setAttribute('data-clean-timeline-hidden', 'true');
            } else {
                // Show the timeline container if it was hidden by clean timeline
                if (container.hasAttribute('data-clean-timeline-hidden')) {
                    container.removeAttribute('hidden');
                    container.removeAttribute('data-clean-timeline-hidden');
                }
            }
        });
    }

    /**
     * Handles comment filter button click
     * @param {HTMLElement} button - Button element
     * @param {Object} settings - Settings object
     */
    static async handleFilterToggle(button, settings) {
        const buttonLabel = button.querySelector('.Button-label');
        const originalText = buttonLabel.textContent;

        // Check current state - if currently filtering, show all; if showing all, apply filter
        const hiddenComments = document.querySelectorAll('.js-timeline-item[hidden], turbo-frame[id*="review-thread"][hidden], turbo-frame[id*="comment-id"][hidden]');
        const isCurrentlyFiltering = hiddenComments.length > 0;

        if (isCurrentlyFiltering) {
            // Show all comments
            this.applyFilter(false, settings);
            ButtonUtils.updateButtonText(button, 'Comments Shown', originalText);
        } else {
            // Apply filter
            const enabledUsernames = this.getEnabledUsernames(settings);
            const hideResolvedComments = settings.hideResolvedComments || false;

            if (!enabledUsernames.length && !hideResolvedComments && !settings.cleanTimeline) {
                ButtonUtils.updateButtonText(button, 'No Filters Enabled', originalText);
                return;
            }

            this.applyFilter(true, settings);
            const hiddenCount = document.querySelectorAll('.js-timeline-item[hidden], turbo-frame[id*="review-thread"][hidden], turbo-frame[id*="comment-id"][hidden]').length;

            // Create concise message based on active filters
            let filterDescription = [];
            if (enabledUsernames.length > 0) {
                filterDescription.push(`${enabledUsernames.length}u`);
            }
            if (hideResolvedComments) {
                filterDescription.push('resolved');
            }
            if (settings.cleanTimeline) {
                filterDescription.push('clean');
            }

            const filterText = filterDescription.join('+');
            ButtonUtils.updateButtonText(button, `Filtered ${hiddenCount} (${filterText})`, originalText);
        }
    }
}

window.CommentFilter = CommentFilter;
