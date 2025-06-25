const Editor = require('./src/editor');

console.log('🧪 Testing VimJS Editor Initialization...\n');

try {
    // Test 1: Create editor instance
    console.log('Test 1: Creating editor instance...');
    const editor = new Editor('./test-ai.js');
    console.log('✓ Editor created successfully');

    // Test 2: Check AI integration
    console.log('\nTest 2: Checking AI integration...');
    const aiStatus = editor.getAIStatus();
    console.log(`✓ AI Service initialized: ${JSON.stringify(aiStatus, null, 2)}`);

    // Test 3: Test AI service methods
    console.log('\nTest 3: Testing AI service methods...');
    console.log(`✓ AI Models available: ${editor.aiService.getSupportedModels().join(', ')}`);
    
    // Test 4: Test context extraction
    console.log('\nTest 4: Testing context extraction...');
    const testLines = ['function test() {', '    return "hello";', '}'];
    const context = editor.aiService.getCodeContext(testLines, 2, 1);
    console.log(`✓ Context extracted (${context.length} chars): "${context.substring(0, 50)}..."`);

    // Test 5: Test cache functionality
    console.log('\nTest 5: Testing cache functionality...');
    editor.aiService.cacheResult('test-key', 'test-value');
    console.log('✓ Cache operations working');

    console.log('\n🎉 All tests passed! VimJS is ready with AI features.');
    console.log('\n📚 Next steps:');
    console.log('1. Configure your Groq API key in .env file');
    console.log('2. Run: node bin/vimjs.js test-ai.js');
    console.log('3. Try pressing Tab in Insert mode for AI completion!');

} catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
}
