const layout        = require('../../common/layout/layout');
const pageContent   = require('./orderConfirm.ejs');
const pageTitle     = '房掌柜 · 订单填写';

module.exports = layout.run(pageTitle, pageContent());
