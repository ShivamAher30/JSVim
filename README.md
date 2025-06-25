# VimJS

A Vim-inspired terminal-based text editor written in JavaScript

## Features

- Vim-like modal editing with normal and insert modes
- **AI-powered code autocompletion** using Groq's LLM API (Mixtral, LLaMA3)
- Command mode for executing commands (`:w`, `:q`, `:wq`, `:q!`)
- Relative and absolute line numbers
- Colorful status line with file info, cursor position, and language detection
- Comprehensive syntax highlighting with support for 30+ languages
- Multiple beautiful color themes (Dracula, Nord, Tokyo Night, One Dark, Solarized)
- Intelligent language detection based on file extension and content
- Eye-catching animations for file opening and operations
- Visual notifications and loading indicators
- File navigation using Vim-like keys (h/j/k/l) or arrow keys
- Simple file operations (open, edit, save)
- Terminal UI with borders and scrollbars using blessed library
- Customizable settings through command mode

## Installation

Install globally from npm:

```bash
npm install -g vimjs
```

Or install from the repository:

```bash
git clone https://github.com/yourusername/vimjs.git
cd vimjs
npm install
npm link
```

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
