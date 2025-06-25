/**
 * Simple test for the enhanced syntax highlighter
 */
const path = require('path');
const SyntaxHighlighter = require('../src/enhanced-syntax-highlighter');

// Create a syntax highlighter instance
const highlighter = new SyntaxHighlighter();

// Test language detection
console.log('Testing language detection:');
const tests = [
  { file: 'example.js', expected: 'javascript' },
  { file: 'script.py', expected: 'python' },
  { file: 'index.html', expected: 'html' },
  { file: 'main.cpp', expected: 'cpp' },
  { file: 'Dockerfile', expected: 'dockerfile' },
  { file: '.bashrc', expected: 'bash' },
];

tests.forEach(({ file, expected }) => {
  const detected = highlighter.getLanguage(file);
  console.log(`${file}: ${detected === expected ? '✓' : '✗'} (detected: ${detected})`);
});

console.log('\nAvailable themes:');
console.log(highlighter.getThemes());

// Test syntax highlighting
console.log('\nTesting syntax highlighting for JavaScript:');

const jsCode = `
// This is a comment
function hello(name) {
  const greeting = "Hello, " + name + "!";
  return greeting;
}

class Example {
  constructor() {
    this.value = 42;
  }
  
  getValue() {
    return this.value;
  }
}

// Testing numeric literals
const num = 123.456;
const hex = 0xFFF;
`;

const highlighted = highlighter.highlightLines(jsCode.split('\n'), 'javascript');
console.log('Highlighting successful:', highlighted.length === jsCode.split('\n').length);

// Test theme switching
console.log('\nTesting theme switching:');
highlighter.getThemes().forEach(theme => {
  const success = highlighter.setTheme(theme);
  console.log(`Switched to ${theme}: ${success ? '✓' : '✗'}`);
});

console.log('\nCurrent theme:', highlighter.getCurrentTheme());

console.log('\nHighlighter is ready for integration!');
