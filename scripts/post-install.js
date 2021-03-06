const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

require('events').EventEmitter.prototype._maxListeners = 10000;

const commands = [
  'npm run lint:fix',
  'npm run install-app-deps',
];

exec(commands.join('&&'), (error, stdout) => {
  if (error) throw error;
  console.log(stdout);
});

// TODO: make a PR to electron-builder project
fs.writeFileSync(
  path.join(__dirname, '../node_modules/app-builder-lib', 'templates/appx/appxmanifest.xml'),
  fs.readFileSync(path.join(__dirname, 'patch/appx', 'appxmanifest.xml')),
);
fs.writeFileSync(
  path.join(__dirname, '../node_modules/app-builder-lib', 'out/targets/AppxTarget.js'),
  fs.readFileSync(path.join(__dirname, 'patch/appx', 'AppxTarget.js')),
);
fs.writeFileSync(
  path.join(__dirname, '../node_modules/app-builder-lib', 'out/electron/electronMac.js'),
  fs.readFileSync(path.join(__dirname, 'patch/mac', 'electronMac.js')),
);
