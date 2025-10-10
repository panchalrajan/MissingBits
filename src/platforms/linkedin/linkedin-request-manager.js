// LinkedIn Request Manager - Manages LinkedIn invitation requests
class LinkedInRequestManager extends BaseManager {
    constructor() {
        super();
        this.overlayButton = null;
        this.currentPageType = null;
        this.isWithdrawing = false;
        this.shouldCancel = false;
    }

    setupConfigs() {
        this.setConfig('pages', {
            invitationManager: 'invitation-manager',
            sent: 'invitation-manager/sent',
            received: 'invitation-manager/received'
        });

        this.setConfig('selectors', {
            withdrawButton: 'button[data-view-name="sent-invitations-withdraw-single"]',
            confirmButton: 'div[data-view-name="edge-creation-connect-action"] button',
            mainContainer: 'main',
            loadMoreButton: 'button'
        });
    }

    setupEventListeners() {
        if (!this.isInvitationManagerPage()) return;

        SettingsManager.subscribe('linkedin-request-manager', (changes) => {
            if (changes.linkedinAutoAcceptEnabled || changes.linkedinAutoWithdrawEnabled) {
                this.updateButtonVisibility();
            }
            if (changes.linkedinWithdrawCount) {
                this.updateButtonText();
            }
        }, { keys: ['linkedinAutoAcceptEnabled', 'linkedinAutoWithdrawEnabled', 'linkedinWithdrawCount'] });

        this.startContentWatcher();
        this.startUrlWatcher();
    }

    onInitialized() {
        if (this.isInvitationManagerPage()) {
            this.setTimeoutTracked(async () => {
                await this.createOverlayButton();
                // Check if we should trigger withdrawal automatically
                await this.checkForAutoTrigger();
            }, 1000);
        }
    }

