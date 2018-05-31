const pageContent = require('./toolUpdatingPrice.ejs');


const layout = require('../../common/layout/layout');
const pageTitle = '房掌柜 · 集团小助手';

const crumbs = require('./modules/crumbs.ejs')();
const hotelList = require('./modules/hotelList.ejs')();
const optLine = require('./modules/optLine.ejs')();
const table = require('./modules/table.ejs')();



let content = pageContent({
    crumbs,
    hotelList,
    optLine,
    table,
})


module.exports = layout.run(pageTitle, content);