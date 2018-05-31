const pageContent = require('./wechatPay.ejs');


const layout = require('../../common/layout/layout');
const pageTitle = '房掌柜 · 微信支付';


let content = pageContent();


module.exports = layout.run(pageTitle, content);