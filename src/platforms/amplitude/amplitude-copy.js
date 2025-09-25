// Amplitude Copy Module for Missing Bits Extension
class AmplitudeCopy {
    constructor() {
        this.observer = null;
        this.isInitialized = false;
        this.stylesInjected = false;
    }

    /**
     * Copy JSON data from Amplitude event details
     */
    async copyJSON() {
        try {
            // Check if Raw view button exists and if it's selected
            const rawButton = document.querySelector('button[data-testid="event-details-change-view-raw"]');
            const isRawSelected = rawButton && rawButton.classList.contains('isSelected');

            if (!isRawSelected && rawButton) {
                // Switch to Raw view first
                rawButton.click();

                // Wait a moment for the view to switch, then copy
                setTimeout(() => {
                    this.performCopy();
                }, 300);
            } else {
                // Raw view is already selected or button not found, copy immediately
                this.performCopy();
            }

        } catch (error) {
            if (window.toast) {
                window.toast.error('❌ Failed to copy JSON');
            }
        }
    }

    /**
     * Perform the actual copy operation
     */
    performCopy() {
        // Target the specific pre element with event details raw view
        const rawDataElement = document.querySelector('pre[data-testid="event-details-raw-view"]');

        if (rawDataElement) {
            // Get the raw text content from the pre element
            const rawContent = rawDataElement.textContent || rawDataElement.innerText;
            const jsonString = rawContent.trim();

            // Copy to clipboard
            navigator.clipboard.writeText(jsonString).then(() => {
                if (window.toast) {
                    window.toast.success('✨ JSON copied to clipboard');
                }
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = jsonString;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                if (window.toast) {
                    window.toast.success('✨ JSON copied to clipboard');
                }
            });
        } else {
            if (window.toast) {
                window.toast.error('❌ Raw JSON data not found');
            }
        }
    }

    /**
     * Create and insert the copy button
     */
    addCopyButton() {
        // Look for the container with the search button and view toggles
        const container = document.querySelector('div[class*="no-wrap"][class*="flex"][class*="h-5"][class*="items-center"][class*="gap-1"]');

        if (!container || container.querySelector('[data-testid="amplitude-copy-button"]')) {
            return; // Container not found or button already exists
        }

        // Create the copy button with the same styling as search button
        const copyButton = document.createElement('button');
        copyButton.className = 'inline-flex cursor-pointer items-center justify-center gap-0.5 whitespace-nowrap rounded-lg border-base border-solid [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 border-transparent bg-transparent text-monochrome-plus5 hover:border-primary-minus2 hover:bg-primary-minus5 hover:text-primary-base active:border-primary-minus2 active:bg-primary-minus3 active:text-primary-base aria-expanded:border-primary-minus2 aria-expanded:bg-primary-minus3 aria-expanded:text-primary-base h-4 min-w-4 px-1 text-sm [&_svg]:size-[20px] w-4';
        copyButton.setAttribute('data-testid', 'amplitude-copy-button');
        copyButton.setAttribute('aria-label', 'Copy JSON');
        copyButton.setAttribute('title', 'Copy JSON to clipboard');

        // Create SVG icon (clipboard/copy icon)
        copyButton.innerHTML = `
            <svg aria-hidden="true" class="block shrink-0 h-[20px] w-[20px]" focusable="false" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"/>
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586l-3-3a1 1 0 00-1.414 1.414L11.586 11H15v.586z"/>
            </svg>
        `;

        // Add click handler
        copyButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.copyJSON();
        });

        // Add the button at the end of the container
        container.appendChild(copyButton);
    }

    /**
     * Start observing page changes to add copy button
     */
    observePageChanges() {
        if (this.observer) {
            this.observer.disconnect();
        }

        this.observer = new MutationObserver(() => {
            this.addCopyButton();
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also try to add button immediately
        this.addCopyButton();
    }

    /**
     * Stop observing page changes
     */
    stopObserving() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    /**
     * Remove any existing copy buttons
     */
    removeCopyButtons() {
        const existingButtons = document.querySelectorAll('[data-testid="amplitude-copy-button"]');
        existingButtons.forEach(button => button.remove());
    }

    /**
     * Inject toast CSS styles for content script
     */
    injectToastStyles() {
        if (this.stylesInjected) {
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            .toast-container {
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 10000;
                pointer-events: none;
            }
            .toast {
                background: #ffffff;
                border-radius: 8px;
                padding: 12px 16px;
                margin-bottom: 12px;
                box-shadow: 0 4px 12px rgba(9, 30, 66, 0.15);
                border-left: 4px solid;
                min-width: 280px;
                max-width: 400px;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                pointer-events: auto;
            }
            .toast-show {
                opacity: 1;
                transform: translateX(0);
            }
            .toast-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .toast-message {
                font-size: 14px;
                color: #172b4d;
                line-height: 1.4;
                font-weight: 500;
            }
            .toast-icon {
                width: 20px;
                height: 20px;
                flex-shrink: 0;
            }
            .toast-success {
                border-left-color: #00875a;
            }
            .toast-success .toast-icon {
                color: #00875a;
            }
            .toast-error {
                border-left-color: #de350b;
            }
            .toast-error .toast-icon {
                color: #de350b;
            }
            .toast-info {
                border-left-color: #0052cc;
            }
            .toast-info .toast-icon {
                color: #0052cc;
            }
            .toast-spinner {
                animation: toast-spin 1s linear infinite;
            }
            @keyframes toast-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        this.stylesInjected = true;
    }

    /**
     * Initialize the amplitude copy functionality
     */
    async initialize() {
        // Only initialize on amplitude.com domains
        if (!window.location.hostname.includes('amplitude.com')) {
            return;
        }

        if (this.isInitialized) {
            return;
        }

        // Inject toast styles for content script
        this.injectToastStyles();

        this.observePageChanges();
        this.isInitialized = true;
    }

    /**
     * Cleanup method
     */
    cleanup() {
        this.stopObserving();
        this.removeCopyButtons();
        this.isInitialized = false;
    }
}

window.AmplitudeCopy = AmplitudeCopy;
