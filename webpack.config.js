module.exports = {
  mode: 'production',
  entry: ['@hotwired/stimulus', './src/index.bundle.js'],
  output: {
    filename: 'hellotext.js',
    library: 'Hellotext',
    libraryTarget: 'umd',
    libraryExport: 'default',
    globalObject: "typeof self !== 'undefined' ? self : this",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.mjs'],
  },
}
