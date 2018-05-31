//全局变量Promise，兼容ie
window.Promise = require('es6-promise');


require('../../static/css/reset.css');

require('../../sass/toolDataIn/toolDataIn.scss');

// 引入各模块 js
require('../../common/layout/header/header').run('toolDataIn');
require('../../common/layout/footer/footer').run();
require('../../common/sideBar/sideBar').run();


//操作酒店区域
require('./modules/operateUser.js').run();

//查询酒店列表
require('./modules/hotelList.js').run();

//搜索酒店
require('./modules/operateHotel.js').run();