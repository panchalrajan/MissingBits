// LinkedIn Connect Manager - Manages LinkedIn connection requests on MyNetwork page
class LinkedInConnect extends BaseManager {
    constructor() {
        super();
        this.connectButton = null;
        this.growPageButton = null;
        this.lastOverlayState = null;
        this.isConnecting = false;
        this.shouldCancel = false;
    }

    setupConfigs() {
        this.setConfig('pages', {
            myNetworkBase: '/mynetwork/'
        });

        this.setConfig('selectors', {
            overlayContainer: 'div[role="main"][data-sdui-screen="com.linkedin.sdui.flagshipnav.mynetwork.CohortSeeAll"]',
            connectButtons: 'button[aria-label*="Invite"][aria-label*="to connect"]',
            connectButtonGeneric: 'button'
        });

        this.setConfig('styles', {
            button: `
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
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
                z-index: 10000;
                white-space: nowrap;
            `
        });
    }

    setupEventListeners() {
        SettingsManager.subscribe('linkedin-connect', (changes) => {
            if (changes.linkedinAutoConnectEnabled) {
                this.checkAndCreateButton();
                this.checkAndCreateGrowPageButton();
            }
        }, { keys: ['linkedinAutoConnectEnabled'] });

        // Watch for overlay appearance on MyNetwork pages
        if (this.isMyNetworkPage()) {
            this.startOverlayWatcher();
        }

        // Always start content watcher for grow page button
        this.startGrowPageWatcher();
    }

    onInitialized() {
        if (this.isMyNetworkPage()) {
            this.setTimeoutTracked(async () => {
                this.checkAndCreateButton();
                await this.checkAndCreateGrowPageButton();
                // Check if we should trigger connection automatically
                await this.checkForAutoTrigger();
            }, 1000);
        } else {
            // Check for grow page button on non-MyNetwork pages (like search results)
            this.setTimeoutTracked(async () => {
                await this.checkAndCreateGrowPageButton();
                // Check if we should trigger connection automatically
                await this.checkForAutoTrigger();
            }, 1000);
        }
    }