    async checkForAutoTrigger() {
        try {
            const result = await chrome.storage.local.get(['triggerLinkedInWithdrawal']);
            if (result.triggerLinkedInWithdrawal && this.isInvitationManagerSentPage()) {
                // Clear the trigger flag
                await chrome.storage.local.remove(['triggerLinkedInWithdrawal']);

                // Start withdrawal after a short delay to ensure page is loaded
                this.setTimeoutTracked(async () => {
                    if (this.overlayButton) {
                        const button = document.getElementById('linkedin-action-btn');
                        if (button && !this.isWithdrawing) {
                            button.click();
                        }
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('Error checking for auto trigger:', error);
        }
    }

    isInvitationManagerPage() {
        const url = window.location.href;
        const config = this.getConfig('pages');
        return url.includes('linkedin.com') && url.includes(config.invitationManager);
    }

    isInvitationManagerSentPage() {
        const url = window.location.href;
        const config = this.getConfig('pages');
        return url.includes('linkedin.com') && url.includes(config.sent);
    }

    isInvitationManagerReceivedPage() {
        const url = window.location.href;
        const config = this.getConfig('pages');
        return url.includes('linkedin.com') && url.includes(config.received);
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

        // Set button text based on page type and withdraw count setting
        if (pageType === 'sent') {
            const withdrawCount = settings.linkedinWithdrawCount || "10";
            if (withdrawCount === "all") {
                button.textContent = 'Withdraw All Requests';
            } else {
                button.textContent = `Withdraw Oldest ${withdrawCount} Requests`;
            }
        } else {
            button.textContent = 'Accept All Requests';
        }

        this.addEventListenerTracked(button, 'mouseenter', () => {
            if (this.isWithdrawing) {
                button.style.background = '#e68900'; // Darker orange when withdrawing
            } else {
                button.style.background = '#004182'; // Dark blue when idle
            }
            button.style.transform = 'translateY(-1px)';
            button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        });

        this.addEventListenerTracked(button, 'mouseleave', () => {
            if (this.isWithdrawing) {
                button.style.background = '#ff9800'; // Back to orange when withdrawing
            } else {
                button.style.background = '#0a66c2'; // Back to blue when idle
            }
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        });

        this.addEventListenerTracked(button, 'click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (this.isWithdrawing) {
                // Cancel the current operation
                this.shouldCancel = true;
                await this.updateButtonText();
                this.isWithdrawing = false;
                console.log('LinkedIn Withdraw: Cancelled by user');
                return;
            }

            if (pageType === 'sent') {
                this.updateButtonState('Scrolling...', true, '#666');

                try {
                    await this.loadAllInvitations();
                    await this.performWithdrawals();
                    await this.updateButtonText();
                } catch (error) {
                    console.error('Error during withdrawal process:', error);
                    await this.updateButtonText();
                }
            }
        });

        overlay.appendChild(button);
        document.body.appendChild(overlay);

        this.overlayButton = overlay;
    }

    async updateButtonText() {
        const button = document.getElementById('linkedin-action-btn');
        if (!button) return;

        const pageType = this.getCurrentPageType();
        if (!pageType) return;

        const settings = await SettingsManager.load();

        let buttonText = '';
        if (pageType === 'sent') {
            const withdrawCount = settings.linkedinWithdrawCount || "10";
            if (withdrawCount === "all") {
                buttonText = 'Withdraw All Requests';
            } else {
                buttonText = `Withdraw Oldest ${withdrawCount} Requests`;
            }
        } else {
            buttonText = 'Accept All Requests';
        }

        // Use updateButtonState to restore normal state
        this.updateButtonState(buttonText, false);
    }

    updateButtonState(text, disabled = false, color = null) {
        const button = document.getElementById('linkedin-action-btn');
        if (!button) return;

        button.textContent = text;

        // Handle disabled state properly for scrolling, but keep clickable during withdrawing
        if (disabled) {
            button.disabled = true;
            button.setAttribute('disabled', 'true');
            button.style.cursor = 'not-allowed';
            button.style.opacity = '0.7';
            button.style.pointerEvents = 'none';
        } else {
            button.disabled = false;
            button.removeAttribute('disabled');
            button.style.cursor = 'pointer';
            button.style.opacity = '1';
            button.style.pointerEvents = 'auto';
        }

        if (color) {
            button.style.background = color;
        } else if (!disabled) {
            button.style.background = '#0a66c2';
        }
    }

    startContentWatcher() {
        const targetNode = document.body;

        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE &&
                            node.classList?.contains('artdeco-tab')) {
                            shouldUpdate = true;
                        }
                    });
                }
            });

            if (shouldUpdate) {
                this.setTimeoutTracked(() => {
                    this.handlePageUpdate();
                }, 300);
            }
        });

        observer.observe(targetNode, {
            childList: true,
            subtree: true
        });

        // Store observer reference for cleanup
        this.mutationObserver = observer;
    }

    startUrlWatcher() {
        const intervalId = this.setIntervalTracked(() => {
            const newPageType = this.getCurrentPageType();
            if (newPageType !== this.currentPageType) {
                this.currentPageType = newPageType;
                this.handlePageUpdate();
            }
        }, 500);
    }

    onCleanup() {
        if (this.overlayButton) {
            this.overlayButton.remove();
            this.overlayButton = null;
        }

        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }

        SettingsManager.unsubscribe('linkedin-request-manager');
        this.currentPageType = null;
    }

    async loadAllInvitations() {
        return new Promise((resolve) => {
            let expectedRequestCount = null;

            // Extract expected count from UI text like "People (66)"
            const getExpectedRequestCount = () => {
                const pageText = document.body.textContent || '';
                const match = pageText.match(/People\s*\((\d+)\)/);
                return match ? parseInt(match[1], 10) : null;
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
                }

                const loadMoreButton = Array.from(this.safeQuerySelectorAll('button')).find(btn =>
                    btn.textContent && btn.textContent.toLowerCase().includes('load more')
                );

                if (loadMoreButton) {
                    loadMoreButton.click();
                    this.setTimeoutTracked(scrollToLoadMore, 500);
                    return;
                }

                const currentWithdrawCount = getCurrentWithdrawCount();

                if (expectedRequestCount) {
                    this.updateButtonState(`Scrolling... (${currentWithdrawCount}/${expectedRequestCount})`, true, '#666');
                } else {
                    this.updateButtonState(`Scrolling... (${currentWithdrawCount} found)`, true, '#666');
                }

                const mainContainer = this.safeQuerySelector(this.getConfig('selectors').mainContainer);
                const canStillScroll = mainContainer &&
                    mainContainer.scrollTop < (mainContainer.scrollHeight - mainContainer.clientHeight - 10);

                if (expectedRequestCount !== null && currentWithdrawCount >= expectedRequestCount && !canStillScroll) {
                    resolve(currentWithdrawCount);
                    return;
                }

                if (mainContainer) {
                    const maxScroll = mainContainer.scrollHeight - mainContainer.clientHeight;
                    if (mainContainer.scrollTop < maxScroll - 10) {
                        mainContainer.scrollBy({
                            top: 750,
                            behavior: 'smooth'
                        });
                    }
                }

                this.setTimeoutTracked(scrollToLoadMore, 150);
            };

            scrollToLoadMore();
        });
    }

    getRandomDelay() {
        return Math.random() * 500 + 1000;
    }

    async performWithdrawals() {
        this.isWithdrawing = true;
        this.shouldCancel = false;

        const settings = await SettingsManager.load();
        const withdrawCount = settings.linkedinWithdrawCount || "10";

        const withdrawButtons = Array.from(this.safeQuerySelectorAll('button')).filter(btn => {
            const textMatch = btn.textContent?.trim().toLowerCase() === 'withdraw';
            const viewMatch = btn.getAttribute('data-view-name') === 'sent-invitations-withdraw-single';
            return textMatch && viewMatch;
        });

        if (withdrawButtons.length === 0) {
            this.isWithdrawing = false;
            return;
        }

        let buttonsToWithdraw;
        if (withdrawCount === "all") {
            buttonsToWithdraw = withdrawButtons.reverse();
        } else {
            const count = parseInt(withdrawCount, 10);
            buttonsToWithdraw = withdrawButtons.slice(-Math.min(count, withdrawButtons.length)).reverse();
        }

        for (let i = 0; i < buttonsToWithdraw.length; i++) {
            // Check if user cancelled
            if (this.shouldCancel) {
                console.log('LinkedIn Withdraw: Operation cancelled');
                this.isWithdrawing = false;
                return;
            }

            const currentCount = i + 1;
            const totalCount = buttonsToWithdraw.length;

            this.updateButtonState(`Withdrawing ${currentCount}/${totalCount}... (cancel)`, false, '#ff9800');

            try {
                buttonsToWithdraw[i].click();
                await this.handleWithdrawConfirmation();

                if (i < buttonsToWithdraw.length - 1) {
                    const delay = this.getRandomDelay();
                    await new Promise(resolve => this.setTimeoutTracked(resolve, delay));
                }
            } catch (error) {
                console.error(`Error withdrawing request ${currentCount}/${totalCount}:`, error);
            }
        }

        this.isWithdrawing = false;
    }

    async handleWithdrawConfirmation() {
        let attempts = 0;
        const maxAttempts = 20;

        while (attempts < maxAttempts) {
            const confirmButtons = Array.from(this.safeQuerySelectorAll('button')).filter(btn => {
                const textMatch = btn.textContent?.trim().toLowerCase() === 'withdraw';
                const parentMatch = btn.closest('div[data-view-name="edge-creation-connect-action"]');
                const ariaMatch = btn.getAttribute('aria-label')?.toLowerCase().startsWith('withdrawn invitation sent to');
                return textMatch && parentMatch && ariaMatch;
            });

            if (confirmButtons.length > 0) {
                confirmButtons[0].click();
                await new Promise(resolve => this.setTimeoutTracked(resolve, 1500));
                return;
            }

            await new Promise(resolve => this.setTimeoutTracked(resolve, 500));
            attempts++;
        }

        throw new Error('Confirmation dialog not found or timeout reached');
    }

    async updateButtonVisibility() {
        await this.createOverlayButton();
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