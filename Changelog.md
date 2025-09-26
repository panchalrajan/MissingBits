# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-09-26

### ✨ **New Features**
- **🍎 Safari Extension Support**: Extension now works on Safari (macOS) in addition to Chrome/Firefox
- **🤖 Automated Safari Builds**: GitHub workflow automatically creates both Chrome and Safari versions

### 🔧 **Major Refactoring**
- **🎨 UI Components**: Centralized UI component system for better maintainability
- **🧩 Base Manager Classes**: Common functionality abstracted into reusable base classes
- **⚡ Better Performance**: Extension now loads faster and uses less memory
- **🧹 Cleaner Code**: Removed duplicate code and CSS-in-JS patterns for easier maintenance

## [1.0.0] - 2025-09-25

### Added

#### GitHub Integration
- **Custom File Filter**: Hide specific file types (`.resolved`, `.lock`, `Package.swift`, etc.) from pull request views
- **Comment Management**: Filter and hide resolved comments with customizable buttons
- **Conversation Expansion**: One-click expand all conversations in PRs and issues
- **Scroll to Top**: Quick navigation button for long GitHub pages
- **Timeline Cleaner**: Hide resolved comments for cleaner PR timelines

#### Jira Integration
- **Smart Copy**: Extract and copy Jira issue data with customizable templates
- **Quick Actions**: Streamlined workflow for issue management

#### Amplitude Integration
- **Data Copy**: Copy analytics data and insights
- **Quick Export**: Export amplitude data in various formats

#### Core Features
- **Settings Management**: Persistent configuration across browser sessions
- **Cross-Platform Support**: Works on GitHub, Jira, and Amplitude
- **Privacy Focused**: No data collection, all processing happens locally
