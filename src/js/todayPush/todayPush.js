//全局变量Promise，兼容ie
window.Promise = require('es6-promise');


require('../../static/css/reset.css');


//添加本页样式
require('../../sass/todayPush/todayPush.scss');

require('../../common/calendarPrice/skin/push-skin.scss');


require('../../common/layout/header/header').run();
require('../../common/layout/footer/footer').run();

//页面数据获取
require('./modules/getData.js').run();

//分页器的交互
require('./modules/mainActive').run();

//“我的关注”功能
require('../../common/sideBar/sideBar').run();

// 初始化价格日历模块
var y = new Date().getFullYear(),
	m = new Date().getMonth();
require('../../common/calendarPrice/calendarPrice').run(y, m + 1);