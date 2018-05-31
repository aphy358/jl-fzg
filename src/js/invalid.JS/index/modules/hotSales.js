
//引入模板文件
const hotSalesT = require('../templates/hotSales.T.ejs');

//引入测试数据
let hotSeasonD = require('../testData/hotSeason.D');

//加载当季热销
function loadAds(){
    // $.getJSON('/user/indexHotSeasonData.do', function(data){
        if( hotSeasonD.returnCode === 1 ){
            $("#hotSalesWrap").html( hotSalesT({ arr : hotSeasonD.data }) );
        }
    // })
}

//首页 当季热销 相关 js
module.exports = {
    run: function(){
        //加载当季热销
        loadAds();
    }
}