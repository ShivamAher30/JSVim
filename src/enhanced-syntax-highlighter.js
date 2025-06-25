/**
 * Enhanced SyntaxHighlighter for VimJS editor with comprehensive language support
 */
const hljs = require('highlight.js');
const path = require('path');
const chalk = require('chalk');
const gradient = require('gradient-string');
const fs = require('fs');

class SyntaxHighlighter {
  /**
   * Create a new enhanced SyntaxHighlighter
   */
  constructor() {
    // Register common languages to ensure they're available
    this.registerLanguages();
    
    // Configure extended file extension mappings
    this.setupExtensionMap();
    
    // Create color themes
    this.setupThemes();
    
    // Set default theme
    this.currentTheme = 'dracula';
    this.styleMap = this.themes[this.currentTheme];
    
    // Token cache for performance
    this.tokenCache = new Map();
    this.lineCache = new Map();
    
    // Max cache size to prevent memory issues
    this.maxCacheSize = 10000;
  }

  /**
   * Register additional languages with highlight.js
   */
  registerLanguages() {
    // hljs registers many languages by default, but we can add custom ones if needed
    
    // Add any language aliases that might be useful
    this.languageAliases = {
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'hpp': 'cpp',
      'cc': 'cpp',
      'hh': 'cpp',
      'm': 'objectivec',
      'md': 'markdown',
      'sh': 'bash',
      'zsh': 'bash',
      'yml': 'yaml'
    };
  }

  /**
   * Setup comprehensive file extension map
   */
  setupExtensionMap() {
    this.extensionMap = {
      // JavaScript/TypeScript
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.mjs': 'javascript',
      '.cjs': 'javascript',
      '.es6': 'javascript',
      
      // Web
      '.html': 'html',
      '.htm': 'html',
      '.xhtml': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.sass': 'scss',
      '.less': 'less',
      '.svg': 'xml',
      
      // Data formats
      '.json': 'json',
      '.jsonc': 'json',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.toml': 'ini',
      '.xml': 'xml',
      '.plist': 'xml',
      
      // Markup
      '.md': 'markdown',
      '.markdown': 'markdown',
      '.tex': 'latex',
      '.rst': 'markdown',
      '.adoc': 'asciidoc',
      
      // Python
      '.py': 'python',
      '.pyw': 'python',
      '.pyx': 'python',
      '.pyi': 'python',
      '.ipynb': 'json', // Jupyter notebooks
      
      // Ruby
      '.rb': 'ruby',
      '.erb': 'erb',
      '.gemspec': 'ruby',
      
      // JVM languages
      '.java': 'java',
      '.kt': 'kotlin',
      '.kts': 'kotlin',
      '.scala': 'scala',
      '.groovy': 'groovy',
      '.gradle': 'groovy',
      
      // C-family
      '.c': 'c',
      '.h': 'c',
      '.cpp': 'cpp',
      '.cc': 'cpp',
      '.cxx': 'cpp',
      '.hpp': 'cpp',
      '.hxx': 'cpp',
      '.cs': 'csharp',
      '.m': 'objectivec',
      '.mm': 'objectivec',
      
      // Other languages
      '.go': 'go',
      '.rs': 'rust',
      '.php': 'php',
      '.swift': 'swift',
      '.dart': 'dart',
      
      // Shell and config
      '.sh': 'bash',
      '.bash': 'bash',
      '.zsh': 'bash',
      '.fish': 'fish',
      '.ps1': 'powershell',
      '.bat': 'dos',
      '.cmd': 'dos',
      '.ini': 'ini',
      '.cfg': 'ini',
      '.conf': 'nginx',
      '.htaccess': 'apache',
      
      // Database
      '.sql': 'sql',
      '.pgsql': 'pgsql',
      '.plsql': 'sql',
      
      // Others
      '.lua': 'lua',
      '.hs': 'haskell',
      '.elm': 'elm',
      '.erl': 'erlang',
      '.ex': 'elixir',
      '.exs': 'elixir',
      '.clj': 'clojure',
      '.lisp': 'lisp',
      '.fs': 'fsharp',
      '.r': 'r',
      '.dockerfile': 'dockerfile',
      '.docker': 'dockerfile',
      '.gitignore': 'plaintext',
      '.env': 'bash',
      '.proto': 'protobuf',
      '.tf': 'hcl',
      '.hcl': 'hcl'
    };
  }

