// Settings Page Controller for GitHub Helper
class SettingsPageController {
    constructor() {
        this.currentSettings = {};
        this.saveTimeout = null;
        this.savingToast = null;
        this.isInitialized = false;
    }

    async init() {
        await this.loadSettings();
        this.setupComponents();
        this.setupEventListeners();
        this.setupStorageListener();
        this.renderFiles();
        this.renderUsernames();
        this.setupJiraSettings();
        this.isInitialized = true;

        // Show welcome message
        setTimeout(() => {
            toast.info('Settings are saved automatically as you make changes');
        }, 1000);
    }

    setupComponents() {
        // No components to setup currently
    }

    async loadSettings() {
        this.currentSettings = await SettingsManager.load();

        // Update UI with loaded settings
        setTimeout(() => {
            const buttonTitleInput = document.getElementById('button-title');
            const fileFilterCheckbox = document.getElementById('file-filter-enabled-checkbox');
            const expandAllCheckbox = document.getElementById('expand-all-enabled');
            const expandButtonTitleInput = document.getElementById('expand-button-title');
            const viewResolvedCheckbox = document.getElementById('view-resolved-enabled-checkbox');
            const viewResolvedButtonTitleInput = document.getElementById('view-resolved-button-title');
            const commentFilterCheckbox = document.getElementById('comment-filter-enabled-checkbox');
            const commentFilterButtonTitleInput = document.getElementById('comment-filter-button-title');
            const scrollToTopEverywhereCheckbox = document.getElementById('scroll-to-top-everywhere-checkbox');
            const scrollToTopPRCheckbox = document.getElementById('scroll-to-top-pr-checkbox');
            const scrollToTopIssueCheckbox = document.getElementById('scroll-to-top-issue-checkbox');
            const scrollToTopPositionRadios = document.querySelectorAll('input[name="scroll-to-top-position"]');
            const copyJsonCheckbox = document.getElementById('copy-json-enabled-checkbox');

            if (buttonTitleInput) {
                buttonTitleInput.value = this.currentSettings.buttonTitle;
            }

            if (fileFilterCheckbox) {
                fileFilterCheckbox.checked = this.currentSettings.fileFilterEnabled;
                this.updateToggleSwitch('file-filter-enabled', this.currentSettings.fileFilterEnabled);
            }

            if (expandAllCheckbox) {
                expandAllCheckbox.checked = this.currentSettings.expandAllEnabled;
                this.updateToggleSwitch('expand-conversations-enabled', this.currentSettings.expandAllEnabled);
            }

            if (expandButtonTitleInput) {
                expandButtonTitleInput.value = this.currentSettings.expandButtonTitle;
            }

            if (viewResolvedCheckbox) {
                viewResolvedCheckbox.checked = this.currentSettings.viewResolvedEnabled;
                this.updateToggleSwitch('view-resolved-enabled', this.currentSettings.viewResolvedEnabled);
            }

            if (viewResolvedButtonTitleInput) {
                viewResolvedButtonTitleInput.value = this.currentSettings.viewResolvedButtonTitle;
            }

            if (commentFilterCheckbox) {
                commentFilterCheckbox.checked = this.currentSettings.commentFilterEnabled;
                this.updateToggleSwitch('comment-filter-enabled', this.currentSettings.commentFilterEnabled);
            }

            if (commentFilterButtonTitleInput) {
                commentFilterButtonTitleInput.value = this.currentSettings.commentFilterButtonTitle;
            }

            const hideResolvedCommentsCheckbox = document.getElementById('comment-filter-hide-resolved-comments-checkbox');
            if (hideResolvedCommentsCheckbox) {
                hideResolvedCommentsCheckbox.checked = this.currentSettings.hideResolvedComments;
                this.updateToggleSwitch('comment-filter-hide-resolved-comments', this.currentSettings.hideResolvedComments);
            }

            const cleanTimelineCheckbox = document.getElementById('comment-filter-clean-timeline-checkbox');
            if (cleanTimelineCheckbox) {
                cleanTimelineCheckbox.checked = this.currentSettings.cleanTimeline;
                this.updateToggleSwitch('comment-filter-clean-timeline', this.currentSettings.cleanTimeline);

                // Apply dependency logic on load
                this.updateCleanTimelineDependency(this.currentSettings.cleanTimeline);
            }

            if (scrollToTopEverywhereCheckbox) {
                scrollToTopEverywhereCheckbox.checked = this.currentSettings.scrollToTopEverywhere;
                this.updateToggleSwitch('scroll-to-top-everywhere', this.currentSettings.scrollToTopEverywhere);
            }

            if (scrollToTopPRCheckbox) {
                scrollToTopPRCheckbox.checked = this.currentSettings.scrollToTopPR;
                this.updateToggleSwitch('scroll-to-top-pr', this.currentSettings.scrollToTopPR);
            }

            if (scrollToTopIssueCheckbox) {
                scrollToTopIssueCheckbox.checked = this.currentSettings.scrollToTopIssue;
                this.updateToggleSwitch('scroll-to-top-issue', this.currentSettings.scrollToTopIssue);
            }

            if (copyJsonCheckbox) {
                copyJsonCheckbox.checked = this.currentSettings.copyJsonEnabled;
                this.updateToggleSwitch('copy-json-enabled', this.currentSettings.copyJsonEnabled);
            }

            const cornerBannerCheckbox = document.getElementById('corner-banner-enabled-checkbox');
            if (cornerBannerCheckbox) {
                cornerBannerCheckbox.checked = this.currentSettings.cornerBannerEnabled;
                this.updateToggleSwitch('corner-banner-enabled', this.currentSettings.cornerBannerEnabled);
            }

            const cornerBannerPositionRadios = document.querySelectorAll('input[name="corner-banner-position"]');
            if (cornerBannerPositionRadios.length > 0) {
                const position = this.currentSettings.cornerBannerPosition || 'top-left';
                cornerBannerPositionRadios.forEach(radio => {
                    radio.checked = radio.value === position;
                });
                this.updateRadioButtonsVisualState('corner-banner-position');
            }

            const cornerBannerColorRadios = document.querySelectorAll('input[name="corner-banner-color"]');
            if (cornerBannerColorRadios.length > 0) {
                const color = this.currentSettings.cornerBannerColor || 'green';
                cornerBannerColorRadios.forEach(radio => {
                    radio.checked = radio.value === color;
                });
                this.updateRadioButtonsVisualState('corner-banner-color');
            }

            // LinkedIn settings
            const linkedinAutoAcceptCheckbox = document.getElementById('linkedin-auto-accept-enabled-checkbox');
            if (linkedinAutoAcceptCheckbox) {
                linkedinAutoAcceptCheckbox.checked = this.currentSettings.linkedinAutoAcceptEnabled;
                this.updateToggleSwitch('linkedin-auto-accept-enabled', this.currentSettings.linkedinAutoAcceptEnabled);
            }

            const linkedinAutoWithdrawCheckbox = document.getElementById('linkedin-auto-withdraw-enabled-checkbox');
            if (linkedinAutoWithdrawCheckbox) {
                linkedinAutoWithdrawCheckbox.checked = this.currentSettings.linkedinAutoWithdrawEnabled;
                this.updateToggleSwitch('linkedin-auto-withdraw-enabled', this.currentSettings.linkedinAutoWithdrawEnabled);
            }

            const linkedinAcceptCountRadios = document.querySelectorAll('input[name="linkedin-accept-count"]');
            if (linkedinAcceptCountRadios.length > 0) {
                const count = this.currentSettings.linkedinAcceptCount || "10";
                linkedinAcceptCountRadios.forEach(radio => {
                    radio.checked = radio.value === count;
                });
                this.updateRadioButtonsVisualState('linkedin-accept-count');
            }

            const linkedinWithdrawCountRadios = document.querySelectorAll('input[name="linkedin-withdraw-count"]');
            if (linkedinWithdrawCountRadios.length > 0) {
                const count = this.currentSettings.linkedinWithdrawCount || "10";
                linkedinWithdrawCountRadios.forEach(radio => {
                    radio.checked = radio.value === count;
                });
                this.updateRadioButtonsVisualState('linkedin-withdraw-count');
            }

            const linkedinAutoConnectCheckbox = document.getElementById('linkedin-auto-connect-enabled-checkbox');
            if (linkedinAutoConnectCheckbox) {
                linkedinAutoConnectCheckbox.checked = this.currentSettings.linkedinAutoConnectEnabled;
                this.updateToggleSwitch('linkedin-auto-connect-enabled', this.currentSettings.linkedinAutoConnectEnabled);
            }

            const teamCopyCheckbox = document.getElementById('team-copy-enabled-checkbox');
            if (teamCopyCheckbox) {
                teamCopyCheckbox.checked = this.currentSettings.teamCopyEnabled;
                this.updateToggleSwitch('team-copy-enabled', this.currentSettings.teamCopyEnabled);
            }

            const teamCopyButtonTitleInput = document.getElementById('team-copy-button-title');
            if (teamCopyButtonTitleInput) {
                teamCopyButtonTitleInput.value = this.currentSettings.teamCopyButtonTitle;
            }

            const teamCopyModeRadios = document.querySelectorAll('input[name="team-copy-mode"]');
            if (teamCopyModeRadios.length > 0) {
                const mode = this.currentSettings.teamCopyMode || 'both';
                teamCopyModeRadios.forEach(radio => {
                    radio.checked = radio.value === mode;
                });
                this.updateRadioButtonsVisualState('team-copy-mode');
            }

            // Jira settings

            const jiraCopyPrimaryCheckbox = document.getElementById('jira-copy-primary-enabled-checkbox');
            if (jiraCopyPrimaryCheckbox) {
                jiraCopyPrimaryCheckbox.checked = this.currentSettings.jiraCopyPrimaryEnabled;
                this.updateToggleSwitch('jira-copy-primary-enabled', this.currentSettings.jiraCopyPrimaryEnabled);
            }

            const jiraCopyDropdownCheckbox = document.getElementById('jira-copy-dropdown-enabled-checkbox');
            if (jiraCopyDropdownCheckbox) {
                jiraCopyDropdownCheckbox.checked = this.currentSettings.jiraCopyDropdownEnabled;
                this.updateToggleSwitch('jira-copy-dropdown-enabled', this.currentSettings.jiraCopyDropdownEnabled);
            }

            const jiraOmniboxCheckbox = document.getElementById('jira-omnibox-enabled-checkbox');
            if (jiraOmniboxCheckbox) {
                jiraOmniboxCheckbox.checked = true; // Always enabled due to Chrome limitation
                this.updateToggleSwitch('jira-omnibox-enabled', true);
                // Disable the toggle since it cannot be changed
                this.disableOmniboxToggle();
            }

            const jiraStatusRelocatorCheckbox = document.getElementById('jira-status-relocator-enabled-checkbox');
            if (jiraStatusRelocatorCheckbox) {
                jiraStatusRelocatorCheckbox.checked = this.currentSettings.jiraStatusRelocatorEnabled;
                this.updateToggleSwitch('jira-status-relocator-enabled', this.currentSettings.jiraStatusRelocatorEnabled);
            }

            const jiraDomainInput = document.getElementById('jira-domain');
            if (jiraDomainInput) {
                jiraDomainInput.value = this.currentSettings.jiraDomain || 'yourcompany';
            }

            // Update demo examples
            this.updateOmniboxDemoExamples();

            // Handle the master toggle logic on load
            this.handleScrollToTopEverywhereChange(this.currentSettings.scrollToTopEverywhere);

            if (scrollToTopPositionRadios.length > 0) {
                const position = this.currentSettings.scrollToTopPosition || 'bottom-right';
                scrollToTopPositionRadios.forEach(radio => {
                    radio.checked = radio.value === position;
                });
                this.updateRadioButtonsVisualState('scroll-to-top-position');
            }
        }, 0);
    }

