module.exports = {
  mode: 'development',
  entry: ['whatwg-fetch', './src/hellotext.js'],
  output: {
    filename: 'hellotext.js'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: [/node_modules/],
        use: [{
          loader: 'babel-loader',
        }]
      }
    ]
  }
};
