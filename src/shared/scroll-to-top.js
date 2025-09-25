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
        this.button.className = `github-helper-scroll-to-top ${position}`;
        this.button.setAttribute('aria-label', 'Scroll to top');
        this.button.setAttribute('title', 'Scroll to top');

        this.button.innerHTML = `
            <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 3.293l4.147 4.146a.5.5 0 01-.708.708L8.5 5.207V11.5a.5.5 0 01-1 0V5.207L4.56 8.147a.5.5 0 11-.708-.708L8 3.293z"/>
            </svg>
        `;

        // CSS styles are now loaded from external file

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

        // Styles are now loaded from external CSS file
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
