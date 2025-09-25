// DOM Utilities Module for GitHub Helper Extension
class DOMUtils {
    /**
     * Gets element by ID with optional validation
     * @param {string} id - Element ID
     * @param {boolean} required - Whether element is required (logs warning if not found)
     * @returns {HTMLElement|null}
     */
    static getElementById(id, required = false) {
        const element = document.getElementById(id);
        if (!element && required) {
            console.warn(`Required element not found: ${id}`);
        }
        return element;
    }

    /**
     * Gets multiple elements by their IDs
     * @param {string[]} ids - Array of element IDs
     * @returns {Object} Object with id as key and element as value
     */
    static getElementsByIds(ids) {
        const elements = {};
        ids.forEach(id => {
            elements[id] = this.getElementById(id);
        });
        return elements;
    }

    /**
     * Sets element value if element exists
     * @param {string} id - Element ID
     * @param {string} value - Value to set
     */
    static setValue(id, value) {
        const element = this.getElementById(id);
        if (element) {
            element.value = value;
        }
    }

    /**
     * Gets element value if element exists
     * @param {string} id - Element ID
     * @param {string} defaultValue - Default value if element not found
     * @returns {string}
     */
    static getValue(id, defaultValue = '') {
        const element = this.getElementById(id);
        return element ? element.value : defaultValue;
    }

    /**
     * Sets element checked state if element exists
     * @param {string} id - Element ID
     * @param {boolean} checked - Checked state
     */
    static setChecked(id, checked) {
        const element = this.getElementById(id);
        if (element) {
            element.checked = checked;
        }
    }

    /**
     * Gets element checked state if element exists
     * @param {string} id - Element ID
     * @param {boolean} defaultValue - Default value if element not found
     * @returns {boolean}
     */
    static getChecked(id, defaultValue = false) {
        const element = this.getElementById(id);
        return element ? element.checked : defaultValue;
    }

    /**
     * Adds event listener to element if it exists
     * @param {string} id - Element ID
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    static addEventListener(id, event, handler, options = {}) {
        const element = this.getElementById(id);
        if (element) {
            element.addEventListener(event, handler, options);
        }
    }

    /**
     * Adds event listeners to multiple elements
     * @param {Object[]} listeners - Array of listener configs
     */
    static addEventListeners(listeners) {
        listeners.forEach(({ id, event, handler, options }) => {
            this.addEventListener(id, event, handler, options);
        });
    }

    /**
     * Toggles class on element
     * @param {string} id - Element ID
     * @param {string} className - Class name to toggle
     * @param {boolean} force - Force add/remove
     */
    static toggleClass(id, className, force = undefined) {
        const element = this.getElementById(id);
        if (element) {
            if (force !== undefined) {
                element.classList.toggle(className, force);
            } else {
                element.classList.toggle(className);
            }
        }
    }

    /**
     * Adds class to element
     * @param {string} id - Element ID
     * @param {string} className - Class name to add
     */
    static addClass(id, className) {
        const element = this.getElementById(id);
        if (element) {
            element.classList.add(className);
        }
    }

    /**
     * Removes class from element
     * @param {string} id - Element ID
     * @param {string} className - Class name to remove
     */
    static removeClass(id, className) {
        const element = this.getElementById(id);
        if (element) {
            element.classList.remove(className);
        }
    }

    /**
     * Sets multiple radio button states
     * @param {string} name - Radio button name
     * @param {string} value - Value to select
     */
    static setRadioValue(name, value) {
        const radios = document.querySelectorAll(`input[name="${name}"]`);
        radios.forEach(radio => {
            radio.checked = radio.value === value;
        });
    }

    /**
     * Gets selected radio button value
     * @param {string} name - Radio button name
     * @param {string} defaultValue - Default value if none selected
     * @returns {string}
     */
    static getRadioValue(name, defaultValue = '') {
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        return selected ? selected.value : defaultValue;
    }

    /**
     * Creates element with attributes and content
     * @param {string} tag - Element tag
     * @param {Object} attributes - Element attributes
     * @param {string|HTMLElement} content - Element content
     * @returns {HTMLElement}
     */
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);

        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });

        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            element.appendChild(content);
        }

        return element;
    }

    /**
     * Shows/hides element
     * @param {string} id - Element ID
     * @param {boolean} show - Whether to show or hide
     */
    static toggleVisibility(id, show) {
        const element = this.getElementById(id);
        if (element) {
            element.style.display = show ? '' : 'none';
        }
    }

    /**
     * Removes all child elements
     * @param {string} id - Element ID
     */
    static clearChildren(id) {
        const element = this.getElementById(id);
        if (element) {
            element.innerHTML = '';
        }
    }

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Delay in milliseconds
     * @returns {Function}
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in milliseconds
     * @returns {Function}
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

window.DOMUtils = DOMUtils;
