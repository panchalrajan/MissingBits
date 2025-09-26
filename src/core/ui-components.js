// UI Components for Settings Page
class UIComponents {
    // File Item Component
    static createFileItem(item, { onToggle, onDelete, onEdit }) {
        const itemElement = document.createElement('div');
        itemElement.className = `file-item ${!item.enabled ? 'disabled' : ''}`;
        itemElement.dataset.id = item.id;

        // Determine icon based on file name/extension
        let icon = '📄';
        if (item.name.startsWith('.')) {
            icon = '🔧'; // Extension
        } else if (item.name.includes('.')) {
            icon = '📦'; // File with extension
        } else {
            icon = '📝'; // File without extension
        }

        itemElement.innerHTML = `
            <div class="item-content">
                <span class="item-icon">${icon}</span>
                <span class="item-text">${item.name}</span>
            </div>
            <div class="item-actions">
                <button class="edit-btn" data-id="${item.id}" title="Edit item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <div class="toggle-switch ${item.enabled ? 'active' : ''}" data-id="${item.id}"></div>
                <button class="delete-btn" data-id="${item.id}" title="Delete item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6V20a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6M8,6V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2V6"></path>
                    </svg>
                </button>
            </div>
        `;

        // Edit handler
        const editBtn = itemElement.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            onEdit(item.id, item.name);
        });

        // Toggle handler
        const toggleSwitch = itemElement.querySelector('.toggle-switch');
        toggleSwitch.addEventListener('click', () => {
            const newState = !item.enabled;
            item.enabled = newState;
            toggleSwitch.classList.toggle('active', newState);
            itemElement.classList.toggle('disabled', !newState);
            onToggle(item.id, newState);
        });

        // Delete handler
        const deleteBtn = itemElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async () => {
            const confirmed = await CustomConfirm.show(
                `Are you sure you want to delete "${item.name}"?<br>This action cannot be undone.`,
                'Delete Item'
            );
            if (confirmed) {
                onDelete(item.id);
            }
        });

        return itemElement;
    }

    // Add File Modal
    static createAddFileModal(onAdd, itemType = 'File', modalTitle = 'Add File or Extension', placeholder = 'Package.swift, Podfile, .xcworkspace', hint = 'Examples:<br>• Extensions: .lock, .resolved, .xcworkspace<br>• Files without extension: Podfile, Cartfile<br>• Files with extension: Package.swift, Podfile.lock', maxLength = 100) {
        const modal = Modal.createInputModal({
            title: modalTitle,
            label: itemType,
            placeholder: placeholder,
            hint: hint,
            maxLength: maxLength,
            onSave: onAdd,
            saveText: `Add ${itemType}`,
            isEdit: false
        });
        return modal.modalElement;
    }

    // Edit File Modal
    static createEditFileModal(currentName, onSave, itemType = 'File', modalTitle = 'Edit File or Extension', placeholder = 'Package.swift, Podfile, .xcworkspace', hint = 'Examples:<br>• Extensions: .lock, .resolved, .xcworkspace<br>• Files without extension: Podfile, Cartfile<br>• Files with extension: Package.swift, Podfile.lock', maxLength = 100) {
        const modal = Modal.createInputModal({
            title: modalTitle,
            label: itemType,
            placeholder: placeholder,
            value: currentName,
            hint: hint,
            maxLength: maxLength,
            onSave: onSave,
            saveText: 'Save Changes',
            isEdit: true
        });
        return modal.modalElement;
    }

    // Keyboard Shortcut Input Component
    static createShortcutInput(container, initialValue = '', onChange = () => {}) {
        const input = container.querySelector('#keyboard-shortcut');
        const clearBtn = container.querySelector('#clear-shortcut');

        let isRecording = false;

        // Set initial value
        if (initialValue) {
            input.value = initialValue;
        }

        // Focus handler
        input.addEventListener('focus', () => {
            input.placeholder = 'Press your key combination...';
            input.classList.add('recording');
            isRecording = true;
        });

        // Blur handler
        input.addEventListener('blur', () => {
            input.placeholder = 'Click to set shortcut';
            input.classList.remove('recording');
            isRecording = false;
        });

        // Keydown handler
        input.addEventListener('keydown', (e) => {
            if (!isRecording) return;
            
            e.preventDefault();
            e.stopPropagation();

            // Ignore standalone modifier keys
            if (['Control', 'Shift', 'Alt', 'Meta', 'Cmd'].includes(e.key)) {
                return;
            }

            // Only allow Ctrl+, Ctrl+Shift+, or Shift+ combinations (no Alt)
            if (e.altKey) {
                input.value = '';
                if (window.toast) {
                    toast.error('Alt key combinations are not supported. Use Ctrl+Key, Ctrl+Shift+Key, or Shift+Key instead.');
                }
                return;
            }

            // Require at least one allowed modifier (Ctrl/Cmd or Shift)
            if (!(e.ctrlKey || e.metaKey || e.shiftKey)) {
                input.value = '';
                if (window.toast) {
                    toast.error('Please use a modifier key: Ctrl+Key, Ctrl+Shift+Key, or Shift+Key');
                }
                return;
            }

            const shortcut = KeyboardShortcutManager.formatShortcut(e);

            input.value = shortcut;
            onChange(shortcut);
            
            // Blur after successful capture
            setTimeout(() => input.blur(), 100);
        });

        // Clear button handler
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                onChange('');
            });
        }

        return {
            setValue: (value) => {
                input.value = value;
            },
            getValue: () => input.value
        };
    }

    // Dropdown Item Component
    static createDropdownItem(option, index, { onEdit, onToggle, onDelete, onReorder }) {
        const item = document.createElement('div');
        item.className = `dropdown-item ${!option.enabled ? 'disabled' : ''}`;
        item.dataset.index = index;
        item.draggable = true;

        item.innerHTML = `
            <div class="item-content">
                <svg class="drag-handle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
                <span class="item-text">${option.text}</span>
            </div>
            <div class="item-actions">
                <button class="edit-btn" data-index="${index}" title="Edit template" style="background: none; border: none; color: #42526e; cursor: pointer; padding: 8px; border-radius: 3px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <div class="toggle-switch ${option.enabled ? 'active' : ''}" data-index="${index}"></div>
                <button class="delete-btn" data-index="${index}" title="Delete option">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6V20a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6M8,6V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2V6"></path>
                    </svg>
                </button>
            </div>
        `;

        // Edit handler
        const editBtn = item.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            onEdit(index);
        });

        // Toggle handler
        const toggleSwitch = item.querySelector('.toggle-switch');
        toggleSwitch.addEventListener('click', () => {
            const newState = !option.enabled;
            option.enabled = newState;
            toggleSwitch.classList.toggle('active', newState);
            item.classList.toggle('disabled', !newState);
            onToggle(index, newState);
        });

        // Delete handler
        const deleteBtn = item.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async () => {
            const confirmed = await CustomConfirm.show(
                `Are you sure you want to delete "${option.text}"?<br>This action cannot be undone.`,
                'Delete Option'
            );
            if (confirmed) {
                onDelete(index);
            }
        });

        // Drag handlers
        item.addEventListener('dragstart', (e) => {
            e.currentTarget.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', index);
        });

        item.addEventListener('dragend', (e) => {
            e.currentTarget.classList.remove('dragging');
        });

        return item;
    }

    // Drag and Drop Setup
    static setupDragAndDrop(container, onReorder) {
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const afterElement = this.getDragAfterElement(container, e.clientY);
            const draggedElement = container.querySelector('.dragging');

            // Only manipulate DOM if we have a valid dragged element
            if (draggedElement) {
                if (afterElement == null) {
                    container.appendChild(draggedElement);
                } else {
                    container.insertBefore(draggedElement, afterElement);
                }
            }
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            
            // Get new order
            const items = Array.from(container.querySelectorAll('.dropdown-item'));
            const newOrder = items.map(item => parseInt(item.dataset.index));
            onReorder(newOrder);
        });
    }

    // Helper for drag and drop
    static getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.dropdown-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Save Status Component
    static createSaveStatus(statusElement) {
        return {
            show: (message, type = '') => {
                statusElement.textContent = message;
                statusElement.className = `save-status ${type}`;
            },
            clear: () => {
                statusElement.textContent = '';
                statusElement.className = 'save-status';
            },
            success: (message) => {
                statusElement.textContent = message;
                statusElement.className = 'save-status success';
                setTimeout(() => {
                    statusElement.textContent = '';
                    statusElement.className = 'save-status';
                }, 3000);
            },
            error: (message) => {
                statusElement.textContent = message;
                statusElement.className = 'save-status error';
                setTimeout(() => {
                    statusElement.textContent = '';
                    statusElement.className = 'save-status';
                }, 5000);
            }
        };
    }
}

window.UIComponents = UIComponents;
