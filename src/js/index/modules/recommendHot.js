
const
    Util = require('../../../common/util.js'),
    recommendHotTmpl = require('../templates/recommendHot.T.ejs'),


    // 初始化 "热门推荐" 数据
    initData = function (){
        var params = {
            channel: 1,
            block: 1,
            pageSize: 6,
        };

        $.post('/user/getAdInfoData.do', params, function(res){
            if( res.returnCode === 1 ){
                if( res.dataList ){
                    res.dataList.forEach(data => {
                        if(data.adImg)  data.adImg = data.adImg.replace(/^http:\/\/image.jladmin.cn/g, 'https://qnb.oss-cn-shenzhen.aliyuncs.com')
                    });
                    
                    var tmpStr = recommendHotTmpl({dataList: res.dataList});
                    $("#recommendHotWrap").html(tmpStr);
                }
            }else if( res.returnCode === -400001 ){
                // Util.login();
            }
        }, 'noAnimation');
    },

    // /hotel/toHotelDetail.do?ch=0&hotelId=577&checkin=2017-12-05&checkout=2017-12-06
    // 为 "今日主推" 查价
    getLowestPriceForRecommendHot = function (target){
        var
        paramStr = $(target).attr('data-link').split('?')[1],
        params = {
            hotelId: Util.queryString('hotelId', paramStr),
            checkInDate: Util.queryString('checkin', paramStr),
            checkOutDate: Util.queryString('checkout', paramStr),
            roomNum: 1,
        }

        $.post('/hotel/priceCache.do', params, function(res){
            if( typeof res === 'string' )   res = window.JSON.parse(res);
            var priceArr = [];
            var lowestPrice = 0;
            if( res.success && res.content && res.content.roomTypeBases && res.content.roomTypeBases.length ){
                for (var i = 0; i < res.content.roomTypeBases.length; i++) {
                    var o = res.content.roomTypeBases[i];
                    for (var j = 0; j < o.roomTypePrices.length; j++) {
                        priceArr.push(o.roomTypePrices[j].showSalePrice);
                    }
                }

                for (i = 0; i < res.content.roomTypeBasesRecommend.length; i++) {
                    o = res.content.roomTypeBasesRecommend[i];
                    for (var j = 0; j < o.roomTypePrices.length; j++) {
                        priceArr.push(o.roomTypePrices[j].showSalePrice);
                    }
                }
            }
            if( priceArr.length ){
                lowestPrice = Math.min.apply(null, priceArr);
            }
            $(target).html(lowestPrice);
        }, 'noAnimation');
    },

    initConcernEvent = function (){
        $(document).delegate(".irt-gz-icon", 'click', function(e){
            
            var _this = $(this),
                collectUrl,
                collectParam = {
	                categoryId : 0,
	                infoId : _this.data('hotelid')
                };
	
	
	        collectUrl = _this.hasClass('icon-gz-on')
		        ? '/fzgCustomerFavorite/removeFavorite.do'
		        : '/fzgCustomerFavorite/saveFavorite.do';
    
	
	        
	        //发送收藏请求
            $.post(collectUrl, collectParam, function (data) {
	            if (data.returnCode !== 1){
	                //提示用户错误信息
                    layer.msg(data.returnMsg);
                }else{
	                //收藏成功则改变样式
		            _this.hasClass('icon-gz-on')
			            ? _this.removeClass('icon-gz-on').addClass('icon-gz-off')
			            : _this.removeClass('icon-gz-off').addClass('icon-gz-on');
                }
            });
    
            e.preventDefault();
        })
    },
	
	//点击热门推荐下的酒店时，先判断用户是否已登录
	initToDetail = function () {
		$(document).delegate('.i-r-h-hotel-item>a', 'click', function () {
			if (window.hasLoginFzg === 'false'){
				// 登录组件
				require('../../../common/loginBox/loginBox.js')();
				
				return false;
			}
		})
	};


// 热门推荐
module.exports = {
    run: function(){

        // 初始化 "热门推荐" 数据
        initData();

        // 初始化关注点击事件
        // initConcernEvent();
	
	    //点击热门推荐下的酒店时，先判断用户是否已登录\
	    initToDetail();
    }
}