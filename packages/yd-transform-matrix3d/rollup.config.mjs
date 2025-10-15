import typescript from '@rollup/plugin-typescript';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {})
];

const tsPlugin = typescript({
  tsconfig: './tsconfig.json',
  declaration: true,
  declarationDir: 'dist'
});

export default [
  // library build
  {
    input: 'src/index.ts',
    external,
    output: [
      { file: pkg.module, format: 'esm', sourcemap: true },
      { file: pkg.main, format: 'cjs', sourcemap: true }
    ],
    plugins: [tsPlugin]
  },
  // cli build
  {
    input: 'src/cli.ts',
    external: [/^node:/, ...external],
    output: [
      { file: 'dist/cli.mjs', format: 'esm', sourcemap: true, banner: '#!/usr/bin/env node' },
      { file: 'dist/cli.cjs', format: 'cjs', sourcemap: true, banner: '#!/usr/bin/env node' }
    ],
    plugins: [tsPlugin]
  }
];
