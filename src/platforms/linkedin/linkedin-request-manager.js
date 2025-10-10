// LinkedIn Request Manager - Manages LinkedIn invitation requests
class LinkedInRequestManager {
    constructor() {
        this.overlayButton = null;
        this.currentPageType = null;
        this.mutationObserver = null;
        this.urlCheckInterval = null;
    }

    async initialize() {
        if (!this.isInvitationManagerPage()) {
            return;
        }

        setTimeout(async () => {
            await this.createOverlayButton();
        }, 1000);

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

    async createOverlayButton() {
        if (this.overlayButton) {
            this.overlayButton.remove();
        }

        const pageType = this.getCurrentPageType();
        if (!pageType) {
            return;
        }

        // Check if button should be shown based on settings
        const settings = await SettingsManager.load();
        const shouldShow = (pageType === 'sent' && settings.linkedinAutoWithdrawEnabled) ||
                          (pageType === 'received' && settings.linkedinAutoAcceptEnabled);

        if (!shouldShow) {
            return;
        }

        this.currentPageType = pageType;

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

        button.textContent = pageType === 'sent' ? 'Withdraw Oldest 10 Requests' : 'Accept All Requests';

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
                this.loadAllInvitations();
            } else {
                console.log(`Button clicked for ${pageType} page`);
            }
        });

        overlay.appendChild(button);
        document.body.appendChild(overlay);

        this.overlayButton = overlay;
    }

    startContentWatcher() {
        const targetNode = document.body;

        this.mutationObserver = new MutationObserver((mutations) => {
            let shouldUpdate = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList &&  node.classList.contains('artdeco-tab')) {
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
        this.urlCheckInterval = setInterval(() => {
            const newPageType = this.getCurrentPageType();
            if (newPageType !== this.currentPageType) {
                this.currentPageType = newPageType;
                this.handlePageUpdate();
            }
        }, 500);
    }

    cleanup() {
        if (this.overlayButton) {
            this.overlayButton.remove();
            this.overlayButton = null;
        }

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

    async loadAllInvitations() {
        return new Promise((resolve) => {
            let expectedRequestCount = null;

            // Extract expected count from UI text like "People (66)"
            const getExpectedRequestCount = () => {
                const pageText = document.body.textContent || '';
                const match = pageText.match(/People\s*\((\d+)\)/);
                if (match) {
                    return parseInt(match[1], 10);
                }
                return null;
            };

            const getCurrentWithdrawCount = () => {
                const withdrawButtons = document.querySelectorAll('button');
                let count = 0;
                withdrawButtons.forEach(btn => {
                    if (btn.textContent && btn.textContent.toLowerCase().includes('withdraw')) {
                        count++;
                    }
                });
                return count;
            };

            const scrollToLoadMore = () => {
                if (expectedRequestCount === null) {
                    expectedRequestCount = getExpectedRequestCount();
                    if (expectedRequestCount === null) {
                        console.log('Could not find expected request count in UI');
                    } else {
                        console.log(`Expected request count: ${expectedRequestCount}`);
                    }
                }

                const loadMoreButton = Array.from(document.querySelectorAll('button')).find(btn =>
                    btn.textContent && btn.textContent.toLowerCase().includes('load more')
                );

                if (loadMoreButton) {
                    loadMoreButton.click();
                    setTimeout(() => {
                        scrollToLoadMore();
                    }, 500);
                    return;
                }

                const currentWithdrawCount = getCurrentWithdrawCount();

                // Try scrolling main container
                const mainContainer = document.querySelector('main');

                // Check if withdraw count matches expected count AND we can't scroll anymore
                const canStillScroll = mainContainer &&
                    mainContainer.scrollTop < (mainContainer.scrollHeight - mainContainer.clientHeight - 10);

                if (expectedRequestCount !== null && currentWithdrawCount >= expectedRequestCount && !canStillScroll) {
                    console.log('All requests loaded - withdraw count matches expected count AND reached scroll end');
                    resolve(currentWithdrawCount);
                    return;
                }

                if (mainContainer) {
                    const maxScroll = mainContainer.scrollHeight - mainContainer.clientHeight;
                    console.log(`Container scroll: ${mainContainer.scrollTop}/${maxScroll}`);
                    if (mainContainer.scrollTop < maxScroll - 10) {
                        mainContainer.scrollBy({
                            top: 750,
                            behavior: 'smooth'
                        }); 
                        console.log('Scrolled container');
                    }
                }

                setTimeout(() => {
                    scrollToLoadMore();
                }, 150);
            };

            scrollToLoadMore();
        });
    }

    async handlePageUpdate() {
        if (this.isInvitationManagerPage()) {
            await this.createOverlayButton();
        } else {
            this.cleanup();
        }
    }
}

window.LinkedInRequestManager = LinkedInRequestManager;