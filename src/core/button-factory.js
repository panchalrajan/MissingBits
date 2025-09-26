// Generic Button Factory for Missing Bits Extension
class ButtonFactory {
    /**
     * Create a GitHub-style button with consistent styling
     * @param {Object} config - Button configuration
     * @param {string} config.text - Button text
     * @param {string} config.variant - Button variant ('primary', 'secondary', 'danger', 'success')
     * @param {string} config.size - Button size ('small', 'medium', 'large')
     * @param {string} config.icon - SVG icon content (optional)
     * @param {Function} config.onClick - Click handler
     * @param {string} config.className - Additional CSS classes
     * @param {string} config.title - Tooltip text
     * @param {string} config.id - Button ID
     * @param {boolean} config.disabled - Whether button is disabled
     * @param {Object} config.attributes - Additional HTML attributes
     * @returns {HTMLButtonElement}
     */
    static create({
        text = '',
        variant = 'secondary',
        size = 'medium',
        icon = null,
        onClick = null,
        className = '',
        title = '',
        id = '',
        disabled = false,
        attributes = {}
    }) {
        const button = document.createElement('button');

        // Base classes for GitHub-style buttons
        const baseClasses = [
            'btn',
            `btn-${variant}`,
            `btn-${size}`,
            className
        ].filter(Boolean);

        button.className = baseClasses.join(' ');

        // Set attributes
        if (id) button.id = id;
        if (title) button.title = title;
        if (disabled) button.disabled = disabled;

        // Apply additional attributes
        Object.entries(attributes).forEach(([key, value]) => {
            button.setAttribute(key, value);
        });

        // Create button content
        let content = '';
        if (icon) {
            content += `<span class="btn-icon">${icon}</span>`;
        }
        if (text) {
            content += `<span class="btn-text">${text}</span>`;
        }

        button.innerHTML = content;

        // Add click handler
        if (onClick) {
            button.addEventListener('click', onClick);
        }

        return button;
    }

    /**
     * Create a simple icon button
     */
    static createIconButton({
        icon,
        onClick = null,
        title = '',
        variant = 'secondary',
        size = 'small',
        className = '',
        ...rest
    }) {
        return this.create({
            icon,
            onClick,
            title,
            variant,
            size,
            className: `btn-icon-only ${className}`,
            ...rest
        });
    }

    /**
     * Create a GitHub-style copy button
     */
    static createCopyButton({
        onClick = null,
        title = 'Copy to clipboard',
        className = '',
        ...rest
    }) {
        const copyIcon = `
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
            </svg>
        `;

        return this.createIconButton({
            icon: copyIcon,
            onClick,
            title,
            className: `copy-btn ${className}`,
            ...rest
        });
    }

    /**
     * Create a GitHub-style edit button
     */
    static createEditButton({
        onClick = null,
        title = 'Edit',
        className = '',
        ...rest
    }) {
        const editIcon = `
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"></path>
            </svg>
        `;

        return this.createIconButton({
            icon: editIcon,
            onClick,
            title,
            className: `edit-btn ${className}`,
            ...rest
        });
    }

    /**
     * Create a GitHub-style delete button
     */
    static createDeleteButton({
        onClick = null,
        title = 'Delete',
        className = '',
        ...rest
    }) {
        const deleteIcon = `
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.748 1.748 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path>
            </svg>
        `;

        return this.createIconButton({
            icon: deleteIcon,
            onClick,
            title,
            variant: 'danger',
            className: `delete-btn ${className}`,
            ...rest
        });
    }

    /**
     * Create a loading/spinner button
     */
    static createLoadingButton({
        text = 'Loading...',
        className = '',
        ...rest
    }) {
        const spinnerIcon = `
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="spinner">
                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" opacity="0.25"></path>
                <path d="M8 0a8 8 0 0 1 8 8 .5.5 0 0 1-1 0 7 7 0 0 0-7-7 .5.5 0 0 1 0-1Z"></path>
            </svg>
        `;

        return this.create({
            text,
            icon: spinnerIcon,
            disabled: true,
            className: `loading-btn ${className}`,
            ...rest
        });
    }

    /**
     * Create a toggle button group
     */
    static createToggleGroup({
        options = [],
        selected = null,
        onToggle = null,
        className = '',
        name = ''
    }) {
        const group = document.createElement('div');
        group.className = `btn-group toggle-group ${className}`;
        if (name) group.setAttribute('data-name', name);

        options.forEach((option, index) => {
            const button = this.create({
                text: option.text || option,
                variant: 'secondary',
                className: `toggle-option ${option.value === selected ? 'active' : ''}`,
                attributes: {
                    'data-value': option.value || option,
                    'data-index': index
                },
                onClick: (e) => {
                    // Remove active class from siblings
                    group.querySelectorAll('.toggle-option').forEach(btn => {
                        btn.classList.remove('active');
                    });

                    // Add active class to clicked button
                    e.target.classList.add('active');

                    if (onToggle) {
                        onToggle(option.value || option, index);
                    }
                }
            });

            group.appendChild(button);
        });

        return group;
    }
}

window.ButtonFactory = ButtonFactory;