# Pull Request

## Description
<!-- Brief description of changes -->

## Type of Change
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 📚 Documentation update
- [ ] 🔧 Refactoring

<!--
========================================================================================
FOR RELEASE BRANCHES (release_*, release/*)
========================================================================================
-->

## 🚀 Release Checklist (for `release_*` branches)
- [ ] **manifest.json** version updated (e.g., 1.0.0 → 1.1.0)
- [ ] **CHANGELOG.md** updated with new version and features
- [ ] All new features tested on target platforms
- [ ] No console errors in production
- [ ] Settings page functionality verified
- [ ] Extension icons and metadata correct

## Platform Testing (Release)
- [ ] 🐙 GitHub (old & new UI)
- [ ] 📋 Jira Cloud/Server
- [ ] 📊 Amplitude

<!--
========================================================================================
FOR HOTFIX BRANCHES (hotfix_*, fix/*)
========================================================================================
-->

## 🐛 Hotfix Checklist (for `hotfix_*` branches)
- [ ] **manifest.json** version updated (patch version, e.g., 1.0.0 → 1.0.1)
- [ ] **CHANGELOG.md** updated with bugfix details
- [ ] Root cause identified and documented
- [ ] Fix tested on affected platforms
- [ ] No regressions introduced
- [ ] Console errors eliminated

## Bug Verification
- [ ] Original issue reproduced before fix
- [ ] Fix verified to resolve the issue
- [ ] Edge cases tested
- [ ] Related functionality still works

<!--
========================================================================================
GENERAL CHECKLIST (all PRs)
========================================================================================
-->

## General Checklist
- [ ] Code follows existing patterns
- [ ] No breaking changes (or clearly documented)
- [ ] Self-review completed
- [ ] Branch is up to date with main/master

## Related Issues
<!-- Link issues: Fixes #123, Closes #456 -->

---

**Branch naming guide:**
- `release_v1.1.0` or `release/1.1.0` → Use Release Checklist
- `hotfix_filter-not-hiding` or `hotfix/sidebar-issue` → Use Hotfix Checklist
- `feature/new-platform` → Use General Checklist