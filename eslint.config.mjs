import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  { ignores: ["dist/", "dist-dev/"] },
  js.configs.recommended,
  {
    // site code, bundled by webpack
    files: ["src/**/*.js"],
    languageOptions: { globals: globals.browser },
  },
  {
    // run by vitest under jsdom, with node APIs
    files: ["tests/**/*.js"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ["bin/**/*.js", "webpack.config.js"],
    languageOptions: { sourceType: "commonjs", globals: globals.node },
  },
  // formatting is Prettier's job
  prettier,
];
