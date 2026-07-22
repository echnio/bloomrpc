const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const productName = 'BloomRPC';
const version = require('../../package.json').version;
const outputDir = path.join(__dirname, '..', '..', 'release');
const appPath = path.join(outputDir, 'mac-arm64', `${productName}.app`);
const dmgPath = path.join(outputDir, `${productName}-${version}-arm64.dmg`);

if (process.platform !== 'darwin') {
  throw new Error('Creating a macOS DMG requires macOS and hdiutil.');
}

if (!fs.existsSync(appPath)) {
  throw new Error(`Packaged app not found at ${appPath}`);
}

const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bloomrpc-dmg-'));

try {
  fs.cpSync(appPath, path.join(stagingDir, `${productName}.app`), {
    recursive: true
  });
  fs.symlinkSync('/Applications', path.join(stagingDir, 'Applications'));

  const result = spawnSync(
    'hdiutil',
    [
      'create',
      '-volname',
      productName,
      '-srcfolder',
      stagingDir,
      '-ov',
      '-format',
      'UDZO',
      dmgPath
    ],
    { stdio: 'inherit' }
  );

  if (result.status !== 0) {
    throw new Error(`hdiutil failed with exit code ${result.status}`);
  }
} finally {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
