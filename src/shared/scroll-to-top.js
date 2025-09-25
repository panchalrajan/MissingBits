// Scroll to Top Module for GitHub Helper Extension
class ScrollToTop {
    constructor() {
        this.button = null;
        this.isActive = false;
    }

    /**
     * Creates and displays the scroll to top button
     * @param {string} position - Position setting ('bottom-right' or 'bottom-left')
     */
    async createButton(position = 'bottom-right') {
        if (this.button) return;

        this.button = document.createElement('button');
        this.button.className = 'github-helper-scroll-to-top';
        this.button.setAttribute('aria-label', 'Scroll to top');
        this.button.setAttribute('title', 'Scroll to top');

        this.button.innerHTML = `
            <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 3.293l4.147 4.146a.5.5 0 01-.708.708L8.5 5.207V11.5a.5.5 0 01-1 0V5.207L4.56 8.147a.5.5 0 11-.708-.708L8 3.293z"/>
            </svg>
        `;

        // Add the CSS styles
        this.addStyles(position);

        // Add scroll listener
        this.setupScrollListener();

        // Add click handler
        this.button.addEventListener('click', this.scrollToTop.bind(this));

        // Add keyboard handler
        this.button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.scrollToTop();
            }
        });

        document.body.appendChild(this.button);
    }

    /**
     * Adds CSS styles for the scroll to top button
     * @param {string} position - Position setting ('bottom-right' or 'bottom-left')
     */
    addStyles(position) {
        // Remove existing styles if they exist
        const existingStyle = document.getElementById('github-helper-scroll-to-top-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        const style = document.createElement('style');
        style.id = 'github-helper-scroll-to-top-styles';
        const positionStyle = position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;';

        style.textContent = `
            .github-helper-scroll-to-top {
                position: fixed;
                bottom: 20px;
                ${positionStyle}
                width: 40px;
                height: 40px;
                background-color: #21262d;
                border: 1px solid #30363d;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transform: translateY(10px);
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                z-index: 1000;
            }

            .github-helper-scroll-to-top.visible {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .github-helper-scroll-to-top:hover {
                background-color: #30363d;
                border-color: #484f58;
                transform: translateY(-2px);
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
            }

            .github-helper-scroll-to-top:active {
                transform: translateY(0);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
            }

            .github-helper-scroll-to-top svg {
                width: 16px;
                height: 16px;
                fill: #f0f6fc;
                pointer-events: none;
            }

            .github-helper-scroll-to-top:focus {
                outline: 2px solid #0969da;
                outline-offset: 2px;
            }

            @media (prefers-color-scheme: light) {
                .github-helper-scroll-to-top {
                    background-color: #ffffff;
                    border-color: #d0d7de;
                }

                .github-helper-scroll-to-top:hover {
                    background-color: #f6f8fa;
                    border-color: #afb8c1;
                }

                .github-helper-scroll-to-top svg {
                    fill: #656d76;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Sets up scroll listener to show/hide button
     */
    setupScrollListener() {
        let scrollTimeout;

        const handleScroll = () => {
            if (!this.button) return;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                if (scrollTop > 300) {
                    this.button.classList.add('visible');
                } else {
                    this.button.classList.remove('visible');
                }
            }, 10);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    /**
     * Scrolls to top of the page
     */
    scrollToTop() {
        const startPosition = window.pageYOffset;
        const startTime = performance.now();
        const duration = 600;

        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        const animateScroll = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easedProgress = easeOutCubic(progress);

            window.scrollTo(0, startPosition * (1 - easedProgress));

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    }

    /**
     * Removes the scroll to top button
     */
    removeButton() {
        if (this.button) {
            this.button.remove();
            this.button = null;
        }

        // Remove styles
        const existingStyle = document.getElementById('github-helper-scroll-to-top-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
    }

    /**
     * Recreates the button with new position
     * @param {string} position - New position setting
     */
    async updatePosition(position) {
        const wasVisible = this.button && this.button.classList.contains('visible');
        this.removeButton();
        await this.createButton(position);

        // Restore visibility state if it was visible before
        if (wasVisible && this.button) {
            this.button.classList.add('visible');
        }
    }

    /**
     * Toggles the scroll to top feature on/off
     */
    toggle() {
        this.isActive = !this.isActive;

        if (this.isActive) {
            // Feature is being turned on - button will be created when needed
            return true;
        } else {
            // Feature is being turned off - remove button
            this.removeButton();
            return false;
        }
    }
}

window.ScrollToTop = ScrollToTop;
