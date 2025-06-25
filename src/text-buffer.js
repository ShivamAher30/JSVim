const fs = require('fs-extra');
const path = require('path');

/**
 * TextBuffer class manages the content of the file being edited
 */
class TextBuffer {
  /**
   * Create a new TextBuffer
   * @param {string} filePath - Path to the file to edit
   * @param {string} initialContent - Initial content for the buffer
   */
  constructor(filePath, initialContent = null) {
    this.filePath = filePath || 'untitled';
    this.isNewFile = true;
    this.content = [''];
    this.modified = false;
    this.cursor = { row: 0, col: 0 };

    if (initialContent !== null) {
      // Use provided content
      this.content = initialContent.split('\n');
      // If content was provided but the file doesn't exist, mark as modified
      this.modified = true;
    } else if (filePath && filePath !== 'untitled') {
      this.loadFile(filePath);
    }
  }

  /**
   * Load file content
   * @param {string} filePath - Path to the file
   */
  loadFile(filePath) {
    try {
      const absPath = path.resolve(filePath);
      if (fs.existsSync(absPath)) {
        const content = fs.readFileSync(absPath, 'utf8');
        this.content = content.split('\n');
        this.isNewFile = false;
      }
    } catch (error) {
      // File doesn't exist yet, we'll create it on save
    }
  }

  /**
   * Save buffer content to file
   * @returns {boolean} - Success status
   */
  saveFile() {
    try {
      if (this.filePath === 'untitled') {
        // Cannot save untitled file without specifying a name
        return false;
      }

      const absPath = path.resolve(this.filePath);
      
      // Ensure the directory exists
      const dirPath = path.dirname(absPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirpSync(dirPath);
      }
      
      fs.writeFileSync(absPath, this.content.join('\n'), 'utf8');
      this.modified = false;
      this.isNewFile = false;
      return true;
    } catch (error) {
      console.error(`Failed to save file: ${error.message}`);
      return false;
    }
  }

  /**
   * Insert character at cursor position
   * @param {string} char - Character to insert
   */
  insertCharacter(char) {
    const { row, col } = this.cursor;
    const line = this.content[row];
    const newLine = line.slice(0, col) + char + line.slice(col);
    this.content[row] = newLine;
    this.cursor.col++;
    this.modified = true;
  }

  /**
   * Insert new line at cursor position
   */
  insertNewLine() {
    const { row, col } = this.cursor;
    const currentLine = this.content[row];
    
    // Split the current line at cursor position
    const newLine = currentLine.slice(col);
    this.content[row] = currentLine.slice(0, col);
    
    // Insert the new line after the current one
    this.content.splice(row + 1, 0, newLine);
    
    // Update cursor position
    this.cursor.row++;
    this.cursor.col = 0;
    this.modified = true;
  }

  /**
   * Delete character before cursor
   */
  deleteCharacter() {
    const { row, col } = this.cursor;
    
    if (col > 0) {
      // Delete character on the current line
      const line = this.content[row];
      this.content[row] = line.slice(0, col - 1) + line.slice(col);
      this.cursor.col--;
      this.modified = true;
    } else if (row > 0) {
      // Merge with previous line
      const prevLine = this.content[row - 1];
      const currLine = this.content[row];
      
      const newCol = prevLine.length;
      this.content[row - 1] = prevLine + currLine;
      this.content.splice(row, 1);
      
      this.cursor.row--;
      this.cursor.col = newCol;
      this.modified = true;
    }
  }

  /**
   * Move cursor up
   */
  moveCursorUp() {
    if (this.cursor.row > 0) {
      this.cursor.row--;
      // Adjust column if necessary
      const lineLength = this.content[this.cursor.row].length;
      this.cursor.col = Math.min(this.cursor.col, lineLength);
    }
  }

  /**
   * Move cursor down
   */
  moveCursorDown() {
    if (this.cursor.row < this.content.length - 1) {
      this.cursor.row++;
      // Adjust column if necessary
      const lineLength = this.content[this.cursor.row].length;
      this.cursor.col = Math.min(this.cursor.col, lineLength);
    }
  }

  /**
   * Move cursor left
   */
  moveCursorLeft() {
    if (this.cursor.col > 0) {
      this.cursor.col--;
    } else if (this.cursor.row > 0) {
      // Move to the end of the previous line
      this.cursor.row--;
      this.cursor.col = this.content[this.cursor.row].length;
    }
  }

  /**
   * Move cursor right
   */
  moveCursorRight() {
    const lineLength = this.content[this.cursor.row].length;
    
    if (this.cursor.col < lineLength) {
      this.cursor.col++;
    } else if (this.cursor.row < this.content.length - 1) {
      // Move to the beginning of the next line
      this.cursor.row++;
      this.cursor.col = 0;
    }
  }

  /**
   * Get cursor position
   * @returns {Object} - {row, col}
   */
  getCursor() {
    return this.cursor;
  }

  /**
   * Get buffer content
   * @returns {Array} - Array of lines
   */
  getContent() {
    return this.content;
  }

  /**
   * Get file name
   * @returns {string} - Filename
   */
  getFilename() {
    if (!this.filePath || this.filePath === 'untitled') {
      return 'untitled';
    }
    try {
      return path.basename(this.filePath);
    } catch (err) {
      return 'untitled';
    }
  }

  /**
   * Clear all content from the buffer
   */
  clear() {
    this.content = [''];
    this.cursor = { row: 0, col: 0 };
    this.modified = true;
  }

  /**
   * Check if buffer has unsaved changes
   * @returns {boolean}
   */
  isModified() {
    return this.modified;
  }

  /**
   * Get current cursor position with validation
   * @returns {Object} - Cursor position {row, col}
   */
  getCursor() {
    // Validate and correct cursor position
    this.validateCursor();
    return { ...this.cursor };
  }
  
  /**
   * Validate and correct cursor position
   */
  validateCursor() {
    const maxRow = Math.max(0, this.content.length - 1);
    const currentLine = this.content[this.cursor.row] || '';
    const maxCol = currentLine.length;
    
    // Correct row if out of bounds
    if (this.cursor.row < 0) {
      this.cursor.row = 0;
    } else if (this.cursor.row > maxRow) {
      this.cursor.row = maxRow;
    }
    
    // Correct column if out of bounds
    if (this.cursor.col < 0) {
      this.cursor.col = 0;
    } else if (this.cursor.col > maxCol) {
      this.cursor.col = maxCol;
    }
  }
}

module.exports = TextBuffer;
