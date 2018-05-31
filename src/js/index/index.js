// 全局变量Promise，兼容ie
window.Promise = require('es6-promise');



// 引入样式文件
require('../../static/css/reset.css');
require('../../sass/index/index.scss');



// 引入各模块 js
require('../../common/layout/header/header').run('index');
require('../../common/layout/footer/footer').run();
require('../../common/sideBar/sideBar').run();

require('./modules/banner.js').run();
require('../../common/searchBar/searchBar.js')({
    elem: '#searchBarWrap'
})
require('./modules/concernAndOrder.js').run();
require('./modules/recommendToday.js').run();
require('./modules/recommendHot.js').run();

//春节收款公告
// require('./modules/notice.js')();


