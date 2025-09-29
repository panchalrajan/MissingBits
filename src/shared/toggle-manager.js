// Toggle Manager Module for GitHub Helper Extension
class ToggleManager extends BaseManager {
    constructor() {
        super();
        this.toggleConfigs = new Map();
        this.radioConfigs = new Map();
    }

    /**
     * Setup configurations - override from BaseManager
     */
    setupConfigs() {
        this.setupToggleConfigs();
        this.setupRadioConfigs();
    }

    /**
     * Setup toggle switch configurations
     */
    setupToggleConfigs() {
        const configs = [
            { id: 'file-filter-enabled', inputId: 'file-filter-enabled-checkbox' },
            { id: 'expand-conversations-enabled', inputId: 'expand-all-enabled' },
            { id: 'view-resolved-enabled', inputId: 'view-resolved-enabled-checkbox' },
            { id: 'comment-filter-enabled', inputId: 'comment-filter-enabled-checkbox' },
            { id: 'scroll-to-top-enabled', inputId: 'scroll-to-top-enabled-checkbox' },
            { id: 'team-copy-enabled', inputId: 'team-copy-enabled-checkbox' }
        ];

        configs.forEach(config => {
            this.toggleConfigs.set(config.id, {
                toggleElement: DOMUtils.getElementById(config.id),
                inputElement: DOMUtils.getElementById(config.inputId),
                ...config
            });
        });
    }

    /**
     * Setup radio button configurations
     */
    setupRadioConfigs() {
        const configs = [
            { name: 'scroll-to-top-position', selector: 'input[name="scroll-to-top-position"]' }
        ];

        configs.forEach(config => {
            this.radioConfigs.set(config.name, {
                elements: document.querySelectorAll(config.selector),
                ...config
            });
        });
    }

    /**
     * Setup event listeners for toggles and radios
     */
    setupEventListeners() {
        this.setupToggleEventListeners();
        this.setupRadioEventListeners();
    }

