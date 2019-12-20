module.exports = {
  entry: __dirname + "/client/main.js",
  module: { rules: [{ exclude: /node_modules/, loader: "babel-loader" }] },
  output: { filename: "bundle.js", path: __dirname + "/public" }
};
