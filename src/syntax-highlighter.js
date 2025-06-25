/**
 * SyntaxHighlighter module for providing enhanced syntax highlighting in the editor
 */
const hljs = require('highlight.js');
const path = require('path');
const chalk = require('chalk');
const gradient = require('gradient-string');

class SyntaxHighlighter {
  /**
   * Create a new SyntaxHighlighter
   */
  constructor() {
    // Map file extensions to languages
    this.extensionMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.html': 'html',
      '.css': 'css',
      '.json': 'json',
      '.md': 'markdown',
      '.py': 'python',
      '.rb': 'ruby',
      '.java': 'java',
      '.c': 'c',
      '.cpp': 'cpp',
      '.h': 'cpp',
      '.hpp': 'cpp',
      '.cs': 'csharp',
      '.go': 'go',
      '.rs': 'rust',
      '.php': 'php',
      '.sh': 'bash',
      '.bash': 'bash',
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.xml': 'xml',
      '.sql': 'sql',
      '.dart': 'dart',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.scala': 'scala',
      '.lua': 'lua',
      '.tex': 'tex'
    };
    
    // Enhanced style mapping with more vibrant colors
    this.styleMap = {
      // Keywords and control flow
      'keyword': chalk.hex('#FF79C6').bold,      // Bright pink
      'built_in': chalk.hex('#8BE9FD'),          // Bright cyan
      'type': chalk.hex('#BD93F9').bold,         // Purple
      
      // Values
      'literal': chalk.hex('#F1FA8C'),           // Bright yellow
      'number': chalk.hex('#BD93F9'),            // Purple
      'regexp': chalk.hex('#FF5555'),            // Red
      'string': chalk.hex('#50FA7B'),            // Bright green
      'subst': chalk.hex('#8BE9FD'),             // Cyan
      'symbol': chalk.hex('#FFB86C'),            // Orange
      
      // Classes and functions
      'class': chalk.hex('#8BE9FD').bold,        // Bold cyan
      'function': chalk.hex('#50FA7B').bold,     // Bold green
      'title': chalk.hex('#FFB86C').bold,        // Bold orange
      'title.class': chalk.hex('#8BE9FD').bold,  // Bold cyan
      'title.function': chalk.hex('#50FA7B').bold, // Bold green
      'params': chalk.hex('#F8F8F2'),            // White
      
      // Comments and documentation
      'comment': chalk.hex('#6272A4'),           // Grayed purple
      'doctag': chalk.hex('#6272A4').italic,     // Italic grayed purple
      'meta': chalk.hex('#6272A4'),              // Grayed purple
      'meta-keyword': chalk.hex('#8BE9FD'),      // Cyan
      'meta-string': chalk.hex('#50FA7B'),       // Green
      
      // HTML/XML
      'section': chalk.hex('#FF79C6'),           // Pink
      'tag': chalk.hex('#FF79C6'),               // Pink
      'name': chalk.hex('#FF79C6'),              // Pink
      'attr': chalk.hex('#50FA7B'),              // Green
      'attribute': chalk.hex('#50FA7B'),         // Green
      
      // Variables and other
      'variable': chalk.hex('#F8F8F2'),          // White
      'variable.language': chalk.hex('#FF79C6'), // Pink
      'variable.constant': chalk.hex('#BD93F9'), // Purple
      
      // Markdown
      'bullet': chalk.hex('#FF79C6'),            // Pink
      'code': chalk.hex('#6272A4'),              // Grayed purple
      'emphasis': chalk.italic,                  // Italic
      'strong': chalk.bold,                      // Bold
      'formula': chalk.hex('#6272A4'),           // Grayed purple
      'link': chalk.hex('#8BE9FD').underline,    // Underlined cyan
      'quote': chalk.hex('#6272A4').italic,      // Italic grayed purple
      
      // CSS
      'selector-tag': chalk.hex('#FF79C6'),      // Pink
      'selector-id': chalk.hex('#FFB86C'),       // Orange
      'selector-class': chalk.hex('#50FA7B'),    // Green
      'selector-attr': chalk.hex('#8BE9FD'),     // Cyan
      'selector-pseudo': chalk.hex('#8BE9FD'),   // Cyan
      
      // Templates
      'template-tag': chalk.hex('#FF79C6'),      // Pink
      'template-variable': chalk.hex('#8BE9FD'), // Cyan
      
      // Diffs
      'addition': chalk.hex('#50FA7B'),          // Green
      'deletion': chalk.hex('#FF5555'),          // Red
      
      // Default
      'default': chalk.hex('#F8F8F2')            // White
    };
    
