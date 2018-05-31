const pageContent = require('./hotelList.ejs');


const layout = require('../../common/layout/layout');
const pageTitle = '房掌柜 · 酒店列表';

const topNav = require('./modules/topNav.ejs')();
const searchLine = require('./modules/searchLine.ejs')();
const advancedSearch = require('./modules/advancedSearch.ejs')();
const subSearchLine = require('./modules/subSearchLine.ejs')();
const hotelList = require('./modules/hotelList.ejs')();
//const nearby = require('./modules/nearby.ejs')();

let content = pageContent({
    topNav: topNav,
    searchLine: searchLine,
    advancedSearch: advancedSearch,
    subSearchLine: subSearchLine,
    hotelList: hotelList,
    //nearby: nearby,
})


module.exports = layout.run(pageTitle, content);