// 全局变量Promise，兼容ie
window.Promise = require('es6-promise');



// 引入样式文件
require('../../static/css/reset.css');
require('../../sass/hotelDetail/hotelDetail.scss');



// 引入各模块 js
require('../../common/layout/header/header').run();
require('../../common/layout/footer/footer').run();
require('../../common/sideBar/sideBar').run();



require('./modules/initials.js').run();
require('./modules/hotelInfo.js').run();
require('./modules/searchLine.js').run();
require('./modules/hotelPriceTable.js').run();



//“我的关注”功能
require('../../common/myConcern/myConcern.js');
