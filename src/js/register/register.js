//全局变量Promise，兼容ie
window.Promise = require('es6-promise');


require('../../static/css/reset.css');

require('../../sass/register/register.scss');

// 引入各模块 js
require('../../common/layout/header/header').run('register');
require('../../common/layout/footer/footer').run();


require('./modules/company.js').run();
require('./modules/user.js').run();
require('./modules/submit.js').run();