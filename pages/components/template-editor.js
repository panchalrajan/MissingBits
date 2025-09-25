// Template Editor Component
class TemplateEditor {
    constructor(settingsController) {
        this.controller = settingsController;
        this.templateEditorSetup = false;
    }

    setupEventListeners() {
        // Avoid setting up multiple times
        if (this.templateEditorSetup) return;
        this.templateEditorSetup = true;

        // Template display and edit button
        const templateDisplay = document.getElementById('template-display');
        const editTemplateBtn = document.getElementById('edit-template-btn');

        // Modal elements
        const modal = document.getElementById('template-editor-modal');
        const modalTemplateInput = document.getElementById('modal-template-input');
        const modalButtonNameDisplay = document.getElementById('modal-button-name-display');
        const editButtonNameBtn = document.getElementById('edit-button-name');
        const closeBtn = document.getElementById('close-template-editor');
        const cancelBtn = document.getElementById('cancel-template-editor');
        const saveBtn = document.getElementById('save-template');
        const clearBtn = document.getElementById('clear-template');
        const resetBtn = document.getElementById('reset-template');

        // Load initial template
        this.updateDisplay();

        // Open modal (single listener)
        if (editTemplateBtn && !editTemplateBtn.hasClickListener) {
            editTemplateBtn.hasClickListener = true;
            editTemplateBtn.addEventListener('click', () => {
                modal.classList.add('show');
                modalTemplateInput.value = this.controller.currentSettings.customTemplate || "{{hyperlink_start}}[{{ticket_id:default}}] - {{ticket_title:default}}{{hyperlink_end}}";

                // Set button name display
                const buttonName = this.controller.currentSettings.copyIssueButtonTitle || "Copy";
                modalButtonNameDisplay.textContent = buttonName;

                this.updateModalPreview(modalTemplateInput.value);
                this.setupDragAndDrop();
            });
        }

        // Close modal handlers
        const closeModal = () => {
            modal.classList.remove('show');
            // Clear editing and adding context when closing modal
            delete modal.dataset.editingDropdownIndex;
            delete modal.dataset.addingNewDropdownOption;
        };

        if (closeBtn && !closeBtn.hasClickListener) {
            closeBtn.hasClickListener = true;
            closeBtn.addEventListener('click', closeModal);
        }

        if (cancelBtn && !cancelBtn.hasClickListener) {
            cancelBtn.hasClickListener = true;
            cancelBtn.addEventListener('click', closeModal);
        }

        // Close on backdrop click (single listener)
        if (modal && !modal.hasBackdropListener) {
            modal.hasBackdropListener = true;
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        // Modal template input handler (single listener)
        if (modalTemplateInput && !modalTemplateInput.hasInputListener) {
            modalTemplateInput.hasInputListener = true;
            modalTemplateInput.addEventListener('input', (e) => {
                this.updateModalPreview(e.target.value);
            });
        }

        // Edit button name pencil icon functionality
        if (editButtonNameBtn && !editButtonNameBtn.hasClickListener) {
            editButtonNameBtn.hasClickListener = true;
            editButtonNameBtn.addEventListener('click', () => {
                // Store original text for escape functionality
                const originalText = modalButtonNameDisplay.textContent;

                // Enable contenteditable
                modalButtonNameDisplay.contentEditable = true;
                modalButtonNameDisplay.focus();

                // Position cursor at the end of text
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(modalButtonNameDisplay);
                range.collapse(false); // Collapse to end
                selection.removeAllRanges();
                selection.addRange(range);

                // Add visual indicator that it's editable
                modalButtonNameDisplay.style.outline = '1px dashed #0052cc';
                modalButtonNameDisplay.style.backgroundColor = 'rgba(0, 82, 204, 0.05)';
                modalButtonNameDisplay.style.borderRadius = '4px';
                modalButtonNameDisplay.style.padding = '4px 8px';

                // Hide edit icon during editing
                editButtonNameBtn.style.display = 'none';

                const finishEditing = (save = true) => {
                    modalButtonNameDisplay.contentEditable = false;
                    modalButtonNameDisplay.style.outline = 'none';
                    modalButtonNameDisplay.style.backgroundColor = 'transparent';
                    modalButtonNameDisplay.style.borderRadius = '';
                    modalButtonNameDisplay.style.padding = '';

                    // Show edit icon again
                    editButtonNameBtn.style.display = 'flex';

                    if (save) {
                        const newName = modalButtonNameDisplay.textContent.trim() || 'Copy';
                        modalButtonNameDisplay.textContent = newName;

                    } else {
                        modalButtonNameDisplay.textContent = originalText;
                    }
                };

                // Handle blur and keyboard events
                const handleBlur = () => finishEditing(true);
                const handleKeydown = (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        finishEditing(true);
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        finishEditing(false);
                    }
                };

                // Handle input to enforce character limit
                const handleInput = (e) => {
                    const maxLength = 20; // Character limit for button title
                    const currentText = modalButtonNameDisplay.textContent;

                    if (currentText.length > maxLength) {
                        // Truncate text to max length
                        const truncatedText = currentText.substring(0, maxLength);
                        modalButtonNameDisplay.textContent = truncatedText;

                        // Move cursor to end
                        const range = document.createRange();
                        const selection = window.getSelection();
                        range.selectNodeContents(modalButtonNameDisplay);
                        range.collapse(false);
                        selection.removeAllRanges();
                        selection.addRange(range);

                        // Show warning
                        if (window.toast) {
                            toast.warning(`Button name limited to ${maxLength} characters`);
                        }
                    }
                };

                modalButtonNameDisplay.addEventListener('blur', handleBlur, { once: true });
                modalButtonNameDisplay.addEventListener('keydown', handleKeydown);
                modalButtonNameDisplay.addEventListener('input', handleInput);
            });
        }


        // Save template (single listener)
        if (saveBtn && !saveBtn.hasClickListener) {
            saveBtn.hasClickListener = true;
            saveBtn.addEventListener('click', () => {
                // Check if we're editing a dropdown option
                const editingDropdownIndex = modal.dataset.editingDropdownIndex;
                const addingNewDropdownOption = modal.dataset.addingNewDropdownOption;

                if (editingDropdownIndex !== undefined) {
                    // Save dropdown option
                    const index = parseInt(editingDropdownIndex);
                    const option = this.controller.currentSettings.dropdownOptions[index];
                    if (option) {
                        const newText = modalButtonNameDisplay.textContent.trim() || 'Option';

                        // Validate for duplicates (excluding current option)
                        const isDuplicate = this.controller.currentSettings.dropdownOptions.some((opt, idx) =>
                            idx !== index && opt.text.toLowerCase() === newText.toLowerCase()
                        );

                        if (isDuplicate) {
                            toast.error(`A dropdown option named "${newText}" already exists. Please choose a different name.`);
                            return;
                        }

                        option.template = modalTemplateInput.value;
                        option.text = newText;

                        // Re-render dropdown list
                        this.controller.renderDropdownOptions();

                        this.controller.autoSave();
                        closeModal();
                        toast.success('Dropdown option updated successfully');

                        // Clear editing context
                        delete modal.dataset.editingDropdownIndex;
                    }
                } else if (addingNewDropdownOption) {
                    // Add new dropdown option
                    const newText = modalButtonNameDisplay.textContent.trim() || 'New Option';
                    const newTemplate = modalTemplateInput.value.trim() || '{{ticket_id}}';

                    // Validate for duplicates
                    const isDuplicate = this.controller.currentSettings.dropdownOptions.some(opt =>
                        opt.text.toLowerCase() === newText.toLowerCase()
                    );

                    if (isDuplicate) {
                        toast.error(`A dropdown option named "${newText}" already exists. Please choose a different name.`);
                        return;
                    }

                    // Create new dropdown option
                    const newOption = {
                        id: `custom-${Date.now()}`,
                        text: newText,
                        enabled: true,
                        template: newTemplate
                    };

                    // Add to dropdown options array
                    if (!this.controller.currentSettings.dropdownOptions) {
                        this.controller.currentSettings.dropdownOptions = [];
                    }
                    this.controller.currentSettings.dropdownOptions.push(newOption);

                    // Re-render dropdown list
                    this.controller.renderDropdownOptions();

                    this.controller.autoSave();
                    closeModal();
                    toast.success('New dropdown option added successfully');

                    // Clear adding context
                    delete modal.dataset.addingNewDropdownOption;
                } else {
                    // Save main template and button name
                    this.controller.currentSettings.customTemplate = modalTemplateInput.value;
                    this.controller.currentSettings.copyIssueButtonTitle = modalButtonNameDisplay.textContent.trim() || 'Copy';

                    this.updateDisplay();
                    this.updateTemplatePreview(modalTemplateInput.value);


                    this.controller.autoSave();
                    closeModal();
                    toast.success('Template and button name saved successfully');
                }
            });
        }

        // Clear template (single listener)
        if (clearBtn && !clearBtn.hasClickListener) {
            clearBtn.hasClickListener = true;
            clearBtn.addEventListener('click', () => {
                modalTemplateInput.value = '';
                this.updateModalPreview('');
            });
        }

        // Reset to default (single listener)
        if (resetBtn && !resetBtn.hasClickListener) {
            resetBtn.hasClickListener = true;
            resetBtn.addEventListener('click', () => {
                const defaultTemplate = "{{hyperlink_start}}[{{ticket_id:default}}] - {{ticket_title:default}}{{hyperlink_end}}";
                modalTemplateInput.value = defaultTemplate;
                modalButtonNameDisplay.textContent = "Copy";
                this.updateModalPreview(defaultTemplate);
            });
        }
    }

