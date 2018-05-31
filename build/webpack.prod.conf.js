var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
var es3ifyPlugin = require('es3ify-webpack-plugin');

var env = process.env.NODE_ENV === 'testing' ?
    require('../config/test.env') :
    config.build.env

var plugins = [
	// http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
        'process.env': env
    }),    
    // new webpack.optimize.UglifyJsPlugin({
    //     compress: {
    //         warnings: false,
    //     },
    //     sourceMap: true,
    // }),
    
    // extract css into its own file
    new ExtractTextPlugin({
        filename: utils.assetsPath('css/[name].[contenthash].css')
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin(),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        minChunks: function(module, count) {
            // any required modules inside node_modules are extracted to vendor
            return (
                module.resource &&
                /\.js$/.test(module.resource) &&
                module.resource.indexOf(
                    path.join(__dirname, '../node_modules')
                ) === 0
            )
        }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        //chunks: ['manifest']
    }),
    // 注意：该插件一定要在 UglifyJsPlugin 插件运行之后再运行才有效
    new es3ifyPlugin(),
    // copy custom static assets 暂时屏蔽，不做文件搬运
    // new CopyWebpackPlugin([{
    //     from: path.resolve(__dirname, '../src/static'),
    //     to: 'static',   //config.build.assetsSubDirectory,
    //     ignore: ['*css*'],
    //     ignorefolder: ['.svn']
    // }]),
    // new webpack.ProvidePlugin({
    //     $: "jquery",
    //     jQuery: "jquery",
    //     "window.jQuery": "jquery"
    // }),
];

//***获取所有入口文件名
var Entries = utils.getAllEntries();

Entries.forEach((page) => {
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    var htmlPlugin = new HtmlWebpackPlugin({
        filename: process.env.NODE_ENV === 'testing' ?
            'template.html' : utils.assetsPath('html/' + page + '.html'),
        template: utils.resolve('src/html/' + page + '/' + page + '.html.js'),
        inject: true,
        chunks: ['manifest', 'common', page],
        //injectItem: ['manifest', 'common', page], //***新添加一个option选项
        minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true
                // more options:
                // https://github.com/kangax/html-minifier#options-quick-reference
        },
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        chunksSortMode: 'dependency'
    })
    plugins.push(htmlPlugin)
})

var webpackConfig = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({
            sourceMap: config.build.productionSourceMap,
            extract: true
        })
    },
    // 总管 sourceMap 的地方，配置这里就行了
    devtool: config.build.productionSourceMap ? '#source-map' : false,
    output: {
        path: config.build.assetsRoot,
        filename: utils.assetsPath('js/[name]/[name].[chunkhash].js'),
        chunkFilename: utils.assetsPath('js/async.js/[name]/[name].[chunkhash].js')
    },
    plugins: plugins
})

if (config.build.productionGzip) {
    var CompressionWebpackPlugin = require('compression-webpack-plugin')

    webpackConfig.plugins.push(
        new CompressionWebpackPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: new RegExp(
                '\\.(' +
                config.build.productionGzipExtensions.join('|') +
                ')$'
            ),
            threshold: 10240,
            minRatio: 0.8
        })
    )
}

if (config.build.bundleAnalyzerReport) {
    var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
