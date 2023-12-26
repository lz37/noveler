const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
/** @type {import('webpack').Configuration} WebpackConfig **/
module.exports = {
  entry: path.join(__dirname, 'src', 'index.tsx'),
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
    alias: {
      '@ext': path.resolve(__dirname, '..', 'extension', 'src'),
      '@web': path.resolve(__dirname, '..', 'webview', 'src'),
      '@common': path.resolve(__dirname, '..', 'common', 'src'),
    },
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: '/node_modules/',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../../dist', 'app'),
  },
  plugins: [],
  optimization: {
    minimizer: [new UglifyJsPlugin(), new CssMinimizerPlugin()],
  },
}