    setupDragAndDrop() {
        const draggableElements = document.querySelectorAll('.draggable-element');
        const templateInput = document.getElementById('modal-template-input');

        // Remove existing listeners to prevent duplicates
        draggableElements.forEach(element => {
            if (element.hasEventListeners) return;
            element.hasEventListeners = true;

            // Make elements draggable
            element.draggable = true;

            // Click to show format options or insert
            element.addEventListener('click', () => {
                const template = element.dataset.template;
                const variableName = template.replace(/[{}]/g, '');

                // Check if this variable has format options
                if (TemplateFormatter.hasFormatOptions(variableName)) {
                    this.showFormatOptions(variableName, templateInput);
                } else {
                    // Direct insert for variables without formats (like links)
                    this.insertTemplateAtCursor(templateInput, template);
                }
            });

            // Drag start
            element.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', element.dataset.template);
                element.style.opacity = '0.5';
            });

            // Drag end
            element.addEventListener('dragend', (e) => {
                element.style.opacity = '1';
            });
        });

        // Setup drop zone
        if (templateInput && !templateInput.hasDropListeners) {
            templateInput.hasDropListeners = true;

            templateInput.addEventListener('dragover', (e) => {
                e.preventDefault();
                templateInput.style.borderColor = '#0052cc';
                templateInput.style.backgroundColor = '#f4f5f7';
            });

            templateInput.addEventListener('dragleave', (e) => {
                templateInput.style.borderColor = '#dfe1e6';
                templateInput.style.backgroundColor = '#ffffff';
            });

            templateInput.addEventListener('drop', (e) => {
                e.preventDefault();
                const template = e.dataTransfer.getData('text/plain');
                this.insertTemplateAtCursor(templateInput, template);

                templateInput.style.borderColor = '#dfe1e6';
                templateInput.style.backgroundColor = '#ffffff';
            });
        }
    }

    insertTemplateAtCursor(input, template) {
        const cursorPos = input.selectionStart;
        const textBefore = input.value.substring(0, cursorPos);
        const textAfter = input.value.substring(input.selectionEnd);

        input.value = textBefore + template + textAfter;
        input.setSelectionRange(cursorPos + template.length, cursorPos + template.length);
        input.focus();

        this.updateModalPreview(input.value);
    }

    updateDisplay() {
        // Update the main page preview
        this.updateTemplatePreview(this.controller.currentSettings.customTemplate || "{{hyperlink_start}}[{{ticket_id:default}}] - {{ticket_title:default}}{{hyperlink_end}}");
    }

    updateTemplatePreview(template) {
        const plainPreview = TemplateRenderer.render(template);
        const htmlPreview = TemplateRenderer.renderAsHtml(template);
        const markdownPreview = TemplateRenderer.renderAsMarkdown(template);

        // Update plain text preview
        const plainElement = document.getElementById('plain-preview-text');
        if (plainElement) {
            plainElement.textContent = plainPreview;
        }

        // Show/hide and update HTML preview
        const htmlContainer = document.getElementById('html-preview');
        const htmlElement = document.getElementById('html-preview-text');
        if (TemplateRenderer.hasHtmlElements(template)) {
            if (htmlContainer) htmlContainer.style.display = 'block';
            if (htmlElement) {
                // For HTML preview, show the rendered HTML
                htmlElement.innerHTML = htmlPreview;
                htmlElement.style.fontFamily = 'inherit'; // Use normal font for rendered HTML
            }
        } else {
            if (htmlContainer) htmlContainer.style.display = 'none';
        }

        // Show/hide and update Markdown preview
        const markdownContainer = document.getElementById('markdown-preview');
        const markdownElement = document.getElementById('markdown-preview-text');
        if (TemplateRenderer.hasMarkdownElements(template)) {
            if (markdownContainer) markdownContainer.style.display = 'block';
            if (markdownElement) {
                // For Markdown preview, convert to HTML and render
                const markdownHtml = TemplateRenderer.convertMarkdownToHtml(markdownPreview);
                markdownElement.innerHTML = markdownHtml;
                markdownElement.style.fontFamily = 'inherit'; // Use normal font for rendered markdown
            }
        } else {
            if (markdownContainer) markdownContainer.style.display = 'none';
        }
    }

    updateModalPreview(template) {
        const plainPreview = TemplateRenderer.render(template);
        const htmlPreview = TemplateRenderer.renderAsHtml(template);
        const markdownPreview = TemplateRenderer.renderAsMarkdown(template);

        // Update plain text preview
        const plainElement = document.getElementById('modal-plain-preview-text');
        if (plainElement) {
            plainElement.textContent = plainPreview;
        }

        // Show/hide and update HTML preview
        const htmlContainer = document.getElementById('modal-html-preview');
        const htmlElement = document.getElementById('modal-html-preview-text');
        if (TemplateRenderer.hasHtmlElements(template)) {
            if (htmlContainer) htmlContainer.style.display = 'block';
            if (htmlElement) {
                // For HTML preview, show the rendered HTML
                htmlElement.innerHTML = htmlPreview;
                htmlElement.style.fontFamily = 'inherit'; // Use normal font for rendered HTML
            }
        } else {
            if (htmlContainer) htmlContainer.style.display = 'none';
        }

        // Show/hide and update Markdown preview
        const markdownContainer = document.getElementById('modal-markdown-preview');
        const markdownElement = document.getElementById('modal-markdown-preview-text');
        if (TemplateRenderer.hasMarkdownElements(template)) {
            if (markdownContainer) markdownContainer.style.display = 'block';
            if (markdownElement) {
                // For Markdown preview, convert to HTML and render
                const markdownHtml = TemplateRenderer.convertMarkdownToHtml(markdownPreview);
                markdownElement.innerHTML = markdownHtml;
                markdownElement.style.fontFamily = 'inherit'; // Use normal font for rendered markdown
            }
        } else {
            if (markdownContainer) markdownContainer.style.display = 'none';
        }
    }

    showFormatOptions(variableName, templateInput) {
        const formatOptions = document.getElementById('format-options');
        const selectedElement = document.getElementById('selected-element');
        const formatButtons = document.getElementById('format-buttons');

        // Show the format options panel
        formatOptions.style.display = 'block';
        selectedElement.textContent = `{{${variableName}}}`;

        // Clear existing buttons
        formatButtons.innerHTML = '';

        // Get format options for this variable
        const formats = TemplateFormatter.getFormatOptionsFor(variableName);

        // Create format buttons
        formats.forEach(format => {
            const button = document.createElement('button');
            button.className = 'format-btn';
            button.textContent = format.label;
            button.title = format.example;

            button.addEventListener('click', () => {
                const formattedVariable = `{{${variableName}:${format.key}}}`;
                this.insertTemplateAtCursor(templateInput, formattedVariable);
                // Hide format options after selection
                formatOptions.style.display = 'none';
            });

            formatButtons.appendChild(button);
        });
    }
}