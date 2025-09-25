# Future Scope and Refactoring Opportunities

This document outlines potential improvements and refactoring opportunities for the Missing Bits extension. The goal is to improve code quality, reduce duplication, and make the extension more maintainable, scalable, and performant.

## Critical Priority (Foundational)

-   **Introduce a Build Process (e.g., Webpack/Rollup)**:
    -   **Problem**: The extension currently loads many individual JavaScript files as content scripts, leading to inefficient loading, global scope pollution, and preventing the use of modern JavaScript module features (ESM). This is a major performance bottleneck and architectural limitation.
    -   **Solution**:
        -   Implement a build tool (like Webpack or Rollup) to bundle all JavaScript modules into optimized, single files for content scripts and background scripts.
        -   Configure build scripts for development (`watch`) and production.
        -   Update `manifest.json` to reference the bundled output files.
    -   **Impact**: Enables true ES module imports/exports, reduces HTTP requests, allows for minification/uglification, and sets the stage for all subsequent refactoring.

-   **Standardize Module Definitions (ES Modules)**:
    -   **Problem**: Inconsistent use of `module.exports` and conditional `window` assignments for module definitions. This is a legacy pattern that hinders static analysis and modern tooling.
    -   **Solution**:
        -   Once a build process is in place, refactor all JavaScript files to exclusively use ES module `import` and `export` syntax.
        -   Remove all `if (typeof module !== 'undefined' && module.exports)` blocks.
    -   **Impact**: Improves code readability, maintainability, and enables tree-shaking for smaller bundle sizes.

## High Priority (Architectural & Maintainability)

-   **Centralize Settings Management**:
    -   **Problem**: Settings are loaded in multiple places (`content.js`, `conversation-expansion.js`, `SettingsManager.js`), leading to redundant `chrome.storage.sync.get` calls, potential inconsistencies, and tight coupling.
    -   **Solution**:
        -   Refactor `SettingsManager` to be the *single source of truth* for loading and saving settings.
        -   All other modules should `import SettingsManager` and use its methods (`SettingsManager.load()`, `SettingsManager.save()`) to interact with settings.
        -   Remove direct `chrome.storage.sync.get` calls from `content.js` and `conversation-expansion.js`.
        -   Implement a publish-subscribe pattern within `SettingsManager` so modules can subscribe to settings changes without constantly re-loading.
    -   **Impact**: Reduces boilerplate, ensures data consistency, improves performance by reducing storage access, and decouples features from direct storage interaction.

-   **Centralize DOM Selectors**:
    -   **Problem**: Hardcoded DOM selectors are scattered across many files (e.g., `content.js`, `FileFilter`, `CommentFilter`, `AmplitudeCopy`, `JiraInterface`), making the extension extremely brittle to UI changes in target applications (GitHub, Jira, Amplitude).
    -   **Solution**:
        -   Create a `selectors.js` module.
        -   Define all frequently used DOM selectors as constants within this module, organized by application (GitHub, Jira, Amplitude) and feature.
        -   Replace all hardcoded selectors in other files with imports from `selectors.js`.
    -   **Impact**: Greatly improves maintainability, makes the extension more resilient to UI changes, and simplifies debugging selector issues.

-   **Refactor "God" File `content.js`**:
    -   **Problem**: This file has too many responsibilities, including feature initialization, settings loading, and orchestrating DOM manipulation for multiple features. It's a central point of coupling.
    -   **Solution**:
        -   Introduce a `FeatureManager` or similar orchestration pattern.
        -   Each feature (FileFilter, ConversationExpansion, ResolvedComments, etc.) should become a more self-contained class/module responsible for its own initialization, DOM interactions, and event handling.
        -   `content.js` should primarily be responsible for initializing the `FeatureManager` and passing it the necessary dependencies (like `SettingsManager`).
    -   **Impact**: Improves modularity, separation of concerns, testability, and reduces the cognitive load of understanding `content.js`.

-   **Refactor Monolithic `settings.js`**:
    -   **Problem**: This file manages the entire settings page, leading to a large, complex file with intertwined logic for different settings sections.
    -   **Solution**:
        -   Break down the settings page logic into smaller, feature-specific modules (e.g., `file-filter-settings-section.js`, `jira-copy-settings-section.js`).
        -   Each section module should handle rendering its part of the UI, loading/saving its specific settings, and managing its event listeners.
        -   The main `settings.js` file should act as a coordinator, initializing these section modules and managing overall page navigation.
        -   Utilize a templating approach (e.g., native `<template>` elements or a lightweight library) for repetitive UI elements like file/username lists and dropdown options.
    -   **Impact**: Improves maintainability, makes it easier to add/remove/modify settings sections, and enhances code organization.

## Medium Priority (Optimization & Feature Refinement)

