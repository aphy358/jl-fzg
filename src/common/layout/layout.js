const header = require('./header/header.ejs');
const footer = require('./footer/footer.ejs');
const layout = require('./layout.ejs');
const staticConfig = require('../../static/staticConfig.js');

module.exports = {
    /**
     * pageTitle：         页面标题
     * content：           页面主体内容
     * no_Header_Footer：  指示页面有无Header和Footer，默认有，如果传了为true的参数，则无
     */
    run(pageTitle, content, options) {
        const renderData = {
            pageTitle,
            header: options && options.no_head ? '' : header(),
            footer: options && options.no_foot ? '' : footer(),
            content,
            staticConfig
        };
        return layout(renderData);
    },
}