    setupEventListeners() {
        // Sidebar navigation
        this.setupSidebarNavigation();

        // Toggle switches
        this.setupToggleSwitches();

        // Button title input
        const buttonTitleInput = document.getElementById('button-title');

        if (buttonTitleInput) {
            buttonTitleInput.addEventListener('input', (e) => {
                const value = e.target.value.trim() || 'Use custom filter';
                this.currentSettings.buttonTitle = value;
                this.debouncedSave();
            });
        }

        // Expand button title input
        const expandButtonTitleInput = document.getElementById('expand-button-title');

        if (expandButtonTitleInput) {
            expandButtonTitleInput.addEventListener('input', (e) => {
                const value = e.target.value.trim() || 'Expand All Conversations';
                this.currentSettings.expandButtonTitle = value;
                this.debouncedSave();
            });
        }

        // File filter enabled checkbox
        const fileFilterCheckbox = document.getElementById('file-filter-enabled-checkbox');

        if (fileFilterCheckbox) {
            fileFilterCheckbox.addEventListener('change', (e) => {
                this.currentSettings.fileFilterEnabled = e.target.checked;
                this.updateToggleSwitch('file-filter-enabled', e.target.checked);
                this.autoSave();
            });
        }

        // Expand all checkbox
        const expandAllCheckbox = document.getElementById('expand-all-enabled');

        if (expandAllCheckbox) {
            expandAllCheckbox.addEventListener('change', (e) => {
                this.currentSettings.expandAllEnabled = e.target.checked;
                this.updateToggleSwitch('expand-conversations-enabled', e.target.checked);
                this.autoSave();
            });
        }

        // View resolved checkbox
        const viewResolvedCheckbox = document.getElementById('view-resolved-enabled-checkbox');

        if (viewResolvedCheckbox) {
            viewResolvedCheckbox.addEventListener('change', (e) => {
                this.currentSettings.viewResolvedEnabled = e.target.checked;
                this.updateToggleSwitch('view-resolved-enabled', e.target.checked);
                this.autoSave();
            });
        }

        // View resolved button title input
        const viewResolvedButtonTitleInput = document.getElementById('view-resolved-button-title');

        if (viewResolvedButtonTitleInput) {
            viewResolvedButtonTitleInput.addEventListener('input', (e) => {
                const value = e.target.value.trim() || 'Toggle Resolved Comments';
                this.currentSettings.viewResolvedButtonTitle = value;
                this.debouncedSave();
            });
        }

        // Comment filter checkbox
        const commentFilterCheckbox = document.getElementById('comment-filter-enabled-checkbox');

        if (commentFilterCheckbox) {
            commentFilterCheckbox.addEventListener('change', (e) => {
                this.currentSettings.commentFilterEnabled = e.target.checked;
                this.updateToggleSwitch('comment-filter-enabled', e.target.checked);
                this.autoSave();
            });
        }

        // Comment filter button title input
        const commentFilterButtonTitleInput = document.getElementById('comment-filter-button-title');

        if (commentFilterButtonTitleInput) {
            commentFilterButtonTitleInput.addEventListener('input', (e) => {
                const value = e.target.value.trim() || 'Filter Custom Comments';
                this.currentSettings.commentFilterButtonTitle = value;
                this.debouncedSave();
            });
        }

        const hideResolvedCommentsCheckbox = document.getElementById('comment-filter-hide-resolved-comments-checkbox');
        if (hideResolvedCommentsCheckbox) {
            hideResolvedCommentsCheckbox.addEventListener('change', (e) => {
                // Prevent unchecking if clean timeline is enabled
                if (!e.target.checked && this.currentSettings.cleanTimeline) {
                    e.target.checked = true;
                    this.updateToggleSwitch('comment-filter-hide-resolved-comments', true);
                    this.showDependencyNotice();
                    return;
                }

                this.currentSettings.hideResolvedComments = e.target.checked;
                this.updateToggleSwitch('comment-filter-hide-resolved-comments', e.target.checked);
                this.autoSave();
            });
        }

        const cleanTimelineCheckbox = document.getElementById('comment-filter-clean-timeline-checkbox');
        if (cleanTimelineCheckbox) {
            cleanTimelineCheckbox.addEventListener('change', (e) => {
                this.currentSettings.cleanTimeline = e.target.checked;
                this.updateToggleSwitch('comment-filter-clean-timeline', e.target.checked);
                this.updateCleanTimelineDependency(e.target.checked);
                this.autoSave();
            });
        }

        // Copy JSON checkbox
        const copyJsonCheckbox = document.getElementById('copy-json-enabled-checkbox');

        if (copyJsonCheckbox) {
            copyJsonCheckbox.addEventListener('change', (e) => {
                this.currentSettings.copyJsonEnabled = e.target.checked;
                this.updateToggleSwitch('copy-json-enabled', e.target.checked);
                this.autoSave();
            });
        }

        // Corner banner checkbox
        const cornerBannerCheckbox = document.getElementById('corner-banner-enabled-checkbox');

        if (cornerBannerCheckbox) {
            cornerBannerCheckbox.addEventListener('change', (e) => {
                this.currentSettings.cornerBannerEnabled = e.target.checked;
                this.updateToggleSwitch('corner-banner-enabled', e.target.checked);
                this.autoSave();
            });
        }

        // Corner banner position radio buttons
        const cornerBannerPositionRadios = document.querySelectorAll('input[name="corner-banner-position"]');
        cornerBannerPositionRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.currentSettings.cornerBannerPosition = e.target.value;
                    this.updateRadioButtonsVisualState('corner-banner-position');
                    this.autoSave();
                }
            });
        });

        // Corner banner color radio buttons
        const cornerBannerColorRadios = document.querySelectorAll('input[name="corner-banner-color"]');
        cornerBannerColorRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.currentSettings.cornerBannerColor = e.target.value;
                    this.updateRadioButtonsVisualState('corner-banner-color');
                    this.autoSave();
                }
            });
        });

        // LinkedIn settings event listeners
        const linkedinAutoAcceptCheckbox = document.getElementById('linkedin-auto-accept-enabled-checkbox');
        if (linkedinAutoAcceptCheckbox) {
            linkedinAutoAcceptCheckbox.addEventListener('change', (e) => {
                this.currentSettings.linkedinAutoAcceptEnabled = e.target.checked;
                this.updateToggleSwitch('linkedin-auto-accept-enabled', e.target.checked);
                this.autoSave();
            });
        }

        const linkedinAutoWithdrawCheckbox = document.getElementById('linkedin-auto-withdraw-enabled-checkbox');
        if (linkedinAutoWithdrawCheckbox) {
            linkedinAutoWithdrawCheckbox.addEventListener('change', (e) => {
                this.currentSettings.linkedinAutoWithdrawEnabled = e.target.checked;
                this.updateToggleSwitch('linkedin-auto-withdraw-enabled', e.target.checked);
                this.autoSave();
            });
        }

        const linkedinAcceptCountRadios = document.querySelectorAll('input[name="linkedin-accept-count"]');
        linkedinAcceptCountRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.currentSettings.linkedinAcceptCount = e.target.value;
                    this.updateRadioButtonsVisualState('linkedin-accept-count');
                    this.autoSave();
                }
            });
        });

        const linkedinWithdrawCountRadios = document.querySelectorAll('input[name="linkedin-withdraw-count"]');
        linkedinWithdrawCountRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.currentSettings.linkedinWithdrawCount = e.target.value;
                    this.updateRadioButtonsVisualState('linkedin-withdraw-count');
                    this.autoSave();
                }
            });
        });

        const linkedinAutoConnectCheckbox = document.getElementById('linkedin-auto-connect-enabled-checkbox');
        if (linkedinAutoConnectCheckbox) {
            linkedinAutoConnectCheckbox.addEventListener('change', (e) => {
                this.currentSettings.linkedinAutoConnectEnabled = e.target.checked;
                this.updateToggleSwitch('linkedin-auto-connect-enabled', e.target.checked);
                this.autoSave();
            });
        }

        // LinkedIn Start Accept button
        const linkedinStartAcceptBtn = document.getElementById('linkedin-start-accept');
        if (linkedinStartAcceptBtn) {
            linkedinStartAcceptBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startLinkedInAccept();
            });
        }

        // LinkedIn Start Withdraw button
        const linkedinStartWithdrawBtn = document.getElementById('linkedin-start-withdraw');
        if (linkedinStartWithdrawBtn) {
            linkedinStartWithdrawBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startLinkedInWithdrawal();
            });
        }

        // LinkedIn Start Connect button
        const linkedinStartConnectBtn = document.getElementById('linkedin-start-connect');
        if (linkedinStartConnectBtn) {
            linkedinStartConnectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startLinkedInConnect();
            });
        }

        // Team copy checkbox
        const teamCopyCheckbox = document.getElementById('team-copy-enabled-checkbox');
        if (teamCopyCheckbox) {
            teamCopyCheckbox.addEventListener('change', (e) => {
                this.currentSettings.teamCopyEnabled = e.target.checked;
                this.updateToggleSwitch('team-copy-enabled', e.target.checked);
                this.autoSave();
            });
        }

        // Team copy button title input
        const teamCopyButtonTitleInput = document.getElementById('team-copy-button-title');
        if (teamCopyButtonTitleInput) {
            teamCopyButtonTitleInput.addEventListener('input', (e) => {
                const value = e.target.value.trim() || 'Copy Members Names';
                this.currentSettings.teamCopyButtonTitle = value;
                this.debouncedSave();
            });
        }

        // Team copy mode radio buttons
        const teamCopyModeRadios = document.querySelectorAll('input[name="team-copy-mode"]');
        teamCopyModeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.currentSettings.teamCopyMode = e.target.value;
                    this.updateRadioButtonsVisualState('team-copy-mode');
                    this.autoSave();
                }
            });
        });

        // Reset button
        const resetButton = document.getElementById('reset-defaults');
        if (resetButton) {
            resetButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleReset();
            });
        }

        // Add file button
        const addFileBtn = document.getElementById('add-file-btn');
        if (addFileBtn) {
            addFileBtn.addEventListener('click', () => {
                this.showAddFileModal();
            });
        }

        // Add username button
        const addUsernameBtn = document.getElementById('add-username-btn');
        if (addUsernameBtn) {
            addUsernameBtn.addEventListener('click', () => {
                this.showAddUsernameModal();
            });
        }

        // Add dropdown option button
        const addDropdownOptionBtn = document.getElementById('add-dropdown-option-btn');
        if (addDropdownOptionBtn) {
            addDropdownOptionBtn.addEventListener('click', () => {
                this.addNewDropdownOption();
            });
        }

        // Scroll to top everywhere checkbox (master toggle)
        const scrollToTopEverywhereCheckbox = document.getElementById('scroll-to-top-everywhere-checkbox');
        if (scrollToTopEverywhereCheckbox) {
            scrollToTopEverywhereCheckbox.addEventListener('change', (e) => {
                this.currentSettings.scrollToTopEverywhere = e.target.checked;
                this.updateToggleSwitch('scroll-to-top-everywhere', e.target.checked);
                this.handleScrollToTopEverywhereChange(e.target.checked);
                this.autoSave();
            });
        }

        // Scroll to top PR checkbox
        const scrollToTopPRCheckbox = document.getElementById('scroll-to-top-pr-checkbox');
        if (scrollToTopPRCheckbox) {
            scrollToTopPRCheckbox.addEventListener('change', (e) => {
                this.currentSettings.scrollToTopPR = e.target.checked;
                this.updateToggleSwitch('scroll-to-top-pr', e.target.checked);
                this.autoSave();
            });
        }

        // Scroll to top Issue checkbox
        const scrollToTopIssueCheckbox = document.getElementById('scroll-to-top-issue-checkbox');
        if (scrollToTopIssueCheckbox) {
            scrollToTopIssueCheckbox.addEventListener('change', (e) => {
                this.currentSettings.scrollToTopIssue = e.target.checked;
                this.updateToggleSwitch('scroll-to-top-issue', e.target.checked);
                this.autoSave();
            });
        }

        // Scroll to top position radio buttons
        const scrollToTopPositionRadios = document.querySelectorAll('input[name="scroll-to-top-position"]');

        scrollToTopPositionRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.currentSettings.scrollToTopPosition = e.target.value;
                    this.updateRadioButtonsVisualState('scroll-to-top-position');
                    this.autoSave();
                }
            });
        });


        // Jira copy primary enabled checkbox
        const jiraCopyPrimaryCheckbox = document.getElementById('jira-copy-primary-enabled-checkbox');
        if (jiraCopyPrimaryCheckbox) {
            jiraCopyPrimaryCheckbox.addEventListener('change', (e) => {
                this.currentSettings.jiraCopyPrimaryEnabled = e.target.checked;
                this.updateToggleSwitch('jira-copy-primary-enabled', e.target.checked);
                this.handleJiraPrimaryChange(e.target.checked);
                this.autoSave();
            });
        }

        // Jira copy dropdown enabled checkbox
        const jiraCopyDropdownCheckbox = document.getElementById('jira-copy-dropdown-enabled-checkbox');
        if (jiraCopyDropdownCheckbox) {
            jiraCopyDropdownCheckbox.addEventListener('change', (e) => {
                this.currentSettings.jiraCopyDropdownEnabled = e.target.checked;
                this.updateToggleSwitch('jira-copy-dropdown-enabled', e.target.checked);
                this.autoSave();
            });
        }

        // Jira omnibox checkbox - disabled due to Chrome limitation
        const jiraOmniboxCheckbox = document.getElementById('jira-omnibox-enabled-checkbox');
        if (jiraOmniboxCheckbox) {
            jiraOmniboxCheckbox.addEventListener('change', (e) => {
                // Prevent changes - always keep enabled
                e.target.checked = true;
                this.currentSettings.jiraOmniboxEnabled = true;
                this.updateToggleSwitch('jira-omnibox-enabled', true);
                this.autoSave();
            });
        }

        // Jira status relocator enabled checkbox
        const jiraStatusRelocatorCheckbox = document.getElementById('jira-status-relocator-enabled-checkbox');
        if (jiraStatusRelocatorCheckbox) {
            jiraStatusRelocatorCheckbox.addEventListener('change', (e) => {
                this.currentSettings.jiraStatusRelocatorEnabled = e.target.checked;
                this.updateToggleSwitch('jira-status-relocator-enabled', e.target.checked);
                this.autoSave();
            });
        }

        // Jira domain input
        const jiraDomainInput = document.getElementById('jira-domain');
        if (jiraDomainInput) {
            jiraDomainInput.addEventListener('input', (e) => {
                this.currentSettings.jiraDomain = e.target.value || 'yourcompany';
                this.updateOmniboxDemoExamples();
                this.autoSave();
            });
        }


        // Edit template button
        const editTemplateBtn = document.getElementById('edit-template-btn');
        if (editTemplateBtn) {
            editTemplateBtn.addEventListener('click', () => {
                this.showEditTemplateModal();
            });
        }
    }

    handleScrollToTopEverywhereChange(isEverywhereEnabled) {
        const prToggleSwitch = document.getElementById('scroll-to-top-pr');
        const issueToggleSwitch = document.getElementById('scroll-to-top-issue');
        const prToggleItem = prToggleSwitch?.closest('.toggle-item');
        const issueToggleItem = issueToggleSwitch?.closest('.toggle-item');
        const dependencyNotice = document.getElementById('scroll-to-top-dependency-notice');

        if (isEverywhereEnabled) {
            // When master is enabled, auto-enable the other toggles and gray them out
            this.currentSettings.scrollToTopPR = true;
            this.currentSettings.scrollToTopIssue = true;

            // Update UI to show enabled state
            const prCheckbox = document.getElementById('scroll-to-top-pr-checkbox');
            const issueCheckbox = document.getElementById('scroll-to-top-issue-checkbox');

            if (prCheckbox) {
                prCheckbox.checked = true;
                this.updateToggleSwitch('scroll-to-top-pr', true);
            }

            if (issueCheckbox) {
                issueCheckbox.checked = true;
                this.updateToggleSwitch('scroll-to-top-issue', true);
            }

            // Gray out the toggles
            if (prToggleItem) {
                prToggleItem.style.opacity = '0.5';
                prToggleItem.style.pointerEvents = 'none';
            }
            if (issueToggleItem) {
                issueToggleItem.style.opacity = '0.5';
                issueToggleItem.style.pointerEvents = 'none';
            }

            // Show dependency notice
            if (dependencyNotice) {
                dependencyNotice.style.display = 'block';
            }
        } else {
            // When master is disabled, restore normal functionality
            if (prToggleItem) {
                prToggleItem.style.opacity = '1';
                prToggleItem.style.pointerEvents = 'auto';
            }
            if (issueToggleItem) {
                issueToggleItem.style.opacity = '1';
                issueToggleItem.style.pointerEvents = 'auto';
            }

            // Hide dependency notice
            if (dependencyNotice) {
                dependencyNotice.style.display = 'none';
            }
        }
    }

    handleJiraPrimaryChange(isPrimaryEnabled) {
        const dropdownToggleItem = document.getElementById('jira-dropdown-toggle-item');
        const dependencyNotice = document.getElementById('dropdown-dependency-notice');
        const dropdownOptionsCard = document.getElementById('jira-dropdown-options-card');

        if (!isPrimaryEnabled) {
            // When primary is disabled, disable dropdown and show notice
            this.currentSettings.jiraCopyDropdownEnabled = false;

            // Update UI to show disabled state
            const dropdownCheckbox = document.getElementById('jira-copy-dropdown-enabled-checkbox');
            if (dropdownCheckbox) {
                dropdownCheckbox.checked = false;
                this.updateToggleSwitch('jira-copy-dropdown-enabled', false);
            }

            // Show dependency notice and fade the toggle
            if (dependencyNotice) {
                dependencyNotice.style.display = 'block';
            }
            if (dropdownToggleItem) {
                dropdownToggleItem.style.opacity = '0.5';
                dropdownToggleItem.style.pointerEvents = 'none';
            }

            // Also disable the dropdown options card
            if (dropdownOptionsCard) {
                dropdownOptionsCard.style.opacity = '0.5';
                dropdownOptionsCard.style.pointerEvents = 'none';
            }
        } else {
            // When primary is enabled, restore normal functionality
            if (dependencyNotice) {
                dependencyNotice.style.display = 'none';
            }
            if (dropdownToggleItem) {
                dropdownToggleItem.style.opacity = '1';
                dropdownToggleItem.style.pointerEvents = 'auto';
            }

            // Re-enable the dropdown options card
            if (dropdownOptionsCard) {
                dropdownOptionsCard.style.opacity = '1';
                dropdownOptionsCard.style.pointerEvents = 'auto';
            }
        }
    }

    showEditTemplateModal() {
        // Initialize the template editor if not already done
        if (!this.templateEditor) {
            this.templateEditor = new TemplateEditor(this);
            this.templateEditor.setupEventListeners();
        }

        // Open the modal - the template editor will handle this
        const modal = document.getElementById('template-editor-modal');
        if (modal) {
            const editBtn = document.getElementById('edit-template-btn');
            if (editBtn) {
                editBtn.click(); // Trigger the actual template editor
            }
        }
    }

    updateTemplatePreview() {
        // Use the template renderer for consistent previews
        const template = this.currentSettings.customTemplate || "{{hyperlink_start}}[{{ticket_id:default}}] - {{ticket_title:default}}{{hyperlink_end}}";

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
                // For HTML preview, show the rendered HTML as escaped text
                htmlElement.innerHTML = htmlPreview.replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
                markdownElement.textContent = markdownPreview;
            }
        } else {
            if (markdownContainer) markdownContainer.style.display = 'none';
        }
    }

    setupSidebarNavigation() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionName = item.getAttribute('data-section');
                this.switchToSection(sectionName);
            });
        });
    }

    switchToSection(sectionName) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked nav item
        const targetNavItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (targetNavItem) {
            targetNavItem.classList.add('active');
        }

        // Hide all content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target content section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    setupToggleSwitches() {
        // Setup click handlers for toggle items (entire clickable area)
        const toggleItems = document.querySelectorAll('.toggle-item');

        toggleItems.forEach(toggleItem => {
            toggleItem.addEventListener('click', (e) => {
                e.preventDefault();
                const input = toggleItem.querySelector('.toggle-input');
                if (input && input.type === 'checkbox') {
                    input.checked = !input.checked;
                    input.dispatchEvent(new Event('change'));
                }
            });
        });

        // Setup click handlers for toggle switches (keep for backwards compatibility)
        const toggleSwitches = document.querySelectorAll('.toggle-switch');

        toggleSwitches.forEach(toggleSwitch => {
            toggleSwitch.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent double-triggering with toggle-item
                const input = toggleSwitch.querySelector('.toggle-input');
                if (input && input.type === 'checkbox') {
                    input.checked = !input.checked;
                    input.dispatchEvent(new Event('change'));
                }
            });
        });

        // Setup click handlers for radio items
        const radioItems = document.querySelectorAll('.radio-item');

        radioItems.forEach(radioItem => {
            radioItem.addEventListener('click', (e) => {
                e.preventDefault();
                const input = radioItem.querySelector('.radio-input');
                if (input) {
                    input.checked = true;
                    input.dispatchEvent(new Event('change'));
                }
            });
        });
    }

    updateToggleSwitch(toggleId, isActive) {
        const toggleSwitch = document.getElementById(toggleId);
        if (toggleSwitch) {
            if (isActive) {
                toggleSwitch.classList.add('active');
            } else {
                toggleSwitch.classList.remove('active');
            }
        }
    }

    updateRadioButtonsVisualState(radioName) {
        const radios = document.querySelectorAll(`input[name="${radioName}"]`);
        radios.forEach(radio => {
            const radioItem = radio.closest('.radio-item');
            if (radioItem) {
                if (radio.checked) {
                    radioItem.classList.add('selected');
                } else {
                    radioItem.classList.remove('selected');
                }
            }
        });
    }

    setupStorageListener() {
        // Listen for storage changes from content script
        SettingsManager.subscribe('settings-page', (changes) => {
            if (!this.isInitialized) return;

            Object.keys(changes).forEach(key => {
                if (changes[key].newValue !== undefined) {
                    this.currentSettings[key] = changes[key].newValue;
                }
            });

            // Update UI if needed
            this.updateUI();
        });
    }

    updateUI() {
        // Update all UI elements with current settings
        const buttonTitleInput = document.getElementById('button-title');
        const fileFilterCheckbox = document.getElementById('file-filter-enabled-checkbox');
        const expandAllCheckbox = document.getElementById('expand-all-enabled');
        const expandButtonTitleInput = document.getElementById('expand-button-title');
        const viewResolvedCheckbox = document.getElementById('view-resolved-enabled-checkbox');
        const viewResolvedButtonTitleInput = document.getElementById('view-resolved-button-title');
        const commentFilterCheckbox = document.getElementById('comment-filter-enabled-checkbox');
        const commentFilterButtonTitleInput = document.getElementById('comment-filter-button-title');
        const scrollToTopEverywhereCheckbox = document.getElementById('scroll-to-top-everywhere-checkbox');
        const scrollToTopPRCheckbox = document.getElementById('scroll-to-top-pr-checkbox');
        const scrollToTopIssueCheckbox = document.getElementById('scroll-to-top-issue-checkbox');
        const scrollToTopPositionRadios = document.querySelectorAll('input[name="scroll-to-top-position"]');
        const copyJsonCheckbox = document.getElementById('copy-json-enabled-checkbox');

        // Jira settings
        const jiraCopyPrimaryCheckbox = document.getElementById('jira-copy-primary-enabled-checkbox');
        const jiraCopyDropdownCheckbox = document.getElementById('jira-copy-dropdown-enabled-checkbox');
        const jiraOmniboxCheckbox = document.getElementById('jira-omnibox-enabled-checkbox');
        const jiraStatusRelocatorCheckbox = document.getElementById('jira-status-relocator-enabled-checkbox');
        const jiraDomainInput = document.getElementById('jira-domain');

        if (buttonTitleInput) {
            buttonTitleInput.value = this.currentSettings.buttonTitle;
        }

        if (fileFilterCheckbox) {
            fileFilterCheckbox.checked = this.currentSettings.fileFilterEnabled;
            this.updateToggleSwitch('file-filter-enabled', this.currentSettings.fileFilterEnabled);
        }

        if (expandAllCheckbox) {
            expandAllCheckbox.checked = this.currentSettings.expandAllEnabled;
            this.updateToggleSwitch('expand-conversations-enabled', this.currentSettings.expandAllEnabled);
        }

        if (expandButtonTitleInput) {
            expandButtonTitleInput.value = this.currentSettings.expandButtonTitle;
        }

        if (viewResolvedCheckbox) {
            viewResolvedCheckbox.checked = this.currentSettings.viewResolvedEnabled;
            this.updateToggleSwitch('view-resolved-enabled', this.currentSettings.viewResolvedEnabled);
        }

        if (viewResolvedButtonTitleInput) {
            viewResolvedButtonTitleInput.value = this.currentSettings.viewResolvedButtonTitle;
        }

        if (commentFilterCheckbox) {
            commentFilterCheckbox.checked = this.currentSettings.commentFilterEnabled;
            this.updateToggleSwitch('comment-filter-enabled', this.currentSettings.commentFilterEnabled);
        }

        if (commentFilterButtonTitleInput) {
            commentFilterButtonTitleInput.value = this.currentSettings.commentFilterButtonTitle;
        }

        const hideResolvedCommentsCheckbox = document.getElementById('comment-filter-hide-resolved-comments-checkbox');
        if (hideResolvedCommentsCheckbox) {
            hideResolvedCommentsCheckbox.checked = this.currentSettings.hideResolvedComments;
            this.updateToggleSwitch('comment-filter-hide-resolved-comments', this.currentSettings.hideResolvedComments);
        }

        const cleanTimelineCheckbox = document.getElementById('comment-filter-clean-timeline-checkbox');
        if (cleanTimelineCheckbox) {
            cleanTimelineCheckbox.checked = this.currentSettings.cleanTimeline;
            this.updateToggleSwitch('comment-filter-clean-timeline', this.currentSettings.cleanTimeline);
        }

        if (scrollToTopEverywhereCheckbox) {
            scrollToTopEverywhereCheckbox.checked = this.currentSettings.scrollToTopEverywhere;
            this.updateToggleSwitch('scroll-to-top-everywhere', this.currentSettings.scrollToTopEverywhere);
        }

        if (scrollToTopPRCheckbox) {
            scrollToTopPRCheckbox.checked = this.currentSettings.scrollToTopPR;
            this.updateToggleSwitch('scroll-to-top-pr', this.currentSettings.scrollToTopPR);
        }

        if (scrollToTopIssueCheckbox) {
            scrollToTopIssueCheckbox.checked = this.currentSettings.scrollToTopIssue;
            this.updateToggleSwitch('scroll-to-top-issue', this.currentSettings.scrollToTopIssue);
        }

        // Handle the master toggle logic
        this.handleScrollToTopEverywhereChange(this.currentSettings.scrollToTopEverywhere);

        if (scrollToTopPositionRadios.length > 0) {
            const position = this.currentSettings.scrollToTopPosition || 'bottom-right';
            scrollToTopPositionRadios.forEach(radio => {
                radio.checked = radio.value === position;
            });
            this.updateRadioButtonsVisualState('scroll-to-top-position');
        }

        // Update Amplitude settings
        if (copyJsonCheckbox) {
            copyJsonCheckbox.checked = this.currentSettings.copyJsonEnabled;
            this.updateToggleSwitch('copy-json-enabled', this.currentSettings.copyJsonEnabled);
        }

        // Update corner banner settings
        const cornerBannerCheckbox = document.getElementById('corner-banner-enabled-checkbox');
        if (cornerBannerCheckbox) {
            cornerBannerCheckbox.checked = this.currentSettings.cornerBannerEnabled;
            this.updateToggleSwitch('corner-banner-enabled', this.currentSettings.cornerBannerEnabled);
        }

        const cornerBannerPositionRadios = document.querySelectorAll('input[name="corner-banner-position"]');
        if (cornerBannerPositionRadios.length > 0) {
            const position = this.currentSettings.cornerBannerPosition || 'top-left';
            cornerBannerPositionRadios.forEach(radio => {
                radio.checked = radio.value === position;
            });
            this.updateRadioButtonsVisualState('corner-banner-position');
        }

        const cornerBannerColorRadios = document.querySelectorAll('input[name="corner-banner-color"]');
        if (cornerBannerColorRadios.length > 0) {
            const color = this.currentSettings.cornerBannerColor || 'green';
            cornerBannerColorRadios.forEach(radio => {
                radio.checked = radio.value === color;
            });
            this.updateRadioButtonsVisualState('corner-banner-color');
        }

        // Update Team Copy settings
        const teamCopyCheckbox = document.getElementById('team-copy-enabled-checkbox');
        if (teamCopyCheckbox) {
            teamCopyCheckbox.checked = this.currentSettings.teamCopyEnabled;
            this.updateToggleSwitch('team-copy-enabled', this.currentSettings.teamCopyEnabled);
        }

        const teamCopyButtonTitleInput = document.getElementById('team-copy-button-title');
        if (teamCopyButtonTitleInput) {
            teamCopyButtonTitleInput.value = this.currentSettings.teamCopyButtonTitle;
        }

        const teamCopyModeRadios = document.querySelectorAll('input[name="team-copy-mode"]');
        if (teamCopyModeRadios.length > 0) {
            const mode = this.currentSettings.teamCopyMode || 'both';
            teamCopyModeRadios.forEach(radio => {
                radio.checked = radio.value === mode;
            });
            this.updateRadioButtonsVisualState('team-copy-mode');
        }

        // Update LinkedIn settings
        const linkedinAutoAcceptCheckbox = document.getElementById('linkedin-auto-accept-enabled-checkbox');
        if (linkedinAutoAcceptCheckbox) {
            linkedinAutoAcceptCheckbox.checked = this.currentSettings.linkedinAutoAcceptEnabled;
            this.updateToggleSwitch('linkedin-auto-accept-enabled', this.currentSettings.linkedinAutoAcceptEnabled);
        }

        const linkedinAutoWithdrawCheckbox = document.getElementById('linkedin-auto-withdraw-enabled-checkbox');
        if (linkedinAutoWithdrawCheckbox) {
            linkedinAutoWithdrawCheckbox.checked = this.currentSettings.linkedinAutoWithdrawEnabled;
            this.updateToggleSwitch('linkedin-auto-withdraw-enabled', this.currentSettings.linkedinAutoWithdrawEnabled);
        }

        const linkedinAcceptCountRadios = document.querySelectorAll('input[name="linkedin-accept-count"]');
        if (linkedinAcceptCountRadios.length > 0) {
            const count = this.currentSettings.linkedinAcceptCount || "10";
            linkedinAcceptCountRadios.forEach(radio => {
                radio.checked = radio.value === count;
            });
            this.updateRadioButtonsVisualState('linkedin-accept-count');
        }

        const linkedinWithdrawCountRadios = document.querySelectorAll('input[name="linkedin-withdraw-count"]');
        if (linkedinWithdrawCountRadios.length > 0) {
            const count = this.currentSettings.linkedinWithdrawCount || "10";
            linkedinWithdrawCountRadios.forEach(radio => {
                radio.checked = radio.value === count;
            });
            this.updateRadioButtonsVisualState('linkedin-withdraw-count');
        }

        const linkedinAutoConnectCheckbox = document.getElementById('linkedin-auto-connect-enabled-checkbox');
        if (linkedinAutoConnectCheckbox) {
            linkedinAutoConnectCheckbox.checked = this.currentSettings.linkedinAutoConnectEnabled;
            this.updateToggleSwitch('linkedin-auto-connect-enabled', this.currentSettings.linkedinAutoConnectEnabled);
        }

        // Update Jira settings

        if (jiraCopyPrimaryCheckbox) {
            jiraCopyPrimaryCheckbox.checked = this.currentSettings.jiraCopyPrimaryEnabled;
            this.updateToggleSwitch('jira-copy-primary-enabled', this.currentSettings.jiraCopyPrimaryEnabled);
        }

        if (jiraCopyDropdownCheckbox) {
            jiraCopyDropdownCheckbox.checked = this.currentSettings.jiraCopyDropdownEnabled;
            this.updateToggleSwitch('jira-copy-dropdown-enabled', this.currentSettings.jiraCopyDropdownEnabled);
        }

        if (jiraOmniboxCheckbox) {
            jiraOmniboxCheckbox.checked = true; // Always enabled due to Chrome limitation
            this.updateToggleSwitch('jira-omnibox-enabled', true);
            this.disableOmniboxToggle();
        }

        if (jiraStatusRelocatorCheckbox) {
            jiraStatusRelocatorCheckbox.checked = this.currentSettings.jiraStatusRelocatorEnabled;
            this.updateToggleSwitch('jira-status-relocator-enabled', this.currentSettings.jiraStatusRelocatorEnabled);
        }

        if (jiraDomainInput) {
            jiraDomainInput.value = this.currentSettings.jiraDomain || 'yourcompany';
        }

        // Update demo examples
        this.updateOmniboxDemoExamples();

        // Handle the Jira primary dependency logic
        this.handleJiraPrimaryChange(this.currentSettings.jiraCopyPrimaryEnabled);

        // Update keyboard shortcut input
        const keyboardShortcutInput = document.getElementById('keyboard-shortcut');
        if (keyboardShortcutInput) {
            keyboardShortcutInput.value = this.currentSettings.keyboardShortcut || '';
        }

        // Re-render Jira dropdown options
        this.renderDropdownOptions();

        // Update template preview
        this.updateTemplatePreview();

        // Re-render file list and usernames list
        this.renderFiles();
        this.renderUsernames();
    }

    renderFiles() {
        const filesList = document.getElementById('files-list');
        if (!filesList) return;

        filesList.innerHTML = '';

        const allFiles = SettingsManager.getAllFiles(this.currentSettings);

        allFiles.forEach(file => {
            const item = UIComponents.createFileItem(file, {
                onToggle: async (id, enabled) => {
                    await SettingsManager.toggleFileEnabled(id, enabled);
                    await this.loadSettings();
                    this.autoSave();
                },
                onEdit: async (id, currentName) => {
                    this.showEditFileModal(id, currentName);
                },
                onDelete: async (id) => {
                    await SettingsManager.removeFile(id);
                    await this.loadSettings();
                    this.renderFiles();
                    toast.success('File removed from hide list');
                }
            });
            filesList.appendChild(item);
        });
    }

    renderUsernames() {
        const usernamesList = document.getElementById('usernames-list');
        if (!usernamesList) return;

        usernamesList.innerHTML = '';

        const allUsernames = SettingsManager.getAllUsernames(this.currentSettings);

        allUsernames.forEach(username => {
            const item = UIComponents.createFileItem(username, {
                onToggle: async (id, enabled) => {
                    await SettingsManager.toggleUsernameEnabled(id, enabled);
                    await this.loadSettings();
                    this.autoSave();
                },
                onEdit: async (id, currentName) => {
                    this.showEditUsernameModal(id, currentName);
                },
                onDelete: async (id) => {
                    await SettingsManager.removeUsername(id);
                    await this.loadSettings();
                    this.renderUsernames();
                    toast.success('Username removed from filter list');
                }
            });
            usernamesList.appendChild(item);
        });
    }

    showAddFileModal() {
        UIComponents.createAddFileModal(async (fileName) => {
            const result = await SettingsManager.addFile(fileName);
            if (result.success) {
                await this.loadSettings();
                this.renderFiles();
                toast.success(`Added to hide list: ${fileName}`);
                return true;
            } else {
                toast.error(result.error);
                return false;
            }
        });
    }

    showEditFileModal(itemId, currentName) {
        UIComponents.createEditFileModal(currentName, async (newName) => {
            const result = await SettingsManager.editFile(itemId, newName);
            if (result.success) {
                await this.loadSettings();
                this.renderFiles();
                toast.success(`Updated: ${newName}`);
                return true;
            } else {
                toast.error(result.error);
                return false;
            }
        });
    }

    showAddUsernameModal() {
        UIComponents.createAddFileModal(async (username) => {
            const result = await SettingsManager.addUsername(username);
            if (result.success) {
                await this.loadSettings();
                this.renderUsernames();
                toast.success(`Added to filter list: ${username}`);
                return true;
            } else {
                toast.error(result.error);
                return false;
            }
        }, 'GitHub Username', 'Add GitHub Username', 'octocat, username123, dev-user', 'Examples:<br>• GitHub usernames: octocat, torvalds, gaearon<br>• Organization accounts: microsoft, google, facebook<br>• Bot accounts: dependabot, github-actions', 39);
    }

    showEditUsernameModal(itemId, currentName) {
        UIComponents.createEditFileModal(currentName, async (newName) => {
            const result = await SettingsManager.editUsername(itemId, newName);
            if (result.success) {
                await this.loadSettings();
                this.renderUsernames();
                toast.success(`Updated: ${newName}`);
                return true;
            } else {
                toast.error(result.error);
                return false;
            }
        }, 'GitHub Username', 'Edit GitHub Username', 'octocat, username123, dev-user', 'Examples:<br>• GitHub usernames: octocat, torvalds, gaearon<br>• Organization accounts: microsoft, google, facebook<br>• Bot accounts: dependabot, github-actions', 39);
    }

    async handleReset() {
        const confirmed = await CustomConfirm.show(
            'Are you sure you want to reset all settings to their default values?<br><br>• Restore all button titles to defaults<br>• Reset file filter list to defaults<br>• Reset username filter list to defaults<br>• Restore feature enable/disable states<br><br>This action cannot be undone.',
            'Reset to Defaults'
        );

        if (confirmed) {
            await this.resetToDefaults();
        }
    }

    async resetToDefaults() {
        try {
            const loadingToast = toast.saving();

            // Get fresh defaults
            this.currentSettings = { ...SettingsManager.defaults };

            // Update UI immediately
            this.updateUI();

            // Save the defaults
            const success = await SettingsManager.save(this.currentSettings);

            if (loadingToast) {
                toast.remove(loadingToast);
            }

            if (success) {
                toast.success('Settings reset to defaults');
                setTimeout(() => {
                    toast.info('All settings have been restored to their original values');
                }, 1000);
            } else {
                await this.loadSettings();
                this.updateUI();
                toast.error('Failed to reset settings');
            }
        } catch (error) {
            await this.loadSettings();
            this.updateUI();
            toast.error('Error resetting settings');
        }
    }

    autoSave() {
        if (!this.isInitialized) return;

        // Clear existing timeout
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        // Remove any existing saving toast
        if (this.savingToast) {
            toast.remove(this.savingToast);
            this.savingToast = null;
        }

        // Show saving toast
        this.savingToast = toast.saving();

        // Debounce auto-save by 800ms
        this.saveTimeout = setTimeout(async () => {
            try {
                const success = await SettingsManager.save({ ...this.currentSettings });
                
                if (this.savingToast) {
                    toast.remove(this.savingToast);
                    this.savingToast = null;
                }

                if (success) {
                    toast.success('Settings saved');
                } else {
                    toast.error('Failed to save settings');
                }
            } catch (error) {
                if (this.savingToast) {
                    toast.remove(this.savingToast);
                    this.savingToast = null;
                }
                toast.error('Error saving settings');
            }
        }, 800);
    }

    debouncedSave() {
        // Clear existing timeout
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        // Set new timeout - longer delay for text input (1.5 seconds)
        this.saveTimeout = setTimeout(() => {
            this.autoSave();
        }, 1500);
    }

    setupJiraSettings() {
        // Setup keyboard shortcut input
        const shortcutContainer = document.querySelector('.shortcut-input-container');
        if (shortcutContainer && window.UIComponents && window.KeyboardShortcutManager) {
            this.keyboardShortcutInput = UIComponents.createShortcutInput(
                shortcutContainer,
                this.currentSettings.keyboardShortcut || '',
                (shortcut) => {
                    this.currentSettings.keyboardShortcut = shortcut;
                    this.autoSave();
                }
            );
        }

        // Setup dropdown options
        this.renderDropdownOptions();
    }

    renderDropdownOptions() {
        const container = document.getElementById('dropdown-options-list');
        if (!container || !window.UIComponents) return;

        container.innerHTML = '';

        const dropdownOptions = this.currentSettings.dropdownOptions || [];

        dropdownOptions.forEach((option, index) => {
            const item = UIComponents.createDropdownItem(option, index, {
                onEdit: (idx) => this.editDropdownOption(idx),
                onToggle: (idx, enabled) => this.toggleDropdownOption(idx, enabled),
                onDelete: (idx) => this.deleteDropdownOption(idx)
                // Removed onReorder to prevent double callbacks - drag and drop handles this
            });
            container.appendChild(item);
        });

        // Setup drag and drop
        if (UIComponents.setupDragAndDrop) {
            UIComponents.setupDragAndDrop(container, (newOrder) => {
                this.reorderDropdownOptions(newOrder);
            });
        }
    }

    editDropdownOption(index) {
        const option = this.currentSettings.dropdownOptions[index];
        if (!option) return;

        // Initialize the template editor if not already done
        if (!this.templateEditor) {
            this.templateEditor = new TemplateEditor(this);
            this.templateEditor.setupEventListeners();
        }

        // Get modal elements
        const modal = document.getElementById('template-editor-modal');
        const modalTemplateInput = document.getElementById('modal-template-input');
        const modalButtonNameDisplay = document.getElementById('modal-button-name-display');

        if (!modal || !modalTemplateInput || !modalButtonNameDisplay) {
            toast.error('Template editor not available');
            return;
        }

        // Open modal with this dropdown option's data
        modal.classList.add('show');
        modalTemplateInput.value = option.template || '';
        modalButtonNameDisplay.textContent = option.text || 'Option';

        // Store the editing context
        modal.dataset.editingDropdownIndex = index;

        // Update the modal preview with the current template
        if (this.templateEditor && this.templateEditor.updateModalPreview) {
            this.templateEditor.updateModalPreview(option.template || '');
        }

        // Setup drag and drop for the modal
        if (this.templateEditor && this.templateEditor.setupDragAndDrop) {
            this.templateEditor.setupDragAndDrop();
        }
    }

    toggleDropdownOption(index, enabled) {
        if (this.currentSettings.dropdownOptions && this.currentSettings.dropdownOptions[index]) {
            this.currentSettings.dropdownOptions[index].enabled = enabled;
            this.autoSave();
        }
    }

    deleteDropdownOption(index) {
        if (this.currentSettings.dropdownOptions) {
            this.currentSettings.dropdownOptions.splice(index, 1);
            this.renderDropdownOptions();
            this.autoSave();
        }
    }

    addNewDropdownOption() {
        // Initialize the template editor if not already done
        if (!this.templateEditor) {
            this.templateEditor = new TemplateEditor(this);
            this.templateEditor.setupEventListeners();
        }

        // Open template editor modal for new dropdown option
        const modal = document.getElementById('template-editor-modal');
        const modalTemplateInput = document.getElementById('modal-template-input');
        const modalButtonNameDisplay = document.getElementById('modal-button-name-display');

        if (modal && modalTemplateInput && modalButtonNameDisplay) {
            modal.classList.add('show');

            // Set default values for new dropdown option
            modalTemplateInput.value = "{{ticket_id}}"; // Simple default template
            modalButtonNameDisplay.textContent = "New Option"; // Default name

            // Set flag to indicate we're adding a new option
            modal.dataset.addingNewDropdownOption = 'true';

            // Clear any existing editing context
            delete modal.dataset.editingDropdownIndex;

            // Update preview and setup drag & drop
            this.templateEditor.updateModalPreview(modalTemplateInput.value);
            this.templateEditor.setupDragAndDrop();
        }
    }

    reorderDropdownOptions(newOrder) {
        if (!this.currentSettings.dropdownOptions) return;

        const reorderedOptions = newOrder.map(oldIndex => this.currentSettings.dropdownOptions[oldIndex]);
        this.currentSettings.dropdownOptions = reorderedOptions;
        this.renderDropdownOptions();

        // Use debounced save to prevent multiple toast messages during drag operations
        this.debouncedSave();
    }

    updateCleanTimelineDependency(cleanTimelineEnabled) {
        const hideResolvedCommentsCheckbox = document.getElementById('comment-filter-hide-resolved-comments-checkbox');
        const hideResolvedCommentsToggleSwitch = document.getElementById('comment-filter-hide-resolved-comments');
        const hideResolvedCommentsToggleItem = hideResolvedCommentsToggleSwitch?.closest('.toggle-item');

        if (cleanTimelineEnabled) {
            // Auto-enable hideResolvedComments
            this.currentSettings.hideResolvedComments = true;
            if (hideResolvedCommentsCheckbox) {
                hideResolvedCommentsCheckbox.checked = true;
                this.updateToggleSwitch('comment-filter-hide-resolved-comments', true);
            }

            // Gray out the toggle using existing pattern
            if (hideResolvedCommentsToggleItem) {
                hideResolvedCommentsToggleItem.style.opacity = '0.5';
                hideResolvedCommentsToggleItem.style.pointerEvents = 'none';
            }

            this.showDependencyNotice();
        } else {
            // Re-enable the setting using existing pattern
            if (hideResolvedCommentsToggleItem) {
                hideResolvedCommentsToggleItem.style.opacity = '1';
                hideResolvedCommentsToggleItem.style.pointerEvents = 'auto';
            }

            this.hideDependencyNotice();
        }
    }

    showDependencyNotice() {
        // Check if notice already exists
        let notice = document.getElementById('clean-timeline-dependency-notice');
        if (notice) {
            notice.style.display = 'block';
            return;
        }

        const hideResolvedCommentsToggleSwitch = document.getElementById('comment-filter-hide-resolved-comments');
        const hideResolvedCommentsFormGroup = hideResolvedCommentsToggleSwitch?.closest('.form-group');
        if (!hideResolvedCommentsFormGroup) return;

        notice = document.createElement('div');
        notice.id = 'clean-timeline-dependency-notice';
        notice.className = 'dependency-notice';
        notice.style.cssText = 'margin-bottom: 16px; padding: 12px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; color: #856404;';
        notice.innerHTML = `<strong>Clean Timeline Dependency:</strong> This setting is automatically enabled because Clean Timeline is active. Disable Clean Timeline to toggle this setting.`;

        // Insert the notice at the beginning of the form group, before the toggle-item
        hideResolvedCommentsFormGroup.insertBefore(notice, hideResolvedCommentsFormGroup.firstChild);
    }

    hideDependencyNotice() {
        const notice = document.getElementById('clean-timeline-dependency-notice');
        if (notice) {
            notice.style.display = 'none';
        }
    }

    updateOmniboxDemoExamples() {
        const domain = this.currentSettings.jiraDomain || 'yourcompany';

        // Update domain demo
        const domainDemo = document.getElementById('domain-demo');
        if (domainDemo) {
            domainDemo.textContent = `https://${domain}.atlassian.net/browse/NC-3423`;
        }
    }

    disableOmniboxToggle() {
        const toggleItem = document.getElementById('jira-omnibox-toggle-item');
        if (toggleItem) {
            toggleItem.style.opacity = '0.5';
            toggleItem.style.pointerEvents = 'none';
        }
    }

    startLinkedInAccept() {
        // Store a flag to trigger auto-accept when the page loads
        chrome.storage.local.set({ triggerLinkedInAccept: true });

        // Open LinkedIn invitation manager received page in new tab
        chrome.tabs.create({
            url: 'https://www.linkedin.com/mynetwork/invitation-manager/received/',
            active: true
        });

        // Show notification
        console.log('Opening LinkedIn and starting acceptance...');
    }

    startLinkedInWithdrawal() {
        // Store a flag to trigger withdrawal when the page loads
        chrome.storage.local.set({ triggerLinkedInWithdrawal: true });

        // Open LinkedIn invitation manager in new tab
        chrome.tabs.create({
            url: 'https://www.linkedin.com/mynetwork/invitation-manager/sent/',
            active: true
        });

        // Show notification (assuming there's a notification system)
        console.log('Opening LinkedIn and starting withdrawal...');
    }

    startLinkedInConnect() {
        // Store a flag to trigger auto-connect when the page loads
        chrome.storage.local.set({ triggerLinkedInConnect: true });

        // Open LinkedIn MyNetwork grow page in new tab
        chrome.tabs.create({
            url: 'https://www.linkedin.com/mynetwork/grow/',
            active: true
        });

        // Show notification
        console.log('Opening LinkedIn and starting connections...');
    }
}

// Initialize the settings page controller
const settingsController = new SettingsPageController();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await settingsController.init();
});