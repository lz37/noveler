const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin()
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const commonConf = require('./webpack.common')

module.exports = smp.wrap({
  ...commonConf,
  plugins: [...commonConf.plugins, new BundleAnalyzerPlugin()],
})
