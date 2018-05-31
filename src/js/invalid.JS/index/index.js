//全局变量Promise，兼容ie
window.Promise = require('es6-promise');

//引入样式文件
require('../../static/css/reset.css');
require('../../sass/header.scss');
require('../../sass/footer.scss');
require('../../static/css/swiper.min.css');
require('../../sass/index/index.scss');

//引入各模块 js 文件，并执行入口函数
require('./modules/banner.js').run();
require('./modules/search.js').run();
require('./modules/hotSales.js').run();
require('./modules/hotelRecommands.js').run();
require('./modules/ticket.js').run();
require('./modules/promotion.js').run();