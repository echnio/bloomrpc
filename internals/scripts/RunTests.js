const spawn = require('cross-spawn');
const path = require('path');

const isE2E = process.argv[2] === 'e2e';
const args = isE2E ? ['test/e2e/.+\\.spec\\.js'] : [];

const result = spawn.sync(
  path.normalize('./node_modules/.bin/jest'),
  [...args, ...process.argv.slice(isE2E ? 3 : 2)],
  { stdio: 'inherit' }
);

process.exit(result.status);