    /**
     * Setup toggle switch event listeners
     */
    setupToggleEventListeners() {
        // Setup click handlers for toggle items (entire clickable area)
        const toggleItems = document.querySelectorAll('.toggle-item');

        toggleItems.forEach(toggleItem => {
            toggleItem.addEventListener('click', (e) => {
                e.preventDefault();
                const input = toggleItem.querySelector('.toggle-input');
                if (input && input.type === 'checkbox') {
                    input.checked = !input.checked;
                    input.dispatchEvent(new Event('change'));
                }
            });
        });

        // Setup click handlers for toggle switches
        const toggleSwitches = document.querySelectorAll('.toggle-switch');

        toggleSwitches.forEach(toggleSwitch => {
            toggleSwitch.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent double-triggering with toggle-item
                const input = toggleSwitch.querySelector('.toggle-input');
                if (input && input.type === 'checkbox') {
                    input.checked = !input.checked;
                    input.dispatchEvent(new Event('change'));
                }
            });
        });
    }

    /**
     * Setup radio button event listeners
     */
    setupRadioEventListeners() {
        // Setup click handlers for radio items
        const radioItems = document.querySelectorAll('.radio-item');

        radioItems.forEach(radioItem => {
            radioItem.addEventListener('click', (e) => {
                e.preventDefault();
                const input = radioItem.querySelector('.radio-input');
                if (input) {
                    input.checked = true;
                    input.dispatchEvent(new Event('change'));
                }
            });
        });
    }

    /**
     * Update toggle switch visual state
     * @param {string} toggleId - Toggle switch ID
     * @param {boolean} isActive - Whether toggle is active
     */
    updateToggleSwitch(toggleId, isActive) {
        const config = this.toggleConfigs.get(toggleId);
        if (config && config.toggleElement) {
            if (isActive) {
                config.toggleElement.classList.add('active');
            } else {
                config.toggleElement.classList.remove('active');
            }
        }
    }

    /**
     * Update radio buttons visual state
     * @param {string} radioName - Radio button name
     */
    updateRadioButtonsVisualState(radioName) {
        const config = this.radioConfigs.get(radioName);
        if (config && config.elements) {
            config.elements.forEach(radio => {
                const radioItem = radio.closest('.radio-item');
                if (radioItem) {
                    if (radio.checked) {
                        radioItem.classList.add('selected');
                    } else {
                        radioItem.classList.remove('selected');
                    }
                }
            });
        }
    }

    /**
     * Set toggle state
     * @param {string} toggleId - Toggle ID
     * @param {boolean} checked - Checked state
     */
    setToggleState(toggleId, checked) {
        const config = this.toggleConfigs.get(toggleId);
        if (config && config.inputElement) {
            config.inputElement.checked = checked;
            this.updateToggleSwitch(toggleId, checked);
        }
    }

    /**
     * Get toggle state
     * @param {string} toggleId - Toggle ID
     * @returns {boolean} Checked state
     */
    getToggleState(toggleId) {
        const config = this.toggleConfigs.get(toggleId);
        return config && config.inputElement ? config.inputElement.checked : false;
    }

    /**
     * Set radio value
     * @param {string} radioName - Radio name
     * @param {string} value - Value to select
     */
    setRadioValue(radioName, value) {
        const config = this.radioConfigs.get(radioName);
        if (config && config.elements) {
            config.elements.forEach(radio => {
                radio.checked = radio.value === value;
            });
            this.updateRadioButtonsVisualState(radioName);
        }
    }

    /**
     * Get radio value
     * @param {string} radioName - Radio name
     * @returns {string|null} Selected value
     */
    getRadioValue(radioName) {
        const config = this.radioConfigs.get(radioName);
        if (config && config.elements) {
            const selected = Array.from(config.elements).find(radio => radio.checked);
            return selected ? selected.value : null;
        }
        return null;
    }

    /**
     * Add toggle change listener
     * @param {string} toggleId - Toggle ID
     * @param {Function} callback - Callback function
     */
    onToggleChange(toggleId, callback) {
        const config = this.toggleConfigs.get(toggleId);
        if (config && config.inputElement) {
            config.inputElement.addEventListener('change', callback);
        }
    }

    /**
     * Add radio change listener
     * @param {string} radioName - Radio name
     * @param {Function} callback - Callback function
     */
    onRadioChange(radioName, callback) {
        const config = this.radioConfigs.get(radioName);
        if (config && config.elements) {
            config.elements.forEach(radio => {
                radio.addEventListener('change', callback);
            });
        }
    }

    /**
     * Enable/disable toggle
     * @param {string} toggleId - Toggle ID
     * @param {boolean} enabled - Whether to enable
     */
    setToggleEnabled(toggleId, enabled) {
        const config = this.toggleConfigs.get(toggleId);
        if (config && config.inputElement) {
            config.inputElement.disabled = !enabled;
            if (config.toggleElement) {
                config.toggleElement.style.opacity = enabled ? '1' : '0.5';
            }
        }
    }

    /**
     * Enable/disable radio group
     * @param {string} radioName - Radio name
     * @param {boolean} enabled - Whether to enable
     */
    setRadioEnabled(radioName, enabled) {
        const config = this.radioConfigs.get(radioName);
        if (config && config.elements) {
            config.elements.forEach(radio => {
                radio.disabled = !enabled;
                const radioItem = radio.closest('.radio-item');
                if (radioItem) {
                    radioItem.style.opacity = enabled ? '1' : '0.5';
                }
            });
        }
    }

    /**
     * Get all toggle states
     * @returns {Object} Object with toggle states
     */
    getAllToggleStates() {
        const states = {};
        this.toggleConfigs.forEach((config, toggleId) => {
            states[toggleId] = this.getToggleState(toggleId);
        });
        return states;
    }

    /**
     * Get all radio values
     * @returns {Object} Object with radio values
     */
    getAllRadioValues() {
        const values = {};
        this.radioConfigs.forEach((config, radioName) => {
            values[radioName] = this.getRadioValue(radioName);
        });
        return values;
    }
}

window.ToggleManager = ToggleManager;
