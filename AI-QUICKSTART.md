# 🤖 VimJS AI Quick Start Guide

## What's New?

VimJS now includes **AI-powered code autocompletion** using Groq's powerful language models! Get intelligent code suggestions as you type.

## 🚀 Quick Setup (2 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Get Your Free API Key
1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign up for a free account
3. Create a new API key

### Step 3: Configure API Key
```bash
# Run the setup helper
npm run setup-ai

# Or manually edit .env file
cp .env.example .env
# Edit .env and replace 'your_groq_api_key_here' with your actual key
```

### Step 4: Test It Out!
```bash
# Start the editor with the test file
npm start test-ai.js

# Or use the full command
node bin/vimjs.js test-ai.js
```

## 🎯 How to Use AI Completion

1. **Enter Insert Mode**: Press `i`
2. **Start Typing**: AI suggestions will appear automatically as grayed-out text
3. **Accept Suggestions**: Press `Tab` to accept the grayed-out suggestion
4. **Dismiss Suggestions**: Continue typing to dismiss and get new suggestions
5. **Manual Trigger**: Press `Tab` when no preview is visible to request suggestions
6. **Continue Coding**: The suggestion integrates seamlessly with your workflow

## ✨ New Features

- **🔍 Live Preview**: See AI suggestions as grayed-out text while typing
- **👁️ Blinking Cursor**: Improved cursor visibility in Insert mode
- **📜 Smart Scrolling**: Cursor stays visible when navigating large files
- **⚡ Auto-Suggestions**: Get suggestions automatically after a pause in typing

## 📝 Commands

| Command | Description |
|---------|-------------|
| `Tab` (in Insert mode) | Trigger AI autocompletion |
| `:toggleAI` | Enable/disable AI features |
| `:ai` | Show AI status and configuration |
| `:aimodel <model>` | Change AI model |

## 🤖 Available AI Models

- **llama3-8b-8192** (default) - Fast and efficient for code completion
- **llama3-70b-8192** - Most capable but slower
- **llama-3.1-8b-instant** - Latest Llama 3.1 model, very fast
- **llama-3.1-70b-versatile** - Latest large model, most capable
- **gemma-7b-it** - Good balance of speed and quality
- **gemma2-9b-it** - Improved Gemma model

## 💡 Tips for Best Results

1. **Watch for Gray Text**: AI suggestions appear as grayed-out text after typing
2. **Provide Context**: AI works better with more code context around your cursor
3. **Use Descriptive Comments**: Add comments describing what you want to implement
4. **Follow Patterns**: AI learns from your existing code style
5. **Pause Briefly**: Allow 1 second after typing for auto-suggestions to appear
6. **Tab to Accept**: Press Tab when you see grayed-out text you want to accept

## 🐛 Troubleshooting

### AI Not Working?
- Check your API key in `.env` file
- Run `:ai` in command mode to see status
- Make sure you have internet connection

### Getting Errors?
- `[AI] Service not configured` → Check API key
- `[AI] Rate limit exceeded` → Wait a moment, try again
- `[AI] Request timeout` → Check internet connection

## 📚 Example Usage

```javascript
// Start typing a function and pause...
function calculateArea(radius) {
    // You'll see grayed-out suggestion appear here
```

After pausing, you might see:
```javascript
function calculateArea(radius) {
    return Math.PI * radius * radius; // ← This appears grayed-out
```

**Press Tab to accept the suggestion!**

## 🎨 Visual Cues

- **Grayed-out text** = AI suggestion (press Tab to accept)
- **Blinking cursor** = Insert mode is active
- **`[AI: Tab to accept]`** = Status bar shows suggestion is ready
- **Cursor follows you** = Auto-scrolling keeps cursor visible

## 🎨 Other VimJS Features

- **Vim-like Editing**: Normal, Insert, and Command modes
- **Syntax Highlighting**: 30+ programming languages
- **Beautiful Themes**: Dracula, Nord, Tokyo Night, etc.
- **File Operations**: Save, quit, and more
- **Customizable**: Many settings via command mode

## 🔧 Running Tests

```bash
# Test AI integration
npm run test-ai

# Test syntax highlighting
npm test
```

## 🎉 Happy Coding!

You're all set! Open any file with VimJS and start using AI-powered autocompletion to boost your productivity.

For more details, see the main [README.md](README.md) file.
