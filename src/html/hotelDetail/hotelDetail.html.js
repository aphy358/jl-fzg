const
    pageContent = require('./hotelDetail.ejs'),


    layout = require('../../common/layout/layout'),
    pageTitle = '房掌柜 · 酒店详情',


    topNav = require('./modules/topNav.ejs')(),
    hotelInfo = require('./modules/hotelInfo.ejs')(),
    searchLine = require('./modules/searchLine.ejs')(),
    priceTable = require('./modules/priceTable.ejs')(),
    hotelInfoDetails = require('./modules/hotelInfoDetails.ejs')(),


    content = pageContent({
        topNav			: topNav,
        hotelInfo		: hotelInfo,
        searchLine		: searchLine,
        priceTable		: priceTable,
        hotelInfoDetails: hotelInfoDetails
    });


module.exports = layout.run(pageTitle, content);