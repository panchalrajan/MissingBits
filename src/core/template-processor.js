// Template Processing for Jira Issues
class TemplateProcessor {
    static async gatherTemplateData(jiraIssue) {
        return {
            ticket_id: jiraIssue.key,
            ticket_title: jiraIssue.summary,
            ticket_url: jiraIssue.url,
            ticket_type: JiraDataExtractor.extractTicketType() || 'Unknown',
            reporter_name: JiraDataExtractor.extractReporter() || 'Unknown',
            assignee_name: JiraDataExtractor.extractAssignee() || 'Unassigned',
            priority: JiraDataExtractor.extractPriority() || 'Unknown',
            status: JiraDataExtractor.extractStatus() || 'Unknown',
            // For hyperlinks (HTML format for Slack, etc.)
            hyperlink_start: `<a href="${jiraIssue.url}">`,
            hyperlink_end: '</a>',
            // For markdown format
            markdown_start: '[',
            markdown_end: `](${jiraIssue.url})`
        };
    }

    static renderCustomTemplate(template, data) {
        let result = template;

        // Replace formatted variables first (e.g., {{ticket_id:lower}})
        result = result.replace(/\{\{(\w+):(\w+)\}\}/g, (match, variable, format) => {
            const value = data[variable];
            if (value) {
                return this.applyFormat(value, format);
            }
            return match;
        });

        // Replace regular variables (e.g., {{ticket_id}})
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            result = result.replace(regex, data[key]);
        });

        return result;
    }

    static applyFormat(value, format) {
        switch (format) {
            case 'default':
                return value;
            case 'lower':
                return value.toLowerCase();
            case 'underscore':
                return value.toLowerCase().replace(/[\s-]/g, '_').replace(/[^\w_]/g, '');
            case 'dash':
                return value.toLowerCase().replace(/[\s_]/g, '-').replace(/[^\w-]/g, '');
            case 'clean':
                return value.replace(/[^\w\s]/g, '');
            case 'clean_lower':
                return value.replace(/[^\w\s]/g, '').toLowerCase();
            case 'first':
                return value.split(' ')[0];
            case 'first_lower':
                return value.split(' ')[0].toLowerCase();
            default:
                return value;
        }
    }
}
window.TemplateProcessor = TemplateProcessor;