  /**
   * Setup color themes
   */
  setupThemes() {
    // Dracula theme - based on popular Dracula color scheme
    const draculaTheme = {
      'keyword': chalk.hex('#FF79C6').bold,      // Pink
      'built_in': chalk.hex('#8BE9FD'),          // Cyan
      'type': chalk.hex('#8BE9FD'),              // Cyan
      'literal': chalk.hex('#F1FA8C'),           // Yellow
      'number': chalk.hex('#BD93F9'),            // Purple
      'regexp': chalk.hex('#FF5555'),            // Red
      'string': chalk.hex('#50FA7B'),            // Green
      'subst': chalk.hex('#F8F8F2'),             // White
      'symbol': chalk.hex('#FFB86C'),            // Orange
      'class': chalk.hex('#8BE9FD').bold,        // Cyan bold
      'function': chalk.hex('#50FA7B'),          // Green
      'title': chalk.hex('#50FA7B'),             // Green
      'title.class': chalk.hex('#8BE9FD').bold,  // Cyan bold
      'title.function': chalk.hex('#50FA7B'),    // Green
      'params': chalk.hex('#F8F8F2'),            // White
      'comment': chalk.hex('#6272A4'),           // Comment gray
      'doctag': chalk.hex('#6272A4').italic,     // Comment gray italic
      'meta': chalk.hex('#F8F8F2'),              // White
      'meta-keyword': chalk.hex('#FF79C6'),      // Pink
      'meta-string': chalk.hex('#50FA7B'),       // Green
      'section': chalk.hex('#F8F8F2').bold,      // White bold
      'tag': chalk.hex('#FF79C6'),               // Pink
      'name': chalk.hex('#8BE9FD'),              // Cyan
      'attr': chalk.hex('#50FA7B'),              // Green
      'attribute': chalk.hex('#50FA7B'),         // Green
      'variable': chalk.hex('#F8F8F2'),          // White
      'variable.language': chalk.hex('#BD93F9'), // Purple
      'variable.constant': chalk.hex('#BD93F9'), // Purple
      'bullet': chalk.hex('#F8F8F2'),            // White
      'code': chalk.hex('#50FA7B'),              // Green
      'emphasis': chalk.hex('#F8F8F2').italic,   // White italic
      'strong': chalk.hex('#F8F8F2').bold,       // White bold
      'formula': chalk.hex('#8BE9FD'),           // Cyan
      'link': chalk.hex('#8BE9FD').underline,    // Cyan underline
      'quote': chalk.hex('#6272A4'),             // Comment gray
      'selector-tag': chalk.hex('#FF79C6'),      // Pink
      'selector-id': chalk.hex('#50FA7B'),       // Green
      'selector-class': chalk.hex('#50FA7B'),    // Green
      'selector-attr': chalk.hex('#F1FA8C'),     // Yellow
      'selector-pseudo': chalk.hex('#50FA7B'),   // Green
      'template-tag': chalk.hex('#FF79C6'),      // Pink
      'template-variable': chalk.hex('#F1FA8C'), // Yellow
      'addition': chalk.hex('#50FA7B'),          // Green
      'deletion': chalk.hex('#FF5555'),          // Red
      'operator': chalk.hex('#FF79C6'),          // Pink
      'punctuation': chalk.hex('#F8F8F2'),       // White
      'property': chalk.hex('#66D9EF'),          // Light cyan
      'default': chalk.hex('#F8F8F2')            // White
    };

    // Nord theme - based on Nord color palette
    const nordTheme = {
      'keyword': chalk.hex('#81A1C1').bold,      // Blue
      'built_in': chalk.hex('#81A1C1'),          // Blue
      'type': chalk.hex('#8FBCBB'),              // Cyan
      'literal': chalk.hex('#B48EAD'),           // Purple
      'number': chalk.hex('#B48EAD'),            // Purple
      'regexp': chalk.hex('#EBCB8B'),            // Yellow
      'string': chalk.hex('#A3BE8C'),            // Green
      'subst': chalk.hex('#D8DEE9'),             // White
      'symbol': chalk.hex('#EBCB8B'),            // Yellow
      'class': chalk.hex('#8FBCBB').bold,        // Cyan bold
      'function': chalk.hex('#88C0D0'),          // Light blue
      'title': chalk.hex('#88C0D0'),             // Light blue
      'title.class': chalk.hex('#8FBCBB').bold,  // Cyan bold
      'title.function': chalk.hex('#88C0D0'),    // Light blue
      'params': chalk.hex('#D8DEE9'),            // White
      'comment': chalk.hex('#4C566A'),           // Gray
      'doctag': chalk.hex('#4C566A').italic,     // Gray italic
      'meta': chalk.hex('#5E81AC'),              // Dark blue
      'meta-keyword': chalk.hex('#5E81AC'),      // Dark blue
      'meta-string': chalk.hex('#A3BE8C'),       // Green
      'section': chalk.hex('#D8DEE9').bold,      // White bold
      'tag': chalk.hex('#81A1C1'),               // Blue
      'name': chalk.hex('#81A1C1'),              // Blue
      'attr': chalk.hex('#D8DEE9'),              // White
      'attribute': chalk.hex('#D8DEE9'),         // White
      'variable': chalk.hex('#D8DEE9'),          // White
      'variable.language': chalk.hex('#81A1C1'), // Blue
      'variable.constant': chalk.hex('#5E81AC'), // Dark blue
      'bullet': chalk.hex('#D8DEE9'),            // White
      'code': chalk.hex('#A3BE8C'),              // Green
      'emphasis': chalk.hex('#D8DEE9').italic,   // White italic
      'strong': chalk.hex('#D8DEE9').bold,       // White bold
      'formula': chalk.hex('#8FBCBB'),           // Cyan
      'link': chalk.hex('#88C0D0').underline,    // Light blue underline
      'quote': chalk.hex('#4C566A'),             // Gray
      'selector-tag': chalk.hex('#81A1C1'),      // Blue
      'selector-id': chalk.hex('#8FBCBB'),       // Cyan
      'selector-class': chalk.hex('#8FBCBB'),    // Cyan
      'selector-attr': chalk.hex('#EBCB8B'),     // Yellow
      'selector-pseudo': chalk.hex('#88C0D0'),   // Light blue
      'template-tag': chalk.hex('#81A1C1'),      // Blue
      'template-variable': chalk.hex('#EBCB8B'), // Yellow
      'addition': chalk.hex('#A3BE8C'),          // Green
      'deletion': chalk.hex('#BF616A'),          // Red
      'operator': chalk.hex('#81A1C1'),          // Blue
      'punctuation': chalk.hex('#D8DEE9'),       // White
      'property': chalk.hex('#8FBCBB'),          // Cyan
      'default': chalk.hex('#D8DEE9')            // White
    };

    // Tokyo Night theme
    const tokyoNightTheme = {
      'keyword': chalk.hex('#BB9AF7').bold,      // Purple
      'built_in': chalk.hex('#7DCFFF'),          // Light blue
      'type': chalk.hex('#7DCFFF'),              // Light blue
      'literal': chalk.hex('#FF9E64'),           // Orange
      'number': chalk.hex('#FF9E64'),            // Orange
      'regexp': chalk.hex('#FF9E64'),            // Orange
      'string': chalk.hex('#9ECE6A'),            // Green
      'subst': chalk.hex('#A9B1D6'),             // Light gray
      'symbol': chalk.hex('#FF9E64'),            // Orange
      'class': chalk.hex('#7DCFFF').bold,        // Light blue bold
      'function': chalk.hex('#7AA2F7'),          // Blue
      'title': chalk.hex('#7AA2F7'),             // Blue
      'title.class': chalk.hex('#7DCFFF').bold,  // Light blue bold
      'title.function': chalk.hex('#7AA2F7'),    // Blue
      'params': chalk.hex('#A9B1D6'),            // Light gray
      'comment': chalk.hex('#565F89'),           // Dark gray
      'doctag': chalk.hex('#565F89').italic,     // Dark gray italic
      'meta': chalk.hex('#89DDFF'),              // Cyan
      'meta-keyword': chalk.hex('#BB9AF7'),      // Purple
      'meta-string': chalk.hex('#9ECE6A'),       // Green
      'section': chalk.hex('#A9B1D6').bold,      // Light gray bold
      'tag': chalk.hex('#BB9AF7'),               // Purple
      'name': chalk.hex('#7DCFFF'),              // Light blue
      'attr': chalk.hex('#9ECE6A'),              // Green
      'attribute': chalk.hex('#9ECE6A'),         // Green
      'variable': chalk.hex('#A9B1D6'),          // Light gray
      'variable.language': chalk.hex('#BB9AF7'), // Purple
      'variable.constant': chalk.hex('#FF9E64'), // Orange
      'bullet': chalk.hex('#A9B1D6'),            // Light gray
      'code': chalk.hex('#9ECE6A'),              // Green
      'emphasis': chalk.hex('#A9B1D6').italic,   // Light gray italic
      'strong': chalk.hex('#A9B1D6').bold,       // Light gray bold
      'formula': chalk.hex('#7DCFFF'),           // Light blue
      'link': chalk.hex('#7AA2F7').underline,    // Blue underline
      'quote': chalk.hex('#565F89'),             // Dark gray
      'selector-tag': chalk.hex('#BB9AF7'),      // Purple
      'selector-id': chalk.hex('#7DCFFF'),       // Light blue
      'selector-class': chalk.hex('#7DCFFF'),    // Light blue
      'selector-attr': chalk.hex('#FF9E64'),     // Orange
      'selector-pseudo': chalk.hex('#7AA2F7'),   // Blue
      'template-tag': chalk.hex('#BB9AF7'),      // Purple
      'template-variable': chalk.hex('#FF9E64'), // Orange
      'addition': chalk.hex('#9ECE6A'),          // Green
      'deletion': chalk.hex('#F7768E'),          // Red
      'operator': chalk.hex('#89DDFF'),          // Cyan
      'punctuation': chalk.hex('#A9B1D6'),       // Light gray
      'property': chalk.hex('#7DCFFF'),          // Light blue
      'default': chalk.hex('#A9B1D6')            // Light gray
    };

    // One Dark theme
    const oneDarkTheme = {
      'keyword': chalk.hex('#C678DD').bold,      // Purple
      'built_in': chalk.hex('#56B6C2'),          // Teal
      'type': chalk.hex('#56B6C2'),              // Teal
      'literal': chalk.hex('#D19A66'),           // Orange
      'number': chalk.hex('#D19A66'),            // Orange
      'regexp': chalk.hex('#E06C75'),            // Red
      'string': chalk.hex('#98C379'),            // Green
      'subst': chalk.hex('#ABB2BF'),             // Gray
      'symbol': chalk.hex('#D19A66'),            // Orange
      'class': chalk.hex('#E5C07B').bold,        // Light yellow bold
      'function': chalk.hex('#61AFEF'),          // Blue
      'title': chalk.hex('#61AFEF'),             // Blue
      'title.class': chalk.hex('#E5C07B').bold,  // Light yellow bold
      'title.function': chalk.hex('#61AFEF'),    // Blue
      'params': chalk.hex('#ABB2BF'),            // Gray
      'comment': chalk.hex('#5C6370'),           // Dark gray
      'doctag': chalk.hex('#5C6370').italic,     // Dark gray italic
      'meta': chalk.hex('#ABB2BF'),              // Gray
      'meta-keyword': chalk.hex('#C678DD'),      // Purple
      'meta-string': chalk.hex('#98C379'),       // Green
      'section': chalk.hex('#ABB2BF').bold,      // Gray bold
      'tag': chalk.hex('#E06C75'),               // Red
      'name': chalk.hex('#E06C75'),              // Red
      'attr': chalk.hex('#D19A66'),              // Orange
      'attribute': chalk.hex('#D19A66'),         // Orange
      'variable': chalk.hex('#ABB2BF'),          // Gray
      'variable.language': chalk.hex('#C678DD'), // Purple
      'variable.constant': chalk.hex('#D19A66'), // Orange
      'bullet': chalk.hex('#E06C75'),            // Red
      'code': chalk.hex('#98C379'),              // Green
      'emphasis': chalk.hex('#ABB2BF').italic,   // Gray italic
      'strong': chalk.hex('#ABB2BF').bold,       // Gray bold
      'formula': chalk.hex('#56B6C2'),           // Teal
      'link': chalk.hex('#61AFEF').underline,    // Blue underline
      'quote': chalk.hex('#5C6370'),             // Dark gray
      'selector-tag': chalk.hex('#E06C75'),      // Red
      'selector-id': chalk.hex('#61AFEF'),       // Blue
      'selector-class': chalk.hex('#D19A66'),    // Orange
      'selector-attr': chalk.hex('#56B6C2'),     // Teal
      'selector-pseudo': chalk.hex('#C678DD'),   // Purple
      'template-tag': chalk.hex('#C678DD'),      // Purple
      'template-variable': chalk.hex('#D19A66'), // Orange
      'addition': chalk.hex('#98C379'),          // Green
      'deletion': chalk.hex('#E06C75'),          // Red
      'operator': chalk.hex('#56B6C2'),          // Teal
      'punctuation': chalk.hex('#ABB2BF'),       // Gray
      'property': chalk.hex('#E06C75'),          // Red
      'default': chalk.hex('#ABB2BF')            // Gray
    };

    // Solarized theme
    const solarizedTheme = {
      'keyword': chalk.hex('#859900').bold,      // Green
      'built_in': chalk.hex('#268BD2'),          // Blue
      'type': chalk.hex('#268BD2'),              // Blue
      'literal': chalk.hex('#CB4B16'),           // Orange
      'number': chalk.hex('#D33682'),            // Magenta
      'regexp': chalk.hex('#DC322F'),            // Red
      'string': chalk.hex('#2AA198'),            // Cyan
      'subst': chalk.hex('#839496'),             // Gray
      'symbol': chalk.hex('#CB4B16'),            // Orange
      'class': chalk.hex('#B58900').bold,        // Yellow bold
      'function': chalk.hex('#268BD2'),          // Blue
      'title': chalk.hex('#268BD2'),             // Blue
      'title.class': chalk.hex('#B58900').bold,  // Yellow bold
      'title.function': chalk.hex('#268BD2'),    // Blue
      'params': chalk.hex('#839496'),            // Gray
      'comment': chalk.hex('#586E75'),           // Dark gray
      'doctag': chalk.hex('#586E75').italic,     // Dark gray italic
      'meta': chalk.hex('#839496'),              // Gray
      'meta-keyword': chalk.hex('#859900'),      // Green
      'meta-string': chalk.hex('#2AA198'),       // Cyan
      'section': chalk.hex('#839496').bold,      // Gray bold
      'tag': chalk.hex('#859900'),               // Green
      'name': chalk.hex('#268BD2'),              // Blue
      'attr': chalk.hex('#B58900'),              // Yellow
      'attribute': chalk.hex('#B58900'),         // Yellow
      'variable': chalk.hex('#839496'),          // Gray
      'variable.language': chalk.hex('#D33682'), // Magenta
      'variable.constant': chalk.hex('#CB4B16'), // Orange
      'bullet': chalk.hex('#D33682'),            // Magenta
      'code': chalk.hex('#2AA198'),              // Cyan
      'emphasis': chalk.hex('#839496').italic,   // Gray italic
      'strong': chalk.hex('#839496').bold,       // Gray bold
      'formula': chalk.hex('#268BD2'),           // Blue
      'link': chalk.hex('#268BD2').underline,    // Blue underline
      'quote': chalk.hex('#586E75'),             // Dark gray
      'selector-tag': chalk.hex('#859900'),      // Green
      'selector-id': chalk.hex('#268BD2'),       // Blue
      'selector-class': chalk.hex('#B58900'),    // Yellow
      'selector-attr': chalk.hex('#CB4B16'),     // Orange
      'selector-pseudo': chalk.hex('#D33682'),   // Magenta
      'template-tag': chalk.hex('#859900'),      // Green
      'template-variable': chalk.hex('#CB4B16'), // Orange
      'addition': chalk.hex('#859900'),          // Green
      'deletion': chalk.hex('#DC322F'),          // Red
      'operator': chalk.hex('#859900'),          // Green
      'punctuation': chalk.hex('#839496'),       // Gray
      'property': chalk.hex('#268BD2'),          // Blue
      'default': chalk.hex('#839496')            // Gray
    };

    // Store all themes
    this.themes = {
      'dracula': draculaTheme,
      'nord': nordTheme,
      'tokyo-night': tokyoNightTheme,
      'one-dark': oneDarkTheme,
      'solarized': solarizedTheme
    };
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
      // Check extension map first
      if (this.extensionMap[ext]) {
        return this.extensionMap[ext];
      }
      
      // If no extension, try to determine from filename
      if (!ext) {
        const basename = path.basename(filePath).toLowerCase();
        if (basename === 'dockerfile') return 'dockerfile';
        if (basename === 'makefile') return 'makefile';
        if (basename.startsWith('.docker')) return 'dockerfile';
        if (basename === '.gitignore') return 'plaintext';
        if (basename === '.bashrc' || basename === '.zshrc') return 'bash';
      }
      
      // Try alias
      const extWithoutDot = ext.slice(1);
      if (this.languageAliases[extWithoutDot]) {
        return this.languageAliases[extWithoutDot];
      }
      
      return null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Detect language from content if extension doesn't help
   * @param {string} content - File content
   * @returns {string|null} - Detected language or null
   */
  detectLanguageFromContent(content) {
    try {
      // First check for shebang line
      const firstLine = content.split('\n')[0];
      if (firstLine && firstLine.startsWith('#!')) {
        if (firstLine.includes('node')) return 'javascript';
        if (firstLine.includes('python')) return 'python';
        if (firstLine.includes('ruby')) return 'ruby';
        if (firstLine.includes('bash') || firstLine.includes('sh')) return 'bash';
        if (firstLine.includes('perl')) return 'perl';
        if (firstLine.includes('php')) return 'php';
      }
      
      // Fallback to highlight.js auto detection
      const result = hljs.highlightAuto(content, [
        'javascript', 'typescript', 'python', 'cpp', 'java',
        'html', 'css', 'ruby', 'rust', 'go', 'php'
      ]);
      
      return result.language || null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Generate a unique cache key for a line
   * @param {string} line - Content line
   * @param {string} language - Language name
   * @returns {string} - Cache key
   */
  getCacheKey(line, language) {
    return `${language}:${line}`;
  }

  /**
   * Highlight a line of code with caching
   * @param {string} line - Line to highlight
   * @param {string} language - Language name
   * @returns {string} - Highlighted line
   */
  highlightLine(line, language) {
    if (!language || !line.trim()) {
      return line;
    }
    
    // Check cache first
    const cacheKey = this.getCacheKey(line, language);
    if (this.lineCache.has(cacheKey)) {
      return this.lineCache.get(cacheKey);
    }
    
    try {
      // Apply syntax highlighting
      const highlighted = hljs.highlight(line, { language, ignoreIllegals: true });
      const styledLine = this.applyStyles(highlighted);
      
      // Cache the result
      if (this.lineCache.size >= this.maxCacheSize) {
        // Clear part of cache if it gets too big
        const keys = Array.from(this.lineCache.keys()).slice(0, 1000);
        keys.forEach(key => this.lineCache.delete(key));
      }
      this.lineCache.set(cacheKey, styledLine);
      
      return styledLine;
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
      // If language wasn't detected by extension, try content detection
      if (lines.length > 0) {
        const sampleContent = lines.slice(0, Math.min(100, lines.length)).join('\n');
        language = this.detectLanguageFromContent(sampleContent);
      }
      
      if (!language) {
        return lines;
      }
    }
    
    // For large files, use a more efficient approach - skip highlighting
    // comments and strings that extend over multiple lines for better performance
    if (lines.length > 1000) {
      // Create a throttled highlighter that processes every 5th line completely
      // and does basic highlighting for other lines
      return lines.map((line, index) => {
        if (index % 5 === 0) {
          return this.highlightLine(line, language);
        } else {
          // Basic highlighting for long files to maintain responsiveness
          // Still highlight keywords for visual clarity
          const simplified = this.simplifiedHighlight(line, language);
          return simplified || this.highlightLine(line, language);
        }
      });
    }
    
    // For normal-sized files, highlight every line
    return lines.map(line => this.highlightLine(line, language));
  }
  
  /**
   * Simplified highlighting for very large files to improve performance
   * @param {string} line - Line to highlight
   * @param {string} language - Language name
   * @returns {string|null} - Highlighted line or null if skipped
   */
  simplifiedHighlight(line, language) {
    // Skip empty or very long lines
    if (!line.trim() || line.length > 200) {
      return line;
    }
    
    try {
      // Only do basic highlighting for common patterns
      let result = line;
      
      // Language-specific basic highlighting
      switch (language) {
        case 'javascript':
        case 'typescript':
          // Basic JS/TS highlighting
          result = result.replace(/\b(const|let|var|function|class|if|else|return|import|export)\b/g, 
            m => this.styleMap.keyword(m));
          result = result.replace(/("[^"]*"|'[^']*'|`[^`]*`)/g, 
            m => this.styleMap.string(m));
          result = result.replace(/(\/\/.*?)$/g, 
            m => this.styleMap.comment(m));
          break;
        case 'python':
          // Basic Python highlighting
          result = result.replace(/\b(def|class|if|else|elif|for|while|import|from|return|with)\b/g, 
            m => this.styleMap.keyword(m));
          result = result.replace(/("[^"]*"|'[^']*')/g, 
            m => this.styleMap.string(m));
          result = result.replace(/(#.*?)$/g, 
            m => this.styleMap.comment(m));
          break;
        case 'html':
          // Basic HTML highlighting
          result = result.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)(.*?)>/g, 
            (m) => this.styleMap.tag(m));
          break;
        default:
          // For other languages, do full highlighting
          return null;
      }
      
      return result;
    } catch (err) {
      return null; // Fallback to full highlighting
    }
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
      const styleClass = token.class || 'default';
      const style = this.styleMap[styleClass] || this.styleMap.default;
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
    // Check token cache first
    if (this.tokenCache.has(html)) {
      return this.tokenCache.get(html);
    }
    
    const tokens = [];
    const regex = /<span class="hljs-([^"]+)">([^<]+)<\/span>|([^<]+)/g;
    
    let match;
    while ((match = regex.exec(html)) !== null) {
      let text;
      if (match[3]) {
        // Plain text
        text = this.decodeHtmlEntities(match[3]);
        tokens.push({ class: 'default', text: text });
      } else {
        // Highlighted token
        text = this.decodeHtmlEntities(match[2]);
        tokens.push({ class: match[1], text: text });
      }
    }
    
    // Add to cache if not too large
    if (this.tokenCache.size < this.maxCacheSize) {
      this.tokenCache.set(html, tokens);
    }
    
    return tokens;
  }

