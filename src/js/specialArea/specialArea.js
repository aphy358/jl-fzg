// 全局变量Promise，兼容ie
window.Promise = require('es6-promise');


require('../../static/css/reset.css');

require('../../sass/specialArea/specialArea.scss');
require('../../common/calendarPrice/skin/push-skin.scss');


require('../../common/layout/header/header').run();
require('../../common/layout/footer/footer').run();

// 页面的初始化，包括：
// 获取当前用户信息、
// 顶部导航按钮、
// "查看详情" 按钮的链接、
// 预定条款和取消条款的 tips、
// 初始化屏幕滚动事件
require('./modules/initial').run();



// 初始化价格日历模块
var y = new Date().getFullYear(),
	m = new Date().getMonth();
require('../../common/calendarPrice/calendarPrice').run(y, m + 1);


// 引入侧边栏模块
// require('../../common/sideBar/sideBar').run();