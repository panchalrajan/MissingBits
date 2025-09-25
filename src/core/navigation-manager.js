// Navigation Manager Module for Missing Bits Extension
class NavigationManager {
    constructor() {
        this.currentSection = 'file-filter';
        this.sections = new Map();
    }

    /**
     * Initialize navigation
     */
    initialize() {
        this.setupSections();
        this.setupEventListeners();
        this.setActiveSection(this.currentSection);
    }

    /**
     * Setup section mappings
     */
    setupSections() {
        const sectionConfigs = [
            { name: 'file-filter', navSelector: '[data-section="file-filter"]', contentSelector: '#file-filter-section' },
            { name: 'expand-conversations', navSelector: '[data-section="expand-conversations"]', contentSelector: '#expand-conversations-section' },
            { name: 'view-resolved', navSelector: '[data-section="view-resolved"]', contentSelector: '#view-resolved-section' },
            { name: 'comment-filter', navSelector: '[data-section="comment-filter"]', contentSelector: '#comment-filter-section' },
            { name: 'scroll-to-top', navSelector: '[data-section="scroll-to-top"]', contentSelector: '#scroll-to-top-section' },
            { name: 'jira-placeholder', navSelector: '[data-section="jira-placeholder"]', contentSelector: '#jira-placeholder-section' },
            { name: 'amplitude-placeholder', navSelector: '[data-section="amplitude-placeholder"]', contentSelector: '#amplitude-placeholder-section' }
        ];

        sectionConfigs.forEach(config => {
            this.sections.set(config.name, {
                navElement: document.querySelector(config.navSelector),
                contentElement: document.querySelector(config.contentSelector)
            });
        });
    }

    /**
     * Setup navigation event listeners
     */
    setupEventListeners() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                // Check if item is disabled
                if (item.classList.contains('disabled')) {
                    return;
                }

                const sectionName = item.getAttribute('data-section');
                if (sectionName) {
                    this.switchToSection(sectionName);
                }
            });
        });
    }

    /**
     * Switch to a specific section
     * @param {string} sectionName - Section name to switch to
     */
    switchToSection(sectionName) {
        if (!this.sections.has(sectionName)) {
            console.warn(`Section not found: ${sectionName}`);
            return;
        }

        // Update current section
        this.currentSection = sectionName;

        // Update navigation state
        this.updateNavigationState(sectionName);

        // Update content state
        this.updateContentState(sectionName);

        // Trigger section change event
        this.triggerSectionChangeEvent(sectionName);
    }

    /**
     * Update navigation visual state
     * @param {string} activeSectionName - Active section name
     */
    updateNavigationState(activeSectionName) {
        this.sections.forEach((section, sectionName) => {
            if (section.navElement) {
                if (sectionName === activeSectionName) {
                    section.navElement.classList.add('active');
                } else {
                    section.navElement.classList.remove('active');
                }
            }
        });
    }

    /**
     * Update content visibility
     * @param {string} activeSectionName - Active section name
     */
    updateContentState(activeSectionName) {
        this.sections.forEach((section, sectionName) => {
            if (section.contentElement) {
                if (sectionName === activeSectionName) {
                    section.contentElement.classList.add('active');
                } else {
                    section.contentElement.classList.remove('active');
                }
            }
        });
    }

    /**
     * Set active section without triggering events
     * @param {string} sectionName - Section name
     */
    setActiveSection(sectionName) {
        if (this.sections.has(sectionName)) {
            this.currentSection = sectionName;
            this.updateNavigationState(sectionName);
            this.updateContentState(sectionName);
        }
    }

    /**
     * Get current active section
     * @returns {string} Current section name
     */
    getCurrentSection() {
        return this.currentSection;
    }

    /**
     * Check if section exists
     * @param {string} sectionName - Section name to check
     * @returns {boolean}
     */
    hasSection(sectionName) {
        return this.sections.has(sectionName);
    }

    /**
     * Add new section dynamically
     * @param {string} sectionName - Section name
     * @param {string} navSelector - Navigation element selector
     * @param {string} contentSelector - Content element selector
     */
    addSection(sectionName, navSelector, contentSelector) {
        this.sections.set(sectionName, {
            navElement: document.querySelector(navSelector),
            contentElement: document.querySelector(contentSelector)
        });
    }

    /**
     * Remove section
     * @param {string} sectionName - Section name to remove
     */
    removeSection(sectionName) {
        this.sections.delete(sectionName);
    }

    /**
     * Trigger section change event
     * @param {string} sectionName - Section name
     */
    triggerSectionChangeEvent(sectionName) {
        const event = new CustomEvent('sectionChange', {
            detail: {
                sectionName,
                previousSection: this.previousSection
            }
        });

        this.previousSection = sectionName;
        document.dispatchEvent(event);
    }

    /**
     * Add event listener for section changes
     * @param {Function} callback - Callback function
     */
    onSectionChange(callback) {
        document.addEventListener('sectionChange', callback);
    }

    /**
     * Remove event listener for section changes
     * @param {Function} callback - Callback function
     */
    offSectionChange(callback) {
        document.removeEventListener('sectionChange', callback);
    }

    /**
     * Get all section names
     * @returns {string[]} Array of section names
     */
    getAllSections() {
        return Array.from(this.sections.keys());
    }

    /**
     * Navigate to next section
     */
    navigateNext() {
        const sections = this.getAllSections();
        const currentIndex = sections.indexOf(this.currentSection);
        const nextIndex = (currentIndex + 1) % sections.length;
        this.switchToSection(sections[nextIndex]);
    }

    /**
     * Navigate to previous section
     */
    navigatePrevious() {
        const sections = this.getAllSections();
        const currentIndex = sections.indexOf(this.currentSection);
        const prevIndex = currentIndex === 0 ? sections.length - 1 : currentIndex - 1;
        this.switchToSection(sections[prevIndex]);
    }
}

window.NavigationManager = NavigationManager;
