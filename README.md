# VimJS - AI-Powered Vim-Style Terminal Editor 🚀

A modern, feature-rich terminal-based text editor inspired by Vim, enhanced with AI-powered code completion and generation capabilities using the Groq API.

![VimJS Demo](https://img.shields.io/badge/Editor-VimJS-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node.js](https://img.shields.io/badge/node.js-v16+-brightgreen)

## ✨ Features

### 🎯 Core Editor Features
- **Vim-inspired Interface** - Familiar modal editing (Normal, Insert, Command modes)
- **Syntax Highlighting** - Support for JavaScript, TypeScript, Python, C++, HTML, CSS, JSON, and more
- **Multiple Color Themes** - Dracula, Neon, Ocean, and Sunset themes
- **Line Numbers** - Absolute and relative line numbering
- **Live Cursor** - Blinking cursor with smooth navigation
- **File Operations** - Save, load, and manage files efficiently

### 🤖 AI-Powered Features
- **Intelligent Code Completion** - Context-aware suggestions using Groq API
- **Natural Language Code Generation** - Generate code from plain English descriptions
- **Code Extension** - Extend existing code with new functionality
- **Feature Implementation** - Implement specific features on command
- **Beautiful Animations** - Visual feedback during AI operations
- **Clean Output** - Advanced sanitization removes HTML, ANSI, and markdown artifacts

### 🎨 Visual Features
- **Real-time Syntax Highlighting** - Enhanced highlighting with multiple language support
- **Animated Welcome Screen** - Stylish startup animations
- **Status Line** - Shows current mode, file info, cursor position, and AI status
- **Smooth Animations** - Code generation progress with emojis and live previews
- **Responsive UI** - Adapts to terminal size changes

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- Terminal with 256-color support
- Groq API key (for AI features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd cli-opensource-agent
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up AI features (optional but recommended):**
   ```bash
   cp .env.example .env
   # Edit .env and add your Groq API key
   ```

4. **Start editing:**
   ```bash
   npm start
   # or
   node bin/vimjs.js [filename]
   ```

## ⌨️ Keyboard Shortcuts

### 🔄 Mode Switching
| Key | Action | Description |
|-----|--------|-------------|
| `i` | Enter Insert Mode | Start typing/editing text |
| `Esc` | Enter Normal Mode | Navigate and execute commands |
| `:` | Enter Command Mode | Execute editor commands |

### 🧭 Navigation (Normal Mode)
| Key | Action | Description |
|-----|--------|-------------|
| `h` / `←` | Move Left | Move cursor one character left |
| `j` / `↓` | Move Down | Move cursor one line down |
| `k` / `↑` | Move Up | Move cursor one line up |
| `l` / `→` | Move Right | Move cursor one character right |

### ✏️ Editing (Insert Mode)
| Key | Action | Description |
|-----|--------|-------------|
| `Tab` | AI Completion | Trigger AI code completion |
| `Enter` | New Line | Insert a new line |
| `Backspace` | Delete Character | Delete character before cursor |
| `←` `→` `↑` `↓` | Navigate | Move cursor while in insert mode |

### 🎨 Themes & Settings
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+T` | Cycle Theme | Switch between color themes |
| `Ctrl+C` | Quit | Exit the editor (with confirmation) |

## 💻 Command Mode Reference

### 📁 File Operations
| Command | Description | Example |
|---------|-------------|---------|
| `:w` | Save current file | `:w` |
| `:q` | Quit editor | `:q` |
| `:wq` | Save and quit | `:wq` |
| `:q!` | Force quit without saving | `:q!` |

### ⚙️ Settings Commands
| Command | Description | Example |
|---------|-------------|---------|
| `:set number` | Enable line numbers | `:set number` |
| `:set nonumber` | Disable line numbers | `:set nonumber` |
| `:set relativenumber` | Enable relative line numbers | `:set rnu` |
| `:set norelativenumber` | Disable relative line numbers | `:set nornu` |
| `:set syntax` | Enable syntax highlighting | `:set syntax` |
| `:set nosyntax` | Disable syntax highlighting | `:set nosyntax` |
| `:set` | Show current settings | `:set` |

### 🎨 Theme Commands
| Command | Description | Available Themes |
|---------|-------------|------------------|
| `:themes` | List all themes | Shows all available themes |
| `:colorscheme <theme>` | Change theme | `dracula`, `neon`, `ocean`, `sunset` |
| `:cs <theme>` | Change theme (short) | `:cs neon` |

### 🤖 AI Commands
| Command | Description | Example |
|---------|-------------|---------|
| `:ai` | Show AI status | `:ai` |
| `:toggleAI` | Toggle AI on/off | `:toggleAI` |
| `:aimodel <model>` | Change AI model | `:aimodel llama3-70b-8192` |

### 🧠 AI Code Generation
| Command | Description | Example |
|---------|-------------|---------|
| `:generate <instruction>` | Generate new code | `:generate create a function to calculate fibonacci numbers` |
| `:gen <instruction>` | Generate code (short) | `:gen add a REST API endpoint for user login` |
| `:extend <instruction>` | Extend existing code | `:extend add error handling to this function` |
| `:implement <instruction>` | Implement feature | `:implement user authentication with JWT tokens` |

### 📖 Help Commands
| Command | Description |
|---------|-------------|
| `:help` | Show detailed help |
| `:h` | Show help (short) |

## 🤖 AI Features Deep Dive

### Code Completion
- **Trigger**: Press `Tab` in insert mode
- **Context-Aware**: Analyzes surrounding code for intelligent suggestions
- **Multiple Languages**: Works with JavaScript, Python, C++, and more
- **Clean Output**: Automatically sanitizes AI responses

### Natural Language Code Generation
Transform plain English into working code:

```
:generate create a function that sorts an array of objects by a specific property
:extend add input validation and error handling
:implement a caching mechanism for expensive operations
```

### AI Models Available
- `llama3-8b-8192` (default)
- `llama3-70b-8192`
- `llama-3.1-8b-instant`
- `llama-3.1-70b-versatile`
- `gemma-7b-it`
- `gemma2-9b-it`

## 🎨 Available Themes

### Dracula (Default)
- Dark purple background
- Vibrant syntax colors
- Easy on the eyes

### Neon
- Electric cyan and magenta
- High contrast
- Futuristic feel

### Ocean
- Blue and teal tones
- Calming colors
- Professional look

### Sunset
- Warm oranges and reds
- Cozy atmosphere
- Creative inspiration

## 📦 Dependencies

### Core Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `blessed` | ^0.1.81 | Terminal UI framework |
| `chalk` | ^4.1.2 | Terminal text styling |
| `highlight.js` | ^11.11.1 | Syntax highlighting engine |
| `node-fetch` | ^2.7.0 | HTTP requests for AI API |
| `dotenv` | ^16.4.5 | Environment variable management |

### Visual Enhancement
| Package | Version | Purpose |
|---------|---------|---------|
| `chalk-animation` | ^2.0.3 | Animated text effects |
| `figlet` | ^1.8.1 | ASCII art text |
| `gradient-string` | ^3.0.0 | Gradient text effects |
| `nanospinner` | ^1.2.2 | Loading spinners |
| `ora` | ^8.2.0 | Terminal spinners |

### Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| `fs-extra` | ^11.1.1 | Enhanced file system operations |
| `yargs` | ^17.7.2 | Command line argument parsing |
| `cardinal` | ^2.1.1 | JavaScript syntax highlighting |

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the project root:

```bash
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# AI Settings (optional)
AI_MODEL=llama3-8b-8192
AI_ENABLED=true
```

### Getting a Groq API Key
1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign up for a free account
3. Generate an API key
4. Add it to your `.env` file

## 🎯 Usage Examples

### Basic Editing Session
```bash
# Start with a new file
npm start newfile.js

# Or open existing file
npm start existing-file.py
```

### AI-Powered Development Workflow
1. **Start Editor**: `npm start app.js`
2. **Enable AI**: Ensure API key is configured
3. **Code with AI**: Use `Tab` for completions
4. **Generate Code**: `:gen create a REST API server`
5. **Extend Code**: `:extend add authentication middleware`
6. **Save & Exit**: `:wq`

### Theme Customization
```
:themes              # List all themes
:cs neon            # Switch to neon theme
:set relativenumber # Enable relative line numbers
```

## 🚀 Advanced Features

### Syntax Highlighting Support
- **JavaScript/TypeScript** - Full ES6+ support
- **Python** - Python 3.x syntax
- **C/C++** - Modern C++ standards
- **HTML/CSS** - Web development
- **JSON** - Configuration files
- **Markdown** - Documentation
- **SQL** - Database queries
- **Shell Scripts** - Bash/PowerShell

### AI Completion Intelligence
- **Context Analysis** - Understands function scope and variables
- **Language Detection** - Adapts to current file type
- **Error Prevention** - Suggests syntactically correct code
- **Best Practices** - Follows coding conventions

### Animation System
- **Welcome Screen** - Animated startup with file info
- **Code Generation** - Live progress with emojis
- **Success/Error States** - Visual feedback
- **Smooth Transitions** - Polished user experience

## 🔍 Troubleshooting

### Common Issues

#### AI Features Not Working
- Ensure `GROQ_API_KEY` is set in `.env`
- Check internet connection
- Verify API key is valid
- Try `:toggleAI` to restart AI service

#### Syntax Highlighting Issues
- File extension must be recognized
- Use `:set syntax` to enable highlighting
- Restart editor if colors don't appear

#### Performance Issues
- Large files may be slower
- Disable AI completion for better performance
- Use `:set nosyntax` for very large files

### Getting Help
- Use `:help` in the editor for quick reference
- Check the console for error messages
- Ensure all dependencies are installed

## 📈 Performance Tips

### For Large Files
- Disable relative line numbers: `:set nornu`
- Turn off syntax highlighting: `:set nosyntax`
- Disable AI features if not needed

### For Better AI Performance
- Keep context concise and relevant
- Use specific, clear instructions for code generation
- Let AI complete before requesting new suggestions

## 🤝 Contributing

We welcome contributions! Please feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgments

- **Vim** - For the inspiration and editing paradigm
- **Groq** - For providing the AI API
- **Blessed** - For the excellent terminal UI framework
- **Highlight.js** - For syntax highlighting capabilities

---

**Happy Coding with VimJS! 🚀✨**

*Made with ❤️ for developers who love terminal-based tools and AI-assisted coding.*



### AI Autocompletion Setup

To enable AI-powered code autocompletion:

1. Get a free API key from [Groq Console](https://console.groq.com/keys)
2. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your Groq API key:
   ```
   GROQ_API_KEY=your_actual_api_key_here
   ```

## Usage

```bash
# Open a file (creates it if doesn't exist)
vimjs filename.txt

# Open untitled buffer
vimjs
```

## Key Bindings

### Normal Mode

- `i` - Enter Insert mode
- `:` - Enter Command mode
- `j` / `Down Arrow` - Move cursor down
- `k` / `Up Arrow` - Move cursor up
- `h` / `Left Arrow` - Move cursor left
- `l` / `Right Arrow` - Move cursor right
- `Ctrl+t` - Cycle through available themes
- `Ctrl+c` - Quit

### Insert Mode

- `Esc` - Return to Normal mode
- `Tab` - **AI code autocompletion** (when API key is configured)
  - If AI preview is visible (grayed out text), Tab accepts the suggestion
  - If no preview, Tab triggers new AI completion request
- Arrow keys - Navigate through text
- `Enter` - Insert new line
- `Backspace` - Delete character before cursor
- **AI Preview**: Suggestions appear as grayed-out text after typing. Press Tab to accept or continue typing to dismiss.

### Command Mode

- `:w` - Write (save) file
- `:q` - Quit (won't quit if there are unsaved changes)
- `:wq` - Write and quit
- `:q!` - Force quit without saving
- `:set relativenumber` / `:set nornu` - Enable/disable relative line numbers
- `:set number` / `:set nonu` - Enable/disable line numbers
- `:set syntax` / `:set nosyntax` - Enable/disable syntax highlighting
- `:help` or `:h` - Show help information
- `:set` - Show current settings
- `:cs <theme>` or `:colorscheme <theme>` - Change color scheme (dracula, nord, tokyo-night, one-dark, solarized)
- `:themes` - List all available themes
- `:toggleAI` - Toggle AI autocompletion on/off
- `:ai` - Show AI service status and configuration
- `:aimodel <model>` - Change AI model (llama3-8b-8192, llama3-70b-8192, etc.)

## Using Command Mode and Changing Themes

### Entering Command Mode

1. Make sure you're in Normal mode (press `Esc` if you're not sure)
2. Press the colon key (`:`) to enter Command mode
3. Type your command (you should see it displayed in the status bar at the bottom)
4. Press `Enter` to execute the command
5. Press `Esc` at any time to cancel and return to Normal mode

### Changing Editor Theme

You can change the theme using either:

1. **Command Mode**: Enter command mode with `:` and type `cs <theme-name>` or `colorscheme <theme-name>` and press Enter.
   Example: `:cs dracula`

2. **Keyboard Shortcut**: Press `Ctrl+t` in normal mode to quickly cycle through all available themes.

Available themes:
- dracula
- nord
- tokyo-night
- one-dark
- solarized

## AI-Powered Code Autocompletion

VimJS now includes intelligent code autocompletion powered by Groq's large language models.

### Features

- **Context-aware suggestions**: Analyzes up to 50 lines or 800 characters before the cursor for optimal performance
- **Intelligent preview mode**: Shows suggestions as faded gray ghost text inline before accepting
- **Multi-language support**: Works with any programming language
- **Smart caching**: Caches recent completions for faster responses
- **Multiple models**: Support for LLaMA3 and other Groq models
- **Graceful error handling**: Handles rate limits, timeouts, and network issues
- **Debounced requests**: 300ms delay prevents excessive API calls while maintaining responsiveness
- **Enhanced cursor feedback**: 
  - Insert mode: Blinking vertical bar (|) cursor
  - Normal mode: Steady block (█) cursor
  - Visual synchronization between cursor and buffer content
- **Auto-scroll**: Cursor remains visible when scrolling through files

### Usage

1. **Setup**: Configure your Groq API key in the `.env` file
2. **Ghost Text Autocompletion**: In Insert mode, AI suggestions appear automatically as clearly visible dim gray text after a 300ms typing pause
3. **Accept Suggestions**: Press `Tab` to accept grayed-out AI suggestions  
4. **Continue Typing**: Keep typing to dismiss current suggestion and trigger new ones
5. **Manual Trigger**: Press `Tab` when no preview is visible to request new suggestions
6. **Toggle**: Use `:toggleAI` to enable/disable the feature
7. **Status**: Use `:ai` to check configuration and status
8. **Models**: Use `:aimodel <model-name>` to switch between models

### Supported Models

- `llama3-8b-8192` (default) - Fast and efficient for code completion
- `llama3-70b-8192` - Most capable but slower
- `llama-3.1-8b-instant` - Latest Llama 3.1 model, very fast
- `llama-3.1-70b-versatile` - Latest large model, most capable
- `gemma-7b-it` - Good balance of speed and quality
- `gemma2-9b-it` - Improved Gemma model

### Status Messages

- `[AI] Suggestion ready (Tab to accept, type to dismiss)` - Preview suggestion available
- `[AI] Suggestion applied` - Completion successfully inserted  
- `[AI] Fetching suggestion...` - Request in progress
- `[AI] Failed to fetch completion` - Generic error
- `[AI] Request timeout` - API timeout (try again)
- `[AI] Rate limit exceeded` - Too many requests
- `[AI] Check API key configuration` - Authentication issue

## Recent Improvements

- **� Fixed Character Rendering Issues**: 
  - Resolved problems with HTML tags, ANSI color codes, and special Unicode characters appearing in AI suggestions
  - Implemented comprehensive suggestion sanitization to ensure plain text only
  - Fixed ghost text visibility conflicts with syntax highlighting
- **�🔄 Enhanced Cursor Management**: Fixed cursor placement issues and improved synchronization between cursor position and buffer content
- **👁️ Mode-Specific Cursor Styling**: 
  - Insert mode: Blinking vertical bar cursor (|) for clear input indication
  - Normal mode: Steady block cursor (█) for navigation feedback
  - Command mode: Hidden cursor during command entry
- **🤖 Intelligent AI Autocompletion**: 
  - **Fixed Ghost Text Visibility**: AI suggestions now appear as clearly visible dim gray text
  - **Improved Rendering Pipeline**: Ghost text is inserted before syntax highlighting to prevent conflicts
  - **Debounced Requests**: 300ms delay prevents excessive API calls while maintaining responsiveness
  - **Smart Context**: Improved context analysis for more relevant suggestions
  - **Enhanced Cleanup**: Better suggestion formatting with comprehensive sanitization
  - **Automatic Triggers**: Suggestions appear naturally as you type with proper dismissal on ESC/cursor movement
- **⚡ Performance Optimizations**:
  - Faster AI response times with reduced timeouts (8s vs 15s)
  - Optimized context window (800 chars vs 1000 chars)
  - Improved caching and suggestion relevance
- **🎯 Better UX**:
  - Immediate preview clearing when typing continues
  - More intuitive Tab acceptance behavior
  - Enhanced status messages and visual feedback
  - Seamless typing flow without interference
- **Enhanced Character Display**: Fixed issues with special characters like quotes (`"`) and other symbols to ensure they display correctly
- **Improved File Saving**: Added more reliable file saving functionality, ensuring directories exist before saving
- **Theme Cycling Shortcut**: Added `Ctrl+t` shortcut to quickly cycle through available themes

## Syntax Highlighting

VimJS supports comprehensive syntax highlighting for 30+ programming languages, including:

- JavaScript/TypeScript/JSX/TSX
- Python
- C/C++
- Java
- HTML/CSS/SCSS/LESS
- Ruby
- Go
- Rust
- PHP
- Shell scripts (Bash, Zsh)
- Markdown
- JSON/YAML/TOML
- SQL
- and many more!

### Language Detection

VimJS automatically detects languages based on:

1. File extension (`.js`, `.py`, `.cpp`, etc.)
2. File content (shebang lines, language-specific patterns)
3. Filenames (like `Dockerfile`, `.bashrc`)

### Color Themes

Available color themes:

- `dracula` - Dark theme with vibrant colors (default)
- `nord` - Cool blue-based color scheme
- `tokyo-night` - Dark theme inspired by Tokyo at night
- `one-dark` - Atom-inspired dark theme
- `solarized` - Classic solarized dark theme

Change the theme with:

```
:cs theme-name
```

or

```
:colorscheme theme-name
```

### Performance Optimizations

For large files, VimJS uses optimized highlighting to maintain editor responsiveness.

## Dependencies

- [blessed](https://github.com/chjj/blessed) - Terminal UI library
- [chalk](https://github.com/chalk/chalk) - Terminal string styling
- [chalk-animation](https://github.com/bokub/chalk-animation) - Terminal animation effects
- [dotenv](https://github.com/motdotla/dotenv) - Environment variable loading
- [gradient-string](https://github.com/bokub/gradient-string) - Beautiful color gradients in terminal
- [figlet](https://github.com/patorjk/figlet.js) - ASCII art text generation
- [nanospinner](https://github.com/usmanyunusov/nanospinner) - Terminal spinners
- [node-fetch](https://github.com/node-fetch/node-fetch) - HTTP client for API requests
- [yargs](https://github.com/yargs/yargs) - Command-line argument parsing
- [fs-extra](https://github.com/jprichardson/node-fs-extra) - Extended filesystem methods
- [highlight.js](https://github.com/highlightjs/highlight.js) - Syntax highlighting for multiple languages
- [cardinal](https://github.com/thlorenz/cardinal) - Additional syntax highlighting capabilities

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Future Enhancements

- Multiple AI completion suggestions (like GitHub Copilot)
- AI-powered code refactoring and optimization suggestions
- Integration with more LLM providers (OpenAI, Anthropic, etc.)
- Search and replace functionality
- Visual selection mode
- Undo/redo functionality
- Split view editing
- Plugin system
