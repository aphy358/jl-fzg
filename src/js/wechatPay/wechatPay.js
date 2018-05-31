//全局变量Promise，兼容ie
window.Promise = require('es6-promise');


require('../../static/css/reset.css');

require('../../sass/wechatPay/wechatPay.scss');

// 引入各模块 js
require('../../common/layout/header/header').run('register');
require('../../common/layout/footer/footer').run();


require('./modules/getQRcode.js').run();
