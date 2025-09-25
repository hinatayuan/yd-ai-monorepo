import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';

const distRoot = join('apps', 'yd-app', 'dist');

runTsc(['-p', join('apps', 'yd-app', 'tsconfig.build.json')]);

mkdirSync(distRoot, { recursive: true });
mkdirSync(join(distRoot, 'vendor'), { recursive: true });
mkdirSync(join(distRoot, 'styles'), { recursive: true });

copyFile(join('apps', 'yd-app', 'index.html'), join(distRoot, 'index.html'));
copyFile(join('apps', 'yd-app', 'styles', 'app.css'), join(distRoot, 'styles', 'app.css'));

const vendorFiles = [
  ['packages/react/dist/esm/index.js', 'vendor/react.js'],
  ['packages/react/dist/esm/jsx-runtime/index.js', 'vendor/react-jsx-runtime.js'],
  ['packages/react-dom/dist/esm/client.js', 'vendor/react-dom-client.js'],
  ['packages/yd-libs/dist/esm/index.js', 'vendor/yd-libs.js'],
  ['packages/yd-hooks/dist/esm/index.js', 'vendor/yd-hooks.js']
];

for (const [source, target] of vendorFiles) {
  copyFile(source, join(distRoot, target));
}

function copyFile(source, target) {
  const directory = dirname(target);
  if (directory && directory !== '.') {
    mkdirSync(directory, { recursive: true });
  }
  copyFileSync(source, target);
}

function runTsc(args) {
  rmSync(distRoot, { recursive: true, force: true });
  const result = spawnSync('tsc', args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
