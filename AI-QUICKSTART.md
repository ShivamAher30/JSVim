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
2. **Position Cursor**: Navigate to where you want code completion
3. **Trigger AI**: Press `Tab` to get AI suggestions
4. **Continue Coding**: The AI suggestion will be inserted at your cursor

## 📝 Commands

| Command | Description |
|---------|-------------|
| `Tab` (in Insert mode) | Trigger AI autocompletion |
| `:toggleAI` | Enable/disable AI features |
| `:ai` | Show AI status and configuration |
| `:aimodel <model>` | Change AI model |

## 🤖 Available AI Models

- **mixtral-8x7b-32768** (default) - Best for code completion
- **llama3-8b-8192** - Fast and efficient
- **llama3-70b-8192** - Most capable but slower
- **gemma-7b-it** - Good balance of speed and quality

## 💡 Tips for Best Results

1. **Provide Context**: AI works better with more code context
2. **Use Comments**: Add comments describing what you want to implement
3. **Follow Patterns**: AI learns from your existing code style
4. **Be Patient**: Wait for the suggestion to load (usually 1-3 seconds)

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
// Type this and press Tab at the end
function fibonacci(n) {
    // Press Tab here
```

The AI might suggest:
```javascript
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
```

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
