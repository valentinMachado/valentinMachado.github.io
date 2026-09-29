const { exec } = require("node:child_process");
const { promisify } = require("node:util");
const path = require("node:path");
const express = require("express");

// optional local overrides (see .env.example)
try {
  process.loadEnvFile();
} catch {
  // no .env file
}

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || "127.0.0.1";

const main = () => {
  const application = express();

  // dev bundle lives outside dist/ so the committed production bundle is never overwritten
  application.use("/dist", express.static(path.resolve("dist-dev")));
  // dotfiles (.git, .env) must never be served
  application.use(express.static("./", { dotfiles: "deny" }));

  const server = application.listen(PORT, HOST, async () => {
    console.log(`Backend listening on http://${HOST}:${PORT}/`);
    try {
      await promisify(exec)("npm run build-dev");
      console.log("Backend is up to date");
    } catch (error) {
      console.error("Dev build failed:\n", error.stdout || error.message);
    }
  });

  server.on("error", (error) => {
    console.error("Backend could not start:", error.message);
    process.exitCode = 1;
  });
};

main();