    async checkForAutoTrigger() {
        try {
            const result = await chrome.storage.local.get(['triggerLinkedInConnect']);
            const isGrowPage = window.location.pathname.includes('/mynetwork/grow/');

            if (result.triggerLinkedInConnect && isGrowPage) {
                // Clear the trigger flag
                await chrome.storage.local.remove(['triggerLinkedInConnect']);

                // Start connecting after a short delay to ensure page is loaded
                this.setTimeoutTracked(async () => {
                    if (this.growPageButton) {
                        const button = document.getElementById('linkedin-grow-connect-btn');
                        if (button && !this.isConnecting) {
                            button.click();
                        }
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('Error checking for auto trigger:', error);
        }
    }

    isMyNetworkPage() {
        const pathname = window.location.pathname;
        const config = this.getConfig('pages');
        return pathname.includes(config.myNetworkBase);
    }

    hasOverlayContainer() {
        const overlayContainer = this.safeQuerySelector(this.getConfig('selectors').overlayContainer);

        // Only log when overlay state changes
        if (this.lastOverlayState !== !!overlayContainer) {
            this.lastOverlayState = !!overlayContainer;
            console.log('LinkedIn Connect: Overlay container found:', !!overlayContainer);

            if (!overlayContainer) {
                // Debug: Let's see what overlay elements exist
                const allOverlays = document.querySelectorAll('[data-sdui-screen*="mynetwork"]');
                console.log('LinkedIn Connect: All mynetwork overlays found:', allOverlays.length);
                allOverlays.forEach((overlay, index) => {
                    console.log(`LinkedIn Connect: Overlay ${index}:`, overlay.getAttribute('data-sdui-screen'), overlay);
                });

                // Also check for any main elements with role="main"
                const mainElements = document.querySelectorAll('div[role="main"]');
                console.log('LinkedIn Connect: Main elements found:', mainElements.length);
                mainElements.forEach((main, index) => {
                    console.log(`LinkedIn Connect: Main ${index}:`, main.getAttribute('data-sdui-screen'), main);
                });
            }
        }

        return !!overlayContainer;
    }

    startOverlayWatcher() {
        // Use mutation observer to watch for overlay appearance/disappearance
        const debouncedCheck = this.debounce(() => {
            this.checkAndCreateButton();
        }, 1000); // 1 second debounce

        const observer = new MutationObserver(() => {
            debouncedCheck();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.mutationObserver = observer;
    }

    startGrowPageWatcher() {
        // Watch for URL changes to properly show/hide button
        let currentPath = window.location.pathname;

        const checkUrlChange = () => {
            if (window.location.pathname !== currentPath) {
                currentPath = window.location.pathname;
                console.log('LinkedIn Connect: URL changed to', currentPath);
                this.checkAndCreateGrowPageButton();
            }
        };

        // Check URL changes frequently
        this.urlCheckInterval = this.setIntervalTracked(checkUrlChange, 500);

        // Also use mutation observer for content changes
        const debouncedCheck = this.debounce(() => {
            this.checkAndCreateGrowPageButton();
        }, 1000);

        const observer = new MutationObserver(() => {
            // Check for URL changes first
            checkUrlChange();
            debouncedCheck();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.growPageMutationObserver = observer;
    }

    async checkAndCreateButton() {
        if (this.hasOverlayContainer()) {
            await this.createConnectButton();
        } else {
            this.removeButton();
        }
    }

    async createConnectButton() {
        console.log('LinkedIn Connect: Creating button...');

        if (this.connectButton) {
            return; // Button already exists
        }

        // Check if overlay container exists
        const overlayContainer = this.safeQuerySelector(this.getConfig('selectors').overlayContainer);
        if (!overlayContainer) {
            console.log('LinkedIn Connect: No overlay container found');
            return;
        }

        // Check if feature is enabled
        const settings = await SettingsManager.load();
        if (!settings.linkedinAutoConnectEnabled) {
            console.log('LinkedIn Connect: Feature disabled in settings');
            return;
        }

        console.log('LinkedIn Connect: Creating button element...');

        const button = document.createElement('button');
        button.id = 'linkedin-connect-btn';
        button.type = 'button';
        button.textContent = 'Connect with First 10';
        button.style.cssText = this.getConfig('styles').button;

        // Add hover effects
        this.addEventListenerTracked(button, 'mouseenter', () => {
            button.style.background = '#004182';
            button.style.transform = 'translate(-50%, -50%) translateY(-2px)';
            button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        });

        this.addEventListenerTracked(button, 'mouseleave', () => {
            button.style.background = '#0a66c2';
            button.style.transform = 'translate(-50%, -50%)';
            button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        });

        // Add click handler
        this.addEventListenerTracked(button, 'click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (this.isConnecting) {
                // Cancel the current operation
                this.shouldCancel = true;
                this.updateButtonState('Connect with First 10', false);
                this.isConnecting = false;
                console.log('LinkedIn Connect: Cancelled by user');
                return;
            }

            await this.performConnections();
        });

        // Ensure overlay container has relative positioning
        if (overlayContainer.style.position !== 'relative') {
            overlayContainer.style.position = 'relative';
        }

        // Add to overlay container
        overlayContainer.appendChild(button);
        this.connectButton = button;

        console.log('LinkedIn Connect: Button created and added to DOM');
    }

    async performConnections() {
        this.isConnecting = true;
        this.shouldCancel = false;

        const connectButtons = this.findConnectButtons();

        if (connectButtons.length === 0) {
            this.updateButtonState('No connections found', false, '#999');
            this.setTimeoutTracked(() => {
                this.updateButtonState('Connect with First 10', false);
            }, 2000);
            this.isConnecting = false;
            return;
        }

        const buttonsToConnect = connectButtons.slice(0, 10);

        for (let i = 0; i < buttonsToConnect.length; i++) {
            // Check if user cancelled
            if (this.shouldCancel) {
                console.log('LinkedIn Connect: Operation cancelled');
                this.isConnecting = false;
                return;
            }

            const currentCount = i + 1;
            const totalCount = buttonsToConnect.length;

            this.updateButtonState(`Connecting ${currentCount}/${totalCount}... (cancel)`, false, '#ff9800');

            try {
                buttonsToConnect[i].click();

                // Quick 0.5 second delay only
                if (i < buttonsToConnect.length - 1) {
                    await new Promise(resolve => this.setTimeoutTracked(resolve, 750));
                }
            } catch (error) {
                console.error(`Error connecting to person ${currentCount}/${totalCount}:`, error);
            }
        }

        this.updateButtonState('Completed!', false, '#4caf50');
        this.setTimeoutTracked(() => {
            this.updateButtonState('Connect with First 10', false);
            this.isConnecting = false;
        }, 750);
    }

    findConnectButtons() {
        const connectButtons = Array.from(
            document.querySelectorAll(
                'div[data-sdui-screen="com.linkedin.sdui.flagshipnav.mynetwork.CohortSeeAll"] div[data-view-name="edge-creation-connect-action"] button'
            )
        ).filter(btn => {
            const textMatch = btn.textContent?.trim().toLowerCase() === 'connect';
            const ariaMatch = btn.getAttribute('aria-label')?.toLowerCase().startsWith('invite');
            return textMatch && ariaMatch;
        });

        return connectButtons;
    }

    findGrowPageConnectButtons() {
        const connectButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
            const textMatch = btn.textContent?.trim().toLowerCase() === 'connect';
            const ariaMatch = btn.getAttribute('aria-label')?.toLowerCase().startsWith('invite');
            const parentMatch = btn.closest('div[data-view-name="edge-creation-connect-action"]');
            return textMatch && ariaMatch && parentMatch;
        });

        return connectButtons;
    }

    findSearchPageConnectButtons() {
        const connectButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
            const textMatch = btn.textContent?.trim().toLowerCase() === 'connect';
            const ariaMatch = btn.getAttribute('aria-label')?.toLowerCase().startsWith('invite');
            // Search results have different DOM structure, so we look for more general patterns
            const isVisible = btn.offsetParent !== null; // Check if button is visible
            return textMatch && ariaMatch && isVisible;
        });

        return connectButtons;
    }

    updateButtonState(text, disabled = false, color = null) {
        const button = this.safeQuerySelector('#linkedin-connect-btn');
        if (!button) return;

        button.textContent = text;

        // Never actually disable the button - always keep it clickable
        button.disabled = false;
        button.removeAttribute('disabled');
        button.style.cursor = 'pointer';
        button.style.opacity = '1';

        if (color) {
            button.style.background = color;
        } else {
            button.style.background = '#0a66c2';
        }
    }

    removeButton() {
        if (this.connectButton) {
            this.connectButton.remove();
            this.connectButton = null;
        }
    }

    async checkAndCreateGrowPageButton() {
        const isGrowPage = window.location.pathname.includes('/mynetwork/grow/');
        const isSearchPage = window.location.pathname.includes('/search/results/people/');

        console.log('LinkedIn Connect: Checking grow page button...', {
            pathname: window.location.pathname,
            isGrowPage,
            isSearchPage,
            buttonExists: !!this.growPageButton
        });

        if (!isGrowPage && !isSearchPage) {
            if (this.growPageButton) {
                console.log('LinkedIn Connect: Removing grow page button - wrong domain');
            }
            this.removeGrowPageButton();
            return;
        }

        if (this.growPageButton) {
            return; // Button already exists
        }

        // Check if feature is enabled
        const settings = await SettingsManager.load();
        console.log('LinkedIn Connect: Settings check', settings.linkedinAutoConnectEnabled);
        if (!settings.linkedinAutoConnectEnabled) {
            console.log('LinkedIn Connect: Feature disabled in settings');
            return;
        }

        const button = document.createElement('button');
        button.id = 'linkedin-grow-connect-btn';
        button.type = 'button';
        button.textContent = 'Connect with First 10';
        button.style.cssText = this.getConfig('styles').button;

        // Add hover effects
        this.addEventListenerTracked(button, 'mouseenter', () => {
            button.style.background = '#004182';
            button.style.transform = 'translateX(-50%) translateY(-2px)';
            button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        });

        this.addEventListenerTracked(button, 'mouseleave', () => {
            button.style.background = '#0a66c2';
            button.style.transform = 'translateX(-50%)';
            button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        });

        // Add click handler
        this.addEventListenerTracked(button, 'click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (this.isConnecting) {
                // Cancel the current operation
                this.shouldCancel = true;
                this.updateGrowPageButtonState('Connect with First 10', false);
                this.isConnecting = false;
                console.log('LinkedIn Connect: Cancelled by user');
                return;
            }

            await this.performGrowPageConnections();
        });

        // Add to page
        document.body.appendChild(button);
        this.growPageButton = button;

        const pageType = window.location.pathname.includes('/search/results/people/') ? 'search results' : 'grow page';
        console.log(`LinkedIn Connect: ${pageType} button created`);
    }

