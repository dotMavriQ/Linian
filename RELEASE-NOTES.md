# 🎉 Linian v1.0.0 Release Notes

## 🚀 **Initial Release - Full Linear Integration for Obsidian**

### ✨ **Core Features**

#### **Real-time Shortcode Conversion**
- ✅ **Live Preview Mode**: Shortcodes convert instantly as you type
- ✅ **Reading Mode**: Shortcodes render in published view
- ✅ **Dual-mode Support**: Works in both editing modes seamlessly

#### **Linear API Integration**
- ✅ **GraphQL API**: Direct integration with Linear's official API
- ✅ **Issue Fetching**: Retrieves complete issue data including:
  - Title and description
  - Priority levels (0-4) with visual icons
  - Status with color-coded indicators
  - Assignee information with avatars
  - Team information
- ✅ **Smart Caching**: Minimizes API calls with intelligent caching system

#### **Visual Design**
- ✅ **Status Colors**: Issues display with Linear's status colors
- ✅ **Priority Icons**: Visual priority indicators (🔴 Urgent, 🟡 Medium, etc.)
- ✅ **Assignee Avatars**: Profile pictures for assigned team members
- ✅ **Interactive Tooltips**: Hover for detailed issue information

#### **Format Support**
- ✅ **Case Insensitive**: Matches `[TEAM-123]` and `[team-123]`
- ✅ **Team Formats**: Supports various team naming conventions
- ✅ **Flexible Patterns**: Handles simple (`DEV-123`) and complex (`ENGINEERING-TEAM-456`) formats

### 🔧 **Technical Implementation**

#### **Architecture**
- **TypeScript**: Fully typed implementation
- **Modular Design**: Clean separation of concerns
- **Error Handling**: Graceful degradation with fallbacks
- **Performance**: Optimized for large notes with many references

#### **API Integration**
- **Authentication**: Secure Linear API key integration
- **Query Optimization**: Efficient GraphQL queries
- **Rate Limiting**: Respectful API usage with caching
- **Error Recovery**: Handles API failures gracefully

#### **Editor Integration**
- **CodeMirror Extensions**: Native editor integration for Live Preview
- **Markdown Post-processing**: Reading mode compatibility
- **DOM Efficiency**: Minimal performance impact
- **Memory Management**: Automatic cleanup and cache management

### 📋 **Setup Requirements**

#### **Prerequisites**
- Obsidian v0.15.0+
- Linear workspace access
- Linear API key

#### **Installation**
1. Download the plugin files
2. Copy to your Obsidian plugins directory
3. Enable in Obsidian settings
4. Configure your Linear API key
5. Start using shortcodes in your notes!

### 🎯 **Usage Examples**

```markdown
Working on [TEAM-465] and [DESIGN-123] today.

The bug in [ENG-789] is blocking [TEAM-466].

Priority issues: [URGENT-001] needs immediate attention.
```

### 🔍 **Debugging & Testing**

- **Debug Command**: "Debug Linear Shortcodes" for troubleshooting
- **Console Logging**: Detailed logging for development
- **Test Coverage**: Comprehensive testing guidelines in `TESTING.md`

### 🌟 **What's Next**

Future versions may include:
- Bulk issue operations
- Custom styling options
- Advanced filtering
- Webhook integration
- Team-specific configurations

---

**Happy note-taking with Linear integration!** 🚀

For issues, feature requests, or contributions, visit our GitHub repository.
