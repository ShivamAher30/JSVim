const fetch = require('node-fetch');
require('dotenv').config();

/**
 * AI Service for code autocompletion using Groq API
 */
class AIService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'mixtral-8x7b-32768';
    this.enabled = true;
    this.cache = new Map(); // Simple cache for recent completions
    this.maxCacheSize = 50;
  }

  /**
   * Check if AI service is available
   * @returns {boolean}
   */
  isAvailable() {
    return this.enabled && this.apiKey.length > 0;
  }

  /**
   * Toggle AI service on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Get code context around cursor position
   * @param {Array} lines - All lines in the buffer
   * @param {number} cursorRow - Current cursor row
   * @param {number} cursorCol - Current cursor column
   * @returns {string} - Context string
   */
  getCodeContext(lines, cursorRow, cursorCol) {
    const maxLines = 100;
    const maxChars = 1000;
    
    // Get lines before and including current cursor position
    const startRow = Math.max(0, cursorRow - maxLines + 1);
    const contextLines = lines.slice(startRow, cursorRow + 1);
    
    // For the last line, only include text up to cursor position
    if (contextLines.length > 0) {
      const lastLineIndex = contextLines.length - 1;
      contextLines[lastLineIndex] = contextLines[lastLineIndex].substring(0, cursorCol);
    }
    
    let context = contextLines.join('\n');
    
    // Truncate if too long
    if (context.length > maxChars) {
      context = context.substring(context.length - maxChars);
      // Try to start from a complete line
      const firstNewline = context.indexOf('\n');
      if (firstNewline > 0) {
        context = context.substring(firstNewline + 1);
      }
    }
    
    return context;
  }

  /**
   * Create cache key for context
   * @param {string} context 
   * @returns {string}
   */
  getCacheKey(context) {
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < context.length; i++) {
      const char = context.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Get AI code suggestion
   * @param {string} context - Code context around cursor
   * @returns {Promise<string>} - AI suggestion
   */
  async getAISuggestion(context) {
    if (!this.isAvailable()) {
      throw new Error('AI service is not available');
    }

    // Check cache first
    const cacheKey = this.getCacheKey(context);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const prompt = this.buildPrompt(context);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a smart code completion engine inside a terminal-based Vim-like text editor. Your task is to predict and autocomplete the next relevant portion of code, based on the current file\'s content and cursor position.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 200,
          timeout: 10000 // 10 second timeout
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response format');
      }

      const suggestion = data.choices[0].message.content.trim();
      
      // Cache the result
      this.cacheResult(cacheKey, suggestion);
      
      return suggestion;
    } catch (error) {
      // Handle different types of errors
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('Request timeout - AI service took too long to respond');
      }
      
      if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded - please try again later');
      }
      
      if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error('Authentication failed - check your API key');
      }
      
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  /**
   * Build prompt for AI completion
   * @param {string} context - Code context
   * @returns {string} - Formatted prompt
   */
  buildPrompt(context) {
    return `### Context:
The user is editing a code file. Below is the current content of the file up to the cursor position:

${context}

### Task:
Based on the code above, suggest the most likely next few lines of code or complete the current unfinished line. Keep the suggestion syntactically and semantically correct. Ensure it follows the style and indentation of the existing code.

### Output Format:
Respond with only the code suggestion — no explanations, no markdown, no comments, no extra newlines.

### Rules:
- Match the programming language syntax based on context (e.g., if it looks like Python, use Python; if it's C++, continue with C++).
- If the user is writing a function, complete the body.
- If the user is in the middle of a line, complete that line.
- If the code is inside a loop, conditional, or block, complete the block cleanly.
- Keep suggestions short (1–5 lines max).`;
  }

  /**
   * Cache a result
   * @param {string} key - Cache key
   * @param {string} suggestion - AI suggestion to cache
   */
  cacheResult(key, suggestion) {
    // Simple LRU cache implementation
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, suggestion);
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get current model name
   * @returns {string}
   */
  getModel() {
    return this.model;
  }

  /**
   * Set model (allow switching between different models)
   * @param {string} modelName - Model name
   */
  setModel(modelName) {
    const supportedModels = [
      'mixtral-8x7b-32768',
      'llama3-8b-8192',
      'llama3-70b-8192',
      'gemma-7b-it'
    ];
    
    if (supportedModels.includes(modelName)) {
      this.model = modelName;
      this.clearCache(); // Clear cache when changing models
      return true;
    }
    return false;
  }

  /**
   * Get list of supported models
   * @returns {Array<string>}
   */
  getSupportedModels() {
    return [
      'mixtral-8x7b-32768',
      'llama3-8b-8192', 
      'llama3-70b-8192',
      'gemma-7b-it'
    ];
  }
}

module.exports = AIService;
