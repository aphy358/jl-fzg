//全局变量Promise，兼容ie
window.Promise = require('es6-promise');


require('../../static/css/reset.css');

require('../../sass/groupDirect/groupDirect.scss');


// 引入各模块 js
require('../../common/layout/header/header').run('group');
require('../../common/layout/footer/footer').run();
require('../../common/sideBar/sideBar').run();


require('./modules/initSwitch.js').run();

require('../../common/searchBar/searchBar.js')({
    elem: $('.search-box'),
    hotelGroup: true
})


