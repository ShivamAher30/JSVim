# 🚀 AI Completion & Code Generation Setup Guide

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

4. **Test AI features**:
   ```bash
   node test-ai-completion.js
   node test-code-generation.js
   ```

## Using AI Features in the Editor

### AI Code Completion
- `:ai` - Toggle AI completion on/off and show status
- `Tab` in Insert Mode - Accept AI suggestion
- `:aimodel <model>` - Change AI model

### 🎯 AI Code Generation (NEW!)
- `:generate <instruction>` - Generate new code from natural language
- `:gen <instruction>` - Short form of generate
- `:extend <instruction>` - Extend existing code with new functionality  
- `:implement <instruction>` - Implement a specific feature

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

## 🎯 Code Generation Examples

### Generate New Code
```
:generate create a function to calculate fibonacci numbers
:gen implement a binary search algorithm
:generate create a REST API endpoint for user authentication
```

### Extend Existing Code  
```
:extend add error handling to this function
:extend add input validation and logging
:extend make this function async and add try-catch
```

### Implement Features
```
:implement user authentication with JWT tokens
:implement pagination for the user list
:implement caching mechanism for API responses
```

### Real-World Examples

**Starting with an empty JavaScript file:**
```
:gen create a simple calculator class with basic operations
```

**Extending existing code:**
```javascript
// Existing code:
function fetchUser(id) {
  return fetch(`/api/users/${id}`).then(r => r.json());
}

// Command: :extend add error handling and retry logic
```

**Implementing features:**
```javascript
// Existing code:
const express = require('express');
const app = express();

// Command: :implement JWT middleware for route protection
```

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

**Code generation not working?**
1. Check API key configuration
2. Try simpler, more specific instructions
3. Make sure you're in command mode (`:`)
4. Run `node test-code-generation.js` to test

**Generated code has issues?**
- Use more specific instructions
- Try different models with `:aimodel <model>`
- Break complex requests into smaller parts

**No suggestions appearing?**
- Make sure you're in Insert Mode (`i`)
- Type some code and pause for 400ms
- Check status bar for `[AI: enabled]`

## Example Usage Workflow

1. **Start editing a file**: `node bin/vimjs.js example.js`
2. **Generate initial code**: `:gen create a user class with name and email properties`
3. **Enter Insert Mode**: `i`
4. **Get AI completion**: Type `user.` and wait 400ms for suggestions
5. **Extend functionality**: `:extend add validation methods to the user class`
6. **Implement features**: `:implement add password hashing functionality`

## Tips for Better Results

### For Code Completion:
- More context = better suggestions
- Pause after typing to trigger suggestions
- Use meaningful variable and function names

### For Code Generation:
- Be specific about requirements
- Mention the programming language if not obvious
- Break complex features into smaller parts
- Use `extend` for modifying existing code
- Use `implement` for adding new features
- Use `generate` for creating new code from scratch
