const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const resolve = (dir) => path.resolve(__dirname, dir)

const tsConfigPath = path.join(__dirname, 'tsconfig.json')
/** @typedef {import('webpack').Configuration} WebpackConfig **/
/** @type WebpackConfig */
module.exports = {
  target: 'node',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, '../../', 'out'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]',
  },
  externals: {
    vscode: 'commonjs vscode',
  },
  resolve: {
    extensions: ['.ts', '.js'],
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
