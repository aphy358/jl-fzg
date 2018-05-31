# my-project

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

webpack 在线文档： https://doc.webpack-china.org/guides/

1、新建一个项目文件夹 webpack sample

2、初始化一个项目，命令：npm init,(后续别人安装只要命令：npm install即可。)

3、安装 Webpack，命令：npm install --dev-save webpack,( 安装webpack的同时，将相关信息写入package.json文件的devDependencies属性 )

4、新建文件 .gitignore，内容为 '/node_modules/'，意思为git忽略文件夹node_modules下的所有文件

5、npm install --dev-save css-loader style-loader extract-text-webpack-plugin

6、/* eslint-disable */ 关闭语法检查

test


webpack打包导致的 js 报错 cases：

解决 default、catch 等关键字方法：
1、cnpm install --save-dev es3ify-webpack-plugin
2、在 module.exports.plugis 插入一条 new es3ifyPlugin()

解决Promise 兼容方法：
1、cnpm install --save-dev es6-promise
2、在入口文件顶部全局引入  window.Promise = require('es6-promise');

