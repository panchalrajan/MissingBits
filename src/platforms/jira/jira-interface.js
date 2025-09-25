// Jira Interface Module - Handles Jira-specific DOM interactions
class JiraInterface {
    static get isJiraPage() {
        return document.querySelector("meta[name=application-name]")?.getAttribute("data-name") === "jira";
    }

    static get issue() {
        const issueKey = document.querySelector(
            "div[data-testid='issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container'] li>a>span"
        )?.textContent || "";
        
        const issueSummary = document.querySelector(
            "h1[data-testid='issue.views.issue-base.foundation.summary.heading']"
        )?.textContent || "";
        
        const issueUrl = document.querySelector(
            "div[data-testid='issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container'] li>a"
        )?.href || "";

        return issueKey ? new JiraIssue(issueKey, issueSummary, issueUrl) : null;
    }

    static get buttonContainer() {
        // Find the container with the Add/Create and Apps buttons using testids
        const addButton = document.querySelector('[data-testid="issue-view-foundation.quick-add.quick-add-items-compact.add-button-dropdown--trigger"]');
        const appsButton = document.querySelector('[data-testid="issue-view-foundation.quick-add.quick-add-items-compact.apps-button-dropdown--trigger"]');
        
        if (addButton && appsButton) {
            // Find their common parent container
            let container = addButton.parentElement;
            while (container && !container.contains(appsButton)) {
                container = container.parentElement;
            }
            return container;
        }
        
        // Fallback to action buttons container area if buttons not found
        return document.querySelector('[data-testid="issue-restrictions.common.ui.issue-restriction-icon.button-with-analytics"]')?.parentElement?.parentElement?.parentElement;
    }

    static createSplitButton(id, text, mainAction, dropdownOptions) {
        // Create wrapper container
        const wrapper = document.createElement("div");
        wrapper.className = "aui-buttons";
        wrapper.id = id;
        
        // Create main button
        const mainButton = document.createElement("button");
        mainButton.type = "button";
        mainButton.setAttribute("aria-label", `Copy ${text || "issue"} to clipboard`);
        
        // Check if we have dropdown options
        const hasDropdownOptions = dropdownOptions && dropdownOptions.length > 0;
        
        if (hasDropdownOptions) {
            // Split button style with dropdown
            mainButton.className = "aui-button split-main-button";
        } else {
            // Single button style without dropdown
            mainButton.className = "aui-button";
        }
        
        // Create AUI copy icon
        const icon = document.createElement("span");
        icon.className = "aui-icon aui-icon-small aui-iconfont-copy-clipboard";
        icon.setAttribute("aria-hidden", "true");
        mainButton.appendChild(icon);
        
        // Add text if provided
        if (text) {
            mainButton.appendChild(document.createTextNode(" " + text));
        }
        
        mainButton.addEventListener("click", mainAction);
        
        // Add main button to wrapper
        wrapper.appendChild(mainButton);
        
        // Only create dropdown elements if we have options
        if (hasDropdownOptions) {
            // Create dropdown trigger button
            const dropdownButton = document.createElement("button");
            dropdownButton.type = "button";
            dropdownButton.className = "aui-button aui-dropdown2-trigger aui-button-split-more";
            dropdownButton.setAttribute("aria-controls", `${id}-dropdown`);
            dropdownButton.setAttribute("aria-haspopup", "true");
            
            // Create dropdown arrow icon
            const arrowIcon = document.createElement("span");
            arrowIcon.className = "aui-icon aui-icon-small aui-iconfont-chevron-down";
            arrowIcon.setAttribute("aria-hidden", "true");
            dropdownButton.appendChild(arrowIcon);
            
            // Create dropdown menu
            const dropdownMenu = this.createDropdownMenu(`${id}-dropdown`, dropdownOptions);
            
            // Add dropdown elements to wrapper
            wrapper.appendChild(dropdownButton);
            wrapper.appendChild(dropdownMenu);
        }
        
        return wrapper;
    }

    static createDropdownMenu(id, options) {
        const menu = document.createElement("aui-dropdown-menu");
        menu.id = id;
        menu.style.display = "none";
        
        const section = document.createElement("aui-section");
        section.setAttribute("label", "Copy Options");
        
        options.forEach(option => {
            const item = document.createElement("aui-item-link");
            item.setAttribute("href", "#");
            item.textContent = option.text;
            item.addEventListener("click", (e) => {
                e.preventDefault();
                option.action();
                menu.style.display = "none";
            });
            section.appendChild(item);
        });
        
        menu.appendChild(section);
        return menu;
    }

    static setupNotifications(copyAction) {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("jira-notifications.js");
        document.body.appendChild(script);

        chrome.runtime.onMessage.addListener((request) => {
            if (request.message === "jira_copy_to_clipboard") {
                copyAction();
            }
        });
    }
}
window.JiraInterface = JiraInterface;
