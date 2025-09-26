// Generic Modal Component for Missing Bits Extension
class Modal {
    constructor() {
        this.modalElement = null;
        this.onClose = null;
    }

    /**
     * Create a generic modal with customizable content and actions
     * @param {Object} config - Modal configuration
     * @param {string} config.title - Modal title
     * @param {string} config.content - HTML content for modal body
     * @param {Array} config.buttons - Array of button configurations
     * @param {Function} config.onShow - Callback when modal is shown
     * @param {Function} config.onClose - Callback when modal is closed
     * @param {string} config.size - Modal size ('small', 'medium', 'large')
     * @returns {HTMLElement} Modal element
     */
    create({
        title = 'Modal',
        content = '',
        buttons = [],
        onShow = null,
        onClose = null,
        size = 'medium'
    }) {
        this.onClose = onClose;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';

        const sizeClass = size === 'small' ? 'modal-dialog-sm' :
                         size === 'large' ? 'modal-dialog-lg' :
                         'modal-dialog';

        modal.innerHTML = `
            <div class="${sizeClass}">
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${this.generateButtons(buttons)}
                </div>
            </div>
        `;

        this.modalElement = modal;
        this.setupEventListeners(buttons);

        document.body.appendChild(modal);
        setTimeout(() => {
            modal.classList.add('show');
            if (onShow) onShow(modal);
        }, 100);

        return modal;
    }

    /**
     * Generate button HTML from configuration
     * @param {Array} buttons - Button configurations
     */
    generateButtons(buttons) {
        return buttons.map(btn => {
            const classList = [
                'modal-btn',
                btn.primary ? 'modal-btn-primary' : 'modal-btn-secondary',
                btn.className || ''
            ].filter(Boolean).join(' ');

            return `<button class="${classList}" data-action="${btn.action || ''}" ${btn.id ? `id="${btn.id}"` : ''}>${btn.text}</button>`;
        }).join('');
    }

    /**
     * Setup event listeners for modal buttons and interactions
     */
    setupEventListeners(buttons) {
        // Close on overlay click
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement) {
                this.close();
            }
        });

        // Button click handlers
        buttons.forEach(btn => {
            if (btn.onClick) {
                const buttonEl = this.modalElement.querySelector(`[data-action="${btn.action}"]`);
                if (buttonEl) {
                    buttonEl.addEventListener('click', btn.onClick);
                }
            }
        });

        // ESC key handler
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    /**
     * Close the modal
     */
    close() {
        if (this.modalElement) {
            this.modalElement.remove();
            this.modalElement = null;
            if (this.onClose) this.onClose();
        }
    }

    /**
     * Get form data from modal inputs
     */
    getFormData() {
        if (!this.modalElement) return {};

        const formData = {};
        const inputs = this.modalElement.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.id) {
                formData[input.id] = input.value;
            }
        });
        return formData;
    }

    /**
     * Set focus to first input in modal
     */
    focusFirstInput() {
        if (!this.modalElement) return;

        const firstInput = this.modalElement.querySelector('input, textarea, select');
        if (firstInput) {
            firstInput.focus();
            if (firstInput.type === 'text') {
                firstInput.select();
            }
        }
    }

    /**
     * Static method to create simple input modals
     */
    static createInputModal({
        title = 'Input Required',
        label = 'Value',
        placeholder = '',
        value = '',
        maxLength = 100,
        hint = '',
        onSave = () => {},
        onCancel = () => {},
        saveText = 'Save',
        isEdit = false
    }) {
        const modal = new Modal();

        const content = `
            <div class="form-group">
                <label for="modal-input">${label}</label>
                <input type="text" id="modal-input" class="form-input"
                       value="${value}" maxlength="${maxLength}" placeholder="${placeholder}">
                ${hint ? `<small class="form-hint">${hint}</small>` : ''}
            </div>
        `;

        const buttons = [
            {
                text: 'Cancel',
                action: 'cancel',
                primary: false,
                onClick: () => {
                    modal.close();
                    onCancel();
                }
            },
            {
                text: saveText,
                action: 'save',
                primary: true,
                onClick: async () => {
                    const input = modal.modalElement.querySelector('#modal-input');
                    const inputValue = input.value.trim();

                    if (inputValue) {
                        const success = await onSave(inputValue);
                        if (success !== false) {
                            modal.close();
                        }
                    } else {
                        if (window.toast) {
                            toast.error(`Please enter a valid ${label.toLowerCase()}`);
                        }
                    }
                }
            }
        ];

        modal.create({
            title,
            content,
            buttons,
            onShow: (modalEl) => {
                const input = modalEl.querySelector('#modal-input');
                input.focus();
                if (isEdit && value) {
                    input.select();
                }

                // Enter key handler
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        modalEl.querySelector('[data-action="save"]').click();
                    }
                });
            }
        });

        return modal;
    }

    /**
     * Static method to create confirmation modals
     */
    static createConfirmModal({
        title = 'Confirm Action',
        message = 'Are you sure?',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        onConfirm = () => {},
        onCancel = () => {},
        type = 'warning' // 'warning', 'danger', 'info'
    }) {
        const modal = new Modal();

        const typeIcon = {
            warning: '⚠️',
            danger: '🗑️',
            info: 'ℹ️'
        }[type] || '❓';

        const content = `
            <div class="confirm-modal-content">
                <div class="confirm-icon">${typeIcon}</div>
                <div class="confirm-message">${message}</div>
            </div>
        `;

        const buttons = [
            {
                text: cancelText,
                action: 'cancel',
                primary: false,
                onClick: () => {
                    modal.close();
                    onCancel();
                }
            },
            {
                text: confirmText,
                action: 'confirm',
                primary: true,
                className: type === 'danger' ? 'modal-btn-danger' : '',
                onClick: () => {
                    modal.close();
                    onConfirm();
                }
            }
        ];

        const modalEl = modal.create({
            title,
            content,
            buttons,
            size: 'small'
        });

        return modal;
    }
}

window.Modal = Modal;