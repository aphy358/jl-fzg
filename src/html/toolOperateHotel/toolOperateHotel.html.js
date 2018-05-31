const pageContent = require('./toolOperateHotel.ejs');


const layout = require('../../common/layout/layout');
const pageTitle = '房掌柜 · 集团小助手酒店分配';


let content = pageContent()


module.exports = layout.run(pageTitle, content);