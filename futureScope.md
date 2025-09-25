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

-   **Create Generic UI Components**:
    -   **Problem**: Duplicate modal logic in `UIComponents.js` (`createAddFileModal`, `createEditFileModal`) and repetitive button creation in `content.js`.
    -   **Solution**:
        -   Develop a more generic `Modal` class/function that can be configured with different content, titles, and action buttons.
        -   Create a generic `Button` utility that can generate GitHub-style buttons based on a configuration object, reducing boilerplate in `content.js`.
    -   **Impact**: Reduces code duplication, improves UI consistency, and makes UI development faster.

-   **Unify Notification Logic**:
    -   **Problem**: Inconsistent notification systems are used (`jira-notifications.js` uses Jira's native system, `toast.js` provides a custom one, and `amplitude-copy.js` has its own direct toast implementation).
    -   **Solution**:
        -   Ensure all parts of the extension use the `toast.js` module for displaying user-facing notifications.
        -   Refactor `amplitude-copy.js` to use `window.toast`.
        -   Decide if Jira's native notification system (`jira-notifications.js`) is truly necessary or if `toast.js` can fully replace it for consistency. If native is preferred for Jira, clearly document the exception.
    -   **Impact**: Provides a consistent user experience for notifications and centralizes notification management.

-   **Refactor `settings.js` with `DOMUtils` and `ToggleManager`**:
    -   **Problem**: Even after breaking down `settings.js` into sections, there's still manual DOM manipulation and event listener setup that could leverage existing utility modules.
    -   **Solution**:
        -   Ensure all DOM interactions within the settings page (especially within the new section modules) use `DOMUtils` methods.
        -   Integrate `ToggleManager` more thoroughly to manage the state and events of all toggle switches, reducing direct manipulation.
    -   **Impact**: Improves code consistency, reduces errors in DOM manipulation, and leverages existing utility code.

## Low Priority (Cleanup & Minor Improvements)

-   **Abstract Filtering Logic**:
    -   **Problem**: `file-filter.js` and `comment-filter.js` share similar filtering logic (`shouldHideFile` and `shouldHideComment`).
    -   **Solution**:
        -   Create a generic `FilterUtils` module with a `shouldHideItem` function that takes an item, a list of patterns, and a function to extract the relevant property for comparison.
    -   **Impact**: Reduces code duplication and makes filtering logic more reusable.

-   **Create a Base `Manager` Class**:
    -   **Problem**: `SettingsManager`, `ToggleManager`, and `NavigationManager` have common patterns (e.g., initialization, event listeners) that could be abstracted.
    -   **Solution**:
        -   Introduce a lightweight `BaseManager` class that provides common lifecycle methods or utility functions.
        -   Have existing manager classes extend this base class.
    -   **Impact**: Promotes code reuse and a more consistent manager pattern.

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
