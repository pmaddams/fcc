module.exports = {
  entry: __dirname + "/client/main.js",
  module: {
    rules: [
      { test: /\.js$/, include: __dirname + "/client", use: "babel-loader" },
      {
        test: /\.scss$/,
        include: __dirname + "/client",
        use: ["style-loader", "css-loader", "sass-loader"]
      }
    ]
  },
  output: { path: __dirname + "/public", filename: "bundle.js" }
};
