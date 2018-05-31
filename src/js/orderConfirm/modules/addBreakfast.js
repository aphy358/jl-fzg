const 
    // 加早字符串模板
    addBreakfastStr = require('../templates/addBreakfast.ejs'),

    // 公共函数库
    commonLib = require('./sendRequest.js'),
    loadBBN   = commonLib.loadBBN,
    renderBBN = commonLib.renderBBN,

    // 另一个公共函数库
    Util = require('../../../common/util');



//将替换好的html结构添加到页面指定位置中
function addBreakfast() {
    loadBBN(function(res){
        if (res.result == "success") {
            
            res.startDate = Util.queryString('startDate');
            res.endDate = Util.queryString('endDate');
            
            // 渲染加早DOM
            renderBBN( '.breakfast-msg-box', addBreakfastStr(res) );
        }
    }, 1);
}



module.exports = addBreakfast;
