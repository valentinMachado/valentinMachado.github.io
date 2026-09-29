const path = require("path");

const result = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    chunkFilename: "[name].bundle.js",
    library: "portfolio",
    libraryTarget: "umd",
    umdNamedDefine: true,
    // dist/ is committed: drop stale chunks on each build
    clean: true,
  },
  module: {
    rules: [],
  },
  resolve: {
    modules: [
      "node_modules", // The default
      "src",
    ],
  },
};

// inject css in bundle (show_room and game_browser_template are using css)
result.module.rules.push({
  test: /\.css$/,
  use: [
    "style-loader", // Tells webpack how to append CSS to the DOM as a style tag.
    "css-loader", // Tells webpack how to read a CSS file.
  ],
});

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
