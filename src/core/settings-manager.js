// Enhanced Settings Manager for Missing Bits Extension
// Single source of truth for all settings with publish-subscribe pattern
class SettingsManager {
    static subscribers = new Map();
    static cachedSettings = null;
    static isLoading = false;

    // Check if extension context is valid
    static isExtensionContextValid() {
        try {
            return !!(chrome && chrome.runtime && chrome.runtime.id);
        } catch (error) {
            return false;
        }
    }

    static get defaults() {
        return {
            // GitHub settings
            buttonTitle: "Use custom filter",
            fileFilterEnabled: true,
            files: [
                { id: "resolved", name: ".resolved", enabled: true, deletable: true },
                { id: "package-swift", name: "Package.swift", enabled: true, deletable: true }
            ],
            expandAllEnabled: true,
            expandButtonTitle: "Expand All Conversations",
            viewResolvedEnabled: true,
            viewResolvedButtonTitle: "Toggle Resolved Comments",
            commentFilterEnabled: true,
            commentFilterButtonTitle: "Filter Custom Comments",
            hideResolvedComments: false,
            cleanTimeline: false,
            scrollToTopEverywhere: true,
            scrollToTopPR: true,
            scrollToTopIssue: true,
            scrollToTopPosition: "bottom-right",
            copyJsonEnabled: true,
            usernames: [
                { id: "default1", name: "github-actions", enabled: true, deletable: true }
            ],
            // Jira settings
            jiraCopyPrimaryEnabled: true,
            jiraCopyDropdownEnabled: true,
            copyIssueTemplate: `<a href="<url>" target="_blank">[<key>] - <title></a>`,
            copyIssueButtonTitle: "Copy",
            customTemplate: "{{hyperlink_start}}[{{ticket_id:default}}] - {{ticket_title:default}}{{hyperlink_end}}",
            keyboardShortcut: "",
            // Jira Omnibox settings
            jiraOmniboxEnabled: true,
            jiraDomain: "yourcompany",
            dropdownOptions: [
                { id: "ticket-id", text: "Copy Ticket ID", enabled: true, template: "{{ticket_id}}" },
                { id: "ticket-title", text: "Copy Ticket Title", enabled: true, template: "{{ticket_title}}" },
                { id: "ticket-url", text: "Copy Ticket URL", enabled: true, template: "{{ticket_url}}" },
                { id: "ticket-type", text: "Copy Ticket Type", enabled: false, template: "{{ticket_type}}" },
                { id: "reporter", text: "Copy Reporter", enabled: false, template: "{{reporter_name}}" },
                { id: "assignee", text: "Copy Assignee", enabled: false, template: "{{assignee_name}}" },
                { id: "priority", text: "Copy Priority", enabled: false, template: "{{priority}}" },
                { id: "status", text: "Copy Status", enabled: false, template: "{{status}}" },
                { id: "markdown", text: "Copy as Markdown", enabled: false, template: "{{markdown_start}}{{ticket_id}} - {{ticket_title}}{{markdown_end}}" },
                { id: "git-branch", text: "Copy for Git Branch", enabled: false, template: "{{ticket_type:dash}}/{{ticket_id:lower}}-{{ticket_title:dash}}" }
            ],
            historyLimit: 0,
            copyHistory: []
        };
    }


    // Load settings with caching
    static async load(useCache = true) {
        // Return cached settings if available and requested
        if (useCache && this.cachedSettings !== null) {
            return this.cachedSettings;
        }

        // Prevent multiple concurrent loads
        if (this.isLoading) {
            return new Promise((resolve) => {
                const checkCache = () => {
                    if (!this.isLoading && this.cachedSettings !== null) {
                        resolve(this.cachedSettings);
                    } else {
                        setTimeout(checkCache, 10);
                    }
                };
                checkCache();
            });
        }

        this.isLoading = true;

        if (!this.isExtensionContextValid()) {
            this.cachedSettings = this.defaults;
            this.isLoading = false;
            return this.cachedSettings;
        }

        try {
            const result = await chrome.storage.sync.get(this.defaults);
            this.cachedSettings = result;
            this.isLoading = false;
            return this.cachedSettings;
        } catch (error) {
            console.warn('Failed to load settings from storage, using defaults:', error);
            this.cachedSettings = this.defaults;
            this.isLoading = false;
            return this.cachedSettings;
        }
    }

