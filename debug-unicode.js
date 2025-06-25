#!/usr/bin/env node

const AIService = require('./src/ai-service');

const aiService = new AIService();

// Test the specific failing case
const testInput = 'function │ test() {';
console.log('Input:', JSON.stringify(testInput));

let step1 = testInput.replace(/[│┌┐└┘├┤┬┴┼]/g, '|');
console.log('Step 1 (Unicode replacement):', JSON.stringify(step1));

let step2 = step1.replace(/[^\x20-\x7E\t\n\r]/g, ' ');
console.log('Step 2 (Non-ASCII removal):', JSON.stringify(step2));

let final = aiService.sanitizeSuggestion(testInput);
console.log('Final result:', JSON.stringify(final));

// Check if the Unicode character is in our replacement list
const unicodeChar = '│';
console.log('Unicode char code:', unicodeChar.charCodeAt(0));
console.log('Is in replacement pattern:', /[│┌┐└┘├┤┬┴┼]/.test(unicodeChar));
