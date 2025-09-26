// Base Manager Class for Missing Bits Extension
// Provides common lifecycle methods and utilities for manager classes
class BaseManager {
    constructor() {
        this.isInitialized = false;
        this.eventListeners = new Map(); // Track event listeners for cleanup
        this.configs = new Map();        // Store configuration mappings
        this.timers = new Set();         // Track timers for cleanup
    }

    /**
     * Initialize the manager - should be overridden by subclasses
     */
    initialize() {
        if (this.isInitialized) {
            console.warn(`${this.constructor.name} is already initialized`);
            return;
        }

        this.setupConfigs();
        this.setupEventListeners();
        this.isInitialized = true;

        this.onInitialized();
    }

    /**
     * Setup configurations - to be overridden by subclasses
     */
    setupConfigs() {
        // Override in subclasses
    }

    /**
     * Setup event listeners - to be overridden by subclasses
     */
    setupEventListeners() {
        // Override in subclasses
    }

    /**
     * Called after initialization is complete
     */
    onInitialized() {
        // Override in subclasses if needed
    }

    /**
     * Cleanup method to remove event listeners and timers
     */
    cleanup() {
        // Remove all tracked event listeners
        this.eventListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.eventListeners.clear();

        // Clear all tracked timers
        this.timers.forEach(timerId => {
            clearTimeout(timerId);
            clearInterval(timerId);
        });
        this.timers.clear();

        this.isInitialized = false;
        this.onCleanup();
    }

    /**
     * Called after cleanup is complete
     */
    onCleanup() {
        // Override in subclasses if needed
    }

    /**
     * Add event listener with automatic tracking for cleanup
     * @param {Element} element - DOM element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event listener options
     */
    addEventListenerTracked(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);

        // Store reference for cleanup
        const listenerKey = `${element.constructor.name}-${event}-${Date.now()}`;
        this.eventListeners.set(listenerKey, {
            element,
            event,
            handler,
            options
        });

        return listenerKey;
    }

    /**
     * Remove specific tracked event listener
     * @param {string} listenerKey - Key returned by addEventListenerTracked
     */
    removeEventListenerTracked(listenerKey) {
        const listener = this.eventListeners.get(listenerKey);
        if (listener) {
            listener.element.removeEventListener(
                listener.event,
                listener.handler,
                listener.options
            );
            this.eventListeners.delete(listenerKey);
        }
    }

    /**
     * Create tracked timeout
     * @param {Function} callback - Callback function
     * @param {number} delay - Delay in milliseconds
     * @returns {number} Timer ID
     */
    setTimeoutTracked(callback, delay) {
        const timerId = setTimeout(() => {
            callback();
            this.timers.delete(timerId); // Remove from tracking after execution
        }, delay);

        this.timers.add(timerId);
        return timerId;
    }

    /**
     * Create tracked interval
     * @param {Function} callback - Callback function
     * @param {number} interval - Interval in milliseconds
     * @returns {number} Timer ID
     */
    setIntervalTracked(callback, interval) {
        const timerId = setInterval(callback, interval);
        this.timers.add(timerId);
        return timerId;
    }

    /**
     * Clear tracked timer
     * @param {number} timerId - Timer ID to clear
     */
    clearTimerTracked(timerId) {
        clearTimeout(timerId);
        clearInterval(timerId);
        this.timers.delete(timerId);
    }

    /**
     * Store configuration with validation
     * @param {string} key - Configuration key
     * @param {Object} config - Configuration object
     * @param {Object} requiredFields - Required fields for validation
     */
    setConfig(key, config, requiredFields = []) {
        // Validate required fields
        const missingFields = requiredFields.filter(field => !config.hasOwnProperty(field));
        if (missingFields.length > 0) {
            throw new Error(`${this.constructor.name}: Missing required config fields: ${missingFields.join(', ')}`);
        }

        this.configs.set(key, config);
    }

    /**
     * Get configuration by key
     * @param {string} key - Configuration key
     * @returns {Object|null} Configuration object or null if not found
     */
    getConfig(key) {
        return this.configs.get(key) || null;
    }

    /**
     * Get all configurations
     * @returns {Map} All configurations
     */
    getAllConfigs() {
        return new Map(this.configs);
    }

    /**
     * Utility method to debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = this.setTimeoutTracked(() => func.apply(this, args), wait);
        };
    }

    /**
     * Utility method to throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                this.setTimeoutTracked(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Utility method for safe DOM element selection
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (default: document)
     * @returns {Element|null} Selected element or null
     */
    safeQuerySelector(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            console.warn(`${this.constructor.name}: Invalid selector "${selector}":`, error);
            return null;
        }
    }

    /**
     * Utility method for safe DOM element selection (all)
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (default: document)
     * @returns {NodeList} Selected elements
     */
    safeQuerySelectorAll(selector, parent = document) {
        try {
            return parent.querySelectorAll(selector);
        } catch (error) {
            console.warn(`${this.constructor.name}: Invalid selector "${selector}":`, error);
            return [];
        }
    }

    /**
     * Check if manager is properly initialized
     * @returns {boolean} True if initialized
     */
    checkInitialization() {
        if (!this.isInitialized) {
            console.warn(`${this.constructor.name}: Manager not initialized. Call initialize() first.`);
            return false;
        }
        return true;
    }

    /**
     * Get manager status information
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            className: this.constructor.name,
            isInitialized: this.isInitialized,
            eventListenersCount: this.eventListeners.size,
            configsCount: this.configs.size,
            timersCount: this.timers.size
        };
    }
}

window.BaseManager = BaseManager;