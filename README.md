# VimJS

A Vim-inspired terminal-based text editor written in JavaScript

## Features

- Vim-like modal editing with normal and insert modes
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

## Usage

```bash
# Open a file (creates it if doesn't exist)
vimjs filename.txt

# Open untitled buffer
vimjs
```

## Key Bindings

### Normal Mode

- `i` - Enter insert mode
- `:` - Enter command mode
- `h` - Move cursor left
- `j` - Move cursor down
- `k` - Move cursor up
- `l` - Move cursor right
- Arrow keys also work for navigation

### Insert Mode

- `Escape` - Return to normal mode
- `Enter` - Insert new line
- `Backspace` - Delete character before cursor

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

## Using Command Mode and Changing Themes

### Entering Command Mode

1. Make sure you're in Normal mode (press `Esc` if you're not sure)
2. Press the colon key (`:`) to enter Command mode
3. Type your command (you should see it displayed in the status bar at the bottom)
4. Press `Enter` to execute the command
5. Press `Esc` at any time to cancel and return to Normal mode

### Changing Editor Theme

VimJS supports multiple beautiful themes that enhance syntax highlighting:

1. In Normal mode, press `:` to enter Command mode
2. Type `cs theme-name` or `colorscheme theme-name` (e.g., `:cs nord`)
3. Press `Enter` to apply the theme

Available themes:
- `dracula` - Default theme with vibrant colors
- `nord` - Cool blue-based color scheme
- `tokyo-night` - Dark theme inspired by Tokyo at night
- `one-dark` - Atom-inspired dark theme
- `solarized` - Classic solarized dark theme

To list all available themes:
1. Enter Command mode with `:`
2. Type `themes`
3. Press `Enter`

### Troubleshooting Command Mode

If you can't see what you're typing in Command mode:
- Check that the status bar at the bottom of the screen is visible
- Press `Esc` and try entering Command mode again with `:`
- If text is still not visible, try resizing your terminal window

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
- [gradient-string](https://github.com/bokub/gradient-string) - Beautiful color gradients in terminal
- [figlet](https://github.com/patorjk/figlet.js) - ASCII art text generation
- [nanospinner](https://github.com/usmanyunusov/nanospinner) - Terminal spinners
- [yargs](https://github.com/yargs/yargs) - Command-line argument parsing
- [fs-extra](https://github.com/jprichardson/node-fs-extra) - Extended filesystem methods
- [highlight.js](https://github.com/highlightjs/highlight.js) - Syntax highlighting for multiple languages
- [cardinal](https://github.com/thlorenz/cardinal) - Additional syntax highlighting capabilities

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Future Enhancements

- Syntax highlighting for common languages
- Search and replace functionality
- Visual selection mode
- Undo/redo functionality
- Split view editing
- Plugin system