    async performGrowPageConnections() {
        this.isConnecting = true;
        this.shouldCancel = false;

        // Use appropriate button finder based on current page
        const isSearchPage = window.location.pathname.includes('/search/results/people/');
        const connectButtons = isSearchPage ? this.findSearchPageConnectButtons() : this.findGrowPageConnectButtons();

        if (connectButtons.length === 0) {
            this.updateGrowPageButtonState('No connections found', false, '#999');
            this.setTimeoutTracked(() => {
                this.updateGrowPageButtonState('Connect with First 10', false);
            }, 2000);
            this.isConnecting = false;
            return;
        }

        const buttonsToConnect = connectButtons.slice(0, 10);

        for (let i = 0; i < buttonsToConnect.length; i++) {
            // Check if user cancelled
            if (this.shouldCancel) {
                console.log('LinkedIn Connect: Operation cancelled');
                this.isConnecting = false;
                return;
            }

            const currentCount = i + 1;
            const totalCount = buttonsToConnect.length;

            this.updateGrowPageButtonState(`Connecting ${currentCount}/${totalCount}... (cancel)`, false, '#ff9800');

            try {
                buttonsToConnect[i].click();

                // Quick 0.75 second delay
                if (i < buttonsToConnect.length - 1) {
                    await new Promise(resolve => this.setTimeoutTracked(resolve, 750));
                }
            } catch (error) {
                console.error(`Error connecting to person ${currentCount}/${totalCount}:`, error);
            }
        }

        this.updateGrowPageButtonState('Completed!', false, '#4caf50');
        this.setTimeoutTracked(() => {
            this.updateGrowPageButtonState('Connect with First 10', false);
            this.isConnecting = false;
        }, 750);
    }

