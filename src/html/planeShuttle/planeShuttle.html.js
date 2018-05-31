
const
    layout = require('../../common/layout/layout'),

    pageContent = require('./planeShuttle.ejs'),

    pageTitle = '房掌柜 · 接送机服务',

    template = require('./modules/oneHotel.ejs'),

    hotelData = require('./testData/externalData'),
    
    rulesHTML = require('./modules/rules.ejs')(),
    // 处理国外模板和数据
    hotelHTML = template({list : hotelData}),
    
    mData = {
        hotelHTML : hotelHTML,
	    rulesHTML  : rulesHTML
    };



module.exports = layout.run(pageTitle, pageContent(mData));
