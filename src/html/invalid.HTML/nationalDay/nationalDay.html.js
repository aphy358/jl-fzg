const layout      = require('../../layout/layout');
const pageContent = require('./nationalDay.ejs');
const pageTitle   = '房掌柜 · 国庆活动';

const template = require('./modules/oneHotel.ejs');

const internalData = require('./testData/internalData'),
      gatData      = require('./testData/gatData'),
      externalData = require('./testData/externalData');

var 
    // 处理国内模板和数据
    internalHTML = template({list : internalData}),

    // 处理港澳台模板和数据
    gatHTML      = template({list : gatData}),

    // 处理国外模板和数据
    externalHTML = template({list : externalData});
    
var mData = {
    internalHTML : internalHTML,
    gatHTML      : gatHTML,
    externalHTML : externalHTML
}



module.exports = layout.run(pageTitle, pageContent(mData), {no_head : true});
