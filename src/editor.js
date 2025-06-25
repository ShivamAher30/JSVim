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
    this.aiPreviewSuggestion = null; // Store current AI preview suggestion
    this.aiPreviewTimeout = null; // Debounce timer for AI preview
    this.cursorBlinkInterval = null; // Cursor blink timer
    this.cursorVisible = true; // Cursor visibility state
    this.lastCursorPosition = { row: 0, col: 0 }; // Track last cursor position for sync
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
    
    // Start cursor blinking
    this.startCursorBlink();
    
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
    // Clear AI preview when entering normal mode or moving cursor
    this.clearAIPreview();
    
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
        this.clearAIPreview();
        this.modeManager.setNormalMode();
        break;
      case 'return':
        this.clearAIPreview();
        this.buffer.insertNewLine();
        break;
      case 'backspace':
        this.clearAIPreview();
        this.buffer.deleteCharacter();
        // Trigger AI preview after backspace with debounce
        this.triggerAIPreviewDebounced();
        break;
      case 'tab':
        // Accept AI preview if available, otherwise get new suggestion
        if (this.aiPreviewSuggestion) {
          this.acceptAIPreview();
        } else if (this.aiService.isAvailable() && !this.aiCompletionInProgress) {
          await this.handleAIPreviewCompletion();
        } else {
          // Fallback to regular tab behavior
          this.buffer.insertCharacter('\t');
        }
        break;
      case 'left':
        this.clearAIPreview();
        this.buffer.moveCursorLeft();
        break;
      case 'down':
        this.clearAIPreview();
        this.buffer.moveCursorDown();
        break;
      case 'up':
        this.clearAIPreview();
        this.buffer.moveCursorUp();
        break;
      case 'right':
        this.clearAIPreview();
        this.buffer.moveCursorRight();
        break;
      default:
        if (ch && !key.ctrl && !key.meta) {
          this.clearAIPreview();
          this.buffer.insertCharacter(ch);
          // Trigger AI preview after typing with debounce
          this.triggerAIPreviewDebounced();
        }
    }
  }

  /**
   * Handle keys in command mode
   * @param {string} ch - Character
   * @param {object} key - Key info
   */
  handleCommandModeKeys(ch, key) {
    // Clear AI preview when in command mode
    this.clearAIPreview();
    
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
   * Render editor content with improved cursor synchronization
   */
  render() {
    const content = this.buffer.getContent();
    const cursor = this.buffer.getCursor();
    let displayContent = '';
    
    // Ensure cursor position is valid and synchronized
    this.ensureCursorSync(cursor);
    
    // Determine language for syntax highlighting
    const filename = this.buffer.getFilename();
    const language = this.syntaxHighlighting ? this.syntaxHighlighter.getLanguage(filename) : null;
    
    // Add content with line numbers if enabled
    if (this.showLineNumbers) {
      // Process lines without syntax highlighting first for AI preview
      const processedContent = content.map((line, index) => {
        if (index === cursor.row && this.aiPreviewSuggestion && this.modeManager.isInsertMode()) {
          return this.insertAIPreviewInLine(line, cursor.col, this.aiPreviewSuggestion);
        }
        return line;
      });
      
      // Apply syntax highlighting to processed content if enabled
      const finalLines = language && this.syntaxHighlighting ? 
        this.syntaxHighlighter.highlightLines(processedContent, language) : 
        processedContent;
      
      finalLines.forEach((line, index) => {
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
      // Process without line numbers
      const processedContent = content.map((line, index) => {
        if (index === cursor.row && this.aiPreviewSuggestion && this.modeManager.isInsertMode()) {
          return this.insertAIPreviewInLine(line, cursor.col, this.aiPreviewSuggestion);
        }
        return line;
      });
      
      // Apply syntax highlighting to processed content if enabled
      const finalLines = language && this.syntaxHighlighting ? 
        this.syntaxHighlighter.highlightLines(processedContent, language) : 
        processedContent;
      
      finalLines.forEach(line => {
        displayContent += line + '\n';
      });
    }
    
    // Set content
    this.contentBox.setContent(displayContent);
    
    // Calculate cursor position (accounting for line numbers and scrolling)
    const cursorX = cursor.col + (this.showLineNumbers ? this.lineNumberWidth : 0);
    const cursorY = cursor.row;
    
    // Ensure cursor is visible by scrolling if necessary
    this.ensureCursorVisible(cursorY);
    
    // Set cursor with mode-specific styling
    this.setCursorPosition(cursorY, cursorX);
    
    // Update status line with additional info
    this.statusLine.update({
      mode: this.modeManager.getMode(),
      filename: this.buffer.getFilename(),
      modified: this.buffer.isModified(),
      cursor: cursor,
      commandBuffer: this.modeManager.getCommandBuffer(),
      language: language || 'plain',
      lineCount: content.length,
      aiEnabled: this.aiService.enabled,
      aiPreview: this.aiPreviewSuggestion ? 'AI suggestion available' : null
    });
    
    // Update last cursor position for sync tracking
    this.lastCursorPosition = { ...cursor };
    
    // Render changes
    this.screen.render();
  }

  /**
   * Start cursor blinking with mode-specific behavior
   */
  startCursorBlink() {
    // Clear any existing blink interval
    if (this.cursorBlinkInterval) {
      clearInterval(this.cursorBlinkInterval);
    }
    
    // Start blinking every 500ms for insert mode only
    this.cursorBlinkInterval = setInterval(() => {
      if (this.modeManager.isInsertMode()) {
        this.cursorVisible = !this.cursorVisible;
        this.updateCursorDisplay();
      } else {
        // Always show cursor in normal mode
        this.cursorVisible = true;
        this.updateCursorDisplay();
      }
    }, 500);
  }

  /**
   * Stop cursor blinking
   */
  stopCursorBlink() {
    if (this.cursorBlinkInterval) {
      clearInterval(this.cursorBlinkInterval);
      this.cursorBlinkInterval = null;
    }
    this.cursorVisible = true;
  }

  /**
   * Update cursor display
   */
  updateCursorDisplay() {
    const cursor = this.buffer.getCursor();
    const cursorX = cursor.col + (this.showLineNumbers ? this.lineNumberWidth : 0);
    const cursorY = cursor.row;
    
    this.setCursorPosition(cursorY, cursorX);
    this.screen.render();
  }

  /**
   * Set cursor position with mode-specific styling
   */
  setCursorPosition(row, col) {
    if (this.modeManager.isInsertMode()) {
      // Insert mode: show blinking vertical bar cursor
      if (this.cursorVisible) {
        this.screen.program.cup(row, col);
        this.screen.program.showCursor();
        // Set cursor style to vertical bar (if terminal supports it)
        this.screen.program.write('\x1b[6 q'); // Steady bar
      } else {
        this.screen.program.hideCursor();
      }
    } else if (this.modeManager.isNormalMode()) {
      // Normal mode: show steady block cursor
      this.screen.program.cup(row, col);
      this.screen.program.showCursor();
      // Set cursor style to block (if terminal supports it)
      this.screen.program.write('\x1b[2 q'); // Steady block
    } else {
      // Command mode: hide cursor
      this.screen.program.hideCursor();
    }
  }

  /**
   * Ensure cursor is visible in viewport
   */
  ensureCursorVisible(cursorRow) {
    const box = this.contentBox;
    const scrollTop = box.getScrollPerc() * Math.max(0, box.getScrollHeight() - box.height);
    const visibleTop = Math.floor(scrollTop);
    const visibleBottom = visibleTop + box.height - 1;

    // Scroll if cursor is outside visible area
    if (cursorRow < visibleTop) {
      // Cursor is above visible area - scroll up
      box.scrollTo(cursorRow);
    } else if (cursorRow > visibleBottom) {
      // Cursor is below visible area - scroll down
      const newScrollTop = cursorRow - box.height + 1;
      box.scrollTo(Math.max(0, newScrollTop));
    }
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
    // Clean up cursor blinking
    this.stopCursorBlink();
    
    // Clean up AI preview timeout
    clearTimeout(this.aiPreviewTimeout);
    
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
   * Handle AI-powered code completion with preview
   */
  async handleAIPreviewCompletion() {
    if (this.aiCompletionInProgress || !this.aiService.isAvailable()) {
      return;
    }

    this.aiCompletionInProgress = true;

    try {
      // Get current context
      const cursor = this.buffer.getCursor();
      const lines = this.buffer.getContent();
      const currentLine = lines[cursor.row] || '';
      
      // Don't suggest if cursor is at the beginning of a line or on empty content
      if (cursor.col === 0 && currentLine.trim() === '') {
        return;
      }
      
      // Don't suggest if we just completed a word/statement
      const charBeforeCursor = currentLine[cursor.col - 1];
      if (charBeforeCursor && /[;}\])]/.test(charBeforeCursor)) {
        return;
      }
      
      const context = this.aiService.getCodeContext(lines, cursor.row, cursor.col);
      
      // Skip if context is too short to be meaningful
      if (context.trim().length < 10) {
        return;
      }

      // Get AI suggestion with timeout
      const suggestion = await this.aiService.getAISuggestion(context);

      if (suggestion && suggestion.length > 0) {
        // Clean up the suggestion
        const cleanSuggestion = this.cleanAISuggestion(suggestion, currentLine, cursor.col);
        
        if (cleanSuggestion && cleanSuggestion.length > 0) {
          // Store as preview suggestion
          this.aiPreviewSuggestion = cleanSuggestion;
          // Don't show intrusive messages during preview - just update status
          this.render(); // Force render to show preview
        }
      }

    } catch (error) {
      console.error('AI preview completion error:', error);
      
      // Show user-friendly error messages only for critical errors
      if (error.message.includes('Authentication') || error.message.includes('API key')) {
        this.showMessage('[AI] Check API key configuration', 2000, 'error');
      } else if (error.message.includes('Rate limit')) {
        this.showMessage('[AI] Rate limit reached', 2000, 'warning');
      }
      // Don't show timeout or network errors to avoid spam
    } finally {
      this.aiCompletionInProgress = false;
    }
  }

  /**
   * Accept AI preview suggestion
   */
  acceptAIPreview() {
    if (this.aiPreviewSuggestion) {
      this.insertAISuggestion(this.aiPreviewSuggestion);
      this.showMessage(`[AI] Suggestion applied`, 2000, 'success');
      this.clearAIPreview();
    }
  }

  /**
   * Clear AI preview suggestion
   */
  clearAIPreview() {
    if (this.aiPreviewSuggestion) {
      this.aiPreviewSuggestion = null;
      // Clear the preview message immediately
      this.statusLine.clearMessage();
    }
    clearTimeout(this.aiPreviewTimeout);
  }

  /**
   * Handle AI-powered code completion (legacy method for direct completion)
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

  /**
   * Ensure cursor position is synchronized with buffer
   */
  ensureCursorSync(cursor) {
    const content = this.buffer.getContent();
    
    // Validate cursor row
    if (cursor.row < 0) {
      cursor.row = 0;
    } else if (cursor.row >= content.length) {
      cursor.row = content.length - 1;
    }
    
    // Validate cursor column
    const currentLine = content[cursor.row] || '';
    if (cursor.col < 0) {
      cursor.col = 0;
    } else if (cursor.col > currentLine.length) {
      cursor.col = currentLine.length;
    }
    
    // Update buffer cursor if it was corrected
    if (cursor.row !== this.lastCursorPosition.row || cursor.col !== this.lastCursorPosition.col) {
      this.buffer.cursor = cursor;
    }
  }

  /**
   * Insert AI preview suggestion into a line for display
   */
  insertAIPreviewInLine(line, cursorCol, suggestion) {
    if (!suggestion || suggestion.length === 0) {
      return line;
    }
    
    // Ensure we're working with plain text
    const plainLine = this.stripAnsiCodes(line);
    const beforeCursor = plainLine.substring(0, cursorCol);
    const afterCursor = plainLine.substring(cursorCol);
    
    // Create ghost text with clear visual distinction
    // Use dim gray text with subtle background that's clearly distinguishable
    const ghostText = chalk.gray.dim(suggestion);
    // Alternative: Use inverse colors for even better visibility
    // const ghostText = chalk.inverse.gray(suggestion);
    
    return beforeCursor + ghostText + afterCursor;
  }

  /**
   * Strip ANSI color codes from text
   */
  stripAnsiCodes(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }

  /**
   * Trigger AI preview with debouncing
   */
  triggerAIPreviewDebounced() {
    if (!this.aiService.isAvailable() || this.aiCompletionInProgress) {
      return;
    }
    
    // Clear existing timeout
    if (this.aiPreviewTimeout) {
      clearTimeout(this.aiPreviewTimeout);
    }
    
    // Set new timeout with 400ms debounce for optimal responsiveness
    this.aiPreviewTimeout = setTimeout(async () => {
      if (this.modeManager.isInsertMode()) { // Only trigger in insert mode
        await this.handleAIPreviewCompletion();
      }
    }, 400);
  }

  /**
   * Clean AI suggestion to make it more appropriate for preview
   */
  cleanAISuggestion(suggestion, currentLine, cursorCol) {
    if (!suggestion || typeof suggestion !== 'string') return '';
    
    // Remove common prefixes that might duplicate existing text
    let cleaned = suggestion.trim();
    
    // Get text before cursor to avoid duplication
    const textBeforeCursor = currentLine.substring(0, cursorCol);
    const lastWord = textBeforeCursor.split(/\s+/).pop() || '';
    
    // If suggestion starts with the last partial word, remove it
    if (lastWord && cleaned.toLowerCase().startsWith(lastWord.toLowerCase())) {
      cleaned = cleaned.substring(lastWord.length);
    }
    
    // Remove leading/trailing quotes or brackets if they don't make sense
    cleaned = cleaned.replace(/^["'`]/, '').replace(/["'`]$/, '');
    
    // For single line suggestions, limit length to be reasonable
    if (!cleaned.includes('\n')) {
      cleaned = cleaned.substring(0, 60); // Reduced from 80 for better visibility
    } else {
      // For multi-line, limit to 2 lines for better preview
      const lines = cleaned.split('\n');
      if (lines.length > 2) {
        cleaned = lines.slice(0, 2).join('\n');
      }
    }
    
    // Remove any remaining problematic characters
    cleaned = cleaned.replace(/[^\x20-\x7E\t\n\r]/g, '');
    
    return cleaned.trim();
  }
}

module.exports = Editor;
