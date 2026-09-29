const path = require("path");

const result = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    chunkFilename: "[name].bundle.js",
    // dist/ is committed: drop stale chunks on each build
    clean: true,
  },
  resolve: {
    modules: [
      "node_modules", // The default
      "src",
    ],
  },
};

// production bundle is committed in dist/ (GitHub Pages serves the repo as is);
// the dev bundle goes to dist-dev/, served as /dist by bin/dev.js
if (process.env.NODE_ENV == "production") {
  result.mode = "production";
  result.output.path = path.resolve(process.cwd(), "./dist");
} else {
  result.mode = "development";
  result.devtool = "source-map";
  result.output.path = path.resolve(process.cwd(), "./dist-dev");
}

module.exports = result;
