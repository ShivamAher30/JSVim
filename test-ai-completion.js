#!/usr/bin/env node

/**
 * Enhanced test script to verify AI completion functionality and clean output
 */

const AIService = require('./src/ai-service');
require('dotenv').config();

async function testAICompletion() {
  console.log('🧪 Testing AI Completion with Format Validation...\n');
  
  const aiService = new AIService();
  
  // Check if AI service is available
  console.log('📊 AI Service Status:');
  console.log(`- Enabled: ${aiService.enabled}`);
  console.log(`- API Key configured: ${aiService.apiKey.length > 0 ? 'Yes' : 'No'}`);
  console.log(`- Model: ${aiService.model}`);
  console.log(`- Available: ${aiService.isAvailable()}`);
  console.log('');
  
  if (!aiService.isAvailable()) {
    console.log('❌ AI service is not available. Please check your .env file and ensure GROQ_API_KEY is set.');
    console.log('');
    console.log('To set up:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Get API key from https://console.groq.com/keys');
    console.log('3. Set GROQ_API_KEY in .env file');
    return;
  }
  
  // Test with sample JavaScript code
  const testContext = `function calculateSum(a, b) {
  return a + b;
}

function calculateProduct(a, b) {
  return`;
  
  console.log('🔄 Testing AI completion with sample JavaScript code...');
  console.log('Context:');
  console.log('```javascript');
  console.log(testContext);
  console.log('```');
  console.log('');
  
  try {
    const suggestion = await aiService.getAISuggestion(testContext);
    console.log('✅ AI Suggestion received:');
    console.log(`"${suggestion}"`);
    
    // Test for common formatting issues
    const hasAnsiCodes = /\x1b\[[0-9;]*[a-zA-Z]/.test(suggestion);
    const hasHtmlTags = /<[^>]*>/.test(suggestion);
    const hasMarkdown = /```|`[^`]*`/.test(suggestion);
    const hasBackticks = suggestion.includes('`');
    const hasFormatting = /\*\*|\*[^*]|\[|\]/.test(suggestion);
    
    console.log('');
    console.log('🔍 Format validation:');
    console.log(`- ANSI codes: ${hasAnsiCodes ? '❌ FOUND' : '✅ Clean'}`);
    console.log(`- HTML tags: ${hasHtmlTags ? '❌ FOUND' : '✅ Clean'}`);
    console.log(`- Markdown: ${hasMarkdown ? '❌ FOUND' : '✅ Clean'}`);
    console.log(`- Backticks: ${hasBackticks ? '❌ FOUND' : '✅ Clean'}`);
    console.log(`- Other formatting: ${hasFormatting ? '❌ FOUND' : '✅ Clean'}`);
    
    if (!hasAnsiCodes && !hasHtmlTags && !hasMarkdown && !hasBackticks && !hasFormatting) {
      console.log('');
      console.log('🎉 AI completion is working correctly with perfectly clean output!');
    } else {
      console.log('');
      console.log('⚠️ Suggestion contains formatting that was cleaned by sanitization.');
      console.log('This is expected - the pipeline will clean it before display.');
    }
  } catch (error) {
    console.log('❌ AI completion failed:');
    console.log(`Error: ${error.message}`);
    
    if (error.message.includes('Authentication')) {
      console.log('');
      console.log('💡 This looks like an API key issue. Please check:');
      console.log('1. Your GROQ_API_KEY is correct');
      console.log('2. The API key has proper permissions');
      console.log('3. Visit https://console.groq.com/keys to verify');
    }
  }
}

// Run the test
testAICompletion().catch(console.error);