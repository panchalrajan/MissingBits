// LinkedIn Overlay Button - Adds overlay button at bottom center
class LinkedInOverlay {
    constructor() {
        this.overlayButton = null;
        this.currentPageType = null;
        this.mutationObserver = null;
        this.urlCheckInterval = null;
    }

    async initialize() {
        // Only initialize on LinkedIn invitation manager pages (sent or received)
        if (!this.isInvitationManagerPage()) {
            return;
        }

        // Create overlay button after a short delay to ensure page is loaded
        setTimeout(() => {
            this.createOverlayButton();
        }, 1000);

        // Start watching for content changes and URL changes
        this.startContentWatcher();
        this.startUrlWatcher();
    }

    isInvitationManagerPage() {
        const url = window.location.href;
        return url.includes('linkedin.com') && url.includes('invitation-manager');
    }

    isInvitationManagerSentPage() {
        const url = window.location.href;
        return url.includes('linkedin.com') && url.includes('invitation-manager/sent');
    }

    isInvitationManagerReceivedPage() {
        const url = window.location.href;
        return url.includes('linkedin.com') && url.includes('invitation-manager/received');
    }

    getCurrentPageType() {
        if (this.isInvitationManagerSentPage()) {
            return 'sent';
        } else if (this.isInvitationManagerReceivedPage()) {
            return 'received';
        }
        return null;
    }

    createOverlayButton() {
        // Remove existing button if it exists
        if (this.overlayButton) {
            this.overlayButton.remove();
        }

        // Get current page type to determine button text and action
        const pageType = this.getCurrentPageType();
        if (!pageType) {
            return; // Don't create button if we can't determine the page type
        }

        // Update current page type
        this.currentPageType = pageType;

        // Create overlay container
        const overlay = document.createElement('div');
        overlay.id = 'linkedin-overlay-container';
        overlay.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            pointer-events: none;
        `;

        // Create the button with LinkedIn-style design
        const button = document.createElement('button');
        button.id = 'linkedin-action-btn';
        button.type = 'button';
        button.style.cssText = `
            background: #0a66c2;
            color: white;
            border: none;
            border-radius: 24px;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            transition: all 0.2s ease;
            pointer-events: auto;
            white-space: nowrap;
        `;

        button.textContent = pageType === 'sent' ? 'Withdraw Last 10 Requests' : 'Accept All Requests';

        // Add hover effects
        button.addEventListener('mouseenter', () => {
            button.style.background = '#004182';
            button.style.transform = 'translateY(-1px)';
            button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.background = '#0a66c2';
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        });

        button.addEventListener('click', () => {
            if (pageType === 'sent') {
                this.handleWithdrawAction();
            } else if (pageType === 'received') {
                this.handleAcceptAllAction();
            }
        });

        // Assemble overlay
        overlay.appendChild(button);
        document.body.appendChild(overlay);

        this.overlayButton = overlay;
    }

    startContentWatcher() {
        // Watch for changes in the main content area
        const targetNode = document.body;

        this.mutationObserver = new MutationObserver((mutations) => {
            let shouldUpdate = false;

            mutations.forEach((mutation) => {
                // Check if any added nodes contain invitation-related content
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Look for tab switches or content updates
                            if (node.classList && (
                                node.classList.contains('artdeco-tab') ||
                                node.classList.contains('pv-s-profile-section') ||
                                node.querySelector && (
                                    node.querySelector('[data-test-pagination-page-btn="sent"]') ||
                                    node.querySelector('[data-test-pagination-page-btn="received"]') ||
                                    node.querySelector('.invitation-card') ||
                                    node.querySelector('.invitation')
                                )
                            )) {
                                shouldUpdate = true;
                            }
                        }
                    });
                }
            });

            if (shouldUpdate) {
                setTimeout(() => {
                    this.handlePageUpdate();
                }, 300);
            }
        });

        this.mutationObserver.observe(targetNode, {
            childList: true,
            subtree: true
        });
    }

    startUrlWatcher() {
        // Check URL changes every 500ms to catch navigation
        this.urlCheckInterval = setInterval(() => {
            const newPageType = this.getCurrentPageType();
            if (newPageType !== this.currentPageType) {
                this.currentPageType = newPageType;
                this.handlePageUpdate();
            }
        }, 500);
    }

    async handleWithdrawAction() {
        this.updateButtonState('loading', 'Loading all invitations...');

        try {
            await this.loadAllInvitations();
            this.updateButtonState('ready', 'Withdraw Last 10 Requests');
        } catch (error) {
            this.updateButtonState('error', 'Error - Try Again');
            setTimeout(() => {
                this.updateButtonState('ready', 'Withdraw Last 10 Requests');
            }, 3000);
        }
    }

    async loadAllInvitations() {
        return new Promise((resolve) => {
            let currentScrollStep = 0;
            let noScrollCount = 0;

            const scrollToCompleteEnd = () => {
                const scrollableContainers = [
                    document.querySelector('main'),
                    document.querySelector('.scaffold-layout__main'),
                    document.querySelector('.application-outlet'),
                    document.querySelector('[role="main"]'),
                    document.querySelector('.artdeco-card')
                ];

                let anyScrolled = false;

                scrollableContainers.forEach((container) => {
                    if (container) {
                        const maxScroll = container.scrollHeight - container.clientHeight;
                        if (container.scrollTop < maxScroll - 10) {
                            container.scrollBy({
                                top: 300,
                                behavior: 'smooth'
                            });
                            anyScrolled = true;
                        }
                    }
                });

                const windowMaxScroll = document.documentElement.scrollHeight - window.innerHeight;
                if (window.pageYOffset < windowMaxScroll - 10) {
                    window.scrollBy({
                        top: 750,
                        behavior: 'smooth'
                    });
                    anyScrolled = true;
                }

                currentScrollStep++;

                if (!anyScrolled) {
                    noScrollCount++;
                } else {
                    noScrollCount = 0;
                }

                if (noScrollCount >= 3 || currentScrollStep >= 200) {
                    setTimeout(() => {
                        const withdrawButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
                            btn.textContent.includes('Withdraw')
                        );
                        resolve(withdrawButtons.length);
                    }, 2000);
                    return;
                }

                setTimeout(() => {
                    scrollToCompleteEnd();
                }, 250);
            };

            scrollToCompleteEnd();
        });
    }

    updateButtonState(state, text) {
        const button = document.getElementById('linkedin-action-btn');
        if (!button) return;

        button.textContent = text;

        // Update button appearance based on state
        switch (state) {
            case 'loading':
                button.style.background = '#666';
                button.style.cursor = 'not-allowed';
                button.disabled = true;
                break;
            case 'error':
                button.style.background = '#d32f2f';
                button.style.cursor = 'pointer';
                button.disabled = false;
                break;
            case 'ready':
            default:
                button.style.background = '#0a66c2';
                button.style.cursor = 'pointer';
                button.disabled = false;
                break;
        }
    }

    handleAcceptAllAction() {
        // TODO: Implement accept all requests functionality
    }

    cleanup() {
        if (this.overlayButton) {
            this.overlayButton.remove();
            this.overlayButton = null;
        }

        // Clean up observers and intervals
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }

        if (this.urlCheckInterval) {
            clearInterval(this.urlCheckInterval);
            this.urlCheckInterval = null;
        }

        this.currentPageType = null;
    }

    handlePageUpdate() {
        if (this.isInvitationManagerPage()) {
            this.createOverlayButton();
        } else {
            this.cleanup();
        }
    }
}

// Make class globally available
window.LinkedInOverlay = LinkedInOverlay;