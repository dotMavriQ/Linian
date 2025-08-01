# Changelog

All notable changes to the Linian plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-07-28

### Fixed
- **Memory Leak Fixes**: Resolved critical memory leaks that could cause segfaults on mobile devices
  - Fixed infinite regex loops in `convertInlineIssuesToTags` method
  - Added proper widget lifecycle management in `LinearIssueWidget`
  - Enhanced plugin cleanup with proper service and DOM element removal
  - Added API timeout protection to prevent hanging requests
- **Tooltip UX Improvement**: Fixed tooltip content order to display description below title and metadata (better UX practices)
- **Deployment Scripts**: 
  - Fixed deployment scripts to correctly detect and use the actual Obsidian vault plugins directory
  - Added case-insensitive detection for existing plugin installations
  - Enhanced file verification and deployment status reporting
  - Improved error handling and file integrity checks

### Technical Changes
- Replaced `regex.exec()` while loops with safer `match()` approach
- Added `_destroyed` flag to prevent widget updates after destruction
- Enhanced cleanup procedures for mobile compatibility
- Improved deployment script robustness and user feedback

## [1.0.0] - 2025-07-26

### Added
- Initial release of Linian plugin
- Convert Linear issue shortcodes (e.g., `[TEAM-123]`) into clickable links
- Dual-mode rendering system supporting both Live Preview and Reading Mode
- Real-time shortcode conversion in editor
- Interactive tooltips with issue details
- Linear GraphQL API integration
- Configurable settings for API key, tooltips, priority icons, and assignee avatars
- Status-based styling with Linear state colors
- Priority indicators and assignee avatars
- Comprehensive error handling and loading states
- GitHub Actions workflow for automated releases
