#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue.bold('\n🤖 VimJS AI Setup Helper\n'));

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
    console.log(chalk.yellow('📄 Creating .env file from template...'));
    
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log(chalk.green('✓ .env file created successfully!'));
    } else {
        // Create basic .env file
        const envContent = `# Groq API Configuration
# Get your API key from: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here

# AI Completion Settings (optional)
# AI_MODEL=mixtral-8x7b-32768
# AI_ENABLED=true
`;
        fs.writeFileSync(envPath, envContent);
        console.log(chalk.green('✓ .env file created with default template!'));
    }
} else {
    console.log(chalk.green('✓ .env file already exists'));
}

// Read current .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const hasApiKey = envContent.includes('GROQ_API_KEY=') && 
                 !envContent.includes('GROQ_API_KEY=your_groq_api_key_here') &&
                 !envContent.includes('GROQ_API_KEY=""') &&
                 !envContent.includes('GROQ_API_KEY=\'\'');

if (hasApiKey) {
    console.log(chalk.green('✓ Groq API key appears to be configured'));
} else {
    console.log(chalk.red('⚠ Groq API key not configured'));
}

console.log(chalk.blue('\n📋 Setup Instructions:'));
console.log(chalk.white('1. Get a free API key from: ') + chalk.cyan('https://console.groq.com/keys'));
console.log(chalk.white('2. Edit the .env file and replace ') + chalk.yellow('your_groq_api_key_here') + chalk.white(' with your actual API key'));
console.log(chalk.white('3. Save the .env file'));

console.log(chalk.blue('\n🚀 Usage:'));
console.log(chalk.white('• Start editor: ') + chalk.cyan('node bin/vimjs.js filename.js'));
console.log(chalk.white('• In Insert mode, press ') + chalk.yellow('Tab') + chalk.white(' for AI completion'));
console.log(chalk.white('• Use ') + chalk.yellow(':toggleAI') + chalk.white(' to enable/disable AI'));
console.log(chalk.white('• Use ') + chalk.yellow(':ai') + chalk.white(' to check AI status'));
console.log(chalk.white('• Use ') + chalk.yellow(':aimodel <model>') + chalk.white(' to change AI model'));

console.log(chalk.blue('\n🤖 Available AI Models:'));
console.log(chalk.white('• ') + chalk.cyan('mixtral-8x7b-32768') + chalk.gray(' (default - best for code)'));
console.log(chalk.white('• ') + chalk.cyan('llama3-8b-8192') + chalk.gray(' (fast and efficient)'));
console.log(chalk.white('• ') + chalk.cyan('llama3-70b-8192') + chalk.gray(' (most capable)'));
console.log(chalk.white('• ') + chalk.cyan('gemma-7b-it') + chalk.gray(' (balanced)'));

console.log(chalk.blue('\n📝 Test the AI features:'));
console.log(chalk.white('Run: ') + chalk.cyan('node bin/vimjs.js test-ai.js'));

console.log(chalk.blue('\n🔧 Troubleshooting:'));
console.log(chalk.white('• If you see ') + chalk.red('[AI] Service not configured') + chalk.white(', check your API key'));
console.log(chalk.white('• If you see ') + chalk.red('[AI] Rate limit exceeded') + chalk.white(', wait a moment and try again'));
console.log(chalk.white('• If you see ') + chalk.red('[AI] Request timeout') + chalk.white(', your internet connection may be slow'));

console.log('');
