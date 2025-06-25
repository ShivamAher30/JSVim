#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const path = require('path');
const fs = require('fs');
const Editor = require('../src/editor');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [filename]')
  .example('$0 myfile.txt', 'Open myfile.txt for editing')
  .help('h')
  .alias('h', 'help')
  .epilog('A Vim-inspired terminal text editor')
  .argv;

// Get the filename from command line arguments
const filename = argv._[0] || null;
let fileContent = '';

// If a filename is provided and the file exists, read its content
if (filename) {
  const filePath = path.resolve(process.cwd(), filename);
  try {
    if (fs.existsSync(filePath)) {
      fileContent = fs.readFileSync(filePath, 'utf8');
    } else {
      console.log(`Creating new file: ${filename}`);
    }
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    process.exit(1);
  }
}

// Initialize and start the editor
const editor = new Editor({
  filename: filename,
  content: fileContent
});

// Start the editor (handle the async nature)
(async () => {
  await editor.start();
})();