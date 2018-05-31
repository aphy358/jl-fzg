const pageContent   = require('./index.ejs');
const layout        = require('../../layout/layout');
const pageTitle     = '房掌柜 · 首页';

module.exports = layout.run(pageTitle, pageContent());