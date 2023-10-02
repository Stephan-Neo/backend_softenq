// ***
// NOTE: MUST RUN THIS IN ROOT PROJECT DIR, OTHERWISE, SYMLINKS WILL NOT WORK !!!
//
// - "$ yarn" command will run this automatically. (package.json - postinstall)
// - This script creates symlinks (e.g. "src/api" to "node_modules/api")
//   so we can do like this from anywhere: require("api/utils/Utils") without using "../.." paths.
// ***

/* eslint-disable */
const fs = require('fs');
const path = require('path');

const symlinks = ['api', 'config', 'utils', 'interfaces', 'models', 'services', 'migrations']; // symlinks

const srcDir = process.env.SRCDIR || 'src';
const destDir = process.env.DESTDIR || 'node_modules';

for (let i = 0; i < symlinks.length; i += 1) {
  const srcPath = path.join(__dirname, srcDir, symlinks[i]);
  const destPath = path.join(__dirname, destDir, symlinks[i]);

  if (fs.existsSync(destPath)) {
    fs.unlinkSync(destPath);
  }

  try {
    fs.symlinkSync(srcPath, destPath, 'dir');
  } catch (ex) {
    console.error(`Creating symbolic link failed, consider Administrator mode on Windows: `);
    console.error(ex);
    break;
  }
}
