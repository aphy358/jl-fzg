
const
    // 在给定的日期基础上加上若干天，并格式化成 '2017-10-01' 的字符串返回
    addDays = require('../../../common/util').addDays,

    // 登录模块相关 js
    loginModel = require('../../../common/loginModel/login');



// 初始化所有 "查看详情"、“酒店名”、“酒店图片” 按钮的链接
function initHrefForDetailBtns(){
    $(".nd-hotel-detail-link,.hname-link,.himg-link").each(function(i, elem){
        var 
            _this    = $(this),
            href     = '',
            hotelId  = _this.attr('data-hotelid'),
            ch       = _this.attr('data-citytype'),
            checkin  = ch === '0' ? addDays(new Date, 0) : addDays(new Date, 1),
            checkout = ch === '0' ? addDays(new Date, 1) : addDays(new Date, 2);

        href = 
            '/hotel/toHotelDetail.do' +
            '?hotelId=' + hotelId +
            '&checkin=' + checkin +
            '&checkout=' + checkout +
            '&ch=' + ch;

        _this.attr('href', href);
    });
}



// 初始化 "预订条款"， "取消条款" 的 tips 事件
function initMouseOverEvent(){    
    $('.cancel-type, .book-type').on('mouseover', function(){
        var _this = $(this),
            msg = _this.attr('data-msg') || 'nothing to show...';
        
        var tip = layer.tips(msg, _this, {
            time: 0, //0表示不自动关闭
            tips: [1, '#ff5a25'],
        });

        _this.on('mouseleave', function(){
            layer.close(tip);
        });
    });
}



// 获取当前用户信息，如果获取到了用户信息，再查价
function getCurrentUser(){
    $.get('/user/getCurrentUser.do', function(res){
        if( res.returnCode === 1 ){
            $("#div_User").attr('data-distrb', res.data.distributorAccount.distrbCode);
        }else if( res.returnCode === -400001 ){
            loginModel.loginFirst();
        }

        // 为每个房型获取一些基本信息（如："预订条款"， "取消条款"，"线上价格"，"暗减后的价格" 等... ），并注入到DOM里
        getInfoForeachHotelRoomType()
    });
}


// 为每个房型获取一些基本信息（如："预订条款"， "取消条款"，"线上价格"，"暗减后的价格" 等... ），并注入到DOM里
function getInfoForeachHotelRoomType(){
    
    if( !$("#div_User").attr('data-distrb') ){
        return setTimeout(function() {
            getInfoForeachHotelRoomType();
        }, 100);
    }

    var hotelRoomTypes = $('.nd-roomtype-price-row');

    if( hotelRoomTypes.length ){
        hotelRoomTypes.each(function(i, o){
            var 
                target = $(o).find('.nd-hotel-order-btn'),
                external = target.attr('data-citytype') === '3';

            var params = {
                hotelId         : target.attr('data-hotelId'),
                supplierId      : target.attr('data-supplierId'),
                roomId          : target.attr('data-roomId'),
                rateType        : target.attr('data-rateType'),
                checkin         : addDays(new Date, 0),
                checkout        : addDays(new Date, 1),
                adultNum        : '2',
                childrenNum     : '0',
                childrenAgesStr : '',
                roomNum         : 1
            }

            $.post('/hotel/getPriceList.do', params, function(data){
                if( data.success && data.content && data.content.result === 'success' && 
                    data.content.roomTypeBases.length && data.content.roomTypeBases[0].roomTypePrices.length ){
                    
                    var
                        d = data.content.roomTypeBases[0].roomTypePrices[0],
                        orderTerm = ( window.JSON.parse(d.hotelPriceStrs) )[0].reserveShow,
                        cancelTerm = d.cancellationDesc,
                        prePrice = d.totalPriceRMBBeforePriceStrategy,
                        newPrice = d.totalPriceRMB;

                    $(o).find('.book-type').attr('data-msg', orderTerm);
                    $(o).find('.cancel-type').attr('data-msg', cancelTerm);

                    // $(o).find('.nd-roomtype-price-pre').html('原价￥' + prePrice);
                    // $(o).find('.nd-roomtype-price').html(newPrice);
	                //将小礼包的价格加入现价中
	                var currentPrice = +target.attr('data-page').split('|')[1] || 0;
	                $(o).find('.nd-roomtype-price').html(newPrice + currentPrice);
                }
            }, 'noAnimation');
        })
    }    
}


//初始化“接送机专享”鼠标移入事件
function initPlanePop() {
	$(document).delegate('.plane-vip>span','mouseenter', function(){
        var _this = $(this),
            msg = _this.attr('data-gift') || 'nothing to show';
		
		var tip = layer.tips(decodeURIComponent(msg), _this, {
			time: 0, //0表示不自动关闭
			tips: [1, '#ff5a25'],
		});
		
		_this.on('mouseleave', function(){
			layer.close(tip);
		});
	});
}


//初始化接送机活动页小礼包信息（包括用户移入“接送机专享”所需的礼包信息，及用户点击预定时需要一同带上的小礼包的价格）
function initPlaneGift() {
    var bookDOM = $('.nd-hotel-order-btn');
    
    bookDOM.each(function (index, dom) {
	    var param = {
		    hotelId : $(dom).attr('data-hotelid'),
		    suppId : $(dom).attr('data-supplierid'),
		    roomId : $(dom).attr('data-roomid'),
		    rateType : $(dom).attr('data-ratetype'),
		    paymentType : $(dom).attr('data-paymenttype'),
		    startDate : $(dom).attr('data-startdate'),
		    endDate : $(dom).attr('data-enddate'),
	    };
	
	    $.post('/hotel/getMarketing.do', param, function (data) {
			    if (!data.data){
				    console.log("marketing data is: " + data.data);
				    $(dom).attr('data-page', 'planeShuttle|0');
				    $(dom).closest('.nd-roomtype-price-row').find('.plane-vip>span').attr('data-gift', 'nothing to show...');
			    }else{
				    $(dom).attr('data-page', 'planeShuttle|' + data.data.marketingPrice);
				    $(dom).closest('.nd-roomtype-price-row').find('.plane-vip>span').attr('data-gift', encodeURIComponent(data.data.marketingInfo) || 'nothing to show...');
			    }
	    }, 'noAnimation');
    })
}


module.exports = {
    run : function(){

        // 获取当前用户信息，如果获取到了用户信息，再查价
        getCurrentUser();

        //初始化“接送机专享”鼠标移入事件
	    initPlanePop();

        //初始化接送机活动页小礼包信息（包括用户移入“接送机专享”所需的礼包信息，及用户点击预定时需要一同带上的小礼包的价格）
        initPlaneGift();

        // 初始化所有 "查看详情" 按钮的链接
        initHrefForDetailBtns();

        // 初始化 "预订条款"， "取消条款" 的 tips 事件
        initMouseOverEvent();
    }
};
