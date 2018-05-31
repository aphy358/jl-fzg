var path = require('path')
var utils = require('./utils')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')

//先获取所有入口文件名，然后再逐个拼接 entry 对象，最后传参。
var Entries = utils.getAllEntries();

var entry = {};   //common: ['jquery']

Entries.forEach((page) => {
    entry[page] = utils.resolve('src/js/' + page + '/' + page + '.js')
});

module.exports = {
    entry: entry,
    output: {
        path: config.build.assetsRoot,
        filename: '[name].js',
        publicPath: process.env.NODE_ENV === 'production' ?
            config.build.assetsPublicPath : config.dev.assetsPublicPath
    },
    resolve: {
        extensions: ['.js', '.vue', '.json', '.scss'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': utils.resolve('src'),
            //'$': utils.resolve('src/thirdpart/js/jquery.js'),
            '~': utils.resolve('src/components'),
        }
    },
    module: {
        rules: [{
                test: /\.html$/,
                loader: 'html-loader',
                options: {
                    minimize: true
                }
            },
            {
                test: /\.ejs$/,
                loader: 'ejs-loader',
                include: [utils.resolve('src')]
            },
            /*{
              test: /\.(js|vue)$/,
              loader: 'eslint-loader',
              enforce: "pre",
              include: [utils.resolve('src'), utils.resolve('test')],
              options: {
                formatter: require('eslint-friendly-formatter')
              }
            },*/
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: vueLoaderConfig
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [utils.resolve('src'), utils.resolve('test')]
            },
            {
                test: /\.(png|jpe?g|gif)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: utils.assetsPath('static/img/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: utils.assetsPath('static/fonts/[name].[hash:7].[ext]')
                }
            }
        ]
    }
}
