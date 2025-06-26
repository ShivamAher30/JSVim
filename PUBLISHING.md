# Publishing Guide for VimJS

This guide walks you through publishing VimJS to npm.

## Pre-Publishing Checklist

### 1. Validate Package Structure
```bash
npm run test:package
```

This will check:
- ✅ All required files are present
- ✅ package.json has all required fields
- ✅ Binary script has correct shebang
- ✅ Core tests pass
- ✅ AI sanitization works

### 2. Test Package Locally
```bash
# Test the package contents without publishing
npm publish --dry-run

# Check what files will be included
npm pack
tar -tzf vimjs-1.0.0.tgz
```

### 3. Update Repository Information
Before publishing, update the repository URLs in `package.json`:
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR-USERNAME/vimjs.git"
  },
  "homepage": "https://github.com/YOUR-USERNAME/vimjs#readme",
  "bugs": {
    "url": "https://github.com/YOUR-USERNAME/vimjs/issues"
  }
}
```

### 4. Version Management
Update version number in `package.json` for releases:
```bash
npm version patch   # 1.0.0 -> 1.0.1
npm version minor   # 1.0.0 -> 1.1.0  
npm version major   # 1.0.0 -> 2.0.0
```

## Publishing Steps

### 1. Login to npm
```bash
npm login
```

### 2. Final Test
```bash
npm run test:package
```

### 3. Publish
```bash
# Dry run first
npm publish --dry-run

# Actual publish
npm publish
```

### 4. Verify Installation
```bash
# Install globally and test
npm install -g vimjs
vimjs --help
vimjs test.txt
```

## Package Structure

Files included in the npm package:
```
vimjs/
├── bin/
│   └── vimjs.js           # CLI entry point
├── src/
│   ├── index.js           # Main module
│   ├── editor.js          # Core editor
│   ├── ai-service.js      # AI integration
│   ├── animations.js      # UI animations
│   ├── command-parser.js  # Command handling
│   ├── mode-manager.js    # Vim modes
│   ├── status-line.js     # Status display
│   ├── syntax-highlighter.js # Code highlighting
│   └── text-buffer.js     # Text management
├── README.md              # Documentation
├── LICENSE                # MIT license
├── .env.example           # AI config template
└── setup-ai.js           # AI setup script
```

Files excluded (via `.npmignore`):
- Test files (`test-*.js`, `test/`)
- Debug files (`debug-*.js`)
- Demo files (`demo-*.js`)
- AI documentation (`AI-*.md`)
- Development dependencies
- Git files

## Post-Publishing

### 1. Tag the Release
```bash
git tag v1.0.0
git push origin v1.0.0
```

### 2. Create GitHub Release
- Go to your repository on GitHub
- Click "Releases" → "Create a new release"
- Use tag `v1.0.0`
- Include changelog and features

### 3. Update Documentation
- Link to npm package in README
- Update installation instructions
- Add usage examples

## Package Features

### Core Features
- Vim-inspired keybindings and modes
- Syntax highlighting for multiple languages
- Terminal-based interface with blessed
- File operations (open, save, create)

### AI Features (Optional)
- Code completion with LLM
- Natural language code generation
- Smart sanitization of AI responses
- Beautiful animations during AI operations

### Commands
- `:generate <description>` - Generate code
- `:extend <description>` - Extend existing code
- `:implement <description>` - Implement functionality
- Standard Vim commands (`:w`, `:q`, `:wq`, etc.)

## Troubleshooting

### Common Issues
1. **Permission denied**: Make sure bin script is executable
2. **Module not found**: Check all dependencies are listed
3. **Command not found**: Verify bin field in package.json
4. **AI features not working**: Run `vimjs setup-ai` after install

### Support
- File issues on GitHub
- Check README.md for usage instructions
- Run `vimjs --help` for command reference

## Maintenance

### Regular Updates
- Update dependencies: `npm update`
- Security audit: `npm audit`
- Test with new Node versions
- Monitor user feedback and issues

### Versioning Strategy
- Patch (1.0.x): Bug fixes, small improvements
- Minor (1.x.0): New features, AI enhancements
- Major (x.0.0): Breaking changes, major rewrites
