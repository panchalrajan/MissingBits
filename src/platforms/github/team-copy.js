// GitHub Team Copy Module
class GitHubTeamCopy extends BaseManager {
    constructor() {
        super();
        this.isTeamPage = false;
        this.copyButton = null;
    }

    /**
     * Setup configurations - override from BaseManager
     */
    setupConfigs() {
        this.isTeamPage = this.checkIfTeamPage();
    }

    /**
     * Check if current page is a GitHub team page
     */
    checkIfTeamPage() {
        const url = window.location.href;
        const pathname = window.location.pathname;
        // Match /orgs/{org}/teams/{team} (with or without /members at the end)
        return url.includes('/orgs/') && url.includes('/teams/') &&
               (pathname.match(/\/orgs\/[^\/]+\/teams\/[^\/]+(?:\/members)?$/) ||
                pathname.match(/\/orgs\/[^\/]+\/teams\/[^\/]+$/) ||
                url.includes('/members'));
    }

    /**
     * Setup event listeners - override from BaseManager
     */
    setupEventListeners() {
        if (!this.isTeamPage) return;

        // Listen for settings changes
        SettingsManager.subscribe('team-copy', (changes) => {
            if (changes.teamCopyEnabled || changes.teamCopyButtonTitle) {
                this.updateButtonVisibility();
            }
        });
    }

    /**
     * Called after initialization is complete - override from BaseManager
     */
    onInitialized() {
        if (this.isTeamPage) {
            this.addCopyButton();
        }
    }

    /**
     * Add copy button to the team page
     */
    async addCopyButton() {
        const settings = await SettingsManager.load();

        if (!settings.teamCopyEnabled) {
            return;
        }

        // Check if button already exists
        if (document.getElementById('missing-bits-team-copy-btn')) {
            return;
        }

        // Try multiple selectors to find the right place to insert the button
        let targetContainer = null;
        let insertBefore = null;

        // Try to find form with membership request
        const form = document.querySelector('form[action*="/membership_requests"]');
        if (form) {
            targetContainer = form;
            insertBefore = form.querySelector('button[type="submit"]');
        }

        // Fallback: look for "Request to join" button anywhere on page
        if (!targetContainer) {
            const requestButton = document.querySelector('button[id*="membership"]') ||
                                  document.querySelector('button:contains("Request to join")') ||
                                  Array.from(document.querySelectorAll('button')).find(btn =>
                                      btn.textContent.includes('Request to join'));

            if (requestButton) {
                targetContainer = requestButton.parentElement;
                insertBefore = requestButton;
            }
        }

        // Fallback: add to the member count area
        if (!targetContainer) {
            const memberCountElement = document.querySelector('[data-view-component="true"]:has-text("members")') ||
                                       document.querySelector('.Layout-sidebar');
            if (memberCountElement) {
                targetContainer = memberCountElement;
                insertBefore = null;
            }
        }

        if (!targetContainer) {
            // Try again in 2 seconds in case page is still loading
            setTimeout(() => this.addCopyButton(), 2000);
            return;
        }

        // Create copy button
        this.copyButton = this.createCopyButton(settings);

        // Insert the button
        if (insertBefore) {
            targetContainer.insertBefore(this.copyButton, insertBefore);
        } else {
            targetContainer.appendChild(this.copyButton);
        }
    }

