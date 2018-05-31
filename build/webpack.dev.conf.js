var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
    baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

var plugins = [
	new webpack.DefinePlugin({
        'process.env': config.dev.env
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new FriendlyErrorsPlugin(),
    // new webpack.ProvidePlugin({
    //     $: "jquery",
    //     jQuery: "jquery",
    //     "window.jQuery": "jquery"
    // }),
];
//***获取所有入口文件名
var Entries = utils.getAllEntries();
Entries.forEach((page) => {
    var htmlPlugin = new HtmlWebpackPlugin({
        filename: page + '.html',
        template: utils.resolve('src/html/' + page + '/' + page + '.html.js'),
        chunks: [page, 'commons/commons'],
        //injectItem: ['manifest', 'common', page], //***新添加一个option选项
        //chunksSortMode: 'dependency',
    })
    plugins.push(htmlPlugin)
})

module.exports = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
    },
    // cheap-module-eval-source-map is faster for development  '#cheap-module-eval-source-map'
    devtool: '#cheap-module-eval-source-map',
    plugins: plugins
})