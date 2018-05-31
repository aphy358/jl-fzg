// 全局变量Promise，兼容ie
window.Promise = require('es6-promise');


require('../../static/css/reset.css');
require('../../sass/header.scss');
require('../../sass/footer.scss');

require('../../sass/nationalDay/nationalDay.scss');


// 页面的初始化，包括：
// 获取当前用户信息、
// 顶部导航按钮、
// "查看详情" 按钮的链接、
// 预定条款和取消条款的 tips、
// 初始化屏幕滚动事件
require('./modules/initial').run();


// 传入国庆节页面特定的一些设置
const option = require('./modules/customized');


// 初始化价格日历模块
require('../../common/calendarPrice/calendarPrice').run( option );


// 引入侧边栏模块
require('../../common/sideBar/sideBar').run();