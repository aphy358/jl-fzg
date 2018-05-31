// 为日历面板查价，然后填充到日历中


var 
    // 在给定的日期基础上加上若干天，并格式化成 '2017-10-01' 的字符串返回
    addDays = require('../../util').addDays;


// 查价
function queryPrice(layero, month, option){
    
    var 
        target           = layero.find('.nd-order-confirm-btn'),
        childrenStrInput = layero.find('.adult-children-input'),
        external         = target.attr('data-citytype') === '3',
        // checkoutStr      = layero.find('.cp-td-inner').not(".disabled").last().attr('data-day'),
        checkoutStr      = layero.find('.cp-td-inner').has('.calendar-p-day-num').last().attr('data-day'),
        checkin          = month ? (month + '-01') : external ? addDays(new Date, 1) : addDays(new Date, 0),
        checkout         = month ? addDays(month + '-01', 31) : addDays(checkoutStr, 1);

    var params = {
        hotelId         : target.attr('data-hotelId'),
        supplierId      : target.attr('data-supplierId'),
        roomId          : target.attr('data-roomId'),
        rateType        : target.attr('data-rateType'),
        checkin         : checkin,
        checkout        : checkout,
        adultNum        : childrenStrInput.attr('data-adultnum'),
        childrenNum     : childrenStrInput.attr('data-childrennum'),
        childrenAgesStr : childrenStrInput.attr('data-childrenagestr'),
        roomNum         : 1
    }

    $.post('/hotel/getPriceList.do', params, function(data){
        // 将查询到的价格填充到日历中
        fillCalendarWithPrices(layero, data, option);
    });
}



// 将查询到的价格填充到日历中
function fillCalendarWithPrices(layero, data, option){
    if( data.content && data.content.result === 'success' && 
        data.content.roomTypeBases.length && data.content.roomTypeBases[0].roomTypePrices.length ){
            
        // 将该参数暂存到全局
        if( !window.currentHotelPriceStrs ){
            window.currentHotelPriceStrs = data.content.roomTypeBases[0].roomTypePrices[0];
        }else{
            $.each(data.content.roomTypeBases[0].roomTypePrices[0].nightlyPriceList, function(i, o){
                if( !$.grep(window.currentHotelPriceStrs.nightlyPriceList, function (p) { return o.date === p.date }).length ){
                    window.currentHotelPriceStrs.nightlyPriceList.push(o);
                }
            });
            window.currentHotelPriceStrs.hotelPriceStrs = window.JSON.stringify(window.currentHotelPriceStrs.nightlyPriceList);
        }

        var dayArr = layero.find('.cp-td-inner');

        for(var i = 0; i < data.content.roomTypeBases[0].roomTypePrices[0].nightlyPriceList.length; i++){
            var o = data.content.roomTypeBases[0].roomTypePrices[0].nightlyPriceList[i];
            
            for(var j = 0; j < dayArr.length; j++){
                var p = dayArr[j],
                    pDayStr = $(p).attr('data-day');

                if( pDayStr === o.date.replace(/-/g, '/') ){

                    var tmpStr = 
                        '<p class="calendar-p-price">￥' + o.salePrice + '</p>' +
                        '<p class="calendar-p-status ' + 
                            (o.status === 0 ? ( (o.stock - o.sellStock < 1) ? 'red">满房' : 'green">剩[' + (o.stock - o.sellStock) + ']' ) :
                             o.status === 1 ? 'green">畅订' :
                             o.status === 2 ? 'purple">待查' :
                             o.status === 3 ? 'red">满房' :
                             o.status === 5 ? ( (o.stock - o.sellStock < 1) ? 'red">满房' : 'green">剩[' + (o.stock - o.sellStock) + ']' ) :
                             ''
                            ) +
                        '</p>';

                    $(p).append( tmpStr );
                    
                    if (o.status === 0 && ( o.stock -o.sellStock <= 0)){
	                    $(p).addClass('disabled');
                    }else if (o.status === 3){
	                    $(p).addClass('disabled');
                    }else if (o.status === 5 && ( o.stock -o.sellStock <= 0)){
	                    $(p).addClass('disabled');
                    }else{
	                    $(p).removeClass('disabled');
                    }

                    break;
                }else{
	
                }
            }
        }

        if( option ){
            // 执行回调函数
            option( layero )
        }
    }
}



/**
 * layero : 价格日历所在的父元素
 * month  : 月份
 * option : 回调函数
 */
module.exports = function(layero, month, option){
    queryPrice(layero, month, option);
}
