const path = require("path");

const result = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    library: "portfolio",
    libraryTarget: "umd",
    umdNamedDefine: true,
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

// (path remains same one cause because github pages handle backend which does not allow a dynamic build of html)
result.output.path = path.resolve(process.cwd(), "./dist");

// production or development
if (process.env.NODE_ENV == "production") {
  result.mode = "production";
} else {
  result.mode = "development";
  result.devtool = "source-map";
}

module.exports = result;
