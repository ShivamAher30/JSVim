# 🚀 AI Completion Setup Guide

## Quick Setup

1. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Get your Groq API key**:
   - Visit [https://console.groq.com/keys](https://console.groq.com/keys)
   - Create a new API key
   - Copy the key

3. **Configure your .env file**:
   ```bash
   GROQ_API_KEY=your_api_key_here
   ```

4. **Test AI completion**:
   ```bash
   node test-ai-completion.js
   ```

## Using AI Completion in the Editor

### Commands
- `:ai` - Toggle AI completion on/off and show status
- `Tab` in Insert Mode - Accept AI suggestion
- `:aimodel <model>` - Change AI model

### AI Completion Behavior

**In Insert Mode:**
- Type code and pause for 400ms
- AI suggestion appears as gray ghost text
- Press `Tab` to accept the suggestion
- Continue typing to dismiss the suggestion
- Press `Esc` or move cursor to dismiss

**Status Bar Indicators:**
- `[AI: enabled]` - AI completion is active
- `[AI: disabled]` - AI completion is off
- `[Tab to accept]` - AI suggestion available

### Supported Models
- `llama3-8b-8192` (default, fastest)
- `llama3-70b-8192` (more accurate)
- `llama-3.1-8b-instant`
- `llama-3.1-70b-versatile`
- `gemma-7b-it`
- `gemma2-9b-it`

### Troubleshooting

**AI not working?**
1. Check API key: `:ai` command shows status
2. Verify internet connection
3. Run `node test-ai-completion.js` to debug

**No suggestions appearing?**
- Make sure you're in Insert Mode (`i`)
- Type some code and pause for 400ms
- Check status bar for `[AI: enabled]`

**Suggestions not relevant?**
- Try different models with `:aimodel <model>`
- AI works better with more context

## Example Usage

1. Start editing a file: `node bin/vimjs.js example.js`
2. Enter Insert Mode: `i`
3. Start typing: `function hello(`
4. Wait 400ms - ghost text appears: `name) {`
5. Press `Tab` to accept or keep typing to dismiss
