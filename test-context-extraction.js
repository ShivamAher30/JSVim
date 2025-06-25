const AIService = require('./src/ai-service');

// Test AI service context extraction
console.log('Testing AI Service context extraction...');

const aiService = new AIService();

// Test code context
const testLines = [
    'function calculateArea(radius) {',
    '    // Calculate area of a circle',
    '    const pi = 3.14159;',
    '    const area = pi * radius * radius;',
    '    return area;',
    '}',
    '',
    'const myRadius = 5;',
    'const result = calculateArea(myRadius);',
    'console.log("Area:", result);',
    '',
    '// New function starts here',
    'function calculateVolume(radius, height) {',
    '    const area = calculateArea(radius);',
    '    // Next line should get AI completion'
];

// Test cursor at end of last line
const cursorRow = testLines.length - 1;
const cursorCol = testLines[cursorRow].length;

console.log('\nTest input:');
console.log('Cursor position:', { row: cursorRow, col: cursorCol });
console.log('Lines around cursor:');
testLines.slice(-5).forEach((line, i) => {
    const isCurrentLine = i === 4;
    console.log(`${isCurrentLine ? '>' : ' '} ${line}${isCurrentLine ? '|' : ''}`);
});

const context = aiService.getCodeContext(testLines, cursorRow, cursorCol);

console.log('\nExtracted context:');
console.log('================');
console.log(context);
console.log('================');
console.log(`Context length: ${context.length} characters`);
console.log(`Context lines: ${context.split('\n').length}`);

// Test prompt building
console.log('\nGenerated prompt:');
console.log('================');
const prompt = aiService.buildPrompt(context);
console.log(prompt);
console.log('================');

console.log('\n✓ Context extraction test completed successfully!');
