const AIService = require('./src/ai-service');

async function testAIService() {
    console.log('🔍 Testing AI Service Connection...\n');
    
    const aiService = new AIService();
    
    // Test 1: Check configuration
    console.log('1. Configuration Check:');
    console.log(`   API Key configured: ${aiService.apiKey ? 'Yes' : 'No'}`);
    console.log(`   API Key length: ${aiService.apiKey.length}`);
    console.log(`   Service available: ${aiService.isAvailable()}`);
    console.log(`   Model: ${aiService.getModel()}`);
    console.log('');
    
    // Test 2: Test context extraction
    console.log('2. Context Extraction Test:');
    const testLines = [
        'function greet(name) {',
        '    console.log("Hello, " + name);',
        '}',
        '',
        'function calculate(a, b) {',
        '    // Add the two numbers'
    ];
    const context = aiService.getCodeContext(testLines, 5, 25);
    console.log(`   Context extracted: ${context.length} characters`);
    console.log(`   Context preview: "${context.substring(0, 100)}..."`);
    console.log('');
    
    // Test 3: Test actual API call
    console.log('3. API Connection Test:');
    try {
        console.log('   Making test API call...');
        const suggestion = await aiService.getAISuggestion(context);
        console.log('   ✅ API call successful!');
        console.log(`   Suggestion received: "${suggestion}"`);
        console.log(`   Suggestion length: ${suggestion.length} characters`);
    } catch (error) {
        console.log('   ❌ API call failed:');
        console.log(`   Error: ${error.message}`);
        console.log(`   Error type: ${error.constructor.name}`);
        
        // Additional debugging
        if (error.message.includes('fetch')) {
            console.log('   → This might be a network connectivity issue');
        } else if (error.message.includes('401') || error.message.includes('403')) {
            console.log('   → This is likely an authentication issue with the API key');
        } else if (error.message.includes('429')) {
            console.log('   → Rate limit exceeded - try again in a moment');
        }
    }
    
    console.log('\n4. Debug Information:');
    console.log(`   Node.js version: ${process.version}`);
    console.log(`   Working directory: ${process.cwd()}`);
    console.log(`   API URL: ${aiService.apiUrl}`);
}

testAIService().catch(console.error);
