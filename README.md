# VimJS

A Vim-inspired terminal-based text editor written in JavaScript

## Features

- Vim-like modal editing with normal and insert modes
- Command mode for executing commands (`:w`, `:q`, `:wq`, `:q!`)
- Relative and absolute line numbers
- Colorful status line with file info, cursor position, and language detection
- Enhanced syntax highlighting with multiple color themes (Dracula, Neon, Ocean, Sunset)
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
- `:cs <theme>` - Change color scheme (dracula, neon, ocean, sunset)
- `:themes` - List all available themes

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
