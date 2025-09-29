// Background script for Missing Bits Extension

// Open settings page on extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

// Open settings page when extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// Omnibox functionality for quick Jira navigation
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  // Simple suggestions based on input
  const suggestions = [];

  if (text.match(/^[A-Z]{2,}-\d+$/)) {
    suggestions.push({
      content: `jira:${text}`,
      description: `Open Jira ticket: <match>${text}</match>`
    });
  } else if (text.match(/^\d+$/)) {
    suggestions.push({
      content: `jira:PROJ-${text}`,
      description: `Open Jira ticket: <match>PROJ-${text}</match> (assuming PROJ prefix)`
    });
  } else if (text.length > 0) {
    suggestions.push({
      content: `search:${text}`,
      description: `Search for: <match>${text}</match>`
    });
  }

  suggest(suggestions);
});

chrome.omnibox.onInputEntered.addListener(async (text, disposition) => {
  try {
    // Load settings to get Jira configuration
    const settings = await chrome.storage.sync.get(['jiraDomain', 'jiraDefaultProject']);

    const domain = settings.jiraDomain || 'yourcompany';
    const defaultProject = settings.jiraDefaultProject || 'PROJ';

    let url = '';

    if (text.startsWith('jira:')) {
      // Handle Jira ticket navigation
      const ticketId = text.replace('jira:', '');
      url = `https://${domain}.atlassian.net/browse/${ticketId}`;
    } else if (text.match(/^[A-Z]{2,}-\d+$/)) {
      // Direct Jira ticket format
      url = `https://${domain}.atlassian.net/browse/${text}`;
    } else if (text.match(/^\d+$/)) {
      // Just a number, use default project
      url = `https://${domain}.atlassian.net/browse/${defaultProject}-${text}`;
    } else if (text.startsWith('search:')) {
      // Search functionality
      const query = text.replace('search:', '');
      url = `https://${domain}.atlassian.net/secure/QuickSearch.jspa?searchString=${encodeURIComponent(query)}`;
    } else {
      // Default to Jira search
      url = `https://${domain}.atlassian.net/secure/QuickSearch.jspa?searchString=${encodeURIComponent(text)}`;
    }

    // Navigate based on disposition
    if (disposition === 'currentTab') {
      chrome.tabs.update({ url });
    } else if (disposition === 'newForegroundTab') {
      chrome.tabs.create({ url });
    } else if (disposition === 'newBackgroundTab') {
      chrome.tabs.create({ url, active: false });
    }
  } catch (error) {
    console.error('Omnibox navigation error:', error);
  }
});