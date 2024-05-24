module.exports = {
  mode: 'production',
  entry: ['whatwg-fetch', '@hotwired/stimulus', './lib/hellotext.js'],
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
