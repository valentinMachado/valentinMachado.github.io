// Launches Vitest from a cwd with an uppercase drive letter. On Windows, VS
// Code opens the folder as `e:\…`: Vitest then loads itself twice (`e:` and
// `E:`) and every suite fails with "Vitest failed to find the runner".
const { spawnSync } = require("child_process");
const path = require("path");

const cwd = process.cwd().replace(/^[a-z]:/, (drive) => drive.toUpperCase());
const cli = path.join(cwd, "node_modules", "vitest", "vitest.mjs");

const { status } = spawnSync(
  process.execPath,
  [cli, ...process.argv.slice(2)],
  { cwd, stdio: "inherit" }
);
process.exit(status ?? 1);