    // Save settings and notify subscribers
    static async save(settings) {
        if (!this.isExtensionContextValid()) {
            return false;
        }

        try {
            await chrome.storage.sync.set(settings);

            // Update cache
            const oldSettings = this.cachedSettings;
            this.cachedSettings = { ...this.cachedSettings, ...settings };

            // Notify subscribers of changes
            this.notifySubscribers(settings, oldSettings);

            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }

    // Subscribe to settings changes
    static subscribe(subscriberId, callback, options = {}) {
        const { keys = null } = options; // Optional: only listen to specific keys

        if (!this.subscribers.has(subscriberId)) {
            this.subscribers.set(subscriberId, []);
        }

        this.subscribers.get(subscriberId).push({
            callback,
            keys,
            id: Date.now() + Math.random()
        });

        // Setup chrome storage listener if this is the first subscriber
        if (this.subscribers.size === 1) {
            this.setupStorageListener();
        }
    }

    // Unsubscribe from settings changes
    static unsubscribe(subscriberId) {
        this.subscribers.delete(subscriberId);

        // Clean up storage listener if no subscribers remain
        if (this.subscribers.size === 0) {
            this.teardownStorageListener();
        }
    }

    // Notify all subscribers of settings changes
    static notifySubscribers(changedSettings, oldSettings) {
        this.subscribers.forEach((subscriptions, subscriberId) => {
            subscriptions.forEach(subscription => {
                const { callback, keys } = subscription;

                // If specific keys are requested, check if any changed
                if (keys) {
                    const relevantChanges = {};
                    let hasRelevantChanges = false;

                    keys.forEach(key => {
                        if (key in changedSettings) {
                            relevantChanges[key] = {
                                oldValue: oldSettings?.[key],
                                newValue: changedSettings[key]
                            };
                            hasRelevantChanges = true;
                        }
                    });

                    if (hasRelevantChanges) {
                        try {
                            callback(relevantChanges, subscriberId);
                        } catch (error) {
                            console.error(`Error in settings subscriber ${subscriberId}:`, error);
                        }
                    }
                } else {
                    // Notify of all changes
                    const changes = {};
                    Object.keys(changedSettings).forEach(key => {
                        changes[key] = {
                            oldValue: oldSettings?.[key],
                            newValue: changedSettings[key]
                        };
                    });

                    try {
                        callback(changes, subscriberId);
                    } catch (error) {
                        console.error(`Error in settings subscriber ${subscriberId}:`, error);
                    }
                }
            });
        });
    }

    // Setup chrome storage listener
    static setupStorageListener() {
        if (!this.isExtensionContextValid()) {
            return;
        }

        try {
            this.storageListener = (changes, namespace) => {
                if (namespace === 'sync') {
                    // Update cache with changes
                    const changedSettings = {};
                    const oldSettings = { ...this.cachedSettings };

                    Object.keys(changes).forEach(key => {
                        changedSettings[key] = changes[key].newValue;
                        if (this.cachedSettings) {
                            this.cachedSettings[key] = changes[key].newValue;
                        }
                    });

                    this.notifySubscribers(changedSettings, oldSettings);
                }
            };

            chrome.storage.onChanged.addListener(this.storageListener);
        } catch (error) {
            console.warn('Failed to setup storage listener:', error);
        }
    }

    // Cleanup storage listener
    static teardownStorageListener() {
        if (!this.isExtensionContextValid() || !this.storageListener) {
            return;
        }

        try {
            chrome.storage.onChanged.removeListener(this.storageListener);
            this.storageListener = null;
        } catch (error) {
            console.warn('Failed to remove storage listener:', error);
        }
    }

    // Get specific setting value
    static async get(key, defaultValue = null) {
        const settings = await this.load();
        return settings[key] !== undefined ? settings[key] : defaultValue;
    }

    // Set specific setting value
    static async set(key, value) {
        const settings = { [key]: value };
        return await this.save(settings);
    }

    // Clear cache (useful for testing or forced refresh)
    static clearCache() {
        this.cachedSettings = null;
    }


    // File management methods
    static async addFile(fileName) {
        try {
            const trimmedName = fileName.trim();
            if (!trimmedName) {
                return { success: false, error: 'Please enter a valid file name or extension' };
            }

            if (trimmedName.length > 100) {
                return { success: false, error: 'File name must be 100 characters or less' };
            }

            const settings = await this.load();
            const isDuplicate = settings.files.some(file =>
                file.name.toLowerCase() === trimmedName.toLowerCase()
            );

            if (isDuplicate) {
                return { success: false, error: `"${trimmedName}" already exists in the list` };
            }

            const newItem = {
                id: Date.now().toString(),
                name: trimmedName,
                enabled: true,
                deletable: true
            };
            settings.files.push(newItem);
            await this.save({ files: settings.files });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to add file. Please try again.' };
        }
    }

    static async removeFile(itemId) {
        try {
            const settings = await this.load();
            settings.files = settings.files.filter(item => item.id !== itemId);
            await this.save({ files: settings.files });
            return true;
        } catch (error) {
            return false;
        }
    }

    static async toggleFileEnabled(itemId, enabled) {
        try {
            const settings = await this.load();
            const item = settings.files.find(item => item.id === itemId);
            if (item) {
                item.enabled = enabled;
                await this.save({ files: settings.files });
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    static async editFile(itemId, newName) {
        try {
            const trimmedName = newName.trim();
            if (!trimmedName) {
                return { success: false, error: 'Please enter a valid file name or extension' };
            }

            if (trimmedName.length > 100) {
                return { success: false, error: 'File name must be 100 characters or less' };
            }

            const settings = await this.load();
            const item = settings.files.find(item => item.id === itemId);

            if (!item) {
                return { success: false, error: 'File not found' };
            }

            const isDuplicate = settings.files.some(file =>
                file.id !== itemId && file.name.toLowerCase() === trimmedName.toLowerCase()
            );

            if (isDuplicate) {
                return { success: false, error: `"${trimmedName}" already exists in the list` };
            }

            item.name = trimmedName;
            await this.save({ files: settings.files });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to update file. Please try again.' };
        }
    }

    static getAllFiles(settings) {
        return settings.files || [];
    }

    static getEnabledFiles(settings) {
        return this.getAllFiles(settings).filter(item => item.enabled);
    }

    // Username management methods
    static async addUsername(username) {
        try {
            const trimmedUsername = username.trim();
            if (!trimmedUsername) {
                return { success: false, error: 'Please enter a valid GitHub username' };
            }

            if (trimmedUsername.length > 39) {
                return { success: false, error: 'GitHub username must be 39 characters or less' };
            }

            if (!/^[a-zA-Z0-9\-_]+$/.test(trimmedUsername)) {
                return { success: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' };
            }

            const settings = await this.load();
            const isDuplicate = settings.usernames.some(user =>
                user.name.toLowerCase() === trimmedUsername.toLowerCase()
            );

            if (isDuplicate) {
                return { success: false, error: `"${trimmedUsername}" already exists in the list` };
            }

            const newItem = {
                id: Date.now().toString(),
                name: trimmedUsername,
                enabled: true,
                deletable: true
            };
            settings.usernames.push(newItem);
            await this.save({ usernames: settings.usernames });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to add username. Please try again.' };
        }
    }

    static async removeUsername(itemId) {
        try {
            const settings = await this.load();
            settings.usernames = settings.usernames.filter(item => item.id !== itemId);
            await this.save({ usernames: settings.usernames });
            return true;
        } catch (error) {
            return false;
        }
    }

    static async toggleUsernameEnabled(itemId, enabled) {
        try {
            const settings = await this.load();
            const item = settings.usernames.find(item => item.id === itemId);
            if (item) {
                item.enabled = enabled;
                await this.save({ usernames: settings.usernames });
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    static async editUsername(itemId, newName) {
        try {
            const trimmedUsername = newName.trim();
            if (!trimmedUsername) {
                return { success: false, error: 'Please enter a valid GitHub username' };
            }

            if (trimmedUsername.length > 39) {
                return { success: false, error: 'GitHub username must be 39 characters or less' };
            }

            if (!/^[a-zA-Z0-9\-_]+$/.test(trimmedUsername)) {
                return { success: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' };
            }

            const settings = await this.load();
            const item = settings.usernames.find(item => item.id === itemId);

            if (!item) {
                return { success: false, error: 'Username not found' };
            }

            const isDuplicate = settings.usernames.some(user =>
                user.id !== itemId && user.name.toLowerCase() === trimmedUsername.toLowerCase()
            );

            if (isDuplicate) {
                return { success: false, error: `"${trimmedUsername}" already exists in the list` };
            }

            item.name = trimmedUsername;
            await this.save({ usernames: settings.usernames });
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to update username. Please try again.' };
        }
    }

    static getAllUsernames(settings) {
        return settings.usernames || [];
    }

    static getEnabledUsernames(settings) {
        return this.getAllUsernames(settings).filter(item => item.enabled);
    }
}

window.SettingsManager = SettingsManager;
