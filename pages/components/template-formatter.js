// Template Formatting Utilities
class TemplateFormatter {
    static hasFormatOptions(variableName) {
        const variablesWithFormats = [
            'ticket_id', 'ticket_title', 'ticket_type',
            'reporter_name', 'assignee_name', 'priority', 'status'
        ];
        return variablesWithFormats.includes(variableName);
    }

    static getFormatOptionsFor(variableName) {
        const formatMaps = {
            ticket_id: [
                { key: 'default', label: 'JRA-456', example: 'JRA-456 (default)' },
                { key: 'lower', label: 'jra-456', example: 'jra-456' },
                { key: 'underscore', label: 'jra_456', example: 'jra_456' }
            ],
            ticket_title: [
                { key: 'default', label: '[iOS] Implement advanced search filters', example: '[iOS] Implement advanced search filters (default)' },
                { key: 'lower', label: '[ios] implement advanced search filters', example: '[ios] implement advanced search filters' },
                { key: 'clean', label: 'iOS Implement advanced search filters', example: 'iOS Implement advanced search filters (no special chars)' },
                { key: 'clean_lower', label: 'ios implement advanced search filters', example: 'ios implement advanced search filters (no special chars)' },
                { key: 'underscore', label: 'ios_implement_advanced_search_filters', example: 'ios_implement_advanced_search_filters' },
                { key: 'dash', label: 'ios-implement-advanced-search-filters', example: 'ios-implement-advanced-search-filters' }
            ],
            reporter_name: [
                { key: 'default', label: 'Sarah Wilson', example: 'Sarah Wilson (default)' },
                { key: 'lower', label: 'sarah wilson', example: 'sarah wilson' },
                { key: 'dash', label: 'sarah-wilson', example: 'sarah-wilson' },
                { key: 'underscore', label: 'sarah_wilson', example: 'sarah_wilson' },
                { key: 'first', label: 'Sarah', example: 'Sarah (first name only)' },
                { key: 'first_lower', label: 'sarah', example: 'sarah (first name only, lowercase)' }
            ],
            assignee_name: [
                { key: 'default', label: 'Alex Chen', example: 'Alex Chen (default)' },
                { key: 'lower', label: 'alex chen', example: 'alex chen' },
                { key: 'dash', label: 'alex-chen', example: 'alex-chen' },
                { key: 'underscore', label: 'alex_chen', example: 'alex_chen' },
                { key: 'first', label: 'Alex', example: 'Alex (first name only)' },
                { key: 'first_lower', label: 'alex', example: 'alex (first name only, lowercase)' }
            ],
            priority: [
                { key: 'default', label: 'High', example: 'High (default)' },
                { key: 'lower', label: 'high', example: 'high' },
                { key: 'dash', label: 'high', example: 'high (single word)' },
                { key: 'underscore', label: 'high', example: 'high (single word)' }
            ],
            ticket_type: [
                { key: 'default', label: 'Task', example: 'Task (default)' },
                { key: 'lower', label: 'task', example: 'task' },
                { key: 'dash', label: 'task', example: 'task (single word)' },
                { key: 'underscore', label: 'task', example: 'task (single word)' }
            ],
            status: [
                { key: 'default', label: 'Done', example: 'Done (default)' },
                { key: 'lower', label: 'done', example: 'done' },
                { key: 'dash', label: 'done', example: 'done (single word)' },
                { key: 'underscore', label: 'done', example: 'done (single word)' }
            ]
        };

        return formatMaps[variableName] || [];
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