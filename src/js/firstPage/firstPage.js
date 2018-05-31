//全局变量Promise，兼容ie
window.Promise = require('es6-promise');


require('../../static/css/reset.css');
require('../../sass/firstPage/firstPage.scss');


require('../../common/layout/footer/footer').run();

//合作商家logo交互、导航栏点击事件等
require('./modules/mainActive.js').run();

//获取验证码及登录模块
require('./modules/firstPageLogin.js').run();