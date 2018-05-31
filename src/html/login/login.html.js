const pageContent   = require('./login.ejs');
const layout        = require('../../common/layout/layout');
const staticConfig  = require('../../static/staticConfig');
const pageTitle     = '房掌柜 · 登录';

module.exports = layout.run(pageTitle, pageContent({staticConfig}), {no_foot : true, no_head : true});