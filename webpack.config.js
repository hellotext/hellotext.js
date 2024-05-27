module.exports = {
  mode: 'production',
  entry: ['whatwg-fetch', '@hotwired/stimulus', './lib/index.js'],
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
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }
    ]
  }
};