-   **~~Create Generic UI Components~~** ✅ **COMPLETED**:
    -   **~~Problem~~**: ~~Duplicate modal logic in `UIComponents.js` (`createAddFileModal`, `createEditFileModal`) and repetitive button creation in `content.js`.~~
    -   **~~Solution~~**: ✅ **IMPLEMENTED**:
        -   ✅ Created generic `Modal` class in `src/core/modal.js` with configurable content, titles, and action buttons
        -   ✅ Created `ButtonFactory` utility in `src/core/button-factory.js` for GitHub-style buttons
        -   ✅ Refactored `UIComponents.js` to use new generic Modal class, reducing duplicate code by ~80 lines
        -   ✅ Added to manifest.json and ready for use across the codebase
    -   **Impact**: ✅ **ACHIEVED** - Reduced code duplication, improved UI consistency, and made UI development faster.

-   **~~Unify Notification Logic~~** ✅ **ALREADY CONSISTENT**:
    -   **~~Problem~~**: ~~Inconsistent notification systems are used (`jira-notifications.js` uses Jira's native system, `toast.js` provides a custom one, and `amplitude-copy.js` has its own direct toast implementation).~~
    -   **~~Solution~~**: ✅ **ANALYSIS COMPLETE**:
        -   ✅ All non-Jira components already use `window.toast` from `toast.js` consistently
        -   ✅ `amplitude-copy.js` correctly uses `window.toast` with proper fallback checks
        -   ✅ Jira uses native `window.AJS.flag` system (intentional for platform consistency)
        -   ✅ No inconsistencies found - notification system is already properly unified
    -   **Impact**: ✅ **ALREADY ACHIEVED** - Consistent user experience for notifications with appropriate platform-specific implementations.

-   **Refactor `settings.js` with `DOMUtils` and `ToggleManager`**:
    -   **Problem**: Even after breaking down `settings.js` into sections, there's still manual DOM manipulation and event listener setup that could leverage existing utility modules.
    -   **Solution**:
        -   Ensure all DOM interactions within the settings page (especially within the new section modules) use `DOMUtils` methods.
        -   Integrate `ToggleManager` more thoroughly to manage the state and events of all toggle switches, reducing direct manipulation.
    -   **Impact**: Improves code consistency, reduces errors in DOM manipulation, and leverages existing utility code.

## Low Priority (Cleanup & Minor Improvements)

-   **~~Abstract Filtering Logic~~** ✅ **COMPLETED**:
    -   **~~Problem~~**: ~~`file-filter.js` and `comment-filter.js` share similar filtering logic (`shouldHideFile` and `shouldHideComment`).~~
    -   **~~Solution~~**: ✅ **IMPLEMENTED**:
        -   ✅ Created generic `FilterUtils` module in `src/core/filter-utils.js` with `shouldHideItem` function
        -   ✅ Added specialized `shouldHideFile` and `shouldHideComment` methods with custom matching logic
        -   ✅ Refactored `file-filter.js`, `file-filter-new.js`, and `comment-filter.js` to use FilterUtils
        -   ✅ Eliminated ~30 lines of duplicate filtering code
        -   ✅ Added utility methods for string matching, file operations, and DOM filtering
    -   **Impact**: ✅ **ACHIEVED** - Reduced code duplication and made filtering logic more reusable.

-   **~~Create a Base `Manager` Class~~** ✅ **COMPLETED**:
    -   **~~Problem~~**: ~~`SettingsManager`, `ToggleManager`, and `NavigationManager` have common patterns (e.g., initialization, event listeners) that could be abstracted.~~
    -   **~~Solution~~**: ✅ **IMPLEMENTED**:
        -   ✅ Created `BaseManager` class in `src/core/base-manager.js` with common lifecycle methods
        -   ✅ Added automatic event listener tracking and cleanup
        -   ✅ Provided utility methods for debouncing, throttling, and safe DOM selection
        -   ✅ Refactored `ToggleManager` and `NavigationManager` to extend `BaseManager`
        -   ✅ Added to manifest.json and settings.html for proper loading
    -   **Impact**: ✅ **ACHIEVED** - Promoted code reuse and established consistent manager pattern.

-   **Extract CSS into Separate Files**:
    -   **Problem**: `scroll-to-top.js` and `amplitude-copy.js` inject CSS directly into the page using `<style>` tags. This is harder to manage, debug, and can lead to FOUC (Flash of Unstyled Content).
    -   **Solution**:
        -   Move all injected CSS into dedicated `.css` files.
        -   Load these CSS files via `manifest.json` (if applicable to content scripts) or dynamically inject them as `<link>` tags.
    -   **Impact**: Improves maintainability, separation of concerns, and potentially performance by allowing browsers to cache CSS.

-   **Improve Error Handling**:
    -   **Problem**: Inconsistent error handling throughout the codebase; some errors are silently caught, others logged, and some result in toasts.
    -   **Solution**:
        -   Establish a consistent error handling strategy (e.g., always log to console for internal errors, use `toast.error` for user-facing issues).
        -   Implement more robust `try...catch` blocks where asynchronous operations or external interactions occur.
        -   Consider a global error handler for uncaught exceptions in content scripts.
    -   **Impact**: Makes the extension more robust, easier to debug, and provides better feedback to users.
