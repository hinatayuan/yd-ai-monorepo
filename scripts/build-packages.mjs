import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join } from 'node:path';

const packages = [
  'react',
  'react-dom',
  'yd-libs',
  'yd-hooks'
];

for (const name of packages) {
  const dist = join('packages', name, 'dist');
  try {
    rmSync(dist, { recursive: true, force: true });
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      throw error;
    }
  }

  runTsc(['-p', join('packages', name, 'tsconfig.build.json')]);
  runTsc(['-p', join('packages', name, 'tsconfig.cjs.json')]);
}

function runTsc(args) {
  const result = spawnSync('tsc', args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
