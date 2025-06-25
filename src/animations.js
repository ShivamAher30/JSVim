/**
 * Animations for VimJS editor
 */
const blessed = require('blessed');
const figlet = require('figlet');
const gradient = require('gradient-string');
const { createSpinner } = require('nanospinner');
const chalkAnimation = require('chalk-animation');

class Animations {
  /**
   * Create a new Animations instance
   * @param {blessed.screen} screen - Blessed screen instance
   */
  constructor(screen) {
    this.screen = screen;
    this.animationBox = null;
    this.spinner = null;
    this.currentAnimation = null;
  }
  
  /**
   * Creates an animation container
   * @private
   */
  _createAnimationContainer() {
    // Create animation container that takes up most of the screen
    this.animationBox = blessed.box({
      top: 'center',
      left: 'center',
      width: '80%',
      height: '60%',
      content: '',
      tags: true,
      border: {
        type: 'line',
        fg: 'cyan'
      },
      style: {
        fg: 'white',
        bg: 'black',
      }
    });
    
    this.screen.append(this.animationBox);
    this.screen.render();
  }
  
  /**
   * Display a welcome animation
   * @param {string} filename - The filename being opened
   * @returns {Promise} - Promise that resolves when animation is complete
   */
  async welcomeAnimation(filename) {
    return new Promise(resolve => {
      // Create animation box if it doesn't exist
      if (!this.animationBox) {
        this._createAnimationContainer();
      }
      
      // Generate ASCII art for "VimJS"
      const asciiArt = figlet.textSync('VimJS', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      });
      
      // Apply fancy gradient to the ASCII art
      const rainbowText = gradient.pastel.multiline(asciiArt);
      
      // Set initial content
      this.animationBox.setContent('\\n\\n' + rainbowText + '\\n\\n');
      this.screen.render();
      
      // Show loading message
      setTimeout(() => {
        const fileText = filename ? `Opening: ${filename}` : 'New File';
        
        // Create a spinner at the bottom of the animation box
        const spinnerText = blessed.text({
          content: `${fileText}`,
          top: '70%',
          left: 'center',
          style: {
            fg: 'green',
          }
        });
        
        // Add spinner to animation box
        this.animationBox.append(spinnerText);
        
        let dots = 0;
        const updateSpinner = () => {
          dots = (dots + 1) % 4;
          const dotString = '.'.repeat(dots);
          spinnerText.setContent(`${fileText}${dotString}`);
          this.screen.render();
        };
        
        // Update spinner every 300ms
        const spinnerInterval = setInterval(updateSpinner, 300);
        
        // Show a "Ready!" message after animation
        setTimeout(() => {
          clearInterval(spinnerInterval);
          
          // Replace spinner with "Ready!" message
          spinnerText.setContent('Ready! Press any key to start editing');
          spinnerText.style.fg = 'yellow';
          this.screen.render();
          
          // Wait for keypress to continue
          this.screen.once('keypress', () => {
            // Remove animation box
            this.screen.remove(this.animationBox);
            this.animationBox = null;
            this.screen.render();
            resolve();
          });
        }, 2000);
      }, 1000);
    });
  }
  
  /**
   * Show a loading animation for file operations
   * @param {string} message - Message to display with the spinner
   * @returns {Object} - Spinner controller
   */
  showLoadingSpinner(message) {
    const spinner = createSpinner(message).start();
    return {
      succeed: (text) => {
        spinner.success({ text });
      },
      fail: (text) => {
        spinner.error({ text });
      },
      update: (text) => {
        spinner.update({ text });
      },
      stop: () => {
        spinner.stop();
      }
    };
  }
  
  /**
   * Flash the screen with a notification
   * @param {string} message - Message to flash
   * @param {string} color - Color to use (success/error/warning)
   */
  flashNotification(message, color = 'success') {
    // Create a full-screen overlay
    const overlay = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      content: '',
      style: {
        bg: color === 'success' ? 'green' :
            color === 'error' ? 'red' :
            color === 'warning' ? 'yellow' : 'blue',
        transparent: true,
        opacity: 0.3
      }
    });
    
    // Create a notification box
    const notification = blessed.box({
      top: 'center',
      left: 'center',
      width: '50%',
      height: 3,
      content: message,
      align: 'center',
      valign: 'middle',
      tags: true,
      border: {
        type: 'line',
      },
      style: {
        fg: 'white',
        bg: color === 'success' ? 'green' :
            color === 'error' ? 'red' :
            color === 'warning' ? 'yellow' : 'blue',
        border: {
          fg: 'white'
        }
      }
    });
    
    // Add to screen
    this.screen.append(overlay);
    this.screen.append(notification);
    this.screen.render();
    
    // Remove after a delay
    setTimeout(() => {
      this.screen.remove(overlay);
      this.screen.remove(notification);
      this.screen.render();
    }, 800);
  }
  
  /**
   * Display a rainbow text effect
   * @param {string} text - Text to animate
   * @returns {Object} - Animation controller
   */
  rainbowText(text) {
    const animation = chalkAnimation.rainbow(text);
    return {
      stop: () => animation.stop(),
      text: animation.text
    };
  }
  
  /**
   * Display a typewriter effect
   * @param {blessed.box} box - Box to display the effect in
   * @param {string} text - Text to type
   * @param {number} speed - Time between characters in ms
   * @returns {Promise} - Resolves when typing is complete
   */
  async typewriter(box, text, speed = 50) {
    return new Promise(resolve => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          box.setContent(box.getContent() + text[i]);
          this.screen.render();
          i++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  }
  
  /**
   * Show animated code generation progress
   * @param {string} instruction - The instruction being processed
   * @param {string} mode - Generation mode (generate, extend, implement)
   * @returns {Object} - Animation controller with update and stop methods
   */
  showCodeGenerationAnimation(instruction, mode = 'generate') {
    const animationContainer = blessed.box({
      top: 'center',
      left: 'center',
      width: '90%',
      height: '70%',
      content: '',
      tags: true,
      border: {
        type: 'line',
        fg: 'cyan'
      },
      style: {
        fg: 'white',
        bg: 'black',
      },
      padding: {
        top: 1,
        bottom: 1,
        left: 2,
        right: 2
      }
    });

    this.screen.append(animationContainer);

    // Animation state
    let frame = 0;
    let dots = '';
    let codeLines = [];
    let isComplete = false;
    
    const modeEmojis = {
      generate: '✨',
      extend: '🔧',
      implement: '⚡'
    };
    
    const modeColors = {
      generate: 'cyan',
      extend: 'yellow',
      implement: 'green'
    };

    // Animation frames
    const animationInterval = setInterval(() => {
      if (isComplete) return;
      
      frame++;
      dots = '.'.repeat((frame % 4));
      
      // Create animated header
      const emoji = modeEmojis[mode] || '🤖';
      const color = modeColors[mode] || 'cyan';
      
      let content = `{center}{${color}-fg}{bold}${emoji} AI Code Generation ${emoji}{/bold}{/${color}-fg}{/center}\n\n`;
      content += `{center}Mode: {${color}-fg}${mode.toUpperCase()}{/${color}-fg}{/center}\n`;
      content += `{center}Instruction: {white-fg}"${instruction}"{/white-fg}{/center}\n\n`;
      
      // Animated thinking indicator
      const thinkingFrames = ['🧠💭', '🤖💡', '⚡🔥', '✨💫'];
      const thinkingFrame = thinkingFrames[frame % thinkingFrames.length];
      content += `{center}{${color}-fg}${thinkingFrame} Analyzing requirements${dots}{/${color}-fg}{/center}\n`;
      
      // Progress indicator
      const progressBar = '█'.repeat(Math.floor((frame % 20) / 2)) + '░'.repeat(10 - Math.floor((frame % 20) / 2));
      content += `{center}[${progressBar}]{/center}\n\n`;
      
      // Simulated code being written
      const codeFrames = [
        'function',
        'function analyze(',
        'function analyze(data) {',
        'function analyze(data) {\n  const result = ',
        'function analyze(data) {\n  const result = processData(',
        'function analyze(data) {\n  const result = processData(data);',
        'function analyze(data) {\n  const result = processData(data);\n  return result;',
        'function analyze(data) {\n  const result = processData(data);\n  return result;\n}'
      ];
      
      if (frame < 50) {
        const codeIndex = Math.min(Math.floor(frame / 7), codeFrames.length - 1);
        content += `{center}{dim}Preview:{/dim}{/center}\n`;
        content += `{${color}-fg}${codeFrames[codeIndex]}{/${color}-fg}\n`;
      }
      
      // Status messages
      const statusMessages = [
        'Connecting to AI service...',
        'Processing natural language...',
        'Analyzing code context...',
        'Generating implementation...',
        'Optimizing code structure...',
        'Adding error handling...',
        'Finalizing code...'
      ];
      
      const statusIndex = Math.floor(frame / 10) % statusMessages.length;
      content += `\n{center}{dim}${statusMessages[statusIndex]}{/dim}{/center}`;

      animationContainer.setContent(content);
      this.screen.render();
    }, 150);

    // Animation controller
    const controller = {
      update: (progressText) => {
        // Update with custom progress text if needed
        if (progressText) {
          let content = `{center}{cyan-fg}{bold}✨ AI Code Generation ✨{/bold}{/cyan-fg}{/center}\n\n`;
          content += `{center}${progressText}{/center}\n`;
          animationContainer.setContent(content);
          this.screen.render();
        }
      },
      
      success: (generatedLines, timeMs) => {
        isComplete = true;
        clearInterval(animationInterval);
        
        const emoji = modeEmojis[mode] || '🤖';
        const color = modeColors[mode] || 'cyan';
        
        let content = `{center}{${color}-fg}{bold}${emoji} Code Generation Complete! ${emoji}{/bold}{/${color}-fg}{/center}\n\n`;
        content += `{center}{green-fg}✅ Successfully ${mode}d code{/green-fg}{/center}\n`;
        content += `{center}Generated: {yellow-fg}${generatedLines} lines{/yellow-fg}{/center}\n`;
        content += `{center}Time: {yellow-fg}${timeMs}ms{/yellow-fg}{/center}\n\n`;
        content += `{center}{dim}Press any key to continue...{/dim}{/center}`;
        
        animationContainer.setContent(content);
        this.screen.render();
        
        // Auto-hide after 2 seconds
        setTimeout(() => {
          this.screen.remove(animationContainer);
          this.screen.render();
        }, 2000);
      },
      
      error: (errorMessage) => {
        isComplete = true;
        clearInterval(animationInterval);
        
        let content = `{center}{red-fg}{bold}❌ Code Generation Failed ❌{/bold}{/red-fg}{/center}\n\n`;
        content += `{center}{red-fg}Error: ${errorMessage}{/red-fg}{/center}\n\n`;
        content += `{center}{dim}Press any key to continue...{/dim}{/center}`;
        
        animationContainer.setContent(content);
        this.screen.render();
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
          this.screen.remove(animationContainer);
          this.screen.render();
        }, 3000);
      },
      
      stop: () => {
        isComplete = true;
        clearInterval(animationInterval);
        this.screen.remove(animationContainer);
        this.screen.render();
      }
    };

    return controller;
  }
}

module.exports = Animations;
