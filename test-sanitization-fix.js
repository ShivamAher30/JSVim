#!/usr/bin/env node

const AIService = require('./src/ai-service');

/**
 * Test the sanitization with problematic inputs that contain HTML spans
 */
function testSanitization() {
    console.log('🧪 Testing AI Service Sanitization...\n');
    
    const aiService = new AIService();
    
    // Test cases with problematic HTML/ANSI artifacts
    const testCases = [
        {
            name: 'HTML spans with hljs classes',
            input: '<span class="hljs-keyword">function</span> <span class="hljs-title">hello</span>() {',
            expected: 'function hello() {'
        },
        {
            name: 'Broken HTML spans',
            input: 'span class="hljs-function">function</span> test() {',
            expected: 'function test() {'
        },
        {
            name: 'Mixed HTML and code',
            input: '<span class="hljs-built_in">console</span>.log("Hello");',
            expected: 'console.log("Hello");'
        },
        {
            name: 'ANSI color codes',
            input: '\x1b[32mfunction\x1b[0m test() {',
            expected: 'function test() {'
        },
        {
            name: 'Markdown code blocks',
            input: '```javascript\nfunction test() {\n```',
            expected: 'function test() {'
        },
        {
            name: 'Complex HTML with nested spans',
            input: '<span class="hljs-keyword">const</span> <span class="hljs-variable">result</span> = <span class="hljs-number">42</span>;',
            expected: 'const result = 42;'
        },
        {
            name: 'C++ includes that should be preserved',
            input: '#include <iostream>',
            expected: '#include <iostream>'
        },
        {
            name: 'Valid angle brackets in code',
            input: 'if (a < b && c > d) {',
            expected: 'if (a < b && c > d) {'
        },
        {
            name: 'HTML entities',
            input: 'if (a &lt; b &amp;&amp; c &gt; d) {',
            expected: 'if (a < b && c > d) {'
        },
        {
            name: 'Real world example with multiple issues',
            input: '<span class="hljs-keyword">function</span> <span class="hljs-title">calculateSum</span>(<span class="hljs-params">a, b</span>) {\n  <span class="hljs-keyword">return</span> a + b;\n}',
            expected: 'function calculateSum(a, b) {\n  return a + b;\n}'
        }
    ];
    
    let passed = 0;
    let failed = 0;
    
    testCases.forEach((testCase, index) => {
        console.log(`Test ${index + 1}: ${testCase.name}`);
        console.log(`Input:    "${testCase.input}"`);
        
        const result = aiService.sanitizeSuggestion(testCase.input);
        console.log(`Output:   "${result}"`);
        console.log(`Expected: "${testCase.expected}"`);
        
        if (result === testCase.expected) {
            console.log('✅ PASS\n');
            passed++;
        } else {
            console.log('❌ FAIL\n');
            failed++;
        }
    });
    
    // Test the code generation sanitization too
    console.log('Testing code generation sanitization...\n');
    
    const codeGenTestCases = [
        {
            name: 'HTML spans in generated code',
            input: '<span class="hljs-function">function</span> <span class="hljs-title">greet</span>(<span class="hljs-params">name</span>) {\n  <span class="hljs-built_in">console</span>.<span class="hljs-property">log</span>(<span class="hljs-string">"Hello, "</span> + name);\n}',
            expected: 'function greet(name) {\n  console.log("Hello, " + name);\n}'
        },
        {
            name: 'C++ code with spans',
            input: '<span class="hljs-meta">#include</span> <span class="hljs-string">&lt;iostream&gt;</span>\n\n<span class="hljs-function"><span class="hljs-keyword">int</span> <span class="hljs-title">main</span><span class="hljs-params">()</span> </span>{\n    std::<span class="hljs-built_in">cout</span> <span class="hljs-string">"Hello World"</span> std::endl;\n    <span class="hljs-keyword">return</span> <span class="hljs-number">0</span>;\n}',
            expected: '#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}'
        }
    ];
    
    codeGenTestCases.forEach((testCase, index) => {
        console.log(`Code Gen Test ${index + 1}: ${testCase.name}`);
        console.log(`Input:    "${testCase.input}"`);
        
        const result = aiService.extractAndCleanGeneratedCode(testCase.input);
        console.log(`Output:   "${result}"`);
        console.log(`Expected: "${testCase.expected}"`);
        
        if (result === testCase.expected) {
            console.log('✅ PASS\n');
            passed++;
        } else {
            console.log('❌ FAIL\n');
            failed++;
        }
    });
    
    console.log(`\n🏁 Test Results: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
        console.log('\n❌ Some tests failed. Sanitization needs improvement.');
        process.exit(1);
    } else {
        console.log('\n✅ All tests passed! Sanitization is working correctly.');
    }
}

// Run the tests
testSanitization();
