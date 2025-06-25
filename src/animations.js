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
}

module.exports = Animations;
