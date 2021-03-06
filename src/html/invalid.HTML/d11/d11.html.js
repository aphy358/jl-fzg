
const
    layout = require('../../layout/layout'),

    pageContent = require('./d11.ejs'),

    pageTitle = '房掌柜 · 双十一',

    template = require('./modules/oneHotel.ejs'),

    internalData = require('./testData/internalData'),
    gatData      = require('./testData/gatData'),
    externalData = require('./testData/externalData'),

    internalHTML = template({list : internalData}),
    gatHTML      = template({list : gatData}),
    externalHTML = template({list : externalData}),

    mData = {
        internalHTML : internalHTML,
        gatHTML      : gatHTML,
        externalHTML : externalHTML
    };


module.exports = layout.run(pageTitle, pageContent(mData), {no_head : true});
