const commonConf = require('./webpack.common')
const path = require('path')
/** @typedef {import('webpack').Configuration} WebpackConfig **/
/** @type WebpackConfig */
module.exports = {
  ...commonConf,
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../../out', 'app'),
  },
}
