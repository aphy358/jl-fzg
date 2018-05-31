const
    // 加床字符串模板
    addBedStr = require('../templates/addBed.ejs'),

    // 公共函数库
    commonLib = require('./sendRequest.js'),
    loadBBN   = commonLib.loadBBN,
    renderBBN = commonLib.renderBBN,

    // 另一个公共函数库
    Util = require('../../../common/util');



// 将替换好的html结构添加到页面指定位置中
function addBed() {
    loadBBN(function(res){
        if (res.result == "success") {
            
            res.startDate = Util.queryString('startDate');
            res.endDate = Util.queryString('endDate');
            res.roomNum = $.orderInfo ? $.orderInfo.content.roomNum
                                      : Util.queryString('roomNum');
            
            res.ofType = [];
            for (var i = 0; i < res.data[0].length; i++) {
                res.ofType[i] = res.data[0][i].type;
            }

            // 回调函数，限制用户加床的总数
            var option = {
                cb     : limitBedNum,
                params : res
            };

            // 渲染加床DOM
            renderBBN( '.bed-msg-box', addBedStr(res), option );
        }
    }, 2);
}



function limitBedNum(res) {
    
    // 先判断用户加床总数是否超过房间数x每间房最多能加的床数
    var addBedTotal = res.roomNum * res.data[0][0].max;

    // 把用户能添加的最大床数绑定给添加按钮
    $('.add-bed').attr("addBedTotal", addBedTotal);
}



module.exports = addBed;
