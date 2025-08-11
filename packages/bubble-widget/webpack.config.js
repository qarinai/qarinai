const path = require("path");

module.exports = {
  entry: {
    "bubble-widget.js": [
      path.resolve(__dirname, "dist", "browser", "main.js"),
      path.resolve(__dirname, "dist", "browser", "styles.css"),
    ],
  },
  output: {
    filename: "[name]",
    path: path.resolve(__dirname, "dist", "bundle"),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  mode: "production",
};
