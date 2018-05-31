
const
    layout = require('../../common/layout/layout'),

    pageContent = require('./specialArea.ejs'),

    pageTitle = '房掌柜 · 港澳放大价',

    template = require('./modules/oneHotel.ejs'),

    hkData = require('./testData/hk'),
    
    aomenData = require('./testData/aomen'),
    
    rulesHTML = require('./modules/rules.ejs')(),
    // 处理国外模板和数据
    hkHTML = template({list : hkData}),
    
    aomenHTML = template({list : aomenData}),
    
    mData = {
        hkHTML : hkHTML,
        aomenHTML : aomenHTML,
	    rulesHTML  : rulesHTML
    };



module.exports = layout.run(pageTitle, pageContent(mData));
