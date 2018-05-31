//全局变量Promise，兼容ie
window.Promise = require('es6-promise');


require('../../static/css/reset.css');

require('../../sass/toolOperateHotel/toolOperateHotel.scss');

// 引入各模块 js
require('../../common/layout/header/header').run('toolOperateHotel');
require('../../common/layout/footer/footer').run();
require('../../common/sideBar/sideBar').run();


//员工下拉框
require('./modules/search.js').run();

//编辑弹出框
require('./modules/operate.js').run();