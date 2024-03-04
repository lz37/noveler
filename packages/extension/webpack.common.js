const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const tsConfigPath = path.join(__dirname, 'tsconfig.json')
/** @type {import('webpack').Configuration} WebpackConfig **/
module.exports = {
  target: 'node',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, '..', '..', 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]',
  },
  externals: {
    vscode: 'commonjs vscode',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@ext': path.resolve(__dirname, '..', 'extension', 'src'),
      '@web': path.resolve(__dirname, '..', 'webview', 'src'),
      '@common': path.resolve(__dirname, '..', 'common', 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: tsConfigPath,
            },
          },
        ],
      },
    ],
  },
  devtool: 'inline-source-map',
  plugins: [],
  optimization: {
    minimizer: [new UglifyJsPlugin()],
  },
}
