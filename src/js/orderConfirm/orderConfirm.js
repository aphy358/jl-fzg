//全局变量Promise，兼容ie
window.Promise = require('es6-promise');

require('../../static/css/tooltip_m.css');
require('../../static/css/datepick.css');
require('../../static/css/reset.css');
//页面样式
require('../../sass/orderConfirm/orderConfirm.scss');
//确认订单信息弹框的样式
// require('../../sass/orderConfirm/confirmOrderMsg.scss');

require('../../common/layout/header/header.js').run();

require('../../common/layout/footer/footer').run();
//页面初始化
require('./modules/initPage').run();

// 引入侧边栏模块
require('../../common/sideBar/sideBar').run();