const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const logFile = path.join(__dirname, 'server.log');
const out = fs.openSync(logFile, 'a');
const err = fs.openSync(logFile, 'a');

console.log('Starting server and logging to server.log...');

const child = spawn('node', ['api/index.js'], {
  detached: true,
  stdio: [ 'ignore', out, err ]
});

child.unref();
process.exit();
