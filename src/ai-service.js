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
              content: 'You are a code completion tool. Return ONLY plain text code without any formatting, colors, markdown, HTML, or explanations. No ANSI codes, no backticks, no markup of any kind. Just the raw code text that should follow the cursor position.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1, // Very low temperature for deterministic, clean results
          max_tokens: 50, // Shorter responses to avoid formatting issues
          stop: ['\n\n', '```', 'EXPLANATION:'], // Maximum 3 stop sequences for Groq API
          stream: false // Ensure we get complete response
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
    return `You are a code completion assistant. Complete the code snippet with ONLY the missing text that should follow the cursor.

CODE CONTEXT:
${context}

INSTRUCTIONS:
- Provide ONLY the code that should be added after the cursor
- Do NOT include any formatting, colors, or markup
- Do NOT use markdown backticks or code blocks
- Do NOT include explanations or comments
- Do NOT repeat existing code
- Respond with raw plain text only
- Keep completions short and practical (1-30 characters typical)
- Match the programming language and style

EXAMPLE:
If context ends with "function hello(" respond with: "name) {"
If context ends with "console.log(" respond with: "'Hello World')"
If context ends with "const result = " respond with: "calculateSum(a, b);"

COMPLETION:`;
  }

  /**
   * Sanitize AI suggestion to ensure plain text only
   * @param {string} suggestion - Raw AI suggestion
   * @returns {string} - Cleaned plain text suggestion
   */
  sanitizeSuggestion(suggestion) {
    if (!suggestion) return '';
    
    let cleaned = suggestion;
    
    // First, remove any potential prompt echoing or explanations
    cleaned = cleaned.replace(/^(COMPLETION:|COMPLETE:|OUTPUT:|RESULT:)/i, '');
    
    // Remove any language identifiers that might have been added
    cleaned = cleaned.replace(/^(javascript|python|java|css|html|json|xml|sql)\s*/i, '');
    
    // CRITICAL: Extract content from markdown code blocks BEFORE removing HTML
    const codeBlockMatch = cleaned.match(/```(?:[a-zA-Z]*\n)?([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      cleaned = codeBlockMatch[1].trim();
    } else {
      // Remove markdown code block markers if no content to extract
      cleaned = cleaned.replace(/```[a-zA-Z]*\n?/g, ''); // Remove opening markers
      cleaned = cleaned.replace(/```/g, ''); // Remove closing markers
    }
    
    // STEP 1: Remove HTML content systematically
    // Remove complete HTML spans while preserving their text content
    cleaned = cleaned.replace(/<span[^>]*>([^<]*)<\/span>/g, '$1');
    
    // Remove broken/incomplete HTML fragments
    cleaned = cleaned.replace(/span\s+class=[^>\s]*>/g, ''); // broken opening spans
    cleaned = cleaned.replace(/<span[^>]*>/g, ''); // opening spans
    cleaned = cleaned.replace(/<\/span>/g, ''); // closing spans
    cleaned = cleaned.replace(/span>/g, ''); // broken fragments
    cleaned = cleaned.replace(/\/span>/g, ''); // broken closing fragments
    
    // Remove HTML attributes and syntax highlighting artifacts
    cleaned = cleaned.replace(/class=[^>\s]*\s*/g, ''); // class attributes
    cleaned = cleaned.replace(/hljs-[a-zA-Z-]+\s*/g, ''); // hljs class names
    cleaned = cleaned.replace(/style=[^>\s]*\s*/g, ''); // style attributes
    
    // Remove any remaining HTML tags EXCEPT valid code constructs
    // Protect includes and comparison operators first
    const protectedIncludes = [];
    
    // First, fix any missing # in includes that got stripped
    cleaned = cleaned.replace(/^(\s*)include\s*<([^>]+)>/gm, '$1#include <$2>');
    
    // Protect both proper and repaired includes
    cleaned = cleaned.replace(/#include\s*<[^>]+>/g, (match, index) => {
      const placeholder = `__INCLUDE_${protectedIncludes.length}__`;
      protectedIncludes.push({ placeholder, original: match });
      return placeholder;
    });
    
    const protectedComparisons = [];
    cleaned = cleaned.replace(/\w+\s*[<>]=?\s*\w+/g, (match, index) => {
      const placeholder = `__COMP_${index}__`;
      protectedComparisons.push({ placeholder, original: match });
      return placeholder;
    });
    
    // Now safe to remove remaining HTML tags
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    
    // Restore protected patterns
    protectedIncludes.forEach(({ placeholder, original }) => {
      cleaned = cleaned.replace(placeholder, original);
    });
    protectedComparisons.forEach(({ placeholder, original }) => {
      cleaned = cleaned.replace(placeholder, original);
    });
    
    // Decode HTML entities AFTER HTML removal
    cleaned = cleaned.replace(/&lt;/g, '<');
    cleaned = cleaned.replace(/&gt;/g, '>');
    cleaned = cleaned.replace(/&amp;/g, '&');
    cleaned = cleaned.replace(/&quot;/g, '"');
    cleaned = cleaned.replace(/&#39;/g, "'");
    
    // Remove inline markdown backticks
    cleaned = cleaned.replace(/`([^`]*)`/g, '$1');
    
    // Remove markdown formatting
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove bold
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // Remove italic
    cleaned = cleaned.replace(/#{1,6}\s*/g, ''); // Remove headers
    
    // Remove ALL ANSI escape sequences
    cleaned = cleaned.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
    cleaned = cleaned.replace(/\x1b\[[0-9;]*m/g, '');
    cleaned = cleaned.replace(/\x1b\[[\d;]*[HfABCDnK]/g, '');
    cleaned = cleaned.replace(/\x1b\][\d;]*;[^\x07]*\x07/g, '');
    cleaned = cleaned.replace(/\x1b[c-fA-F]/g, '');
    
    // Remove Unicode box drawing chars
    cleaned = cleaned.replace(/[│┌┐└┘├┤┬┴┼─═║╔╗╚╝╠╣╦╩╬]/g, '|');
    cleaned = cleaned.replace(/[""'']/g, '"'); // Normalize quotes
    cleaned = cleaned.replace(/[–—]/g, '-'); // Normalize dashes
    
    // Remove control characters except essential whitespace
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Remove non-printable characters but keep valid code symbols
    cleaned = cleaned.replace(/[^\x20-\x7E\t\n\r]/g, '');
    
    // Clean up whitespace while preserving code structure
    cleaned = cleaned.replace(/[ \t]+/g, ' '); // Multiple spaces to single
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n'); // Max 2 newlines
    
    // Trim but preserve essential structure
    cleaned = cleaned.trim();
    
    // Extract code from explanatory text
    const codePatterns = [
      /(?:here'?s?\s*(?:the\s*)?(?:completion|code|suggestion):\s*)(.*)/i,
      /(?:the\s*(?:completion|code|suggestion)\s*(?:is|would\s*be):\s*)(.*)/i,
      /(?:complete\s*(?:with|as):\s*)(.*)/i,
      /(?:add:\s*)(.*)/i
    ];
    
    for (const pattern of codePatterns) {
      const match = cleaned.match(pattern);
      if (match && match[1]) {
        cleaned = match[1].trim();
        break;
      }
    }
    
    // Remove trailing explanations
    const endPatterns = [
      /^(.+?)(?:\s*(?:this|that|which)\s+(?:completes?|finishes?|ends?).*)/i,
      /^(.+?)(?:\s*(?:to\s+)?(?:complete|finish|end).*)/i
    ];
    
    for (const pattern of endPatterns) {
      const match = cleaned.match(pattern);
      if (match && match[1]) {
        cleaned = match[1].trim();
        break;
      }
    }
    
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

  /**
   * Generate code based on natural language instruction
   * @param {string} instruction - Natural language instruction
   * @param {string} existingCode - Current file content
   * @param {string} language - Programming language
   * @param {string} mode - Generation mode (generate, extend, implement)
   * @returns {Promise<string>} - Generated code
   */
  async generateCodeFromInstruction(instruction, existingCode, language, mode = 'generate') {
    if (!this.isAvailable()) {
      throw new Error('AI service is not available - check API key configuration');
    }

    const prompt = this.buildCodeGenerationPrompt(instruction, existingCode, language, mode);

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for code generation

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
              content: `You are an expert code generator. Your task is to ${mode} code based on natural language instructions. Generate clean, well-structured, production-ready code that follows best practices. Always maintain existing code structure and add new code appropriately.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3, // Balanced temperature for creative but structured code
          max_tokens: 1000, // More tokens for code generation
          stop: ['```END', 'EXPLANATION:', '---END---'], // Stop markers for code generation
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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

      const generatedCode = data.choices[0].message.content.trim();
      
      // Clean and extract code from the response
      const cleanedCode = this.extractAndCleanGeneratedCode(generatedCode);
      
      return cleanedCode;
    } catch (error) {
      // Handle different types of errors
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('Request timeout - code generation took too long');
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
      
      throw new Error(`Code generation error: ${error.message}`);
    }
  }

  /**
   * Build prompt for code generation
   * @param {string} instruction - Natural language instruction
   * @param {string} existingCode - Current file content
   * @param {string} language - Programming language
   * @param {string} mode - Generation mode
   * @returns {string} - Formatted prompt
   */
  buildCodeGenerationPrompt(instruction, existingCode, language, mode) {
    const modeInstructions = {
      generate: 'Generate new code that implements the requested functionality.',
      extend: 'Extend the existing code by adding the requested functionality while preserving all existing code.',
      implement: 'Implement the requested feature by adding it to the existing codebase appropriately.'
    };

    return `${modeInstructions[mode] || modeInstructions.generate}

PROGRAMMING LANGUAGE: ${language || 'Auto-detect'}

CURRENT CODE:
${existingCode || '// Empty file'}

INSTRUCTION: ${instruction}

CRITICAL REQUIREMENTS:
- Write clean, readable, and well-commented code
- Follow ${language || 'best'} coding conventions and best practices
- If extending existing code, preserve ALL existing functionality
- Add new code in the most appropriate location
- Include proper error handling where needed
- Make the code production-ready

RESPONSE FORMAT REQUIREMENTS:
- Return ONLY raw source code
- NO HTML tags or spans (like <span class="hljs-function">)
- NO markdown code blocks or backticks
- NO syntax highlighting markup
- NO explanations or descriptions
- NO ANSI color codes
- Just plain text code that can be directly saved to a file

EXAMPLE BAD RESPONSE:
<span class="hljs-function">function</span> example()

EXAMPLE GOOD RESPONSE:
function example()

CODE:`;
  }

  /**
   * Extract and clean generated code from AI response
   * @param {string} response - Raw AI response
   * @returns {string} - Cleaned code
   */
  extractAndCleanGeneratedCode(response) {
    if (!response) return '';
    
    let cleaned = response;
    
    // Remove common prefixes/suffixes
    cleaned = cleaned.replace(/^(CODE:|RESULT:|OUTPUT:|RESPONSE:)/i, '');
    cleaned = cleaned.replace(/(END CODE|END RESULT|END OUTPUT|END RESPONSE)$/i, '');
    
    // Extract content from markdown code blocks BEFORE removing HTML
    const codeBlockMatch = cleaned.match(/```(?:[a-zA-Z]*\n)?([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      cleaned = codeBlockMatch[1];
    } else {
      // Remove markdown code block markers
      cleaned = cleaned.replace(/```[\s\S]*?\n/g, '');
      cleaned = cleaned.replace(/```[\s\S]*?$/g, '');
      cleaned = cleaned.replace(/```/g, '');
    }
    
    // STEP 1: Remove HTML content systematically
    // Remove complete HTML spans while preserving their text content
    cleaned = cleaned.replace(/<span[^>]*>([^<]*)<\/span>/g, '$1');
    
    // Remove broken/incomplete HTML fragments
    cleaned = cleaned.replace(/span\s+class=[^>\s]*>/g, ''); // broken opening spans
    cleaned = cleaned.replace(/<span[^>]*>/g, ''); // opening spans
    cleaned = cleaned.replace(/<\/span>/g, ''); // closing spans
    cleaned = cleaned.replace(/span>/g, ''); // broken fragments
    cleaned = cleaned.replace(/\/span>/g, ''); // broken closing fragments
    
    // Remove HTML attributes and syntax highlighting artifacts
    cleaned = cleaned.replace(/class=[^>\s]*\s*/g, ''); // class attributes
    cleaned = cleaned.replace(/hljs-[a-zA-Z-]+\s*/g, ''); // hljs class names
    cleaned = cleaned.replace(/style=[^>\s]*\s*/g, ''); // style attributes
    
    // STEP 2: Protect valid code constructs before HTML removal
    const protectedPatterns = [];
    
    // First, fix any missing # in includes that got stripped
    cleaned = cleaned.replace(/^(\s*)include\s*<([^>]+)>/gm, '$1#include <$2>');
    
    // Protect C++ includes
    cleaned = cleaned.replace(/#include\s*<[^>]+>/g, (match, index) => {
      const placeholder = `__INCLUDE_${index}__`;
      protectedPatterns.push({ placeholder, original: match });
      return placeholder;
    });
    
    // Protect comparison operators in conditions
    cleaned = cleaned.replace(/if\s*\([^)]*[<>][^)]*\)/g, (match, index) => {
      const placeholder = `__IF_${index}__`;
      protectedPatterns.push({ placeholder, original: match });
      return placeholder;
    });
    
    // Protect loop conditions
    cleaned = cleaned.replace(/(while|for)\s*\([^)]*[<>][^)]*\)/g, (match, index) => {
      const placeholder = `__LOOP_${index}__`;
      protectedPatterns.push({ placeholder, original: match });
      return placeholder;
    });
    
    // Protect general comparison operators
    cleaned = cleaned.replace(/\w+\s*[<>]=?\s*\w+/g, (match, index) => {
      const placeholder = `__COMP_${index}__`;
      protectedPatterns.push({ placeholder, original: match });
      return placeholder;
    });
    
    // Protect stream operators
    cleaned = cleaned.replace(/(std::)?(cout|cin|cerr)\s*[<>]{1,2}\s*/g, (match, index) => {
      const placeholder = `__STREAM_${index}__`;
      protectedPatterns.push({ placeholder, original: match });
      return placeholder;
    });
    
    // Now safe to remove remaining HTML tags
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    
    // STEP 3: Restore protected patterns
    protectedPatterns.forEach(({ placeholder, original }) => {
      cleaned = cleaned.replace(placeholder, original);
    });
    
    // Decode HTML entities AFTER HTML removal
    cleaned = cleaned.replace(/&lt;/g, '<');
    cleaned = cleaned.replace(/&gt;/g, '>');
    cleaned = cleaned.replace(/&amp;/g, '&');
    cleaned = cleaned.replace(/&quot;/g, '"');
    cleaned = cleaned.replace(/&#39;/g, "'");
    
    // Remove ANSI escape sequences
    cleaned = cleaned.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
    cleaned = cleaned.replace(/\x1b\[[0-9;]*m/g, '');
    cleaned = cleaned.replace(/\x1b\][\d;]*;[^\x07]*\x07/g, '');
    cleaned = cleaned.replace(/\[[\d;]*m/g, ''); // Additional color codes
    
    // STEP 4: Fix common C++ constructs that get broken during HTML removal
    cleaned = cleaned.replace(/include\s+<([^>]+)>/g, '#include <$1>'); // Fix missing # in includes
    cleaned = cleaned.replace(/std::\s*cout\s+"/g, 'std::cout << "'); // Fix cout with string
    cleaned = cleaned.replace(/std::\s*cout\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, 'std::cout << $1'); // Fix cout with variables
    cleaned = cleaned.replace(/cout\s+"/g, 'cout << "'); // Fix cout statements
    cleaned = cleaned.replace(/cout\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, 'cout << $1'); // Fix cout with variables
    cleaned = cleaned.replace(/(\w+)\s+std::endl/g, '$1 << std::endl'); // Fix endl statements
    cleaned = cleaned.replace(/(\w+)\s+endl/g, '$1 << endl'); // Fix endl without std
    cleaned = cleaned.replace(/#include\s+iostream>/g, '#include <iostream>'); // Fix includes without opening <
    cleaned = cleaned.replace(/#include\s+([a-zA-Z][a-zA-Z0-9._]*)/g, '#include <$1>'); // Fix includes missing brackets
    
    // Fix general stream operators that got mangled
    cleaned = cleaned.replace(/(\w+)\s+"([^"]+)"/g, '$1 << "$2"'); // Fix variable << "string"
    cleaned = cleaned.replace(/(\w+)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*;/g, '$1 << $2;'); // Fix variable << variable
    
    // Fix broken function keywords and other fragments
    cleaned = cleaned.replace(/^<(\w+)/gm, '$1'); // Fix lines starting with <word
    cleaned = cleaned.replace(/(\w+)<\s/g, '$1 '); // Fix word< patterns
    
    // Remove explanatory text at the beginning or end
    const explanationPatterns = [
      /^.*?(?:here'?s?\s*(?:the\s*)?(?:code|implementation|solution):\s*)/i,
      /^.*?(?:this\s*(?:code|implementation|solution)\s*(?:does|will|should).*?\n)/i,
      /^.*?(?:the\s*following\s*(?:code|implementation|solution).*?\n)/i
    ];
    
    for (const pattern of explanationPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }
    
    // Remove trailing explanations
    const endExplanationPatterns = [
      /\n\s*(?:this|the\s*above)\s*(?:code|implementation|solution).*$/i,
      /\n\s*(?:explanation|note|comment):.*$/i,
      /\n\s*(?:this\s*function|this\s*class|this\s*method).*$/i
    ];
    
    for (const pattern of endExplanationPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }
    
    // Clean up whitespace but preserve code structure and indentation
    cleaned = cleaned.replace(/^\s*\n+/, ''); // Remove leading empty lines
    cleaned = cleaned.replace(/\n\s*$/, '\n'); // Ensure single trailing newline
    
    // Fix specific whitespace issues from our tests - be more careful about indentation
    // Only fix clear single-space indentation issues, preserve others
    cleaned = cleaned.replace(/\n /g, '\n  '); // Change single space to double space indentation
    
    // Remove lines that are just HTML fragments or broken syntax
    const lines = cleaned.split('\n');
    const cleanLines = lines.filter(line => {
      const trimmed = line.trim();
      // Filter out lines that look like HTML fragments
      return !(
        /^(span|div|p|code|pre)\s*$/.test(trimmed) ||
        /^\/\s*(span|div|p|code|pre)\s*$/.test(trimmed) ||
        /^hljs-/.test(trimmed) ||
        /^class=/.test(trimmed) ||
        (trimmed === '' && lines.length > 1) // Remove empty lines only if multiple lines
      );
    });
    
    return cleanLines.join('\n');
  }
}

module.exports = AIService;
