
const
    layout = require('../../common/layout/layout'),

    pageContent = require('./customerRescue.ejs'),

    pageTitle = '房掌柜 · 不忘初心',

    template = require('./modules/oneHotel.ejs'),

    hotelData = require('./testData/externalData'),

    // 处理国外模板和数据
    hotelHTML = template({list : hotelData}),
    
    mData = {
        hotelHTML : hotelHTML
    };



module.exports = layout.run(pageTitle, pageContent(mData));
