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
      'toggleAI': this.toggleAI.bind(this),
      'ai': this.showAIStatus.bind(this),
      'aimodel': this.changeAIModel.bind(this),
      'generate': this.generateCode.bind(this),
      'gen': this.generateCode.bind(this),
      'extend': this.extendCode.bind(this),
      'implement': this.implementFeature.bind(this),
    };
  }

  /**
   * Parse and execute command
   * @param {string} commandStr - Command string
   * @returns {boolean} - Command success status
   */
  async parseCommand(commandStr) {
    commandStr = commandStr.trim();
    
    // Extract command base (first word)
    const commandBase = commandStr.split(' ')[0];
    
    // Check if the command exists
    if (this.commands[commandBase]) {
      return await this.commands[commandBase](commandStr);
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
      ':ai - Toggle AI completion and show status',
      ':aimodel <model> - Change AI model',
      '',
      'AI Code Generation:',
      ':generate <instruction> - Generate new code from description',
      ':gen <instruction> - Same as generate (short form)',
      ':extend <instruction> - Extend existing code with new functionality',
      ':implement <instruction> - Implement a specific feature',
      '',
      'Examples:',
      ':gen create a function to calculate fibonacci numbers',
      ':extend add error handling to this function',
      ':implement user authentication with JWT tokens',
      '',
      ':help/h - Show this help'
    ].join('\n');
    
    this.editor.showMessage(help, 10000);
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

  /**
   * Toggle AI autocompletion
   * @returns {boolean}
   */
  toggleAI() {
    this.editor.toggleAI();
    return true;
  }

  /**
   * Show/Toggle AI status with clear feedback
   * @returns {boolean}
   */
  showAIStatus() {
    // Toggle AI and get new status
    const newState = this.editor.toggleAI();
    const status = this.editor.getAIStatus();
    
    // Show clear toggle confirmation message
    const statusText = status.enabled ? 'enabled' : 'disabled';
    let message = `[AI] Completion ${statusText}`;
    
    if (status.enabled) {
      if (!status.available) {
        message += ' ⚠️ (API key missing or invalid)';
      } else {
        message += ` | Model: ${status.model}`;
      }
    }
    
    this.editor.showMessage(message, 3000);
    
    // Force a render to update status bar immediately
    this.editor.render();
    
    return true;
  }

  /**
   * Change AI model
   * @param {string} commandStr - Command string
   * @returns {boolean}
   */
  changeAIModel(commandStr) {
    const parts = commandStr.split(' ');
    
    if (parts.length === 1) {
      const currentModel = this.editor.aiService.getModel();
      const supportedModels = this.editor.aiService.getSupportedModels();
      this.editor.showMessage(`Current model: ${currentModel}. Available: ${supportedModels.join(', ')}`, 5000);
      return true;
    }
    
    const modelName = parts[1];
    const success = this.editor.aiService.setModel(modelName);
    
    if (!success) {
      const supportedModels = this.editor.aiService.getSupportedModels();
      this.editor.showMessage(`Unknown model: '${modelName}'. Available: ${supportedModels.join(', ')}`, 5000);
      return false;
    }
    
    this.editor.showMessage(`AI model changed to: ${modelName}`);
    return true;
  }

  /**
   * Generate code based on natural language instruction
   * @param {string} commandStr - Command string with instruction
   * @returns {boolean}
   */
  async generateCode(commandStr) {
    const instruction = this.extractInstruction(commandStr, 'generate');
    if (!instruction) {
      this.editor.showMessage('Usage: :generate <instruction> or :gen <instruction>', 3000, 'warning');
      return false;
    }

    return await this.handleCodeGeneration(instruction, 'generate');
  }

  /**
   * Extend existing code based on natural language instruction
   * @param {string} commandStr - Command string with instruction
   * @returns {boolean}
   */
  async extendCode(commandStr) {
    const instruction = this.extractInstruction(commandStr, 'extend');
    if (!instruction) {
      this.editor.showMessage('Usage: :extend <instruction>', 3000, 'warning');
      return false;
    }

    return await this.handleCodeGeneration(instruction, 'extend');
  }

  /**
   * Implement a feature based on natural language instruction
   * @param {string} commandStr - Command string with instruction
   * @returns {boolean}
   */
  async implementFeature(commandStr) {
    const instruction = this.extractInstruction(commandStr, 'implement');
    if (!instruction) {
      this.editor.showMessage('Usage: :implement <instruction>', 3000, 'warning');
      return false;
    }

    return await this.handleCodeGeneration(instruction, 'implement');
  }

  /**
   * Extract instruction from command string
   * @param {string} commandStr - Full command string
   * @param {string} command - Command name to remove
   * @returns {string|null} - Extracted instruction
   */
  extractInstruction(commandStr, command) {
    const parts = commandStr.split(' ');
    if (parts.length < 2) {
      return null;
    }

    // Remove the command part and join the rest as instruction
    parts.shift(); // Remove command
    return parts.join(' ').trim();
  }

  /**
   * Handle code generation based on instruction and mode
   * @param {string} instruction - Natural language instruction
   * @param {string} mode - Generation mode (generate, extend, implement)
   * @returns {boolean}
   */
  async handleCodeGeneration(instruction, mode) {
    try {
      this.editor.showMessage(`[AI] Processing ${mode} request...`, 0, 'info');
      
      const result = await this.editor.generateCodeFromInstruction(instruction, mode);
      
      if (result) {
        this.editor.showMessage(`[AI] Code ${mode}d successfully`, 2000, 'success');
        return true;
      } else {
        this.editor.showMessage(`[AI] Failed to ${mode} code`, 3000, 'error');
        return false;
      }
    } catch (error) {
      console.error(`Code generation error (${mode}):`, error);
      
      let errorMessage = `[AI] ${mode} failed`;
      
      if (error.message.includes('timeout')) {
        errorMessage += ' - request timeout';
      } else if (error.message.includes('Authentication')) {
        errorMessage += ' - check API key';
      } else if (error.message.includes('Rate limit')) {
        errorMessage += ' - rate limit exceeded';
      }
      
      this.editor.showMessage(errorMessage, 3000, 'error');
      return false;
    }
  }
}

module.exports = CommandParser;
