import path from 'node:path';
import typescript from '@rollup/plugin-typescript';

const input = 'src/index.ts';
const outputDir = 'dist';

export default {
  input,
  output: [
    {
      file: path.join(outputDir, 'index.js'),
      format: 'esm',
      sourcemap: true
    },
    {
      file: path.join(outputDir, 'index.cjs'),
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    }
  ],
  plugins: [
    typescript({
      tsconfig: path.resolve('tsconfig.json'),
      declaration: true,
      declarationDir: path.join(outputDir)
    })
  ]
};