    /**
     * Create the copy button element
     */
    createCopyButton(settings) {
        const button = document.createElement('button');
        button.id = 'missing-bits-team-copy-btn';
        button.type = 'button';
        button.className = 'btn Button--secondary Button--medium Button mr-2';
        button.style.marginRight = '8px';

        button.innerHTML = `
            <span class="Button-content">
                <span class="Button-label">${settings.teamCopyButtonTitle}</span>
            </span>
        `;

        // Add click event listener
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.copyTeamMembers();
        });

        return button;
    }

    /**
     * Copy team member names to clipboard
     */
    async copyTeamMembers() {
        const settings = await SettingsManager.load();
        const originalText = settings.teamCopyButtonTitle;

        try {
            const teamData = this.extractTeamData();

            if (teamData.members.length === 0) {
                ButtonUtils.updateButtonText(this.copyButton, 'No members found', originalText);
                return;
            }

            // Format the output with team name and members
            let outputText = `${teamData.teamName}\n\n`;
            outputText += teamData.members.join('\n');

            await navigator.clipboard.writeText(outputText);

            // Show success state
            ButtonUtils.updateButtonText(this.copyButton, 'Copied Members Names', originalText);

        } catch (error) {
            ButtonUtils.updateButtonText(this.copyButton, 'Failed', originalText);
        }
    }

    /**
     * Extract team data (name and members) from the page
     */
    extractTeamData() {
        const teamName = this.getTeamName();
        const members = [];

        // Find all member list items using multiple possible selectors
        let memberItems = document.querySelectorAll('.member-listing .member-list-item');

        // Fallback selectors if the primary one doesn't work
        if (memberItems.length === 0) {
            memberItems = document.querySelectorAll('[data-bulk-actions-id]');
        }

        memberItems.forEach(item => {
            // Get username from data attribute
            const username = item.getAttribute('data-bulk-actions-id') || '';

            let displayName = '';

            // Try multiple strategies to find the display name

            // Strategy 1: Look for the name in the main user link
            const userLinks = item.querySelectorAll('a[href*="/' + username + '"]');
            for (const link of userLinks) {
                const linkText = link.textContent.trim();
                // Skip if it's just the username or an avatar
                if (linkText && linkText !== username && !linkText.includes('avatar')) {
                    displayName = linkText;
                    break;
                }
            }

            // Strategy 2: Look for strong/bold text that might be the display name
            if (!displayName) {
                const strongElements = item.querySelectorAll('strong, b, .text-bold');
                for (const element of strongElements) {
                    const text = element.textContent.trim();
                    if (text && text !== username) {
                        displayName = text;
                        break;
                    }
                }
            }

            // Strategy 3: Look in the second table cell specifically
            if (!displayName) {
                const cells = item.querySelectorAll('.table-list-cell');
                if (cells.length >= 2) {
                    const contentCell = cells[1];

                    // Look for any text that's not the username
                    const allLinks = contentCell.querySelectorAll('a');
                    for (const link of allLinks) {
                        const text = link.textContent.trim();
                        if (text && text !== username && !text.includes('@') && !text.includes('avatar')) {
                            displayName = text;
                            break;
                        }
                    }

                    // If still no display name, look for any non-link text
                    if (!displayName) {
                        const textNodes = [];
                        const walker = document.createTreeWalker(
                            contentCell,
                            NodeFilter.SHOW_TEXT,
                            null,
                            false
                        );

                        let node;
                        while (node = walker.nextNode()) {
                            const text = node.textContent.trim();
                            if (text && text !== username && !text.includes('@')) {
                                textNodes.push(text);
                            }
                        }

                        if (textNodes.length > 0) {
                            displayName = textNodes[0];
                        }
                    }
                }
            }

            // Format the output
            let memberText = '';
            if (displayName && username && displayName !== username) {
                memberText = `${displayName} (${username})`;
            } else if (displayName) {
                memberText = displayName;
            } else if (username) {
                memberText = username;
            }

            if (memberText) {
                members.push(memberText);
            }
        });

        return {
            teamName,
            members
        };
    }


    /**
     * Update button visibility based on settings
     */
    async updateButtonVisibility() {
        const settings = await SettingsManager.load();

        if (settings.teamCopyEnabled) {
            if (!this.copyButton) {
                this.addCopyButton();
            } else {
                // Update button text using ButtonUtils
                ButtonUtils.setButtonText(this.copyButton, settings.teamCopyButtonTitle);
            }
        } else {
            // Remove button if it exists
            if (this.copyButton && this.copyButton.parentNode) {
                this.copyButton.parentNode.removeChild(this.copyButton);
                this.copyButton = null;
            }
        }
    }

    /**
     * Get team name from the page
     */
    getTeamName() {
        // Try multiple selectors for the team name
        let teamNameElement = document.querySelector('.Layout-sidebar h2[data-view-component="true"]');

        if (!teamNameElement) {
            teamNameElement = document.querySelector('.Layout-sidebar h2');
        }

        if (!teamNameElement) {
            teamNameElement = document.querySelector('[data-view-component="true"] h2');
        }

        return teamNameElement ? teamNameElement.textContent.trim() : 'Team';
    }

    /**
     * Handle page navigation/updates
     */
    handlePageUpdate() {
        if (this.checkIfTeamPage()) {
            this.isTeamPage = true;
            this.addCopyButton();
        } else {
            this.isTeamPage = false;
            if (this.copyButton && this.copyButton.parentNode) {
                this.copyButton.parentNode.removeChild(this.copyButton);
                this.copyButton = null;
            }
        }
    }
}

// Export for use in content script
window.GitHubTeamCopy = GitHubTeamCopy;