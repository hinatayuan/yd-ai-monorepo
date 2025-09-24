import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' assert { type: 'json' };

const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {})
];

export default {
  input: 'src/index.ts',
  external,
  output: [
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true
    },
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    }
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist'
    })
  ]
};
