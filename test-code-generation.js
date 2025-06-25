#!/usr/bin/env node

/**
 * Test script for natural language code generation features
 */

const AIService = require('./src/ai-service');
require('dotenv').config();

async function testCodeGeneration() {
  console.log('🎯 Testing AI Code Generation Features...\n');
  
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
    return;
  }
  
  // Test scenarios
  const testCases = [
    {
      mode: 'generate',
      instruction: 'create a function to calculate fibonacci numbers up to n',
      existingCode: '',
      language: 'javascript'
    },
    {
      mode: 'extend',
      instruction: 'add error handling and input validation',
      existingCode: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
      language: 'javascript'
    },
    {
      mode: 'implement',
      instruction: 'add a utility function to format numbers with commas',
      existingCode: `const utils = {
  capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
  reverse: (str) => str.split('').reverse().join('')
};`,
      language: 'javascript'
    }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`🔄 Test ${i + 1}: ${testCase.mode.toUpperCase()} mode`);
    console.log(`Instruction: "${testCase.instruction}"`);
    
    if (testCase.existingCode) {
      console.log('Existing code:');
      console.log('```javascript');
      console.log(testCase.existingCode);
      console.log('```');
    }
    
    console.log('');
    
    try {
      const startTime = Date.now();
      const generatedCode = await aiService.generateCodeFromInstruction(
        testCase.instruction,
        testCase.existingCode,
        testCase.language,
        testCase.mode
      );
      const endTime = Date.now();
      
      if (generatedCode && generatedCode.trim()) {
        console.log('✅ Generated code:');
        console.log('```javascript');
        console.log(generatedCode);
        console.log('```');
        console.log(`⏱️ Generation time: ${endTime - startTime}ms`);
        console.log(`📏 Generated ${generatedCode.split('\n').length} lines`);
        
        // Validate the code doesn't contain formatting issues
        const hasAnsiCodes = /\x1b\[[0-9;]*[a-zA-Z]/.test(generatedCode);
        const hasMarkdown = /```/.test(generatedCode);
        const hasHtmlSpans = /<span[^>]*>|<\/span>|hljs-/.test(generatedCode);
        const hasHtmlTags = /<[^>]*>/.test(generatedCode);
        const hasExplanations = /(?:this|the)\s+(?:code|function|implementation)/i.test(generatedCode);
        
        console.log('🔍 Quality validation:');
        console.log(`- ANSI codes: ${hasAnsiCodes ? '❌ FOUND' : '✅ Clean'}`);
        console.log(`- Markdown: ${hasMarkdown ? '❌ FOUND' : '✅ Clean'}`);
        console.log(`- HTML spans: ${hasHtmlSpans ? '❌ FOUND' : '✅ Clean'}`);
        console.log(`- HTML tags: ${hasHtmlTags ? '❌ FOUND' : '✅ Clean'}`);
        console.log(`- Explanations: ${hasExplanations ? '❌ FOUND' : '✅ Clean'}`);
        
        if (!hasAnsiCodes && !hasMarkdown && !hasHtmlSpans && !hasHtmlTags && !hasExplanations) {
          console.log('✨ Code looks perfect and ready to use!');
        } else {
          console.log('⚠️ Warning: Generated code contains formatting that should be cleaned');
        }
      } else {
        console.log('❌ No code generated');
      }
      
    } catch (error) {
      console.log(`❌ Generation failed: ${error.message}`);
    }
    
    console.log('\n' + '─'.repeat(60) + '\n');
  }
  
  console.log('🎉 Code generation testing complete!');
  console.log('');
  console.log('💡 To use in the editor:');
  console.log('1. Start: node bin/vimjs.js test-file.js');
  console.log('2. Enter command mode: press ":"');
  console.log('3. Try: :generate create a simple calculator class');
  console.log('4. Or: :extend add subtraction and division methods');
}

// Run the test
testCodeGeneration().catch(console.error);
