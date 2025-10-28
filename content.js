// Missing Bits Extension - Content Script for GitHub productivity features

// Check if extension context is valid - use centralized method
function isExtensionContextValid() {
  return SettingsManager.isExtensionContextValid();
}

async function addCustomFilterButton() {
  try {
    const settings = await SettingsManager.load();
    await FileFilterManager.createFilterButton(settings);
  } catch (error) {
    // Silently fail if button creation fails
  }
}

// Scroll to top functionality
let scrollToTopInstance = null;

// Amplitude copy functionality
let amplitudeCopyInstance = null;

// Jira copy functionality
let jiraCopyInstance = null;

// GitHub Team copy functionality
let teamCopyInstance = null;

// LinkedIn request manager functionality
let linkedInOverlayInstance = null;

// LinkedIn connect functionality
let linkedInConnectInstance = null;

function shouldShowScrollToTopButton(settings) {
  // If everywhere is enabled, show on all GitHub pages
  if (settings.scrollToTopEverywhere) {
    return true;
  }

  // Otherwise check specific page types
  const currentPath = window.location.pathname;
  const isPRPage = currentPath.match(/\/pull\/\d+/);
  const isIssuePage = currentPath.match(/\/issues\/\d+/);

  if (isPRPage && settings.scrollToTopPR) {
    return true;
  }

  if (isIssuePage && settings.scrollToTopIssue) {
    return true;
  }

  return false;
}

async function createScrollToTopButton() {
  if (!scrollToTopInstance) {
    scrollToTopInstance = new ScrollToTop();
  }

  const settings = await SettingsManager.load();
  const position = settings.scrollToTopPosition || 'bottom-right';
  await scrollToTopInstance.createButton(position);
}

function removeScrollToTopButton() {
  if (scrollToTopInstance) {
    scrollToTopInstance.removeButton();
  }
}

