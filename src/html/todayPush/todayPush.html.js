const layout        = require('../../common/layout/layout');
const pageContent   = require('./todayPush.ejs');
const pageTitle     = '房掌柜 · 今日主推';

module.exports = layout.run(pageTitle, pageContent());