// Template Rendering Utilities
class TemplateRenderer {
    static getSampleData() {
        return {
            ticket_id: 'JRA-456',
            ticket_title: '[iOS] Implement advanced search filters',
            ticket_url: 'https://company.atlassian.net/browse/JRA-456',
            ticket_type: 'Task',
            reporter_name: 'Sarah Wilson',
            assignee_name: 'Alex Chen',
            priority: 'High',
            status: 'Done',
            // For hyperlinks (HTML format for Slack, etc.)
            hyperlink_start: '<a href="https://company.atlassian.net/browse/JRA-456">',
            hyperlink_end: '</a>',
            // For markdown format
            markdown_start: '[',
            markdown_end: '](https://company.atlassian.net/browse/JRA-456)'
        };
    }

    static render(template) {
        const sampleData = this.getSampleData();
        let result = template;

        // Replace formatted variables first (e.g., {{ticket_id:lower}})
        result = result.replace(/\{\{(\w+):(\w+)\}\}/g, (match, variable, format) => {
            const value = sampleData[variable];
            if (value) {
                return TemplateFormatter.applyFormat(value, format);
            }
            return match;
        });

        // Replace regular variables (e.g., {{ticket_id}})
        Object.keys(sampleData).forEach(key => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            result = result.replace(regex, sampleData[key]);
        });

        return result || 'Empty template';
    }

    static renderAsHtml(template) {
        // Only render if template contains HTML elements
        if (!this.hasHtmlElements(template)) return '';

        const sampleData = this.getSampleData();
        let result = template;

        // Replace formatted variables first
        result = result.replace(/\{\{(\w+):(\w+)\}\}/g, (match, variable, format) => {
            const value = sampleData[variable];
            if (value) {
                return TemplateFormatter.applyFormat(value, format);
            }
            return match;
        });

        // Replace regular variables
        Object.keys(sampleData).forEach(key => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            result = result.replace(regex, sampleData[key]);
        });

        return result || 'Empty template';
    }

    static renderAsMarkdown(template) {
        // Only render if template contains markdown elements
        if (!this.hasMarkdownElements(template)) return '';

        const sampleData = this.getSampleData();
        let result = template;

        // Replace formatted variables first
        result = result.replace(/\{\{(\w+):(\w+)\}\}/g, (match, variable, format) => {
            const value = sampleData[variable];
            if (value) {
                return TemplateFormatter.applyFormat(value, format);
            }
            return match;
        });

        // Replace regular variables
        Object.keys(sampleData).forEach(key => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            result = result.replace(regex, sampleData[key]);
        });

        return result || 'Empty template';
    }

    static hasHtmlElements(template) {
        return template.includes('{{hyperlink_start}}') || template.includes('{{hyperlink_end}}');
    }

    static hasMarkdownElements(template) {
        return template.includes('{{markdown_start}}') || template.includes('{{markdown_end}}');
    }

    static convertMarkdownToHtml(markdownText) {
        // Simple markdown to HTML converter for links
        // Pattern: [text](url) -> <a href="url">text</a>
        return markdownText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    }
}