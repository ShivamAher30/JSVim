const blessed = require('blessed');
const chalk = require('chalk');
const TextBuffer = require('./text-buffer');
const ModeManager = require('./mode-manager');
const CommandParser = require('./command-parser');
const StatusLine = require('./status-line');
const SyntaxHighlighter = require('./enhanced-syntax-highlighter');
const Animations = require('./animations');
const AIService = require('./ai-service');

/**
 * Main Editor class
 */
class Editor {
  /**
   * Create a new Editor
   * @param {Object|string} options - Options object or file path
   * @param {string} options.filename - Path to the file to edit
   * @param {string} options.content - Initial content
   */
  constructor(options) {
    // Handle both string path and options object
    const filePath = typeof options === 'string' ? options : options.filename;
    const initialContent = typeof options === 'string' ? null : options.content;

    this.buffer = new TextBuffer(filePath, initialContent);
    this.modeManager = new ModeManager();
    this.commandParser = new CommandParser(this);
    this.syntaxHighlighter = new SyntaxHighlighter();
    this.aiService = new AIService();
    
    this.screen = null;
    this.contentBox = null;
    this.statusLine = null;
    this.animations = null;
    
    this.lineNumberWidth = 6; // Width of line numbers column
    this.showLineNumbers = true; // Whether to show line numbers
    this.relativeLineNumbers = true; // Whether to show relative line numbers
    this.syntaxHighlighting = true; // Whether to enable syntax highlighting
    this.aiCompletionInProgress = false; // Track if AI completion is in progress
  }

