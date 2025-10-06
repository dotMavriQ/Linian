# Linian Plugin Deployment Guide

This guide explains how to build and deploy the Linian plugin to your Obsidian vault for testing and development.

## Quick Start

### One-time Setup
```bash
# Install dependencies
npm install
```

### Deploy for Testing
```bash
# Build and deploy to Obsidian
./deploy.sh
# OR use npm script
npm run deploy
```

### Development Mode
```bash
# Build in watch mode and auto-deploy changes
./dev-deploy.sh
# OR use npm script
npm run dev-deploy
```

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Install** | `npm install` | Install all dependencies |
| **Build** | `npm run build` | Build plugin for production |
| **Dev Build** | `npm run dev` | Build plugin in watch mode |
| **Deploy** | `./deploy.sh` or `npm run deploy` | Build and deploy to Obsidian |
| **Dev Deploy** | `./dev-deploy.sh` or `npm run dev-deploy` | Watch mode with auto-deploy |
| **Full Install** | `npm run install-obsidian` | Build + Deploy in one command |

## Deployment Process

### What Gets Deployed

The deployment script copies these files to `$OBSIDIAN_PLUGINS_DIR/linian/` (default: `$HOME/.obsidian/plugins/linian/`):

- `manifest.json` - Plugin metadata and configuration
- `main.js` - Compiled plugin code (generated from TypeScript)
- `styles.css` - Plugin styling
- `versions.json` - Version compatibility information

### Target Location

```
$OBSIDIAN_PLUGINS_DIR/linian/
├── manifest.json
├── main.js
├── styles.css
└── versions.json
```

## Development Workflow

### For Quick Testing
1. Make your changes to the source code
2. Run `./deploy.sh` to build and deploy
3. In Obsidian, disable and re-enable the plugin to reload
4. Test your changes

### For Active Development
1. Run `./dev-deploy.sh` to start watch mode
2. Make changes to your source code
3. Files are automatically rebuilt and deployed
4. In Obsidian, disable and re-enable the plugin to see changes
5. Press Ctrl+C to stop watch mode

## Obsidian Integration

### Enable the Plugin
1. Open Obsidian
2. Go to Settings → Community Plugins
3. Make sure **Safe mode** is turned OFF
4. Find "Linian" in the installed plugins list
5. Toggle it ON

### Configure the Plugin
1. Go to Settings → Linian
2. Enter your Linear API key
3. Test the connection
4. Customize display options as needed

### Reload After Changes
After deploying new changes:
1. Go to Settings → Community Plugins
2. Toggle Linian OFF, then ON again
3. Or restart Obsidian completely

## Troubleshooting

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run build
```

### Deployment Issues
```bash
# Check if target directory exists
ls -la $OBSIDIAN_PLUGINS_DIR/

# Check file permissions
ls -la $OBSIDIAN_PLUGINS_DIR/linian/

# Manual deployment
mkdir -p $OBSIDIAN_PLUGINS_DIR/linian/
cp manifest.json main.js styles.css versions.json $OBSIDIAN_PLUGINS_DIR/linian/
```

### Plugin Not Loading
1. Check Obsidian's Developer Console (Ctrl+Shift+I)
2. Look for error messages in the Console tab
3. Verify all required files are present
4. Check that Safe mode is disabled

### API Issues
1. Verify your Linear API key is correct
2. Test API connection in plugin settings
3. Check network connectivity
4. Clear plugin cache if needed

## File Structure

```
Linian/
├── src/                    # Source code
│   ├── api.ts             # Linear API service
│   ├── constants.ts       # Configuration constants
│   ├── renderer.ts        # DOM rendering logic
│   ├── settings.ts        # Settings UI
│   └── types.ts           # TypeScript interfaces
├── main.ts                # Plugin entry point
├── manifest.json          # Plugin metadata
├── styles.css             # Plugin styles
├── package.json           # Node.js dependencies
├── tsconfig.json          # TypeScript configuration
├── esbuild.config.mjs     # Build configuration
├── deploy.sh              # Deployment script
├── dev-deploy.sh          # Development deployment script
└── README.md              # Documentation
```

## Development Tips

### Hot Reloading
The `dev-deploy.sh` script provides near-instant deployment of changes. However, Obsidian still requires manual plugin reload.

### Debugging
- Use `console.log()` statements in your code
- Check Obsidian's Developer Console for errors
- Use browser debugging tools with Obsidian

### Testing
- Test with different Linear issue formats
- Test with various issue states and priorities
- Test error conditions (invalid API key, network issues)
- Test performance with many issues in a document

## Production Deployment

When ready to publish:

1. Update version in `manifest.json`
2. Run `npm run build` for production build
3. Test thoroughly in your local Obsidian
4. Package files for distribution
5. Submit to Obsidian Community Plugins (if desired)

### Automated Release Pipeline

- Pushing a version bump to the `main` branch automatically runs the **Build & Release Obsidian Plugin** workflow.
- The workflow:
	1. Builds the plugin from source
	2. Packages a BRAT-compliant zip (`linian-{version}.zip`) containing a `linian/` folder with all runtime files
	3. Updates the `release` branch with the fresh runtime files
	4. Creates a GitHub Release tagged with the version from `manifest.json`
	5. Attaches both the zip archive and the individual files to the release
- To trigger a new release, bump the version in `manifest.json` (and `versions.json` when needed) and push to `main`; the workflow skips automatically if a release tag already exists for that version.

## Support

If you encounter issues:
1. Check this deployment guide
2. Review error messages in console
3. Verify file permissions and paths
4. Test with minimal configuration

---

**Happy developing! 🚀**
