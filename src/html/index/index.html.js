const pageContent = require('./index.ejs');
const search = require('./modules/search.ejs');
const notice = require('./modules/notice.ejs');
const concernAndOrder = require('./modules/concernAndOrder.ejs');
const recommendToday = require('./modules/recommendToday.ejs');
const recommendHot = require('./modules/recommendHot.ejs');


const layout = require('../../common/layout/layout');
const pageTitle = '房掌柜 · 首页';


let content = pageContent({
    search: search(),
    notice: notice(),
    concernAndOrder: concernAndOrder(),
    recommendToday: recommendToday(),
    recommendHot: recommendHot(),
})


module.exports = layout.run(pageTitle, content);