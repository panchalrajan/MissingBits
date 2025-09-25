// Simple Custom Confirm Dialog
class CustomConfirm {
    static show(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'confirm-overlay';

            // Create dialog
            const dialog = document.createElement('div');
            dialog.className = 'confirm-dialog';

            dialog.innerHTML = `
                <div class="confirm-header">
                    <h3 class="confirm-title">${title}</h3>
                </div>
                <div class="confirm-body">
                    <div class="confirm-content">
                        <svg class="confirm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <div class="confirm-message">${message}</div>
                    </div>
                </div>
                <div class="confirm-footer">
                    <button class="confirm-btn confirm-btn-secondary" id="confirm-cancel">Cancel</button>
                    <button class="confirm-btn confirm-btn-primary" id="confirm-ok">Delete</button>
                </div>
            `;

            // Add event listeners
            const cancelBtn = dialog.querySelector('#confirm-cancel');
            const okBtn = dialog.querySelector('#confirm-ok');

            const cleanup = () => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                }, 200);
            };

            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });

            okBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });

            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    cleanup();
                    resolve(false);
                }
            });

            // Close on Escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    cleanup();
                    resolve(false);
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            // Focus the cancel button by default
            setTimeout(() => {
                cancelBtn.focus();
            }, 100);
        });
    }
}

window.CustomConfirm = CustomConfirm;
