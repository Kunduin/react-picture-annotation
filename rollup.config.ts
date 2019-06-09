import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import sourceMaps from "rollup-plugin-sourcemaps";

import svgr from "@svgr/rollup";
import babel from "rollup-plugin-babel";
import json from "rollup-plugin-json";
import external from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
// import typescript from "rollup-plugin-typescript2";
import url from "rollup-plugin-url";

// tslint:disable-next-line: no-var-requires
const pkg = require("./package.json");

const extensions = [".js", ".jsx", ".ts", ".tsx"];

export default {
  input: `src/index.ts`,
  output: [
    { file: pkg.main, name: "named", format: "umd", sourcemap: true },
    { file: pkg.module, name: "named", format: "es", sourcemap: true }
  ],
  // tslint:disable-next-line: object-literal-sort-keys
  external: [],
  watch: {
    include: "src/**"
  },
  plugins: [
    external(),
    postcss({
      modules: false
    }),
    url({ exclude: ["**/*.svg"] }),
    svgr(),
    resolve({ extensions }),
    // Allow json resolution
    json(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    babel({ extensions, include: ["src/**/*"] }),
    // Resolve source maps to the original source
    sourceMaps()
  ]
};