  /**
   * Decode HTML entities to their actual characters
   * @param {string} text - Text with HTML entities
   * @returns {string} - Decoded text
   */
  decodeHtmlEntities(text) {
    return text
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
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
      
      // Clear caches when theme changes
      this.tokenCache.clear();
      this.lineCache.clear();
      
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
   * Clear highlighting caches
   */
  clearCache() {
    this.tokenCache.clear();
    this.lineCache.clear();
  }

  /**
   * Analyze code to show language statistics
   * @param {string} content - Code content
   * @param {string} language - Language name
   * @returns {Object} - Statistics
   */
  analyzeCode(content, language) {
    if (!content || !language) {
      return null;
    }
    
    try {
      const lines = content.split('\n');
      const totalLines = lines.length;
      
      // Count comments, code lines, etc.
      let commentLines = 0;
      let codeLines = 0;
      let emptyLines = 0;
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) {
          emptyLines++;
        } else if (
          (language === 'javascript' || language === 'typescript' || language === 'java' || language === 'cpp' || language === 'c') && 
          (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.endsWith('*/') || trimmed.match(/^\s*\*\s/))
        ) {
          commentLines++;
        } else if (
          language === 'python' && 
          (trimmed.startsWith('#') || trimmed.startsWith('"""') || trimmed.endsWith('"""'))
        ) {
          commentLines++;
        } else if (
          (language === 'html' || language === 'xml') && 
          (trimmed.startsWith('<!--') || trimmed.endsWith('-->'))
        ) {
          commentLines++;
        } else {
          codeLines++;
        }
      });
      
      return {
        totalLines,
        codeLines,
        commentLines,
        emptyLines,
        commentRatio: commentLines / (totalLines || 1)
      };
    } catch (err) {
      return null;
    }
  }
}

module.exports = SyntaxHighlighter;
