// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";
import { ROOT } from "./helpers";

const require = createRequire(import.meta.url);

/** Runs the production webpack config into a temporary directory. */
const buildProduction = async (outputPath) => {
  const previousEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  const configPath = resolve(ROOT, "webpack.config.js");
  delete require.cache[configPath];
  const config = require(configPath);
  process.env.NODE_ENV = previousEnv;

  const webpack = require("webpack");
  return new Promise((resolvePromise, reject) => {
    webpack(
      {
        ...config,
        context: ROOT,
        output: { ...config.output, path: outputPath },
      },
      (error, stats) => {
        if (error) return reject(error);
        if (stats.hasErrors())
          return reject(new Error(stats.toString("errors-only")));
        resolvePromise(stats);
      }
    );
  });
};

describe("production build", () => {
  let outputDir;
  let built;

  beforeAll(async () => {
    outputDir = mkdtempSync(join(tmpdir(), "portfolio-build-"));
    await buildProduction(outputDir);
    built = readFileSync(join(outputDir, "bundle.js"), "utf8");
    return () => rmSync(outputDir, { recursive: true, force: true });
  }, 120000);

  it("builds a minified bundle without source map reference", () => {
    expect(built.length).toBeGreaterThan(0);
    expect(built).not.toMatch(/sourceMappingURL/);
    expect(built.split("\n").length).toBeLessThan(10);
  });

  it("matches the committed dist/bundle.js (run `npm run build` before committing)", () => {
    // git may check the file out with CRLF line endings on Windows
    const normalize = (code) => code.replace(/\r\n/g, "\n");
    const committed = readFileSync(resolve(ROOT, "dist/bundle.js"), "utf8");
    expect(normalize(committed) === normalize(built)).toBe(true);
  });
});
