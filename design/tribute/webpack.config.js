module.exports = {
  entry: __dirname + "/client/main.js",
  module: {
    rules: [
      { test: /\.scss$/, use: ["style-loader", "css-loader", "sass-loader"] }
    ]
  },
  output: { filename: "bundle.js", path: __dirname + "/public" }
};
