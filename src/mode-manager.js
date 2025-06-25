/**
 * ModeManager class handles the state of the editor (Normal, Insert modes)
 */
class ModeManager {
  constructor() {
    this.MODES = {
      NORMAL: 'normal',
      INSERT: 'insert',
      COMMAND: 'command'
    };
    
    this.currentMode = this.MODES.NORMAL;
    this.commandBuffer = '';
  }

  /**
   * Set editor mode to normal
   */
  setNormalMode() {
    this.currentMode = this.MODES.NORMAL;
    this.commandBuffer = '';
  }

  /**
   * Set editor mode to insert
   */
  setInsertMode() {
    this.currentMode = this.MODES.INSERT;
  }

  /**
   * Set editor mode to command
   */
  setCommandMode() {
    this.currentMode = this.MODES.COMMAND;
    this.commandBuffer = ':';
  }

  /**
   * Check if editor is in normal mode
   * @returns {boolean}
   */
  isNormalMode() {
    return this.currentMode === this.MODES.NORMAL;
  }

  /**
   * Check if editor is in insert mode
   * @returns {boolean}
   */
  isInsertMode() {
    return this.currentMode === this.MODES.INSERT;
  }

  /**
   * Check if editor is in command mode
   * @returns {boolean}
   */
  isCommandMode() {
    return this.currentMode === this.MODES.COMMAND;
  }

  /**
   * Get current mode
   * @returns {string}
   */
  getMode() {
    return this.currentMode;
  }

  /**
   * Add character to command buffer
   * @param {string} char - Character to add
   */
  addToCommandBuffer(char) {
    this.commandBuffer += char;
  }

  /**
   * Remove last character from command buffer
   */
  removeFromCommandBuffer() {
    if (this.commandBuffer.length > 1) { // Preserve the initial ':'
      this.commandBuffer = this.commandBuffer.slice(0, -1);
    }
  }

  /**
   * Get command buffer
   * @returns {string}
   */
  getCommandBuffer() {
    return this.commandBuffer;
  }

  /**
   * Clear command buffer
   */
  clearCommandBuffer() {
    this.commandBuffer = ':';
  }

  /**
   * Execute command and return to normal mode
   * @returns {string} - Command to execute
   */
  executeCommand() {
    const command = this.commandBuffer.slice(1); // Remove the leading ':'
    this.setNormalMode();
    return command;
  }
}

module.exports = ModeManager;