    // Theme options
    this.themes = {
      'dracula': this.styleMap,
      'neon': this.createNeonTheme(),
      'ocean': this.createOceanTheme(),
      'sunset': this.createSunsetTheme()
    };
    
    // Set default theme
    this.currentTheme = 'dracula';
  }

  /**
   * Create neon theme for syntax highlighting
   * @returns {Object} - Style map for neon theme
   */
  createNeonTheme() {
    return {
      'keyword': chalk.hex('#fe53bb').bold,      // Pink
      'built_in': chalk.hex('#09fbd3'),          // Bright cyan
      'type': chalk.hex('#f5d300').bold,         // Yellow
      'literal': chalk.hex('#08f7fe'),           // Bright blue
      'number': chalk.hex('#08f7fe'),            // Bright blue
      'regexp': chalk.hex('#fe53bb'),            // Pink
      'string': chalk.hex('#09fbd3'),            // Cyan
      'subst': chalk.hex('#08f7fe'),             // Blue
      'symbol': chalk.hex('#f5d300'),            // Yellow
      'class': chalk.hex('#08f7fe').bold,        // Bold blue
      'function': chalk.hex('#09fbd3').bold,     // Bold cyan
      'title': chalk.hex('#fe53bb').bold,        // Bold pink
      'params': chalk.hex('#ffffff'),            // White
      'comment': chalk.hex('#7a7a7a'),           // Gray
      'default': chalk.hex('#ffffff')            // White
    };
  }

  /**
   * Create ocean theme for syntax highlighting
   * @returns {Object} - Style map for ocean theme
   */
  createOceanTheme() {
    return {
      'keyword': chalk.hex('#5F9EA0').bold,      // Cadet Blue
      'built_in': chalk.hex('#4682B4'),          // Steel Blue
      'type': chalk.hex('#6495ED').bold,         // Cornflower Blue
      'literal': chalk.hex('#00BFFF'),           // Deep Sky Blue
      'number': chalk.hex('#87CEEB'),            // Sky Blue
      'regexp': chalk.hex('#B0C4DE'),            // Light Steel Blue
      'string': chalk.hex('#ADD8E6'),            // Light Blue
      'subst': chalk.hex('#87CEFA'),             // Light Sky Blue
      'symbol': chalk.hex('#40E0D0'),            // Turquoise
      'class': chalk.hex('#48D1CC').bold,        // Medium Turquoise
      'function': chalk.hex('#00CED1').bold,     // Dark Turquoise
      'title': chalk.hex('#20B2AA').bold,        // Light Sea Green
      'params': chalk.hex('#E0FFFF'),            // Light Cyan
      'comment': chalk.hex('#7A8B8B'),           // Dark Gray
      'default': chalk.hex('#E0FFFF')            // Light Cyan
    };
  }

  /**
   * Create sunset theme for syntax highlighting
   * @returns {Object} - Style map for sunset theme
   */
  createSunsetTheme() {
    return {
      'keyword': chalk.hex('#FF7F50').bold,      // Coral
      'built_in': chalk.hex('#FFA07A'),          // Light Salmon
      'type': chalk.hex('#FF8C00').bold,         // Dark Orange
      'literal': chalk.hex('#FFD700'),           // Gold
      'number': chalk.hex('#FFDEAD'),            // Navajo White
      'regexp': chalk.hex('#CD5C5C'),            // Indian Red
      'string': chalk.hex('#F08080'),            // Light Coral
      'subst': chalk.hex('#FA8072'),             // Salmon
      'symbol': chalk.hex('#FF6347'),            // Tomato
      'class': chalk.hex('#FF4500').bold,        // Orange Red
      'function': chalk.hex('#FF8C00').bold,     // Dark Orange
      'title': chalk.hex('#FFA500').bold,        // Orange
      'params': chalk.hex('#FFFAFA'),            // Snow
      'comment': chalk.hex('#A9A9A9'),           // Dark Gray
      'default': chalk.hex('#FFFAFA')            // Snow
    };
  }

  /**
   * Set the current theme
   * @param {string} themeName - Theme name
   * @returns {boolean} - Success status
   */
  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
      this.styleMap = this.themes[themeName];
      return true;
    }
    return false;
  }

  /**
   * Get list of available themes
   * @returns {Array<string>} - Theme names
   */
  getThemes() {
    return Object.keys(this.themes);
  }

  /**
   * Get current theme name
   * @returns {string} - Current theme name
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Get language for a file based on extension
   * @param {string} filePath - Path to the file
   * @returns {string|null} - Language name or null if not recognized
   */
  getLanguage(filePath) {
    if (!filePath || filePath === 'untitled') {
      return null;
    }
    
    try {
      const ext = path.extname(filePath).toLowerCase();
      return this.extensionMap[ext] || null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Highlight a line of code
   * @param {string} line - Line to highlight
   * @param {string} language - Language name
   * @returns {string} - Highlighted line
   */
  highlightLine(line, language) {
    if (!language) {
      return line;
    }
    
    try {
      const highlighted = hljs.highlight(line, { language, ignoreIllegals: true });
      return this.applyStyles(highlighted);
    } catch (err) {
      return line;
    }
  }

  /**
   * Highlight lines of code
   * @param {Array<string>} lines - Lines to highlight
   * @param {string} language - Language name
   * @returns {Array<string>} - Highlighted lines
   */
  highlightLines(lines, language) {
    if (!language) {
      return lines;
    }
    
    return lines.map(line => this.highlightLine(line, language));
  }

  /**
   * Apply chalk styles to highlighted tokens
   * @param {Object} highlighted - Highlighted output from hljs
   * @returns {string} - Colorized string
   */
  applyStyles(highlighted) {
    let result = '';
    
    // Parse the highlighted HTML-like output and apply chalk styles
    const tokens = this.parseTokens(highlighted.value);
    
    for (const token of tokens) {
      const style = this.styleMap[token.class] || this.styleMap.default;
      result += style(token.text);
    }
    
    return result;
  }

  /**
   * Parse tokens from highlighted HTML-like output
   * @param {string} html - HTML-like string from hljs
   * @returns {Array<Object>} - Array of token objects
   */
  parseTokens(html) {
    const tokens = [];
    const regex = /<span class="hljs-([^"]+)">([^<]+)<\/span>|([^<]+)/g;
    
    let match;
    while ((match = regex.exec(html)) !== null) {
      if (match[3]) {
        // Plain text
        tokens.push({ class: 'default', text: match[3] });
      } else {
        // Highlighted token
        tokens.push({ class: match[1], text: match[2] });
      }
    }
    
    return tokens;
  }

  /**
   * Get language for a file based on extension
   * @param {string} filePath - Path to the file
   * @returns {string|null} - Language name or null if not recognized
   */
  getLanguage(filePath) {
    if (!filePath || filePath === 'untitled') {
      return null;
    }
    
    try {
      const ext = path.extname(filePath).toLowerCase();
      return this.extensionMap[ext] || null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Highlight a line of code
   * @param {string} line - Line to highlight
   * @param {string} language - Language name
   * @returns {string} - Highlighted line
   */
  highlightLine(line, language) {
    if (!language) {
      return line;
    }
    
    try {
      const highlighted = hljs.highlight(line, { language, ignoreIllegals: true });
      return this.applyStyles(highlighted);
    } catch (err) {
      return line;
    }
  }

  /**
   * Highlight lines of code
   * @param {Array<string>} lines - Lines to highlight
   * @param {string} language - Language name
   * @returns {Array<string>} - Highlighted lines
   */
  highlightLines(lines, language) {
    if (!language) {
      return lines;
    }
    
    return lines.map(line => this.highlightLine(line, language));
  }

  /**
   * Apply chalk styles to highlighted tokens
   * @param {Object} highlighted - Highlighted output from hljs
   * @returns {string} - Colorized string
   */
  applyStyles(highlighted) {
    let result = '';
    
    // Parse the highlighted HTML-like output and apply chalk styles
    const tokens = this.parseTokens(highlighted.value);
    
    for (const token of tokens) {
      const style = this.styleMap[token.class] || this.styleMap.default;
      result += style(token.text);
    }
    
    return result;
  }

  /**
   * Parse tokens from highlighted HTML-like output
   * @param {string} html - HTML-like string from hljs
   * @returns {Array<Object>} - Array of token objects
   */
  parseTokens(html) {
    const tokens = [];
    const regex = /<span class="hljs-([^"]+)">([^<]+)<\/span>|([^<]+)/g;
    
    let match;
    while ((match = regex.exec(html)) !== null) {
      if (match[3]) {
        // Plain text
        tokens.push({ class: 'default', text: match[3] });
      } else {
        // Highlighted token
        tokens.push({ class: match[1], text: match[2] });
      }
    }
    
    return tokens;
  }
}

module.exports = SyntaxHighlighter;
