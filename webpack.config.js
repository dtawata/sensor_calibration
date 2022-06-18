const path = require('path');
const entry = path.join(__dirname, 'src', 'index.js');
const output = path.join(__dirname, 'public');

module.exports = {
  entry: entry,
  output: {
    path: output,
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  mode: 'development',
  resolve: {
    extensions: ['.js', '.jsx']
  }
}