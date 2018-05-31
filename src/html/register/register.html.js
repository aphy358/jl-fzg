const pageContent = require('./register.ejs');
const company = require('./modules/company.ejs');
const user = require('./modules/user.ejs');


const layout = require('../../common/layout/layout');
const pageTitle = '房掌柜 · 免费注册';


let content = pageContent({
    company: company(),
    user   : user(),
})


module.exports = layout.run(pageTitle, content);