const pageContent = require('./toolDataIn.ejs');


const layout = require('../../common/layout/layout');
const pageTitle = '房掌柜 · 集团小助手数据导入';


let content = pageContent()


module.exports = layout.run(pageTitle, content);