async function addGitHubHelperButtons() {
  // Only add on PR pages that are not /files pages
  if (!window.location.pathname.match(/\/pull\/\d+\/?$/) &&
      !window.location.pathname.match(/\/pull\/\d+\/(?!files)/)) {
    return;
  }

  if (!isExtensionContextValid()) {
    return;
  }

  try {
    // Load settings
    const settings = await SettingsManager.load();

  // Check if at least one feature is enabled
  const shouldShowExpandButton = settings.expandAllEnabled && document.querySelectorAll('.ajax-pagination-form').length > 0;
  const shouldShowResolvedButton = settings.viewResolvedEnabled;
  const shouldShowCommentFilterButton = settings.commentFilterEnabled;

  if (!shouldShowExpandButton && !shouldShowResolvedButton && !shouldShowCommentFilterButton) {
    // Remove existing container if no features are enabled
    const existingContainer = document.getElementById('github-helper-buttons-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    return;
  }

  // Remove existing container first
  const existingContainer = document.getElementById('github-helper-buttons-container');
  if (existingContainer) {
    existingContainer.remove();
  }

  // Find the sidebar container
  let sidebarContainer = null;
  const sidebarSelectors = [
    '.Layout-sidebar',
    '[data-view-component="true"].Layout-sidebar',
    '.discussion-sidebar',
    '#partial-discussion-sidebar'
  ];

  for (const selector of sidebarSelectors) {
    sidebarContainer = document.querySelector(selector);
    if (sidebarContainer) break;
  }

  if (!sidebarContainer) {
    setTimeout(addGitHubHelperButtons, 2000);
    return;
  }

  // Create main container div
  const container = document.createElement('div');
  container.id = 'github-helper-buttons-container';
  container.style.marginTop = '16px';

  // Create form to hold all buttons
  const form = document.createElement('form');
  form.className = 'thread-subscribe-form';

  // Create expand conversations button (first)
  if (shouldShowExpandButton) {
    const expandButton = ButtonUtils.createButton({
      id: 'expand-all-comments-btn',
      label: settings.expandButtonTitle || 'Expand All Conversations',
      iconSvg: `
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-unfold">
          <path d="M8.177.677l2.896 2.896a.25.25 0 01-.177.427H8.75v1.25a.75.75 0 01-1.5 0V4H5.104a.25.25 0 01-.177-.427L7.823.677a.25.25 0 01.354 0zM7.25 10.75a.75.75 0 011.5 0V12h2.146a.25.25 0 01.177.427l-2.896 2.896a.25.25 0 01-.354 0l-2.896-2.896A.25.25 0 015.104 12H7.25v-1.25zm-5-2a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5zM6 8a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5A.75.75 0 016 8zm2.25.75a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5zM12 8a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5A.75.75 0 0112 8zm2.25.75a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5z"></path>
        </svg>
      `,
      onClick: async () => {
        if (!isExtensionContextValid()) {
          return;
        }
        const settings = await SettingsManager.load();
        await ConversationExpansion.handleExpandClick(expandButton, settings);
      },
      marginTop: '0'
    });

    form.appendChild(expandButton);
  }

  // Create resolved comments button (second)
  if (shouldShowResolvedButton) {
    const resolvedButton = ButtonUtils.createButton({
      id: 'view-resolved-comments-btn',
      label: settings.viewResolvedButtonTitle || 'Toggle Resolved Comments',
      iconSvg: `
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check-circle">
          <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042L6.25 10.81a.75.75 0 0 0 1.042-.018l3.75-3.75z"></path>
        </svg>
      `,
      onClick: (e) => {
        e.preventDefault();
        if (!isExtensionContextValid()) {
          return;
        }
        ResolvedComments.handleToggleClick(resolvedButton);
      },
      marginTop: shouldShowExpandButton ? '16px' : '0'
    });

    form.appendChild(resolvedButton);
  }

  // Create comment filter button (third)
  if (shouldShowCommentFilterButton) {
    const commentFilterButton = ButtonUtils.createButton({
      id: 'comment-filter-btn',
      label: settings.commentFilterButtonTitle || 'Filter Custom Comments',
      iconSvg: `
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-filter">
          <path d="M.75 3h14.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1 0-1.5ZM3 7.75a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75Zm3 4a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path>
        </svg>
      `,
      onClick: async (e) => {
        e.preventDefault();
        if (!isExtensionContextValid()) {
          return;
        }
        const settings = await SettingsManager.load();
        await CommentFilter.handleFilterToggle(commentFilterButton, settings);
      },
      marginTop: (shouldShowExpandButton || shouldShowResolvedButton) ? '16px' : '0'
    });

    form.appendChild(commentFilterButton);
  }


  // Assemble container
  container.appendChild(form);
  sidebarContainer.appendChild(container);

  // Make the buttons container sticky
  makeButtonsSticky(container);

  } catch (error) {
    // Silently fail if button creation fails
  }
}

function makeButtonsSticky(container) {
  // Add sticky styles for just the buttons container
  const stickyStyles = `
  #github-helper-buttons-container {
    position: sticky !important;
    top: 80px !important;
    z-index: 100 !important;
    background: #0d1117 !important; 
    border-radius: 6px !important;
    padding: 8px !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
    border: 1px solid #30363d !important;
  }`;

  // Check if styles are already injected
  if (!document.getElementById('github-buttons-sticky-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'github-buttons-sticky-styles';
    styleElement.textContent = stickyStyles;
    document.head.appendChild(styleElement);
  }
}

// Show a notification to the user about context invalidation
function showContextInvalidatedNotification() {
  // Only show if we're on a GitHub page
  if (!window.location.hostname.includes('github.com')) return;

  // Use centralized toast system if available
  if (window.toast) {
    window.toast.error('🔄 Extension reloaded. Please refresh the page to restore functionality.', 8000);
  }
}

// Global storage listener for changes
if (isExtensionContextValid()) {
  try {
    chrome.storage.onChanged.addListener(async (changes, namespace) => {
      if (namespace === 'sync' && isExtensionContextValid()) {
        // If file filter enabled state changed, add or remove button (only on files pages)
        if (changes.fileFilterEnabled) {
          if (changes.fileFilterEnabled.newValue && window.location.pathname.match(/\/pull\/\d+\/files/)) {
            addCustomFilterButton();
          } else {
            const existingOldButton = document.getElementById('custom-filter-button');
            const existingNewButton = document.getElementById('custom-filter-button-new');
            if (existingOldButton) existingOldButton.remove();
            if (existingNewButton) existingNewButton.remove();
          }
        }

        // If expand conversations enabled state changed, refresh buttons
        if (changes.expandAllEnabled) {
          addGitHubHelperButtons();
        }

        // If expand button title changed, update existing button
        if (changes.expandButtonTitle) {
          const existingButton = document.getElementById('expand-all-comments-btn');
          const buttonLabel = existingButton?.querySelector('.Button-label');
          if (existingButton && buttonLabel && existingButton.getAttribute('data-state') !== 'completed') {
            ButtonUtils.setButtonText(existingButton, changes.expandButtonTitle.newValue || 'Expand All Conversations');
          }
        }

        // If view resolved enabled state changed, refresh buttons
        if (changes.viewResolvedEnabled) {
          addGitHubHelperButtons();
        }

        // If view resolved button title changed, update existing button
        if (changes.viewResolvedButtonTitle) {
          const existingButton = document.getElementById('view-resolved-comments-btn');
          const buttonLabel = existingButton?.querySelector('.Button-label');
          if (existingButton && buttonLabel) {
            ButtonUtils.setButtonText(existingButton, changes.viewResolvedButtonTitle.newValue || 'Toggle Resolved Comments');
          }
        }

        // If comment filter enabled state changed, refresh buttons
        if (changes.commentFilterEnabled) {
          addGitHubHelperButtons();
        }

        // If comment filter button title changed, update existing button
        if (changes.commentFilterButtonTitle) {
          const existingButton = document.getElementById('comment-filter-btn');
          const buttonLabel = existingButton?.querySelector('.Button-label');
          if (existingButton && buttonLabel) {
            ButtonUtils.setButtonText(existingButton, changes.commentFilterButtonTitle.newValue || 'Filter Custom Comments');
          }
        }

        // If hide resolved comments setting changed, re-apply filter if currently active
        if (changes.hideResolvedComments || changes.cleanTimeline) {
          const existingButton = document.getElementById('comment-filter-btn');
          if (existingButton) {
            const hiddenComments = document.querySelectorAll('.js-timeline-item[hidden], turbo-frame[id*="review-thread"][hidden], turbo-frame[id*="comment-id"][hidden]');
            const isCurrentlyFiltering = hiddenComments.length > 0;

            // Only re-apply filter if it's currently active
            if (isCurrentlyFiltering) {
              const settings = await SettingsManager.load();
              CommentFilter.applyFilter(true, settings);
            }
          }
        }

        // If any scroll to top settings changed, re-evaluate visibility
        if (changes.scrollToTopEverywhere || changes.scrollToTopPR || changes.scrollToTopIssue) {
          const settings = await SettingsManager.load();
          const shouldShow = shouldShowScrollToTopButton(settings);

          if (shouldShow && !scrollToTopInstance) {
            scrollToTopInstance = new ScrollToTop();
            await scrollToTopInstance.createButton(settings.scrollToTopPosition || 'bottom-right');
          } else if (!shouldShow && scrollToTopInstance) {
            removeScrollToTopButton();
          }
        }

        // Initialize team copy feature if settings changed
        if (changes.teamCopyEnabled || changes.teamCopyButtonTitle || changes.teamCopyMode) {
          if (teamCopyInstance) {
            teamCopyInstance.updateButtonVisibility();
          }
        }

        // If scroll to top position changed, recreate the button with new position
        if (changes.scrollToTopPosition) {
          if (scrollToTopInstance) {
            const settings = await SettingsManager.load();
            const shouldShow = shouldShowScrollToTopButton(settings);
            if (shouldShow) {
              await scrollToTopInstance.updatePosition(settings.scrollToTopPosition || 'bottom-right');
            }
          }
        }

        // If files settings changed and filter is enabled, reapply filter
        if (changes.files) {
          try {
            const updatedSettings = await SettingsManager.load();
            const isCurrentlyFiltered = document.querySelectorAll('.file[hidden]').length > 0;
            if (isCurrentlyFiltered) {
              FileFilterManager.applyFilter(true, updatedSettings);
            }
          } catch (error) {
            // Silently fail if filter reapplication fails
          }
        }

        // If copy JSON enabled state changed, initialize or remove amplitude copy functionality
        if (changes.copyJsonEnabled) {
          if (changes.copyJsonEnabled.newValue) {
            if (!amplitudeCopyInstance) {
              amplitudeCopyInstance = new AmplitudeCopy();
            }
            await amplitudeCopyInstance.initialize();
          } else {
            // Cleanup amplitude copy functionality
            if (amplitudeCopyInstance) {
              amplitudeCopyInstance.cleanup();
            }
          }
        }

        // If Jira copy settings changed, refresh the button on Jira pages
        if (changes.jiraCopyPrimaryEnabled || changes.jiraCopyDropdownEnabled ||
            changes.keyboardShortcut || changes.copyIssueButtonTitle || changes.dropdownOptions) {
          if (window.location.hostname.includes('atlassian.net') && jiraCopyInstance) {
            // Refresh the button to reflect new settings
            jiraCopyInstance.refreshButton();
          }
        }

        // If Jira status relocator setting changed, initialize or cleanup relocator
        if (changes.jiraStatusRelocatorEnabled) {
          if (window.location.hostname.includes('atlassian.net') && jiraCopyInstance) {
            if (changes.jiraStatusRelocatorEnabled.newValue) {
              // Initialize status relocator if enabled
              if (!jiraCopyInstance.statusRelocator) {
                jiraCopyInstance.statusRelocator = new JiraStatusRelocator();
                jiraCopyInstance.statusRelocator.initialize();
              }
            } else {
              // Cleanup status relocator if disabled
              if (jiraCopyInstance.statusRelocator) {
                jiraCopyInstance.statusRelocator.cleanup();
                jiraCopyInstance.statusRelocator = null;
              }
            }
          }
        }

        // If LinkedIn settings changed, update button visibility and text
        if (changes.linkedinAutoAcceptEnabled || changes.linkedinAutoWithdrawEnabled) {
          if (window.location.hostname.includes('linkedin.com') && linkedInOverlayInstance) {
            // Update button visibility (requires full button recreation)
            await linkedInOverlayInstance.handlePageUpdate();
          }
        }

        // If only withdraw count changed, just update button text
        if (changes.linkedinWithdrawCount && !changes.linkedinAutoAcceptEnabled && !changes.linkedinAutoWithdrawEnabled) {
          if (window.location.hostname.includes('linkedin.com') && linkedInOverlayInstance) {
            // Just update button text without recreating
            await linkedInOverlayInstance.updateButtonText();
          }
        }

        // If LinkedIn connect settings changed, update button visibility
        if (changes.linkedinAutoConnectEnabled) {
          if (window.location.hostname.includes('linkedin.com') && linkedInConnectInstance) {
            await linkedInConnectInstance.handlePageUpdate();
          }
        }
      }
    });
  } catch (error) {
    // Silently fail if storage listener setup fails
  }
}

// Initialize when page loads
async function initializeGitHubHelper() {
  // Only initialize if extension context is valid
  if (isExtensionContextValid()) {
    addCustomFilterButton();
    addGitHubHelperButtons();

    // Initialize scroll to top feature based on new toggle logic
    const settings = await SettingsManager.load();
    const shouldShowScrollToTop = shouldShowScrollToTopButton(settings);

    if (shouldShowScrollToTop) {
      if (!scrollToTopInstance) {
        scrollToTopInstance = new ScrollToTop();
      }
      await scrollToTopInstance.createButton(settings.scrollToTopPosition || 'bottom-right');
    }

    // Initialize Amplitude copy functionality if enabled
    if (settings.copyJsonEnabled) {
      if (!amplitudeCopyInstance) {
        amplitudeCopyInstance = new AmplitudeCopy();
      }
      await amplitudeCopyInstance.initialize();
    }

    // Initialize Jira copy functionality on Jira pages
    if (window.location.hostname.includes('atlassian.net')) {
      if (!jiraCopyInstance) {
        jiraCopyInstance = new JiraCopy();
      }
      await jiraCopyInstance.initialize();
    }

    // Initialize GitHub Team copy functionality on GitHub pages
    if (window.location.hostname.includes('github.com')) {
      if (!teamCopyInstance) {
        teamCopyInstance = new GitHubTeamCopy();
        await teamCopyInstance.initialize();
      } else {
        // Handle page navigation updates
        teamCopyInstance.handlePageUpdate();
      }
    }

    // Initialize LinkedIn request manager functionality on LinkedIn pages
    if (window.location.hostname.includes('linkedin.com')) {
      if (!linkedInOverlayInstance) {
        linkedInOverlayInstance = new LinkedInRequestManager();
        await linkedInOverlayInstance.initialize();
      } else {
        // Handle page navigation updates
        linkedInOverlayInstance.handlePageUpdate();
      }

      // Initialize LinkedIn connect functionality
      if (!linkedInConnectInstance) {
        linkedInConnectInstance = new LinkedInConnect();
        await linkedInConnectInstance.initialize();
      } else {
        // Handle page navigation updates
        linkedInConnectInstance.handlePageUpdate();
      }
    }
  } else {
    showContextInvalidatedNotification();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGitHubHelper);
} else {
  initializeGitHubHelper();
}

// Also run when navigating via GitHub's AJAX navigation
document.addEventListener('pjax:end', initializeGitHubHelper);
document.addEventListener('turbo:load', initializeGitHubHelper);