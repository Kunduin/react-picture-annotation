import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';

import svgr from '@svgr/rollup';
import json from 'rollup-plugin-json';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import url from 'rollup-plugin-url';

// tslint:disable-next-line: no-var-requires
const pkg = require('./package.json');

export default {
  input: `src/index.ts`,
  output: [
    { file: pkg.main, name: 'named', format: 'umd', sourcemap: true },
    { file: pkg.module, name: 'named', format: 'es', sourcemap: true }
  ],
  // tslint:disable-next-line: object-literal-sort-keys
  external: [],
  watch: {
    include: 'src/**'
  },
  plugins: [
    external(),
    postcss({
      modules: false
    }),
    url({ exclude: ['**/*.svg'] }),
    svgr(),
    resolve(),
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({
      useTsconfigDeclarationDir: true,
      objectHashIgnoreUnknownHack: true,
      clean: true
    }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    // Resolve source maps to the original source
    sourceMaps()
  ]
};
