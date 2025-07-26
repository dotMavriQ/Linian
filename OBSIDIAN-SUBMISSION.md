# Obsidian Community Plugin Submission

## Plugin Information
- **Plugin Name**: Linian
- **Plugin ID**: linian
- **Repository**: https://github.com/dotMavriQ/Linian
- **Author**: Jonatan Jansson (@dotMavriQ)
- **Description**: Convert Linear issue shortcodes into clickable links with status-based styling

## Requirements Checklist

### ✅ Repository Requirements
- [x] Plugin hosted on GitHub
- [x] Repository is public
- [x] Repository has proper README with installation instructions
- [x] Repository has releases with built plugin files
- [x] main.js, manifest.json, and styles.css in releases
- [x] Plugin follows Obsidian API guidelines

### ✅ Plugin Requirements
- [x] Plugin works without internet connection (with cached data)
- [x] Plugin doesn't make excessive API calls (uses caching)
- [x] Plugin doesn't modify Obsidian's core functionality
- [x] Plugin has proper error handling
- [x] Plugin is responsive and performant

### ✅ Code Quality
- [x] TypeScript source code
- [x] Proper error handling
- [x] No sensitive data in repository
- [x] Clean, documented code
- [x] Follows Obsidian plugin best practices

### ✅ Documentation
- [x] Clear README with usage instructions
- [x] Installation instructions
- [x] Configuration guide
- [x] Troubleshooting section
- [x] Proper licensing (MIT)

## Submission Process

1. **Create Initial Release**:
   ```bash
   git add .
   git commit -m "feat: initial release v1.0.0"
   git tag v1.0.0
   git push origin main
   git push origin v1.0.0
   ```

2. **Verify Release**:
   - Check that GitHub Actions built and published the release
   - Verify main.js, manifest.json, styles.css are in release assets
   - Test the plugin from the release files

3. **Submit to Obsidian**:
   - Fork https://github.com/obsidianmd/obsidian-releases
   - Add plugin to community-plugins.json
   - Create pull request

## Obsidian Plugin Store Guidelines

### Plugin Approval Criteria:
- ✅ **Functionality**: Plugin provides clear value to users
- ✅ **Quality**: Well-coded, tested, stable
- ✅ **Documentation**: Clear instructions and descriptions
- ✅ **Maintenance**: Active development and issue responses
- ✅ **Guidelines**: Follows all Obsidian plugin guidelines

### Submission Requirements:
- ✅ **Public GitHub repo** with source code
- ✅ **Releases** with built plugin files (main.js, manifest.json, styles.css)
- ✅ **manifest.json** with correct format and required fields
- ✅ **README.md** with installation and usage instructions
- ✅ **No sensitive data** or API keys in repository

## Post-Submission

Once approved:
- Plugin will appear in Obsidian's Community Plugins
- Users can install directly from Obsidian
- Updates pushed through new GitHub releases
- Maintain backwards compatibility when possible
