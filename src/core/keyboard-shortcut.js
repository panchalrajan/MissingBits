// Keyboard Shortcut Management Module
class KeyboardShortcutManager {
    constructor() {
        this.activeShortcut = null;
        this.listener = null;
    }

    // Parse shortcut string into components
    static parseShortcut(shortcutString) {
        if (!shortcutString) return null;
        
        const parts = shortcutString.split('+');
        const modifiers = {
            ctrl: false,
            cmd: false,
            alt: false,
            shift: false
        };
        
        let key = '';
        
        parts.forEach(part => {
            const lowerPart = part.toLowerCase();
            if (lowerPart === 'ctrl') modifiers.ctrl = true;
            else if (lowerPart === 'cmd') modifiers.cmd = true;
            else if (lowerPart === 'alt') modifiers.alt = true;
            else if (lowerPart === 'shift') modifiers.shift = true;
            else key = part.toLowerCase();
        });
        
        return { modifiers, key };
    }

    // Format key combination for display
    static formatShortcut(event) {
        const modifiers = [];
        if (event.ctrlKey || event.metaKey) {
            modifiers.push(navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl');
        }
        if (event.altKey) modifiers.push('Alt');
        if (event.shiftKey) modifiers.push('Shift');

        const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
        return [...modifiers, key].join('+');
    }

    // Check if event matches shortcut
    static matchesShortcut(event, shortcutString) {
        const parsed = this.parseShortcut(shortcutString);
        if (!parsed) return false;

        const eventKey = event.key.toLowerCase();
        const ctrlPressed = event.ctrlKey || event.metaKey;
        
        return (
            eventKey === parsed.key &&
            ctrlPressed === (parsed.modifiers.ctrl || parsed.modifiers.cmd) &&
            event.altKey === parsed.modifiers.alt &&
            event.shiftKey === parsed.modifiers.shift
        );
    }

    // Check if currently focused element should block shortcuts
    static shouldBlockShortcut() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
        );
    }

    // Setup shortcut listener
    setupListener(shortcutString, callback) {
        this.removeListener();
        
        if (!shortcutString) return;

        this.activeShortcut = shortcutString;
        this.listener = (event) => {
            if (KeyboardShortcutManager.shouldBlockShortcut()) return;
            
            if (KeyboardShortcutManager.matchesShortcut(event, shortcutString)) {
                event.preventDefault();
                event.stopPropagation();
                callback();
            }
        };

        document.addEventListener('keydown', this.listener);
    }

    // Remove existing listener
    removeListener() {
        if (this.listener) {
            document.removeEventListener('keydown', this.listener);
            this.listener = null;
            this.activeShortcut = null;
        }
    }

    // Update shortcut
    updateShortcut(newShortcutString, callback) {
        this.setupListener(newShortcutString, callback);
    }
}

window.KeyboardShortcutManager = KeyboardShortcutManager;
