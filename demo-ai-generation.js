#!/usr/bin/env node

/**
 * Demo script to showcase the AI code generation with animations
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🎯 AI Code Generation Demo with Beautiful Animations!');
console.log('');
console.log('This will start the VimJS editor with a test file.');
console.log('Once the editor opens:');
console.log('');
console.log('1. Press ":" to enter command mode');
console.log('2. Try these commands to see the beautiful animations:');
console.log('   :generate create a calculator class with basic operations');
console.log('   :extend add scientific functions like sin, cos, tan');
console.log('   :implement error handling and input validation');
console.log('');
console.log('Press any key to start the editor...');

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', () => {
  process.stdin.setRawMode(false);
  
  // Start the editor
  const editorPath = path.join(__dirname, 'bin', 'vimjs.js');
  const testFile = path.join(__dirname, 'test-generation-demo.js');
  
  const editor = spawn('node', [editorPath, testFile], {
    stdio: 'inherit'
  });
  
  editor.on('close', (code) => {
    console.log('Demo completed!');
    process.exit(code);
  });
});
