const Editor = require('./src/editor');
const AIService = require('./src/ai-service');

// Test basic editor instantiation
console.log('Testing VimJS with AI features...');

try {
    // Test AI service
    const aiService = new AIService();
    console.log('✓ AI Service created');
    console.log(`  - Available: ${aiService.isAvailable()}`);
    console.log(`  - Model: ${aiService.getModel()}`);
    console.log(`  - Supported models: ${aiService.getSupportedModels().join(', ')}`);
    
    // Test editor
    const editor = new Editor('./test-ai.js');
    console.log('✓ Editor created with AI support');
    console.log(`  - AI Status: ${JSON.stringify(editor.getAIStatus())}`);
    
    console.log('\n🎉 All tests passed! AI features are integrated.');
    console.log('\nTo test AI completion:');
    console.log('1. Set up .env with GROQ_API_KEY');
    console.log('2. Run: node bin/vimjs.js test-ai.js');
    console.log('3. Press "i" to enter Insert mode');
    console.log('4. Position cursor after "// Try AI completion after this line"');
    console.log('5. Press Tab to trigger AI completion');
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
}
