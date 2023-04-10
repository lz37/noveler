const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const path = require('path')
const resolve = (dir) => path.resolve(__dirname, dir)
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
/** @typedef {import('webpack').Configuration} WebpackConfig **/
/** @type WebpackConfig */
module.exports = {
  entry: path.join(__dirname, 'src', 'index.tsx'),
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
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
