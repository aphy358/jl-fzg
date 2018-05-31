// 价格日历中的相关事件


var 
    // 在给定的日期基础上加上若干天，并格式化成 '2017-10-01' 的字符串返回
    addDays = require('../../util').addDays,

    buildMonths = require('./buildMonthHTML'),

    // 查价模块，然后填充日历
    queryPriceForCalendar = require('./queryPriceForCalendar');



// 初始化价格日历每一天的点击事件
function initCalendarDayClick(){
    $(document).delegate(".cp-td-inner", "click", function(){

        if( $(this).hasClass('disabled') )    return;

        var 
            _this         = $(this),
            thisDayStr    = _this.attr('data-day'),
            nextDayStr    = addDays(new Date(thisDayStr), 1, '/'),
            dayArr        = _this.closest('.calendar-price-wrap').find('.cp-td-inner'),
            checkin       = $( $.grep( dayArr, function(o){ return $(o).hasClass('checkin') } ) ),
            checkout      = $( $.grep( dayArr, function(o){ return $(o).hasClass('checkout') } ) ),
            checkBetween  = $( $.grep( dayArr, function(o){ return $(o).hasClass('between-check') } ) ),
            parent        = _this.closest('.calendar-price-wrap').parent(),
            checkinInput  = parent.find('.oop-date-input.checkin'),
            checkoutInput = parent.find('.oop-date-input.checkout');

        // 如果还没设置入住日期，则...
        if( !checkin.length ){
            _this.addClass('checkin');
            checkinInput.val( thisDayStr ).attr('data-v', thisDayStr);
            checkoutInput.val('').attr('data-v', nextDayStr);
	
        }
        // 如果设置了入住日期而没设置离店日期，则...
        else if( checkin.length && !checkout.length ){

            if( $(this).hasClass('checkin') )    return;

            if( new Date( thisDayStr + ' 23:59:59' ) < new Date( checkin.attr('data-day') ) ){
                checkin.removeClass('checkin');
                _this.addClass('checkin');
                checkinInput.val( thisDayStr ).attr('data-v', thisDayStr);
                checkoutInput.attr('data-v', nextDayStr);
            }else{
                _this.addClass('checkout');
                setCheckBetween( _this.closest('.calendar-price-wrap'), dayArr );
                checkoutInput.val( thisDayStr ).attr('data-v', thisDayStr);
	
            }
	
        }
        // 如果入住日期和离店日期都设置了
        else{
            checkin.removeClass('checkin');
            checkout.removeClass('checkout');
            checkBetween.removeClass('between-check');
            _this.addClass('checkin');
            checkinInput.val( thisDayStr ).attr('data-v', thisDayStr);
            checkoutInput.val('').attr('data-v', nextDayStr);
        }
	
	    //接送页设置总价
	    selectedPrice();
    });
}


//计算用户选择日期的总价
function selectedPrice() {
	if ($('.total-price')){
		var selectedDay,
			selectedPrice = 0,
			planeFlag = false;
		if ($('.between-check>.calendar-p-price').length > 0){
			selectedDay = $('.between-check>.calendar-p-price');
			selectedDay.each(function (index, dom) {
				if ($(dom).closest('.cp-td-inner').hasClass('of-plane')) planeFlag = true;
				if (index < selectedDay.length - 1) selectedPrice += +$(dom).text().split('￥')[1];
			});
		}else{
			selectedDay = $('.checkin>.calendar-p-price');
			selectedDay.each(function (index, dom) {
				if ($(dom).closest('.cp-td-inner').hasClass('of-plane')) planeFlag = true;
				if (index <= selectedDay.length - 1) selectedPrice += +$(dom).text().split('￥')[1];
			});
		}
		
		if (planeFlag === true){
			$('.total-price>.overt-num').text(selectedPrice + +$('.plane-price>.overt-num').text());
			$('.plane-price').show();
			$('.total-price').show();
		}else{
			$('.total-price>.overt-num').text(selectedPrice);
			$('.plane-price').hide();
			$('.total-price').show();
		}
	}
}



// 设置入住日期和离店日期之间的日期背景颜色
function setCheckBetween( target, dayArr ){

    var 
        checkin  = +new Date( target.find('.checkin').attr('data-day') + ' 00:00:00' ),
        checkout = +new Date( target.find('.checkout').attr('data-day') + ' 23:59:59' );

    for(var i = 0; i < dayArr.length; i++){
        var o = dayArr[i],
            oTime = +new Date( $(o).attr('data-day') );

        if( checkin <= oTime && oTime <= checkout ){
            $(o).addClass('between-check');
        }
    }
}



