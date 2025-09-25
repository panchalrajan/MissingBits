// Jira Issue Class - Template-based copy operations
class JiraIssue {
    constructor(key, summary, url) {
        this.key = key;
        this.summary = summary;
        this.url = url;
        this.copyOps = new CopyOperations(this);
    }

    format(template) {
        const replacements = {
            "<key>": this.key,
            "<title>": this.summary,
            "<url>": this.url,
        };

        let formattedText = template;
        formattedText = formattedText.replace(
            /<\w+>/g,
            (key) => replacements[key] || key
        );

        return formattedText;
    }

    // Main copy operation
    async copyToClipboard() {
        return this.copyOps.copyToClipboard();
    }
}
window.JiraIssue = JiraIssue;
