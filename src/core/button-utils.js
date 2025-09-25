// Button Utilities for GitHub Helper Extension
class ButtonUtils {
    /**
     * Creates a standardized GitHub-style button
     * @param {Object} config - Button configuration
     * @param {string} config.id - Button ID
     * @param {string} config.label - Button text
     * @param {string} config.iconSvg - SVG icon HTML
     * @param {Function} config.onClick - Click handler
     * @param {string} config.marginTop - CSS margin-top value
     * @returns {HTMLElement} Button element
     */
    static createButton(config) {
        const {
            id,
            label,
            iconSvg,
            onClick,
            marginTop = '0'
        } = config;

        const button = document.createElement('button');
        button.id = id;
        button.type = 'button';
        button.className = 'Button--secondary Button--small Button Button--fullWidth';
        button.setAttribute('data-view-component', 'true');
        button.style.marginTop = marginTop;

        const buttonContent = document.createElement('span');
        buttonContent.className = 'Button-content';

        const iconSpan = document.createElement('span');
        iconSpan.className = 'Button-visual Button-leadingVisual';
        iconSpan.innerHTML = iconSvg;

        const labelSpan = document.createElement('span');
        labelSpan.className = 'Button-label';
        labelSpan.textContent = label;

        buttonContent.appendChild(iconSpan);
        buttonContent.appendChild(labelSpan);
        button.appendChild(buttonContent);

        if (onClick) {
            button.addEventListener('click', onClick);
        }

        return button;
    }

    /**
     * Updates button text with automatic reset
     * @param {HTMLElement} button - Button element
     * @param {string} newText - New button text
     * @param {string} originalText - Text to revert to
     * @param {number} resetDelay - Delay before reverting (ms)
     */
    static updateButtonText(button, newText, originalText, resetDelay = 2000) {
        const buttonLabel = button.querySelector('.Button-label');
        if (buttonLabel) {
            buttonLabel.textContent = newText;
            setTimeout(() => {
                buttonLabel.textContent = originalText;
            }, resetDelay);
        }
    }

    /**
     * Enables/disables button with text update
     * @param {HTMLElement} button - Button element
     * @param {boolean} enabled - Whether button should be enabled
     */
    static setButtonEnabled(button, enabled) {
        button.disabled = !enabled;
    }

    /**
     * Gets current button label text
     * @param {HTMLElement} button - Button element
     * @returns {string} Button label text
     */
    static getButtonText(button) {
        const buttonLabel = button.querySelector('.Button-label');
        return buttonLabel ? buttonLabel.textContent : '';
    }

    /**
     * Sets button label text
     * @param {HTMLElement} button - Button element
     * @param {string} text - New text
     */
    static setButtonText(button, text) {
        const buttonLabel = button.querySelector('.Button-label');
        if (buttonLabel) {
            buttonLabel.textContent = text;
        }
    }
}

window.ButtonUtils = ButtonUtils;
