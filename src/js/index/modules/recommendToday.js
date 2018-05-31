
const
    Util = require('../../../common/util.js'),
    recommendTodayTmpl = require('../templates/recommendToday.T.ejs'),


	// 过滤数据，同一酒店只允许出现一个主推产品
    grepData = function(mainPushCityDtoList){
		for(var i = 0; i < mainPushCityDtoList.length; i++){
			var o = mainPushCityDtoList[i], hotelIds = [];
			
			if(o.isShow){
				for(var j = 0; o.mainPushProductDtoList && j < o.mainPushProductDtoList.length; j++){
					var p = o.mainPushProductDtoList[j];
				
					$.inArray(p.infoId, hotelIds) === -1
						? hotelIds.push(p.infoId)
						: o.mainPushProductDtoList.splice(j--, 1);
				}
			}else{
				mainPushCityDtoList.splice(i--, 1);
			}
		}
		
		return mainPushCityDtoList;
    },

    initData = function (){
        $.post('/mainPush/queryMainPushProductList.do', function(res){
            if( res.returnCode === 1 ){
                if( res.data.mainPushCityDtoList && res.data.mainPushCityDtoList.length ){

                    var tmpStr = recommendTodayTmpl({
                        mainPushCityDtoList : grepData(res.data.mainPushCityDtoList)
                    })
    
                    $("#recommendTodayWrap").html(tmpStr);
    
                    // 点击向左切换一批广告
                    initSwitchLeft();
            
                    // 点击向右切换一批广告
                    initSwitchRight();
	
	                //点击今日主推下的酒店时，先判断用户是否已登录
	                initToDetail();
    
                    // for (var i = 0; i < $(".irt-order-btn").length; i++) {
                    //     getPriceForRecommendToday($(".irt-order-btn")[i]);
                    // }
                }
            }else if( res.returnCode === -400001 ){
                // Util.login();
            }
        }, 'noAnimation');
    },

    // 为 "今日主推" 查价
    getPriceForRecommendToday = function (orderBtn){
        var
        o = $(orderBtn),
        params = {
            hotelId: o.attr('data-hotelid'),
            supplierId: o.attr('data-suppid'),
            roomId: o.attr('data-roomid'),
            rateType: o.attr('data-pricetypeid'),
            checkin: Util.addDays(new Date(), 0),
            checkout: Util.addDays(new Date(), 1),
            roomNum: 1
        };

        $.post('/hotel/getPriceListCache.do', params, function(res){
            if( typeof res === 'string' )   res = window.JSON.parse(res);
            if( res.success && res.content && res.content.roomTypeBases && res.content.roomTypeBases[0] && res.content.roomTypeBases[0].roomTypePrices ){
                var target = o.closest('.i-r-t-hotel-item').find('.oranged');
                var showSalePrice = res.content.roomTypeBases[0].roomTypePrices[0].showSalePrice;
                target.html( '￥' + showSalePrice );
            }
        }, 'noAnimation');
    },

    // 点击向左切换一批广告
    initSwitchLeft = function (){
        $(".switch-bar.switch-left").on('click', function(){
            var _this = $(this);
            if( _this.hasClass('disabled') )    return;

            var
            parent = _this.closest('.i-r-switch-hotels'),
            shownArr = parent.find('.i-r-t-hotel-item.shown'),
            hiddenArr = $(shownArr[0]).prevAll('.i-r-t-hotel-item.hidden');

            parent.find('.switch-bar.switch-right').removeClass('disabled');
            if( hiddenArr.length < 5 )  parent.find('.switch-bar.switch-left').addClass('disabled');

            for (var i = hiddenArr.length > 4 ? 3 : hiddenArr.length - 1, j = 3;  i > -1; i--, j--) {
                var o = hiddenArr[i];
                var p = shownArr[j];

                $(o).removeClass('hidden').addClass('shown');
                $(p).removeClass('shown').addClass('hidden');
            }
        });
    },

    // 点击向右切换一批广告
    initSwitchRight = function (){
        $(".switch-bar.switch-right").on('click', function(){
            var _this = $(this);
            if( _this.hasClass('disabled') )    return;

            var
            parent = _this.closest('.i-r-switch-hotels'),
            shownArr = parent.find('.i-r-t-hotel-item.shown'),
            hiddenArr = $(shownArr[shownArr.length - 1]).nextAll('.i-r-t-hotel-item.hidden');
            
            parent.find('.switch-bar.switch-left').removeClass('disabled');
            if( hiddenArr.length < 5 )  parent.find('.switch-bar.switch-right').addClass('disabled');

            for (var i = 0; i < hiddenArr.length && i < 4; i++) {
                var o = hiddenArr[i];
                var p = shownArr[i];

                $(o).removeClass('hidden').addClass('shown');
                $(p).removeClass('shown').addClass('hidden');
            }
        });
    },

    // 初始化点击 "查看全部" 按钮
    initCheckMoreClick = function(){
        //i-recommend-btn
    },
    
    //点击今日主推下的酒店及”查看全部“时，先判断用户是否已登录
    initToDetail = function () {
        $('.i-r-t-hotel-item>a,.i-recommend-btn>a').click(function () {
	        if (window.hasLoginFzg === 'false'){
		        // 登录组件
		        require('../../../common/loginBox/loginBox.js')();
		
		        return false;
	        }
        })
    };



// 今日主推
module.exports = {
    run: function(){

        // 初始化 "今日主推" 数据
        initData();

        // 初始化点击 "查看全部" 按钮
        initCheckMoreClick();
    }
}