    updateGrowPageButtonState(text, disabled = false, color = null) {
        const button = this.safeQuerySelector('#linkedin-grow-connect-btn');
        if (!button) return;

        button.textContent = text;

        // Never actually disable the button - always keep it clickable
        button.disabled = false;
        button.removeAttribute('disabled');
        button.style.cursor = 'pointer';
        button.style.opacity = '1';

        if (color) {
            button.style.background = color;
        } else {
            button.style.background = '#0a66c2';
        }
    }

    removeGrowPageButton() {
        if (this.growPageButton) {
            console.log('LinkedIn Connect: Removing grow page button from DOM');
            this.growPageButton.remove();
            this.growPageButton = null;
        }
    }

    async updateButtonVisibility() {
        await this.checkAndCreateButton();
        await this.checkAndCreateGrowPageButton();
    }

    async handlePageUpdate() {
        if (this.isMyNetworkPage()) {
            await this.checkAndCreateButton();
            await this.checkAndCreateGrowPageButton();
        } else {
            this.removeButton();
            // Still check for grow page button on non-MyNetwork pages (like search results)
            await this.checkAndCreateGrowPageButton();
        }
    }

    onCleanup() {
        this.removeButton();
        this.removeGrowPageButton();

        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }

        if (this.growPageMutationObserver) {
            this.growPageMutationObserver.disconnect();
            this.growPageMutationObserver = null;
        }

        if (this.urlCheckInterval) {
            clearInterval(this.urlCheckInterval);
            this.urlCheckInterval = null;
        }

        SettingsManager.unsubscribe('linkedin-connect');
    }
}

window.LinkedInConnect = LinkedInConnect;