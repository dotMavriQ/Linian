# Linian

> **Linear Integration for Obsidian**

Convert Linear issue shortcodes like `[TEAM-465]` into clickable links with status-based styling in your Obsidian notes.

## 🙏 **Inspiration & Acknowledgments**

Linian is inspired by the excellent **[Jira Issue](https://github.com/marc0l92/obsidian-jira-issue)** plugin for Obsidian created by **[marc0l92](https://github.com/marc0l92)**. We aimed to create a spiritual cousin that brings the same seamless issue integration experience to Linear users. Special thanks to marc0l92 for pioneering this workflow in the Obsidian ecosystem - their work showed us how powerful inline issue references can be for note-taking and project management.

Our goal was to match that same level of functionality and user experience, but tailored specifically for Linear's modern issue tracking approach.

![Linian Demo](https://via.placeholder.com/600x300/2D3748/FFFFFF?text=Linian+Demo)

## Features

- **Automatic Detection**: Recognizes Linear issue shortcodes in your notes (e.g., `[TEAM-123]`)
- **Rich Visual Feedback**: Color-coded status indicators that match your issue states
- **Inline Issue Cards**: Render compact badges or expanded cards directly in your notes—no hover required
- **Priority Icons**: Visual priority indicators (🔴 Urgent, 🟠 High, 🟡 Medium, 🔵 Low)
- **Assignee Avatars**: See who's working on each issue at a glance
- **Smart Caching**: Efficient caching system to minimize API calls
- **Customizable**: Configure display options, cache settings, and more

## Installation

### From Obsidian Community Plugins (Coming Soon)

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Linian"
4. Install and enable the plugin

### Manual Installation from GitHub Releases

**Option 1: Download Plugin Folder (Recommended)**
1. Go to [GitHub Releases](https://github.com/dotMavriQ/linian/releases)
2. Download the latest `linian-x.x.x.zip` file
3. Extract the zip file to get the `linian` folder
4. Copy the `linian` folder to your vault's `.obsidian/plugins/` directory
5. Enable the plugin in Obsidian Settings → Community Plugins

**Option 2: Download Individual Files**
1. Go to [GitHub Releases](https://github.com/dotMavriQ/linian/releases)
2. Download `main.js`, `manifest.json`, and `styles.css`
3. Create a folder named `linian` in your vault's `.obsidian/plugins/` directory
4. Place the downloaded files in the `linian` folder
5. Enable the plugin in Obsidian Settings → Community Plugins

> **Tip:** Prefer automated updates? Add `https://github.com/dotMavriQ/Linian` to the [BRAT](https://obsidian.md/brat) community plugin and it will track the latest `release` branch build for you.

### Development Installation

For the latest development version:
1. Clone this repository
2. Run `npm install && npm run build`
3. Copy the built files to your plugins directory using `./deploy.sh`

## Setup

1. **Get your Linear API Key**:
   - Go to Linear Settings → API → Personal API Keys
   - Create a new API key
   - Copy the key (starts with `lin_api_`)

2. **Configure Linian**:
   - Open Obsidian Settings → Linian
   - Paste your API key
   - Test the connection
   - Customize display options as needed

## Usage

Simply type Linear issue identifiers in your notes using square brackets:

```markdown
Working on [TEAM-465] and [DESIGN-123] today.

The bug in [ENG-789] is blocking [TEAM-466].

# Need more context?
[L_TEAM-465] will render the full title and metadata inline, similar to the Jira Issue plugin.
```

Linian will automatically:
- Convert shortcodes to clickable links
- Add status-based color coding
- Show priority icons and assignee avatars
- Render expanded summaries when you prefix the shortcode with `L_`

## Display Options

### Status Colors
Issues are color-coded based on their Linear status:
- **Backlog**: Gray
- **Todo/Unstarted**: Purple  
- **In Progress**: Blue
- **Done/Completed**: Green
- **Canceled**: Red

### Priority Icons
- 🔴 **Urgent** (Priority 4)
- 🟠 **High** (Priority 3)
- 🟡 **Medium** (Priority 2)
- 🔵 **Low** (Priority 1)
- ⚪ **No Priority** (Priority 0)

## Configuration

### Display Settings
- **Show Priority Icons**: Display priority indicators
- **Show Assignee Avatars**: Show profile pictures

### Performance Settings
- **Cache Timeout**: How long to cache issue data (1-60 minutes)
- **Max Cache Size**: Maximum number of issues to cache (100-5000)

### Cache Management
- View current cache statistics
- Clear cache when needed
- Automatic cache cleanup

## Commands

- **Refresh Linear Cache**: Clear cached data and re-fetch issues

## Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup
```bash
git clone https://github.com/dotMavriQ/linian.git
cd linian
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## API Usage

Linian uses the Linear GraphQL API. Make sure your API key has the following permissions:
- Read issues
- Read teams
- Read users (for assignee information)

## Troubleshooting

### Issues Not Loading
1. Verify your API key is correct
2. Check your internet connection
3. Test the connection in settings
4. Clear the cache and try again

### Slow Performance
1. Reduce cache timeout
2. Decrease max cache size
3. Disable avatars if not needed

- Ensure shortcodes follow the pattern `[TEAM-123]` (or `[L_TEAM-123]` for the expanded view)
- Team keys must be uppercase
- Issue numbers must be numeric

## Privacy & Security

- API keys are stored locally in your Obsidian vault
- Issue data is cached temporarily to improve performance
- No data is sent to third-party services except Linear's API
- All connections use HTTPS

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/dotMavriQ/linian/issues)
- **Discussions**: [Join the community discussion](https://github.com/dotMavriQ/linian/discussions)
- **Support development**: [Liberapay](https://liberapay.com/dotMavriQ/)

## Acknowledgments

- [Linear](https://linear.app) for their excellent API
- [Obsidian](https://obsidian.md) for the amazing platform
- The Obsidian community for inspiration and support

---

**Made with ❤️ for the Obsidian community**
