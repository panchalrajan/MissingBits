// GitHub Corner Ribbon Notification Module
class GitHubCornerBanner extends BaseManager {
    constructor() {
        super();
        this.ribbon = null;
        this.observer = null;
        this.checkInterval = null;
        this.isGitHubPage = false;
        this.CHECK_INTERVAL_MS = 30000; // Check every 30 seconds
        this.lastScrollTop = 0;
        this.scrollThreshold = 50; // Hide after scrolling 50px
        this.currentSettings = {};
    }

    /**
     * Setup configurations - override from BaseManager
     */
    setupConfigs() {
        this.isGitHubPage = this.checkIfGitHubPage();
    }

    /**
     * Check if current page is a GitHub page
     */
    checkIfGitHubPage() {
        return window.location.hostname === 'github.com';
    }

    /**
     * Setup event listeners - override from BaseManager
     */
    setupEventListeners() {
        if (!this.isGitHubPage) return;

        // Listen for settings changes
        SettingsManager.subscribe('corner-banner', (changes) => {
            if (changes.cornerBannerEnabled) {
                this.currentSettings.cornerBannerEnabled = changes.cornerBannerEnabled.newValue;
                this.handleSettingsChange(this.currentSettings.cornerBannerEnabled);
            }
            if (changes.cornerBannerPosition) {
                this.currentSettings.cornerBannerPosition = changes.cornerBannerPosition.newValue;
                this.updateRibbonPosition();
            }
            if (changes.cornerBannerColor) {
                this.currentSettings.cornerBannerColor = changes.cornerBannerColor.newValue;
                this.updateRibbonColor();
            }
        }, { keys: ['cornerBannerEnabled', 'cornerBannerPosition', 'cornerBannerColor'] });
    }

    /**
     * Called after initialization is complete - override from BaseManager
     */
    async onInitialized() {
        if (!this.isGitHubPage) {
            return;
        }

        this.currentSettings = await SettingsManager.load();
        if (this.currentSettings.cornerBannerEnabled) {
            this.startWatching();
        }
    }

    /**
     * Handle settings change
     */
    handleSettingsChange(isEnabled) {
        if (isEnabled) {
            this.startWatching();
        } else {
            this.stopWatching();
            this.removeRibbon();
        }
    }

    /**
     * Start watching for notification elements
     */
    startWatching() {
        // Initial check
        this.checkForNotifications();

        // Setup periodic checks (every 30 seconds)
        if (!this.checkInterval) {
            this.checkInterval = this.setIntervalTracked(() => {
                this.checkForNotifications();
            }, this.CHECK_INTERVAL_MS);
        }

        // Setup mutation observer for immediate DOM changes
        if (!this.observer) {
            this.observer = new MutationObserver(() => {
                this.checkForNotifications();
            });

            this.observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-indicator-mode']
            });
        }

        // Setup scroll listener to hide ribbon on scroll
        this.handleScroll = this.handleScroll.bind(this);
        window.addEventListener('scroll', this.handleScroll, { passive: true });
    }

    /**
     * Stop watching for notification elements
     */
    stopWatching() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }

        window.removeEventListener('scroll', this.handleScroll);
    }

    /**
     * Handle scroll events to hide/show ribbon
     */
    handleScroll() {
        if (!this.ribbon) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > this.scrollThreshold) {
            this.ribbon.classList.add('hidden-on-scroll');
        } else {
            this.ribbon.classList.remove('hidden-on-scroll');
        }

        this.lastScrollTop = scrollTop;
    }

    /**
     * Check for notification elements and show/hide ribbon accordingly
     */
    checkForNotifications() {
        const notificationElement = document.querySelector('[data-indicator-mode="global"]');

        if (notificationElement && this.hasNotifications(notificationElement)) {
            this.showRibbon();
        } else {
            this.removeRibbon();
        }
    }

    /**
     * Check if the notification element actually has notifications
     */
    hasNotifications(element) {
        const hasGlobalIndicator = element.getAttribute('data-indicator-mode') === 'global';
        const hasCountBadge = element.querySelector('.mail-status.unread') !== null;
        const hasNotificationDot = element.querySelector('.notification-indicator') !== null;
        const hasTextContent = element.textContent.trim().length > 0;

        return hasGlobalIndicator && (hasCountBadge || hasNotificationDot || hasTextContent);
    }

    /**
     * Show the corner ribbon
     */
    showRibbon() {
        if (this.ribbon) {
            return; // Ribbon already exists
        }

        this.ribbon = this.createRibbon();
        document.body.appendChild(this.ribbon);

        // Animate in
        this.setTimeoutTracked(() => {
            if (this.ribbon) {
                this.ribbon.classList.add('visible');
            }
        }, 100);
    }

    /**
     * Create the ribbon element
     */
    createRibbon() {
        const ribbon = document.createElement('div');
        ribbon.className = 'github-corner-ribbon';
        ribbon.setAttribute('role', 'button');
        ribbon.setAttribute('aria-label', 'You have unread notifications');
        ribbon.setAttribute('title', 'Click to view notifications');

        // Apply position class
        const position = this.currentSettings.cornerBannerPosition || 'top-left';
        if (position === 'top-right') {
            ribbon.classList.add('position-top-right');
        }

        // Apply color class
        const color = this.currentSettings.cornerBannerColor || 'green';
        ribbon.classList.add(`color-${color}`);

        // Add ribbon text
        const text = document.createElement('span');
        text.className = 'github-corner-ribbon-text';
        text.textContent = 'New Notifications';

        ribbon.appendChild(text);

        // Add click handler to navigate to notifications
        ribbon.addEventListener('click', () => {
            window.location.href = 'https://github.com/notifications';
        });

        return ribbon;
    }

    /**
     * Update ribbon position when settings change
     */
    updateRibbonPosition() {
        if (!this.ribbon) return;

        const position = this.currentSettings.cornerBannerPosition || 'top-left';

        // Update position class
        this.ribbon.classList.remove('position-top-left', 'position-top-right');
        if (position === 'top-right') {
            this.ribbon.classList.add('position-top-right');
        }
    }

    /**
     * Update ribbon color when settings change
     */
    updateRibbonColor() {
        if (!this.ribbon) return;

        const color = this.currentSettings.cornerBannerColor || 'green';

        // Update color class
        this.ribbon.classList.remove('color-green', 'color-red', 'color-blue');
        this.ribbon.classList.add(`color-${color}`);
    }

    /**
     * Remove the ribbon from DOM
     */
    removeRibbon() {
        if (this.ribbon && this.ribbon.parentNode) {
            this.ribbon.classList.remove('visible');

            this.setTimeoutTracked(() => {
                if (this.ribbon && this.ribbon.parentNode) {
                    this.ribbon.parentNode.removeChild(this.ribbon);
                    this.ribbon = null;
                }
            }, 300);
        }
    }

    /**
     * Cleanup when manager is destroyed
     */
    destroy() {
        this.stopWatching();
        this.removeRibbon();
        super.destroy();
    }
}

// Export for use in content script
window.GitHubCornerBanner = GitHubCornerBanner;
