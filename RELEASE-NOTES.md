# Linian Release Notes

## v1.1.1 – 2025-10-06

### 🔧 Maintenance
- End-to-end release automation: pushing a new version to `main` now builds the plugin, refreshes the `release` branch, and publishes a GitHub release bundle automatically.
- Added BRAT setup guidance to the README so you can subscribe to the `release` branch for hands-free updates.

### 📦 Upgrade Notes
- No plugin behavior changes; upgrade only if you want the new automation and documentation improvements.

## v1.1.0 – 2025-10-06

### ✨ Highlights
- **Inline expanded cards**: Prefix a shortcode with `L_` to render the full issue title inline with colorful status dots and a rich hover tooltip for extra context.
- **Safer rendering pipeline**: The Markdown processor now walks text nodes instead of raw HTML, preventing the DOM rewrite loops that previously caused crashes in long notes.
- **Unified experience**: Compact badges keep priority icons and avatars, while expanded cards focus on titles and metadata—no redundant default tooltip required.
- **Repository cleanup**: Removed the experimental dual-plugin workspace and comparison tooling, making this the single source of truth going forward.

### 🔄 Improvements
- Streamlined the hover tooltip so it only appears for expanded cards, cutting dozens of unnecessary event listeners per note.
- Strengthened cache guardrails so already-rendered issues are skipped when notes re-render, avoiding flicker and race conditions.

### 🛠 Fixes
- Patched edge cases where repeated shortcode scanning could remove plugin containers or duplicate renders during Obsidian refreshes.

### 📦 Upgrade Notes
- Update the plugin from the GitHub release archive (`linian-1.1.0.zip`) or copy `main.js`, `manifest.json`, `styles.css`, and `versions.json` into your vault’s `.obsidian/plugins/linian` folder.
- No configuration changes are required; existing settings carry forward.

## v1.0.1 – 2025-07-28

Bugfix release focused on memory leaks, tooltip ordering, and deployment scripts. See `CHANGELOG.md` for the detailed breakdown.

## v1.0.0 – 2025-07-26

Initial release delivering real-time Linear shortcode conversion in both Reading Mode and Live Preview, complete with status colors, priority icons, assignee avatars, caching, and a full settings experience.