// 初始化 "上一月" 按钮的点击事件
function initMonthSwitchLeftClick(){
    $(document).delegate('.month-switch-bar.month-left', 'click', function(){
        var
            _this = $(this),
            parent = _this.closest('.calendar-price-wrap'),

            // 当前显示的两个月份
            currentMonthArr = parent.find('.cp-one-month-wrap.current'),

            // 在当前显示的两个月前面隐藏的月份
            hiddenAhead = $(currentMonthArr[0]).prevAll('.cp-one-month-wrap.hidden');
    
        if( hiddenAhead.length < 2 ){
            parent.find('.month-left').addClass('hidden');
        }

        $(currentMonthArr[currentMonthArr.length - 1]).removeClass('current').addClass('hidden');
        $(currentMonthArr[0]).prev('.cp-one-month-wrap.hidden').removeClass('hidden').addClass('current');
    });
}



// 初始化 "下一月" 按钮的点击事件
function initMonthSwitchRightClick(option){
    $(document).delegate('.month-switch-bar.month-right', 'click', function(){
        var
            _this = $(this),
            parent = _this.closest('.calendar-price-wrap'),

            // 当前显示的两个月份
            currentMonthArr = parent.find('.cp-one-month-wrap.current'),

            // 在当前显示的两个月前面隐藏的月份
            hiddenAhead = $(currentMonthArr[0]).prevAll('.cp-one-month-wrap.hidden'),

            // 在当前显示的两个月后面隐藏的月份
            hiddenBehind = $(currentMonthArr[currentMonthArr.length - 1]).nextAll('.cp-one-month-wrap.hidden');
        
        parent.find('.month-left').removeClass('hidden');
        $(currentMonthArr[0]).removeClass('current').addClass('hidden');
        
        // 如果在当前显示的两个月后面还有隐藏的月份，则显示其中一个，否则再动态生成一个月的数据（包括查价）
        if( hiddenBehind.length > 0 ){
            $(hiddenBehind[0]).removeClass('hidden').addClass('current');
        }else{
            var
                lastMonthStr = $(currentMonthArr[currentMonthArr.length - 1]).attr('data-month'),
                cYear        = +lastMonthStr.split('/')[0],
                cMonth       = +lastMonthStr.split('/')[1],
                newMonthStr  = cMonth == 12
                                ? (cYear + 1) + '-01'
                                : cYear + '-' + (cMonth + 1),
                newMonthHTML = cMonth == 12
                                ? buildMonths(cYear + 1, 1)
                                : buildMonths(cYear, cMonth + 1);

            parent.append(newMonthHTML);
	
	
	        // 预定参数设置面板
            var target = _this.closest('.layui-layer-content').find('.nd-order-confirm-btn');
	        var orderParam = {
		        startDate            : target.attr('data-startdate'),
		        endDate              : target.attr('data-enddate'),
		        page                 : target.attr('data-page')
	        };
	
	        setClassForPush(orderParam);

            // 查价
            queryPriceForCalendar(parent.closest('.layui-layer-content'), newMonthStr, option);
        }
    });
}


//给属于主推计划内的日期添加类名
function setClassForPush(orderParam) {
	var innerArr = $('.cp-td-inner');
	//判断是否属于主推日期
	for (var iA = 0; iA < innerArr.length; iA++) {
		if (innerArr.eq(iA).data('day') === undefined){
			continue;
		}else{
			var everyDay = innerArr.eq(iA).data('day').replace(/[/]/g,'-'),
				yesterday = addDays(new Date(), -1);
			
			if (new Date(everyDay) >= new Date(orderParam.startDate) && new Date(everyDay) <= new Date(orderParam.endDate) && new Date(everyDay) > new Date(yesterday)){
				//判断是今日主推页面还是接送机活动页
				if (orderParam.page && orderParam.page.split('|')[0] === 'planeShuttle'){
					innerArr.eq(iA).addClass('of-plane');
				}else{
					innerArr.eq(iA).addClass('of-push');
				}
			}
		}
	}
}


module.exports = function(option){

    // 初始化价格日历每一天的点击事件
    initCalendarDayClick(option);

    // 初始化 "上一月" 按钮的点击事件
    initMonthSwitchLeftClick(option);

    // 初始化 "下一月" 按钮的点击事件
    initMonthSwitchRightClick(option);
}