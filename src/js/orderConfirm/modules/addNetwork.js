const 
    // 加早字符串模板
    addNetworkStr = require('../templates/addNetwork.ejs'),

    // 公共函数库
    commonLib = require('./sendRequest.js'),
    loadBBN   = commonLib.loadBBN,
    renderBBN = commonLib.renderBBN,

    // 另一个公共函数库
    Util = require('../../../common/util');



// 将替换好的html结构添加到页面指定位置中
function addNetwork() {
    loadBBN(function(res){
        if (res.result == "success") {
            
            res.startDate = Util.queryString('startDate');
            res.endDate = Util.queryString('endDate');
            res.roomNum = $.orderInfo ? $.orderInfo.content.roomNum
                                      : Util.queryString('roomNum');

            // 渲染加宽带DOM
            renderBBN( '.network-msg-box', addNetworkStr(res) );
        }
    }, 3);
}



module.exports = addNetwork;
