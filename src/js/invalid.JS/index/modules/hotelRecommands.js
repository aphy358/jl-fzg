
//引入模板文件
const hotelRecommands = require('../templates/hotelRecommands.T.ejs');

//引入测试数据
let internalRecommandsD = require('../testData/internalRecommands.D');

//加载国内酒店
function loadInternalAds(){
    // $.getJSON('/user/indexInternalhotelData.do', function(data){
        if( internalRecommandsD.returnCode === 1 ){
            $("#hotelRecommands").html( hotelRecommands({ arr : internalRecommandsD.data.gnAds }) );
        }
    // })
}

//初始化 国内酒店、国际酒店 点击切换事件
function initNationSwithClick(){
	$(".ads-title-item").on('click', function(){
		var _this = $(this);
		if( _this.hasClass('current') )		return;
		
		_this.parent().find('.ads-title-item').removeClass('current');
		_this.addClass('current');
		
        var target = _this.attr('data-for');
		var arr = _this.closest('.ads-wrap').find('.toggle-show');
		arr.addClass('hidden');
		arr.filter(function(i, o){ return $(o).attr('data-target') == target; })
		   .removeClass('hidden');
	});
}

//首页 国内酒店、国外酒店 相关 js
module.exports = {
    run: function(){
        //加载国内酒店
        loadInternalAds();

        //初始化 国内酒店、国际酒店 点击切换事件
        initNationSwithClick();
    }
}