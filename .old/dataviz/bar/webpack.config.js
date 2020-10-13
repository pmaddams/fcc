module.exports = {
  entry: __dirname + "/client/main.js",
  module: {
    rules: [
      { test: /\.js$/, include: __dirname + "/client", use: "babel-loader" }
    ]
  },
  output: { path: __dirname + "/public", filename: "bundle.js" }
};
