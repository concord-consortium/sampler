#!/usr/bin/env node

/**
 * This script starts the Sampler application on a custom port.
 * Usage: node start-custom-port.js [port]
 * Example: node start-custom-port.js 3001
 */

const { spawn } = require('child_process');
const port = process.argv[2] || 3001;

console.log(`Starting Sampler on port ${port}...`);

// Run webpack-dev-server with custom port
const webpackProcess = spawn('npx', [
  'webpack', 
  'serve', 
  '--no-https', 
  '--port', 
  port
], { 
  stdio: 'inherit',
  shell: true
});

webpackProcess.on('error', (error) => {
  console.error(`Failed to start webpack-dev-server: ${error.message}`);
  process.exit(1);
});

console.log(`Sampler should be available at http://localhost:${port} when ready.`); 