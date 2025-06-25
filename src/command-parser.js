/**
 * CommandParser class handles parsing and executing Vim-like commands
 */
class CommandParser {
  /**
   * Create new CommandParser
   * @param {Editor} editor - Reference to the editor
   */
  constructor(editor) {
    this.editor = editor;
    this.commands = {
      'w': this.saveFile.bind(this),
      'q': this.quit.bind(this),
      'wq': this.saveAndQuit.bind(this),
      'q!': this.forceQuit.bind(this),
      'set': this.showSettings.bind(this),
      'h': this.showHelp.bind(this),
      'help': this.showHelp.bind(this),
      'themes': this.listThemes.bind(this),
      'colorscheme': this.changeColorScheme.bind(this),
      'cs': this.changeColorScheme.bind(this),
    };
  }

  /**
   * Parse and execute command
   * @param {string} commandStr - Command string
   * @returns {boolean} - Command success status
   */
  parseCommand(commandStr) {
    commandStr = commandStr.trim();
    
    // Extract command base (first word)
    const commandBase = commandStr.split(' ')[0];
    
    // Check if the command exists
    if (this.commands[commandBase]) {
      return this.commands[commandBase](commandStr);
    }
    
    // Handle set commands
    if (commandStr.startsWith('set ') || commandStr.startsWith('set no')) {
      return this.handleSetCommand(commandStr);
    }
    
    return false;
  }
  
  /**
   * Handle 'set' commands
   * @param {string} commandStr - Command string
   * @returns {boolean} - Command success status
   */
  handleSetCommand(commandStr) {
    // Extract the setting name
    const parts = commandStr.split(' ');
    if (parts.length < 2) return false;
    
    const isDisable = parts[1].startsWith('no');
    const setting = isDisable ? parts[1].substring(2) : parts[1];
    
    // Handle different settings
    switch (setting) {
      case 'relativenumber':
      case 'rnu':
        this.editor.relativeLineNumbers = !isDisable;
        this.editor.showMessage(`Relative line numbers ${!isDisable ? 'enabled' : 'disabled'}`);
        return true;
      
      case 'number':
      case 'nu':
        this.editor.showLineNumbers = !isDisable;
        this.editor.showMessage(`Line numbers ${!isDisable ? 'enabled' : 'disabled'}`);
        return true;
        
      case 'syntax':
        this.editor.syntaxHighlighting = !isDisable;
        this.editor.showMessage(`Syntax highlighting ${!isDisable ? 'enabled' : 'disabled'}`);
        return true;
        
      default:
        this.editor.showMessage(`Unknown setting: ${setting}`);
        return false;
    }
  }

  /**
   * Save current file
   * @param {string} commandStr - Command string
   * @returns {boolean}
   */
  saveFile(commandStr) {
    return this.editor.saveFile();
  }

  /**
   * Quit the editor
   * @param {string} commandStr - Command string
   * @returns {boolean}
   */
  quit(commandStr) {
    if (this.editor.hasUnsavedChanges()) {
      this.editor.showMessage('No write since last change (add ! to override)');
      return false;
    }
    this.editor.quit();
    return true;
  }

  /**
   * Save file and quit
   * @param {string} commandStr - Command string
   * @returns {boolean}
   */
  saveAndQuit(commandStr) {
    const saved = this.saveFile(commandStr);
    if (saved) {
      this.editor.quit();
      return true;
    }
    return false;
  }

  /**
   * Force quit without saving
   * @param {string} commandStr - Command string
   * @returns {boolean}
   */
  forceQuit(commandStr) {
    this.editor.quit();
    return true;
  }

  /**
   * Show current settings
   * @param {string} commandStr - Command string
   * @returns {boolean}
   */
  showSettings(commandStr) {
    const settings = [
      `Line numbers: ${this.editor.showLineNumbers ? 'on' : 'off'}`,
      `Relative numbers: ${this.editor.relativeLineNumbers ? 'on' : 'off'}`,
      `Syntax highlighting: ${this.editor.syntaxHighlighting ? 'on' : 'off'}`,
      `Theme: ${this.editor.getCurrentTheme()}`
    ].join('\n');
    
    this.editor.showMessage(settings, 5000);
    return true;
  }

  /**
   * Show help information
   * @param {string} commandStr - Command string
   * @returns {boolean}
   */
  showHelp(commandStr) {
    const help = [
      'Commands:',
      ':w - Save file',
      ':q - Quit',
      ':wq - Save and quit',
      ':q! - Force quit',
      ':set relativenumber/nornu - Toggle relative line numbers',
      ':set number/nonu - Toggle line numbers',
      ':set syntax/nosyntax - Toggle syntax highlighting',
      ':cs <theme> - Change color scheme (dracula, neon, ocean, sunset)',
      ':themes - List all available themes',
      ':help/h - Show this help'
    ].join('\n');
    
    this.editor.showMessage(help, 8000);
    return true;
  }

  /**
   * List available color schemes/themes
   * @returns {boolean}
   */
  listThemes() {
    const themes = this.editor.getThemes();
    const currentTheme = this.editor.getCurrentTheme();
    const message = `Available themes: ${themes.join(', ')}\nCurrent theme: ${currentTheme}`;
    this.editor.showMessage(message, 5000);
    return true;
  }
  
  /**
   * Change or show color scheme
   * @param {string} commandStr - Command string
   * @returns {boolean}
   */
  changeColorScheme(commandStr) {
    // Extract theme name if provided (format: "cs theme-name")
    const parts = commandStr.split(' ');
    
    // If no theme name provided, show current theme
    if (parts.length === 1) {
      const currentTheme = this.editor.getCurrentTheme();
      this.editor.showMessage(`Current theme: ${currentTheme}`);
      return true;
    }
    
    // Try to set the theme
    const themeName = parts[1];
    const success = this.editor.setTheme(themeName);
    
    if (!success) {
      const themes = this.editor.getThemes();
      this.editor.showMessage(`Unknown theme: '${themeName}'. Available themes: ${themes.join(', ')}`, 5000);
      return false;
    }
    
    // Show a message confirming the change
    this.editor.showMessage(`Theme changed to: ${themeName}`);
    
    // Force a full render to apply the theme
    this.editor.render();
    
    return true;
  }
}

module.exports = CommandParser;
