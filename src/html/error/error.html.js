const layout        = require('../../common/layout/layout');
const pageContent   = require('./error.ejs');
const pageTitle     = '房掌柜 · error';

module.exports = layout.run(pageTitle, pageContent(), {no_head : true, no_foot : true});