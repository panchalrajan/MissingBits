// LinkedIn Connect Manager - Manages LinkedIn connection requests on MyNetwork page
class LinkedInConnect extends BaseManager {
    constructor() {
        super();
        this.connectButton = null;
        this.lastOverlayState = null;
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
        if (!this.isMyNetworkPage()) return;

        SettingsManager.subscribe('linkedin-connect', (changes) => {
            if (changes.linkedinAutoConnectEnabled) {
                this.checkAndCreateButton();
            }
        }, { keys: ['linkedinAutoConnectEnabled'] });

        // Watch for overlay appearance
        this.startOverlayWatcher();
    }

    onInitialized() {
        if (this.isMyNetworkPage()) {
            this.setTimeoutTracked(() => {
                this.checkAndCreateButton();
            }, 1000);
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

            const isDisabled = button.disabled || button.hasAttribute('disabled');
            if (isDisabled) {
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
        const connectButtons = this.findConnectButtons();

        if (connectButtons.length === 0) {
            this.updateButtonState('No connections found', true, '#999');
            this.setTimeoutTracked(() => {
                this.updateButtonState('Connect with First 10', false);
            }, 2000);
            return;
        }

        const buttonsToConnect = connectButtons.slice(0, 10);

        for (let i = 0; i < buttonsToConnect.length; i++) {
            const currentCount = i + 1;
            const totalCount = buttonsToConnect.length;

            this.updateButtonState(`Connecting ${currentCount}/${totalCount}...`, true, '#ff9800');

            try {
                buttonsToConnect[i].click();

                // Quick 0.5 second delay only
                if (i < buttonsToConnect.length - 1) {
                    await new Promise(resolve => this.setTimeoutTracked(resolve, 500));
                }
            } catch (error) {
                console.error(`Error connecting to person ${currentCount}/${totalCount}:`, error);
            }
        }

        this.updateButtonState('Completed!', true, '#4caf50');
        this.setTimeoutTracked(() => {
            this.updateButtonState('Connect with First 10', false);
        }, 500);
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

    updateButtonState(text, disabled = false, color = null) {
        const button = this.safeQuerySelector('#linkedin-connect-btn');
        if (!button) return;

        button.textContent = text;

        if (disabled) {
            button.disabled = true;
            button.setAttribute('disabled', 'true');
            button.style.cursor = 'not-allowed';
            button.style.opacity = '0.7';
        } else {
            button.disabled = false;
            button.removeAttribute('disabled');
            button.style.cursor = 'pointer';
            button.style.opacity = '1';
        }

        if (color) {
            button.style.background = color;
        } else if (!disabled) {
            button.style.background = '#0a66c2';
        }
    }

    removeButton() {
        if (this.connectButton) {
            this.connectButton.remove();
            this.connectButton = null;
        }
    }

    async updateButtonVisibility() {
        await this.checkAndCreateButton();
    }

    async handlePageUpdate() {
        if (this.isMyNetworkPage()) {
            await this.checkAndCreateButton();
        } else {
            this.removeButton();
        }
    }

    onCleanup() {
        this.removeButton();

        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }

        SettingsManager.unsubscribe('linkedin-connect');
    }
}

window.LinkedInConnect = LinkedInConnect;