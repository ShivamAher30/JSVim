// Welcome to VimJS with AI Autocompletion!
// This file demonstrates how to use AI-powered code completion

// 🚀 How to test AI completion:
// 1. Make sure your .env file has a valid GROQ_API_KEY
// 2. Open this file with: node bin/vimjs.js test-ai.js
// 3. Press 'i' to enter Insert mode
// 4. Position your cursor at the end of any comment that says "// Press Tab here"
// 5. Press Tab to get AI suggestions!

// JavaScript Examples
function calculateArea(radius) {
    const pi = 3.14159;
    return pi * radius * radius;
}

function calculateVolume(radius, height) {
    const area = calculateArea(radius);
    // Press Tab here to complete the volume calculation
}

// Array manipulation
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => {
    // Press Tab here for array transformation logic
});

// Object-oriented example
class Rectangle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    
    getArea() {
        // Press Tab here for area calculation
    }
    
    getPerimeter() {
        // Press Tab here for perimeter calculation
    }
}

// Async/await example
async function fetchUserData(userId) {
    try {
        // Press Tab here for fetch implementation
    } catch (error) {
        // Press Tab here for error handling
    }
}

// Event handling
function setupEventListeners() {
    const button = document.getElementById('myButton');
    button.addEventListener('click', function() {
        // Press Tab here for click handler logic
    });
}

// Utility function
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        // Press Tab here for debounce implementation
    };
}

// Export module
module.exports = {
    calculateArea,
    calculateVolume,
    Rectangle,
    // Press Tab here for more exports
};