  /**
   * Start the editor
   */
  async start() {
    // Create screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: `VimJS - ${this.buffer.getFilename()}`
    });
    
    // Initialize animations
    this.animations = new Animations(this.screen);
    
    // Show welcome animation
    await this.animations.welcomeAnimation(this.buffer.getFilename());
    
    // Create content box for text editing
    this.contentBox = blessed.box({
      top: 0,
      left: 0,
      right: 0,
      bottom: 1, // Leave space for status line
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      mouse: true,
      border: {
        type: 'line',
        fg: 'blue'
      },
      scrollbar: {
        ch: '█',
        track: {
          bg: 'black'
        },
        style: {
          fg: 'cyan'
        }
      },
      style: {
        fg: 'white',
        bg: 'black',
      }
    });
    
    // Create status line
    this.statusLine = new StatusLine(this.screen);
    
    // Add content box to screen
    this.screen.append(this.contentBox);
    
    // Set key handling
    this.setupKeyHandlers();
    
    // Set initial focus
    this.contentBox.focus();
    
    // Initial render
    this.render();
    
    // Start screen event loop
    this.screen.render();
  }

  /**
   * Set up key event handlers
   */
  setupKeyHandlers() {
    // Allow quitting with Ctrl+C
    this.screen.key(['C-c'], () => {
      return this.quit();
    });
    
    // Handle key events
    this.screen.on('keypress', async (ch, key) => {
      if (!key) return;
      
      if (this.modeManager.isNormalMode()) {
        this.handleNormalModeKeys(ch, key);
      } else if (this.modeManager.isInsertMode()) {
        await this.handleInsertModeKeys(ch, key);
      } else if (this.modeManager.isCommandMode()) {
        this.handleCommandModeKeys(ch, key);
      }
      
      // Update UI
      this.render();
    });
  }

  /**
   * Handle keys in normal mode
   * @param {string} ch - Character
   * @param {object} key - Key info
   */
  handleNormalModeKeys(ch, key) {
    // Handle colon character for command mode
    if (ch === ':') {
      this.modeManager.setCommandMode();
      return;
    }
    
    switch (key.name) {
      case 'i':
        this.modeManager.setInsertMode();
        break;
      case ':':
        this.modeManager.setCommandMode();
        break;
      // Theme switching shortcut
      case 't':
        if (key.ctrl) {
          this.cycleTheme();
        }
        break;
      // Navigation keys
      case 'h':
        this.buffer.moveCursorLeft();
        break;
      case 'j':
        this.buffer.moveCursorDown();
        break;
      case 'k':
        this.buffer.moveCursorUp();
        break;
      case 'l':
        this.buffer.moveCursorRight();
        break;
      // Arrow keys also work
      case 'left':
        this.buffer.moveCursorLeft();
        break;
      case 'down':
        this.buffer.moveCursorDown();
        break;
      case 'up':
        this.buffer.moveCursorUp();
        break;
      case 'right':
        this.buffer.moveCursorRight();
        break;
    }
  }

  /**
   * Handle keys in insert mode
   * @param {string} ch - Character
   * @param {object} key - Key info
   */
  async handleInsertModeKeys(ch, key) {
    switch (key.name) {
      case 'escape':
        this.modeManager.setNormalMode();
        break;
      case 'return':
        this.buffer.insertNewLine();
        break;
      case 'backspace':
        this.buffer.deleteCharacter();
        break;
      case 'tab':
        // AI autocompletion on Tab key
        if (this.aiService.isAvailable() && !this.aiCompletionInProgress) {
          await this.handleAICompletion();
        } else {
          // Fallback to regular tab behavior
          this.buffer.insertCharacter('\t');
        }
        break;
      case 'left':
        this.buffer.moveCursorLeft();
        break;
      case 'down':
        this.buffer.moveCursorDown();
        break;
      case 'up':
        this.buffer.moveCursorUp();
        break;
      case 'right':
        this.buffer.moveCursorRight();
        break;
      default:
        if (ch && !key.ctrl && !key.meta) {
          this.buffer.insertCharacter(ch);
        }
    }
  }

  /**
   * Handle keys in command mode
   * @param {string} ch - Character
   * @param {object} key - Key info
   */
  handleCommandModeKeys(ch, key) {
    switch (key.name) {
      case 'escape':
        this.modeManager.setNormalMode();
        break;
      case 'return':
        const command = this.modeManager.executeCommand();
        const result = this.commandParser.parseCommand(command);
        if (!result) {
          this.showMessage(`Unknown command: ${command}`);
        }
        break;
      case 'backspace':
        this.modeManager.removeFromCommandBuffer();
        break;
      default:
        if (ch && !key.ctrl && !key.meta && key.name !== 'tab') {
          this.modeManager.addToCommandBuffer(ch);
        }
    }
  }

  /**
   * Render editor content
   */
  render() {
    const content = this.buffer.getContent();
    const cursor = this.buffer.getCursor();
    let displayContent = '';
    
    // Determine language for syntax highlighting
    const filename = this.buffer.getFilename();
    const language = this.syntaxHighlighting ? this.syntaxHighlighter.getLanguage(filename) : null;
    
    // Add content with line numbers if enabled
    if (this.showLineNumbers) {
      // Apply syntax highlighting if enabled and language detected
      const highlightedLines = language ? this.syntaxHighlighter.highlightLines(content, language) : content;
      
      highlightedLines.forEach((line, index) => {
        // Calculate line number (absolute or relative)
        let lineNumber;
        if (this.relativeLineNumbers && index !== cursor.row) {
          // Calculate the relative distance from the current line
          const distance = Math.abs(index - cursor.row);
          lineNumber = String(distance).padStart(this.lineNumberWidth - 2, ' ');
        } else {
          // Use absolute line numbers for current line or if relative is disabled
          lineNumber = String(index + 1).padStart(this.lineNumberWidth - 2, ' ');
        }
        
        // Apply different styles to current line number
        const lineNumberStyle = index === cursor.row 
          ? chalk.yellow.bold(`${lineNumber} >`) 
          : chalk.gray(`${lineNumber} |`);
          
        displayContent += lineNumberStyle + line + '\n';
      });
    } else {
      // Highlight without line numbers
      if (language && this.syntaxHighlighting) {
        const highlightedLines = this.syntaxHighlighter.highlightLines(content, language);
        displayContent = highlightedLines.join('\n');
      } else {
        displayContent = content.join('\n');
      }
    }
    
    // Set content
    this.contentBox.setContent(displayContent);
    
    // Calculate cursor position (accounting for line numbers)
    const cursorX = cursor.col + (this.showLineNumbers ? this.lineNumberWidth : 0);
    const cursorY = cursor.row;
    
    // Set cursor
    this.screen.program.cup(cursorY, cursorX);
    
    // Update status line with additional info
    this.statusLine.update({
      mode: this.modeManager.getMode(),
      filename: this.buffer.getFilename(),
      modified: this.buffer.isModified(),
      cursor: cursor,
      commandBuffer: this.modeManager.getCommandBuffer(),
      language: language || 'plain',
      lineCount: content.length
    });
    
    // Render changes
    this.screen.render();
  }

  /**
   * Save the current file
   * @returns {boolean} - Success status
   */
  saveFile() {
    // Show a loading spinner if animations are available
    const spinner = this.animations ? 
      this.animations.showLoadingSpinner(`Saving ${this.buffer.getFilename()}...`) : 
      null;
    
    // Perform the save operation
    const result = this.buffer.saveFile();
    
    // Update spinner and show message
    if (result) {
      if (spinner) {
        spinner.succeed(`"${this.buffer.getFilename()}" written`);
      }
      this.showMessage(`"${this.buffer.getFilename()}" written`, 3000, 'success');
      return true;
    } else {
      if (spinner) {
        spinner.fail('Error writing file');
      }
      this.showMessage('Error writing file', 3000, 'error');
      return false;
    }
  }

  /**
   * Show message in status line
   * @param {string} message - Message to show
   * @param {number} duration - Duration in ms
   * @param {string} type - Message type (info, success, error, warning)
   */
  showMessage(message, duration, type = 'info') {
    if (this.statusLine) {
      this.statusLine.showMessage(message, duration);
    }
    
    // If it's an important message, use animation flash as well
    if (type !== 'info' && this.animations) {
      this.animations.flashNotification(message, type);
    }
  }

  /**
   * Check if there are unsaved changes
   * @returns {boolean}
   */
  hasUnsavedChanges() {
    return this.buffer.isModified();
  }

  /**
   * Quit the editor
   */
  quit() {
    this.screen.destroy();
    process.exit(0);
  }

  /**
   * Set the syntax highlighting theme
   * @param {string} themeName - Theme name
   * @returns {boolean} - Success status
   */
  setTheme(themeName) {
    const success = this.syntaxHighlighter.setTheme(themeName);
    if (success) {
      this.render();
      if (this.animations) {
        this.animations.flashNotification(`Theme changed to: ${themeName}`, 'success');
      }
    }
    return success;
  }

  /**
   * Get list of available themes
   * @returns {Array<string>} - Theme names
   */
  getThemes() {
    return this.syntaxHighlighter.getThemes();
  }

  /**
   * Get current theme name
   * @returns {string} - Current theme name
   */
  getCurrentTheme() {
    return this.syntaxHighlighter.getCurrentTheme();
  }

  /**
   * Cycle to the next available theme
   * @returns {boolean} - Success status
   */
  cycleTheme() {
    const themes = this.getThemes();
    const currentTheme = this.getCurrentTheme();
    const currentIndex = themes.indexOf(currentTheme);
    
    // Get next theme in the list
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    return this.setTheme(nextTheme);
  }

  /**
   * Handle AI-powered code completion
   */
  async handleAICompletion() {
    if (this.aiCompletionInProgress) {
      return;
    }

    this.aiCompletionInProgress = true;

    try {
      // Show loading message
      this.showMessage('[AI] Fetching suggestion...', 0, 'info');
      this.render(); // Force render to show the message immediately

      // Get current context
      const cursor = this.buffer.getCursor();
      const lines = this.buffer.getContent();
      const context = this.aiService.getCodeContext(lines, cursor.row, cursor.col);

      // Get AI suggestion
      const suggestion = await this.aiService.getAISuggestion(context);

      if (suggestion && suggestion.length > 0) {
        // Insert the suggestion at current cursor position
        this.insertAISuggestion(suggestion);
        this.showMessage(`[AI] Suggestion applied`, 2000, 'success');
      } else {
        this.showMessage('[AI] No suggestion available', 2000, 'warning');
      }

    } catch (error) {
      console.error('AI completion error:', error);
      
      // Show user-friendly error messages
      let errorMessage = '[AI] Failed to fetch completion';
      
      if (error.message.includes('timeout')) {
        errorMessage = '[AI] Request timeout - try again';
      } else if (error.message.includes('Rate limit')) {
        errorMessage = '[AI] Rate limit exceeded';
      } else if (error.message.includes('Authentication')) {
        errorMessage = '[AI] Check API key configuration';
      } else if (error.message.includes('not available')) {
        errorMessage = '[AI] Service not configured';
      }
      
      this.showMessage(errorMessage, 3000, 'error');
    } finally {
      this.aiCompletionInProgress = false;
    }
  }

  /**
   * Insert AI suggestion into the buffer
   * @param {string} suggestion - The AI-generated code suggestion
   */
  insertAISuggestion(suggestion) {
    // Clean up the suggestion - remove leading/trailing whitespace
    suggestion = suggestion.trim();
    
    if (!suggestion) {
      return;
    }

    // Split suggestion into lines if it contains newlines  
    const suggestionLines = suggestion.split('\n');
    
    // Insert each line
    for (let i = 0; i < suggestionLines.length; i++) {
      const line = suggestionLines[i];
      
      if (i === 0) {
        // First line: insert at current cursor position
        for (const char of line) {
          this.buffer.insertCharacter(char);
        }
      } else {
        // Subsequent lines: insert newline first, then the content
        this.buffer.insertNewLine();
        for (const char of line) {
          this.buffer.insertCharacter(char);
        }
      }
    }
  }

  /**
   * Toggle AI completion on/off
   * @returns {boolean} - New AI enabled state
   */
  toggleAI() {
    const newState = this.aiService.toggle();
    const status = newState ? 'enabled' : 'disabled';
    this.showMessage(`[AI] Autocompletion ${status}`, 2000, 'info');
    return newState;
  }

  /**
   * Get AI service status information
   * @returns {Object} - AI service status
   */
  getAIStatus() {
    return {
      enabled: this.aiService.enabled,
      available: this.aiService.isAvailable(),
      model: this.aiService.getModel(),
      apiKeyConfigured: this.aiService.apiKey.length > 0
    };
  }
}

module.exports = Editor;
