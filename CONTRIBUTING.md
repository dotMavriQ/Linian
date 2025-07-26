# 🚀 Contributing to Linian

Thank you for your interest in contributing to Linian! This document provides guidelines for contributing to the project.

## 📋 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Obsidian (for testing)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/linian.git
   cd linian
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # For deployment, set your Obsidian plugins directory
   export OBSIDIAN_PLUGINS_DIR="$HOME/.obsidian/plugins"
   ```

4. **Build the plugin**
   ```bash
   npm run build
   ```

5. **Deploy for testing**
   ```bash
   npm run deploy
   ```

## 🔧 Development Workflow

### Building
- `npm run build` - Production build
- `npm run dev` - Development build with watch mode

### Testing
- Follow the guidelines in `TESTING.md`
- Test with your own Linear workspace
- Ensure both Live Preview and Reading modes work

### Deployment
- `npm run deploy` - Deploy to local Obsidian
- `npm run dev-deploy` - Deploy development version

## 📝 Code Style

- Use TypeScript strict mode
- Follow existing code formatting
- Add comments for complex logic
- Update documentation when adding features

## 🐛 Reporting Issues

When reporting issues, please include:
- Obsidian version
- Plugin version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

## ✨ Feature Requests

- Open an issue with the "enhancement" label
- Describe the feature and use case
- Consider backwards compatibility

## 🔒 Security

- Never commit API keys or personal information
- Use environment variables for local paths
- Report security vulnerabilities privately

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.
