import babel from "@rollup/plugin-babel";
import postcss from "rollup-plugin-postcss";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import path from "path";

// tslint:disable-next-line: no-var-requires
import pkg from "./package.json";

const extensions = [".js", ".jsx", ".ts", ".tsx"];

export default {
  input: `src/index.ts`,
  output: [
    // { dir: "dist/umd", name: "named", format: "umd", sourcemap: true },
    { file: pkg.main, name: "named", format: "umd", sourcemap: true },
    // { dir: "dist/es", name: "named", format: "es", sourcemap: true }
    { file: pkg.module, name: "named", format: "es", sourcemap: true },
  ],
  // tslint:disable-next-line: object-literal-sort-keys
  external: [],
  watch: {
    include: "src/**",
  },
  plugins: [
    external(),
    postcss({
      modules: false,
    }),
    nodeResolve({ extensions }),
    // Allow json resolution
    babel({
      exclude: "node_modules/**",
      extensions,
      configFile: path.resolve(__dirname, ".babelrc.json"),
    }),
  ],
};
