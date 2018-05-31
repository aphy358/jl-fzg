const pageContent = require('./groupDirect.ejs'),
    wanhao = require('./modules/wanhao.ejs'),
    xidawu = require('./modules/xidawu.ejs'),
    zhouji = require('./modules/zhouji.ejs'),
    bestwest = require('./modules/bestwest.ejs');


const layout = require('../../common/layout/layout');
const pageTitle = '房掌柜 · 集团直连';


let content = pageContent(
    {
        wanhao: wanhao(),
        xidawu: xidawu(),
        zhouji: zhouji(),
        bestwest : bestwest(),
    }
)


module.exports = layout.run(pageTitle, content);