// Generic Filtering Utilities for Missing Bits Extension
class FilterUtils {
    /**
     * Generic function to determine if an item should be hidden based on filter patterns
     * @param {*} item - The item to evaluate (could be string, DOM element, etc.)
     * @param {Array} enabledPatterns - Array of enabled pattern objects with .name property
     * @param {Function} extractValue - Function that extracts the comparable value from the item
     * @param {Function} matchFunction - Optional custom matching logic
     * @returns {boolean} True if item should be hidden
     */
    static shouldHideItem(item, enabledPatterns, extractValue, matchFunction = null) {
        if (!enabledPatterns || !enabledPatterns.length) return false;

        const value = extractValue(item);
        if (!value) return false;

        return enabledPatterns.some(pattern => {
            const patternValue = pattern.name;

            if (matchFunction) {
                return matchFunction(value, patternValue);
            }

            // Default matching: exact match
            return value === patternValue;
        });
    }

    /**
     * File-specific filtering logic for GitHub file paths
     * @param {string} filePath - Full file path
     * @param {Array} enabledFiles - Array of enabled file pattern objects
     * @returns {boolean} True if file should be hidden
     */
    static shouldHideFile(filePath, enabledFiles) {
        return this.shouldHideItem(
            filePath,
            enabledFiles,
            (path) => path.split('/').pop(), // Extract filename from path
            (fileName, pattern) => {
                // Extension matching (.lock, .resolved, etc.)
                if (pattern.startsWith('.')) {
                    return fileName.endsWith(pattern);
                }

                // Exact file name matching (Package.swift, Podfile, etc.)
                if (pattern.includes('.')) {
                    return fileName === pattern;
                }

                // File without extension matching (Podfile, Cartfile, etc.)
                return fileName === pattern;
            }
        );
    }

    /**
     * Comment-specific filtering logic for GitHub comments
     * @param {HTMLElement} commentContainer - Comment container DOM element
     * @param {Array} enabledUsernames - Array of enabled username pattern objects
     * @returns {boolean} True if comment should be hidden
     */
    static shouldHideComment(commentContainer, enabledUsernames) {
        return this.shouldHideItem(
            commentContainer,
            enabledUsernames,
            (container) => {
                const authorLink = container.querySelector('.author');
                return authorLink ? authorLink.textContent.trim() : null;
            }
        );
    }

    /**
     * Extract enabled items from settings array
     * @param {Array} items - Array of items with .enabled property
     * @returns {Array} Array of enabled items
     */
    static getEnabledItems(items) {
        return (items || []).filter(item => item.enabled);
    }

    /**
     * String matching utilities
     */
    static StringMatchers = {
        /**
         * Exact string match
         */
        exact: (value, pattern) => value === pattern,

        /**
         * Case-insensitive exact match
         */
        exactIgnoreCase: (value, pattern) =>
            value.toLowerCase() === pattern.toLowerCase(),

        /**
         * String contains pattern
         */
        contains: (value, pattern) => value.includes(pattern),

        /**
         * Case-insensitive contains
         */
        containsIgnoreCase: (value, pattern) =>
            value.toLowerCase().includes(pattern.toLowerCase()),

        /**
         * Regular expression match
         */
        regex: (value, pattern) => {
            try {
                return new RegExp(pattern).test(value);
            } catch (error) {
                console.warn('Invalid regex pattern:', pattern);
                return false;
            }
        },

        /**
         * Wildcard pattern match (supports * and ?)
         */
        wildcard: (value, pattern) => {
            const regexPattern = pattern
                .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
                .replace(/\\\\\\*/g, '.*')              // Replace \* with .*
                .replace(/\\\\\\?/g, '.');              // Replace \? with .
            try {
                return new RegExp(`^${regexPattern}$`).test(value);
            } catch (error) {
                console.warn('Invalid wildcard pattern:', pattern);
                return false;
            }
        }
    };

    /**
     * File extension utilities
     */
    static FileUtils = {
        /**
         * Extract file extension including the dot
         */
        getExtension: (filePath) => {
            const fileName = filePath.split('/').pop();
            const lastDot = fileName.lastIndexOf('.');
            return lastDot !== -1 ? fileName.substring(lastDot) : '';
        },

        /**
         * Extract filename without path
         */
        getFileName: (filePath) => filePath.split('/').pop(),

        /**
         * Extract filename without extension
         */
        getBaseName: (filePath) => {
            const fileName = filePath.split('/').pop();
            const lastDot = fileName.lastIndexOf('.');
            return lastDot !== -1 ? fileName.substring(0, lastDot) : fileName;
        },

        /**
         * Check if path is a file (has extension)
         */
        isFile: (filePath) => {
            const fileName = filePath.split('/').pop();
            return fileName.includes('.');
        }
    };

    /**
     * DOM utilities for filtering
     */
    static DOMUtils = {
        /**
         * Apply visibility to array of elements
         */
        setElementsVisibility: (elements, visible) => {
            elements.forEach(element => {
                if (visible) {
                    element.removeAttribute('hidden');
                } else {
                    element.setAttribute('hidden', '');
                }
            });
        },

        /**
         * Toggle visibility of elements based on filter
         */
        filterElements: (elements, shouldHideCallback) => {
            elements.forEach(element => {
                const shouldHide = shouldHideCallback(element);
                if (shouldHide) {
                    element.setAttribute('hidden', '');
                } else {
                    element.removeAttribute('hidden');
                }
            });
        }
    };
}

window.FilterUtils = FilterUtils;