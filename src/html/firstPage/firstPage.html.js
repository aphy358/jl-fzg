const layout        = require('../../common/layout/layout');
const pageContent   = require('./firstPage.ejs');
const pageTitle     = '房掌柜 · 企业首页';

module.exports = layout.run(pageTitle, pageContent(), {no_head : true});