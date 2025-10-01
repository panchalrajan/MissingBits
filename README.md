# Missing Bits

> All-in-one productivity toolkit for GitHub, Jira, and Amplitude - streamlining your development workflow

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue)](https://chromewebstore.google.com/detail/missing-bits/aoamccioffindnejoppjmiboeicigaif)
[![Version](https://img.shields.io/badge/version-1.4.0-green)](#changelog)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE.md)

## 🚀 Features

### GitHub Integration
- **🎯 Custom File Filter**: Hide specific file types (`.resolved`, `.lock`, `Package.swift`, etc.) from pull request views
- **💬 Comment Management**: Filter and hide resolved comments with customizable buttons
- **📈 Conversation Expansion**: Expand all conversations in pull requests and issues
- **⬆️ Scroll to Top**: Quick navigation button for long pages
- **🌙 Timeline Cleaner**: Hide resolved comments and clean up PR timelines
- **👥 Team Copy**: Copy team member names with one click from GitHub team pages

### Jira Integration
- **📋 Smart Copy**: Copy issue details with customizable templates
- **🚀 Quick Navigation**: Type `j + TAB` in address bar to quickly navigate to Jira tickets *(Chrome only)*
- **🎯 Status Button Relocator**: Move ticket status button from sidebar to toolbar for easier access
- **🔗 Quick Actions**: Streamlined workflow for issue management
- **📊 Data Extraction**: Extract and format issue information

### Amplitude Integration
- **📊 Data Copy**: Copy analytics data and insights

## 📦 Installation

### 🍎 Safari (macOS)
1. Download the Safari version from [GitHub Releases](https://github.com/panchalrajan/MissingBits/releases)
2. Extract the ZIP file and double-click the `.app` file
3. Open Safari → Preferences → Extensions
4. Enable "Missing Bits" extension

### 🌐 Chrome/Firefox
#### From Chrome Web Store
1. Visit the [Chrome Web Store](https://chromewebstore.google.com/detail/missing-bits/aoamccioffindnejoppjmiboeicigaif)
2. Click "Add to Chrome"
3. Grant necessary permissions

#### Manual Installation
1. Download the Chrome version from [GitHub Releases](https://github.com/panchalrajan/MissingBits/releases)
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the downloaded folder

## 🔧 Configuration

### Accessing Settings
- Click the Missing Bits icon in your browser toolbar
- Or right-click the extension icon and select "Options"

### File Filter Settings
Configure which files to hide in GitHub pull requests:

- **Extension Filters**: `.resolved`, `.lock`, `.xcworkspace`, etc.
- **Filename Filters**: `Package.swift`, `Podfile`, `Cartfile`, etc.
- **Custom Patterns**: Add your own file patterns

### Comment Filter Settings
- **Button Text**: Customize the filter button label
- **Hide Resolved**: Automatically hide resolved comments
- **Timeline Cleaning**: Clean up PR conversation timelines

### Scroll to Top Settings
- **Enable on PRs**: Show scroll button on pull request pages
- **Enable on Issues**: Show scroll button on issue pages
- **Enable Everywhere**: Show scroll button on all GitHub pages

### Team Copy Settings
- **Button Visibility**: Toggle the copy team members button on GitHub team pages
- **Button Title**: Customize the button text (default: "Copy Members Names")
- **Copy Mode**: Choose between "Display Name and Username" or "Username Only" format

## 🎮 Usage

### GitHub File Filtering
1. Navigate to any GitHub pull request files tab
2. Look for the "Use custom filter" button in the toolbar
3. Click to toggle file filtering on/off
4. Filtered files will be hidden from both main view and sidebar

### Comment Management
1. Open any GitHub pull request or issue
2. Use the comment filter buttons to manage conversations
3. Expand all conversations with one click
4. Hide resolved comments to focus on active discussions

### GitHub Team Copy
1. Navigate to any GitHub organization team page (e.g., `/orgs/myorg/teams/myteam`)
2. Look for the "Copy Members Names" button on the team page
3. Click to copy team name and member list to clipboard
4. Choose copy format in settings: "Display Name and Username" or "Username Only"

<!-- Jira Quick Navigation Section -->
### Jira Integration
1. Navigate to any Jira issue
2. Use the copy buttons to extract issue information
3. Customize templates in settings for your workflow
4. **Quick Navigation** *(Chrome only)*: Type `j + TAB` in browser address bar, then enter ticket number
5. **Status Button Relocator**: Enable in settings to move status button from sidebar to toolbar (restores old Jira behavior)

### Amplitude Analytics
1. Navigate to Amplitude dashboards
2. Use copy/export features for data analysis
3. Quick access to formatted analytics data

## 🏗️ Architecture

### Platform Integrations
- **GitHub Module**: PR/Issue enhancements and file filtering
- **Jira Module**: Issue management and data extraction
- **Amplitude Module**: Analytics data handling

### Cross-Platform Support
- **🍎 Safari Extension**: Native macOS Safari support
- **🌐 Chrome/Firefox**: Cross-browser compatibility
- **🤖 Automated Builds**: GitHub Actions creates both versions

## 🛠️ Development

### Setup
```bash
git clone https://github.com/panchalrajan/MissingBits.git
cd missing-bits
```

### Project Structure
```
missing-bits/
├── src/
│   ├── core/           # Core utilities and managers
│   ├── platforms/      # Platform-specific integrations
│   │   ├── github/     # GitHub enhancements
│   │   ├── jira/       # Jira integrations
│   │   └── amplitude/  # Amplitude features
│   ├── shared/         # Shared components
│   └── styles/         # CSS styles
├── pages/              # Extension pages (settings, etc.)
│   └── components/     # UI components for settings
├── icons/              # Extension icons
├── manifest.json       # Extension manifest
└── content.js          # Main content script
```

### Building
The extension is built using vanilla JavaScript with no build process required.

### Testing
1. Load the extension in Chrome developer mode
2. Test on GitHub pull requests, Jira issues, and Amplitude dashboards
3. Verify settings persistence and cross-tab functionality

## 🤝 Contributing

We welcome contributions! Please see our Contributing Guide for details.

### Development Guidelines
1. Follow existing code style and patterns
2. Test thoroughly on target platforms
3. Update documentation for new features
4. Ensure backward compatibility

### Submitting Changes
1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Submit a pull request with detailed description

## 📋 Changelog

See [CHANGELOG.md](Changelog.md) for detailed version history.

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/panchalrajan/MissingBits/issues)

## 🔒 Privacy

Missing Bits respects your privacy:
- **No Data Collection**: We don't collect any personal data
- **Local Storage Only**: Settings are stored locally in your browser
- **No External Requests**: All processing happens locally
- **Open Source**: Full transparency with public code

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Thanks to the GitHub, Jira, and Amplitude teams for their platforms
- Community contributors and testers
- Open source libraries and tools used

## 🔗 Links

- [Chrome Web Store](https://chromewebstore.google.com/detail/missing-bits/aoamccioffindnejoppjmiboeicigaif) 
- [GitHub Repository](https://github.com/panchalrajan/MissingBits)
- [~~Documentation~~](https://github.com/panchalrajan/MissingBits/wiki) [Coming Soon]
- [Issues](https://github.com/panchalrajan/MissingBits/issues)

---

Made with ❤️ for developers who want to streamline their workflow across GitHub, Jira, and Amplitude.
