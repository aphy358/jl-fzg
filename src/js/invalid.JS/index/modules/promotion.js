
//引入模板文件
const promotionT = require('../templates/promotion.T.ejs');

//初始化促销特卖
function initPromotion(){
    $("#promotion").html( promotionT() );
}


//首页促销特卖 相关 js
module.exports = {
    run: function(){
        //初始化促销特卖
        initPromotion()
    }
}