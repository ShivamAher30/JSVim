const fetch = require('node-fetch');
require('dotenv').config();

/**
 * AI Service for code autocompletion using Groq API
 */
class AIService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'llama3-8b-8192'; // Updated to current supported model
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
   * Get code context around cursor position with improved intelligence
   * @param {Array} lines - All lines in the buffer
   * @param {number} cursorRow - Current cursor row
   * @param {number} cursorCol - Current cursor column
   * @returns {string} - Context string
   */
  getCodeContext(lines, cursorRow, cursorCol) {
    const maxLines = 50; // Reduced for faster processing
    const maxChars = 800; // Reduced for more focused context
    
    // Get lines before and including current cursor position
    const startRow = Math.max(0, cursorRow - maxLines + 1);
    const contextLines = lines.slice(startRow, cursorRow + 1);
    
    // For the last line, only include text up to cursor position
    if (contextLines.length > 0) {
      const lastLineIndex = contextLines.length - 1;
      const lastLine = contextLines[lastLineIndex] || '';
      contextLines[lastLineIndex] = lastLine.substring(0, cursorCol);
    }
    
    let context = contextLines.join('\n');
    
    // Truncate if too long, but try to preserve meaningful structure
    if (context.length > maxChars) {
      context = context.substring(context.length - maxChars);
      
      // Try to start from a complete line or meaningful boundary
      const boundaries = ['\n\n', '\nfunction ', '\nclass ', '\ndef ', '\n  ', '\n'];
      let bestStart = 0;
      
      for (const boundary of boundaries) {
        const index = context.indexOf(boundary);
        if (index > 0 && index < context.length / 2) {
          bestStart = index + boundary.length;
          break;
        }
      }
      
      if (bestStart > 0) {
        context = context.substring(bestStart);
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
      throw new Error('AI service is not available - check API key configuration');
    }

    // Check cache first
    const cacheKey = this.getCacheKey(context);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const prompt = this.buildPrompt(context);

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
              content: 'You are a smart code completion engine inside a terminal-based Vim-like text editor. Your task is to predict and autocomplete the next relevant portion of code, based on the current file\'s content and cursor position. Provide concise, contextually appropriate suggestions that complete the current line or statement.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2, // Lower temperature for more deterministic results
          max_tokens: 100, // Reduced for faster responses and better preview
          stop: ['\n\n', '```', '---'] // Stop at double newlines, code blocks, or dividers
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear timeout if request completes

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API Error Response:', errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication failed - check your GROQ_API_KEY');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded - please try again later');
        } else if (response.status === 400) {
          throw new Error('Invalid request - check model name and parameters');
        } else {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid API response:', data);
        throw new Error('Invalid API response format');
      }

      const suggestion = data.choices[0].message.content.trim();
      
      // Clean the suggestion to ensure it's plain text only
      const cleanedSuggestion = this.sanitizeSuggestion(suggestion);
      
      // Cache the result if it's meaningful
      if (cleanedSuggestion && cleanedSuggestion.length > 0) {
        this.cacheResult(cacheKey, cleanedSuggestion);
      }
      
      return cleanedSuggestion;
    } catch (error) {
      // Handle different types of errors
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('Request timeout - AI service took too long to respond');
      }
      
      if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded - please try again later');
      }
      
      if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error('Authentication failed - check your GROQ_API_KEY');
      }
      
      if (error.message.includes('fetch')) {
        throw new Error('Network error - check your internet connection');
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
Based on the code above, suggest the most likely next few characters, words, or lines of code to complete the current unfinished expression, statement, or block. This is for inline autocompletion preview.

### Output Format:
Respond with ONLY the plain text code completion. Do not include:
- HTML tags or markup  
- ANSI escape sequences or color codes
- Markdown formatting (backticks, asterisks, etc.)
- Explanations or comments
- Extra newlines at the start

### Rules:
- Match the programming language syntax based on context
- If the user is in the middle of typing a function name, complete it
- If the user is writing a function call, complete the parentheses and arguments
- If the user is in the middle of a line, complete that line appropriately
- Keep suggestions concise and immediately useful (prefer 1-3 lines)
- For function calls, include likely parameters based on context
- Don't repeat code that's already written
- Return only the remaining text that should be added after the cursor`;
  }

  /**
   * Sanitize AI suggestion to ensure plain text only
   * @param {string} suggestion - Raw AI suggestion
   * @returns {string} - Cleaned plain text suggestion
   */
  sanitizeSuggestion(suggestion) {
    if (!suggestion) return '';
    
    let cleaned = suggestion;
    
    // Remove markdown formatting first (before HTML tags)
    cleaned = cleaned.replace(/```[a-zA-Z]*\n?/g, '');
    cleaned = cleaned.replace(/```/g, '');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
    
    // Remove HTML tags (e.g., <span class="hljs-function">)
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    
    // Remove ANSI escape sequences (e.g., [38;2;248;242m)
    cleaned = cleaned.replace(/\x1b\[[0-9;]*m/g, '');
    
    // Remove other common escape sequences
    cleaned = cleaned.replace(/\x1b\[[A-Za-z]/g, '');
    
    // Remove special Unicode characters that might cause rendering issues
    cleaned = cleaned.replace(/[│┌┐└┘├┤┬┴┼]/g, '|');
    
    // Ensure only printable ASCII and common UTF-8 characters
    cleaned = cleaned.replace(/[^\x20-\x7E\t\n\r]/g, ' ');
    
    // Remove excessive whitespace but preserve single spaces and newlines
    cleaned = cleaned.replace(/[ \t]+/g, ' ');
    cleaned = cleaned.replace(/\n\s*\n/g, '\n');
    cleaned = cleaned.replace(/^\s+/, ''); // Remove leading whitespace
    cleaned = cleaned.replace(/\s+$/, ''); // Remove trailing whitespace
    
    return cleaned;
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
      'llama3-8b-8192',
      'llama3-70b-8192',
      'llama-3.1-8b-instant',
      'llama-3.1-70b-versatile',
      'gemma-7b-it',
      'gemma2-9b-it'
    ];
  }
}

module.exports = AIService;
