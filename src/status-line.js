const blessed = require('blessed');
const chalk = require('chalk');

/**
 * StatusLine class for rendering the editor status line
 */
class StatusLine {
  /**
   * Create a new StatusLine
   * @param {blessed.screen} screen - Blessed screen instance
   * @param {object} options - Status line options
   */
  constructor(screen, options = {}) {
    const { height = 1, bottom = 0 } = options;
    
    this.screen = screen;
    this.message = '';
    this.messageTimeout = null;

    // Create the status line box
    this.statusBox = blessed.box({
      bottom: bottom,
      left: 0,
      right: 0,
      height: height,
      tags: true,
      padding: {
        left: 1,
        right: 1
      },
      style: {
        fg: 'white',
        bg: 'blue',
        bold: true,
        border: {
          fg: 'white',
        },
      }
    });

    // Create message box for temporary messages
    this.messageBox = blessed.box({
      bottom: bottom + height,
      left: 0,
      right: 0,
      height: 1,
      content: '',
      tags: true,
      style: {
        fg: 'white',
        bg: 'red',
      },
      hidden: true
    });

    // Add to screen
    screen.append(this.statusBox);
    screen.append(this.messageBox);
  }

  /**
   * Update status line content
   * @param {object} data - Status data
   */
  update(data) {
    const { mode, filename, modified, cursor, commandBuffer, language, lineCount } = data;
    
    // If in command mode, show the command buffer with proper formatting
    if (mode === 'command') {
      // Make command text bold with high contrast colors for maximum visibility
      this.statusBox.style.bg = 'black';
      this.statusBox.style.fg = 'white';
      this.statusBox.style.bold = true;
      
      // Create the command display with clear visual indicators
      const commandText = commandBuffer || ':';
      const displayText = `{yellow-fg}{bold}${commandText}{/bold}{/yellow-fg}`;
      
      this.statusBox.setContent(displayText);
      
      // Force screen render to ensure visibility
      this.screen.render();
      return;
    }
    
    // Reset style for other modes
    this.statusBox.style.bg = 'blue';
    this.statusBox.style.fg = 'white';
    
    // Build status line content
    const modeDisplay = this.getModeDisplay(mode);
    const fileDisplay = `${filename}${modified ? ' [+]' : ''}`;
    const positionDisplay = `${cursor.row + 1},${cursor.col + 1}`;
    
    // Add language if available
    const langDisplay = language ? chalk.cyan(`[${language}]`) : '';
    
    // Show line count
    const lineCountDisplay = lineCount ? `Lines: ${lineCount}` : '';
    
    // Format the status line
    const statusLine = `${modeDisplay} ${langDisplay} | ${fileDisplay} | ${positionDisplay} | ${lineCountDisplay}`;
    
    // Update the status box
    this.statusBox.setContent(statusLine);
    this.screen.render();
  }

  /**
   * Get formatted mode display
   * @param {string} mode - Current mode
   * @returns {string} - Formatted mode
   */
  getModeDisplay(mode) {
    switch (mode) {
      case 'normal':
        return chalk.black.bgGreen(' NORMAL ');
      case 'insert':
        return chalk.black.bgYellow(' INSERT ');
      case 'command':
        return chalk.black.bgBlue(' COMMAND ');
      default:
        return chalk.black.bgWhite(` ${mode.toUpperCase()} `);
    }
  }

  /**
   * Show temporary message
   * @param {string} message - Message to show
   * @param {number} duration - Duration in ms
   */
  showMessage(message, duration = 3000) {
    this.message = message;
    this.messageBox.setContent(message);
    this.messageBox.show();
    
    // Clear any existing timeout
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    
    // Set timeout to hide the message
    this.messageTimeout = setTimeout(() => {
      this.messageBox.hide();
      this.screen.render();
    }, duration);
    
    this.screen.render();
  }
}

module.exports = StatusLine;
