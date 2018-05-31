
const
    // 在给定的日期基础上加上若干天，并格式化成 '2017-10-01' 的字符串返回
    addDays = require('../../../common/util').addDays,

    // 登录模块相关 js
    loginModel = require('../../../common/loginModel/login');



// 初始化所有 "查看详情" 按钮的链接
function initHrefForDetailBtns(){
    $(".nd-hotel-detail-link").each(function(i, elem){
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
            tips: [1, '#3595CC'],
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
                checkin         : external ? addDays(new Date, 1) : addDays(new Date, 0),
                checkout        : external ? addDays(new Date, 2) : addDays(new Date, 1),
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

                    $(o).find('.nd-roomtype-price-pre').html('线上￥' + prePrice);
                    $(o).find('.nd-roomtype-price').html(newPrice);
                }
            }, 'noAnimation');
        })
    }    
}



// 初始化礼包信息弹出事件
function initGiftPop(){
    $('.gift-pop').on('mouseover', function(){
        var _this = $(this),
            msg = _this.attr('data-gift') || 'nothing to show...';
        
        var tip = layer.tips(msg, _this, {
            time: 0, //0表示不自动关闭
            tips: [2, '#3595CC'],
            area: '300px'
        });

        _this.on('mouseleave', function(){
            layer.close(tip);
        });
    });
}


module.exports = {
    run : function(){

        // 获取当前用户信息，如果获取到了用户信息，再查价
        getCurrentUser();

        // 初始化礼包信息弹出事件
        initGiftPop();

        // 初始化所有 "查看详情" 按钮的链接
        initHrefForDetailBtns();

        // 初始化 "预订条款"， "取消条款" 的 tips 事件
        initMouseOverEvent();
    }
};
