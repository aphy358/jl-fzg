// 日历中的相关事件


// 引入 dragable，使日历可拖拽
require('../../dragable');


var
    Util = require('../../util'),
    // 在给定的日期基础上加上若干天，并格式化成 '2017-10-01' 的字符串返回
    addDays = Util.addDays,

    // 获取日历的 HTML
    monthStr = require('./buildMonthHTML')(),

    // 日历面板模板
    calendarPanel = require('../templates/calendarPanel.ejs'),

    buildMonths = require('./buildMonthHTML'),

    _default = {
        setPos : function(){
            var
                target = this.target,
                targetRect = target.getBoundingClientRect(),
                left = targetRect.left + (this.left || 0) + $(document).scrollLeft(),
                top = targetRect.bottom + 2 + (this.top || 0) + $(document).scrollTop(),
                widthBorder = document.body.scrollWidth - 745;
    
            this.element.css('left', left > widthBorder ? widthBorder : left)
                        .css('top', top)
                        .css('display', 'none');
        },

        show : function(){
            this.setPos();
            this.element.show();
            this.element.removeClass('fixed');
        },

        hide : function(){
            // 如果只选了入住日期而没选离店日期
            if( this.target.value.length == 13 ){
                var checkin = this.target.value.split(' - ')[0];
                var checkout = addDays(checkin, 1, '/');
                this.target.value += checkout;
                $(this.target).trigger('datePicked');
            }
            this.element.hide('fast');
        },

        // 初始化目标元素的入离日期
        initCheckinCheckout : function(){
            if( !this.target.checkin ){
                this.cityType == 3
                    ? ( this.target.checkin = addDays(new Date(), 1, '/'), this.target.checkout = addDays(new Date(), 2, '/') )
                    : ( this.target.checkin = addDays(new Date(), 0, '/'), this.target.checkout = addDays(new Date(), 1, '/') );
            }
            
            var tds = this.element.find('.calendar-td-inner');
            
            for (var i = 0; i < tds.length; i++) {
            	var
	            	o = $(tds[i]),
	            	dateStr = Util.formatOne(o.attr('data-day'));
                
                if( !o.hasClass('day-grayed') ){
                    if(dateStr === this.target.checkin){
                        o.addClass('checkin')
                    }else if(dateStr === this.target.checkout){
                        o.addClass('checkout')
                    }
                }
            }
            
            this.setCheckBetween(this.element, tds)
        },

        // 设置目标元素的显示
        setTargetText : function(v1, v2){
            this.target.value = (v1 || '') + ' - ' + (v2 || '');
            this.target.checkin = v1;
            this.target.checkout = v2 ? v2 : null;
        },

        // 日期临时置灰（当选择了入住日期，则超过入住日期15天之后的日期全部置灰）
        setTmpGray : function(){

            var checkin = this.target.checkin;
            var checkout = this.target.checkout;

            if( checkin && !checkout ){

                var dayArr = this.element.find('.calendar-td-inner');
                var lastValidDay = new Date( addDays(checkin, this.validDays, '/') + ' 23:59:59' );

                // 先将之前设置的状态清空
                dayArr.removeClass('tmp-grayed');

                for(var i = 0; i < dayArr.length; i++){
                    var _date = new Date( $(dayArr[i]).attr('data-day') );
                    if( lastValidDay < _date ){
                        $(dayArr[i]).addClass('tmp-grayed');
                    }
                }
            }
        },

        // 点击某一天
        dayClick : function( _this ){

            if( _this.hasClass('day-grayed') || _this.hasClass('tmp-grayed') )    return;
            
            var
                cal = this.element,
                thisDayStr   = _this.attr('data-day'),
                dayArr       = cal.find('.calendar-td-inner'),
                checkin      = $( $.grep( dayArr, function(o){ return $(o).hasClass('checkin') } ) ),
                checkout     = $( $.grep( dayArr, function(o){ return $(o).hasClass('checkout') } ) ),
                checkBetween = $( $.grep( dayArr, function(o){ return $(o).hasClass('between-check') } ) );
    
            // 如果还没设置入住日期，则...
            if( !checkin.length ){
                _this.addClass('checkin');
                this.setTargetText(thisDayStr);
                this.setTmpGray();
            }
            // 如果设置了入住日期而没设置离店日期，则...
            else if( checkin.length && !checkout.length ){
    
                if( _this.hasClass('checkin') )    return;
    
                if( new Date( thisDayStr + ' 23:59:59' ) < new Date( checkin.attr('data-day') ) ){
                    checkin.removeClass('checkin');
                    _this.addClass('checkin');
                    this.setTargetText(thisDayStr);
                    this.setTmpGray();
                }else{
                    _this.addClass('checkout');
                    this.setCheckBetween( cal, dayArr );
                    dayArr.removeClass('tmp-grayed');
                    this.setTargetText(checkin.attr('data-day'), thisDayStr);
                    this.hide();
                    $(this.target).trigger('datePicked');
                }
            }
            // 如果入住日期和离店日期都设置了
            else{
                checkin.removeClass('checkin');
                checkout.removeClass('checkout');
                checkBetween.removeClass('between-check');
                _this.addClass('checkin');
                this.setTargetText(thisDayStr);
                this.setTmpGray();
            }
        },

        dayPicked : function(){
            // TO DO...
        },

        // 设置入住日期和离店日期之间的日期背景颜色
        setCheckBetween( target, dayArr ){
    
            var 
                checkin  = +new Date( target.find('.checkin').attr('data-day') + ' 00:00:00' ),
                checkout = +new Date( target.find('.checkout').attr('data-day') + ' 23:59:59' );
        
            for(var i = 0; i < dayArr.length; i++){
                var o = dayArr[i],
                    oTime = +new Date( $(o).attr('data-day') );
        
                if( checkin <= oTime && oTime <= checkout && !$(o).hasClass('day-grayed') ){
                    $(o).addClass('between-check');
                }
            }
        },

        // 点击 "上一月"
        switchLeft : function(){
            var
                cal = this.element,

                // 当前显示的两个月份
                currentMonthArr = cal.find('.calendar-one-month-wrap.current'),

                // 在当前显示的两个月前面隐藏的月份
                hiddenAhead = $(currentMonthArr[0]).prevAll('.calendar-one-month-wrap.hidden');
        
            if( hiddenAhead.length < 2 ){
                cal.find('.month-left').addClass('hidden');
            }

            $(currentMonthArr[1]).removeClass('current').addClass('hidden');
            $(currentMonthArr[0]).prev('.calendar-one-month-wrap.hidden').removeClass('hidden').addClass('current');
        },

        // 点击 "下一月"
        switchRight : function(){
            var
                cal = this.element,

                // 当前显示的两个月份
                currentMonthArr = cal.find('.calendar-one-month-wrap.current'),

                // 在当前显示的两个月前面隐藏的月份
                hiddenAhead = $(currentMonthArr[0]).prevAll('.calendar-one-month-wrap.hidden'),

                // 在当前显示的两个月后面隐藏的月份
                hiddenBehind = $(currentMonthArr[currentMonthArr.length - 1]).nextAll('.calendar-one-month-wrap.hidden');
            
            cal.find('.month-left').removeClass('hidden');
            $(currentMonthArr[0]).removeClass('current').addClass('hidden');
            
            // 如果在当前显示的两个月后面还有隐藏的月份，则显示其中一个，否则再动态生成一个月的数据（包括查价）
            if( hiddenBehind.length ){
                $(hiddenBehind[0]).removeClass('hidden').addClass('current');
            }else{
                var
                    lastMonthStr = $(currentMonthArr[1]).attr('data-month'),
                    cYear        = +lastMonthStr.split('/')[0],
                    cMonth       = +lastMonthStr.split('/')[1],
                    newMonthDom = cMonth == 12
                                    ? $(buildMonths(cYear + 1, 1))
                                    : $(buildMonths(cYear, cMonth + 1));

                cal.append(newMonthDom);

                this.setTmpGray();
            }
        },
    };



// 初始化日历事件
function initEvents(myCalendar){
    var cal = myCalendar.element;

    $(document).on('mousedown', function(e){
        var
        event = window.event || e,
        target = event.target || event.srcElement,

        // 兼容IE，当点击到滚动条时，chrome下的target显示为document，而IE8下显示是根节点<html>标签，而IE9下是对象{...}
        isScrollBar = target.tagName === 'HTML' || !target.tagName;

        // 当点击的位置既不是该组件，也不是该组件对应的目标元素，也不是滚动条时，则隐藏该组件
        if( !$(target).closest('.calendar-wrap').length && target !== myCalendar.target && !isScrollBar ){
            myCalendar.hide();
        }
    })
    
    cal.delegate('.calendar-td-inner', 'click', function(){
		myCalendar.dayClick( $(this) );
    })
    
    cal.find('.month-switch-bar.month-left').on('click', function(){
        myCalendar.switchLeft();
    })

    cal.find('.month-switch-bar.month-right').on('click', function(){
        myCalendar.switchRight();
    })
   
}


// 新建一个日历对象
function createComponent_c(options){
    var element = $(calendarPanel({
            monthStr : monthStr,
        }));

    var myCalendar = $.extend({}, _default, options);
    myCalendar.element = element;
    myCalendar.setPos();

    // 将今天之前的日期设置为灰色，国外是将明天之前的日期设置为灰色
    setDayGrayedBeforeToday(myCalendar);

    $("body").append(element);

    return myCalendar;
}


// 将今天之前的日期设置为灰色，国外是将明天之前的日期设置为灰色
function setDayGrayedBeforeToday(myCalendar){

    // 如果是凌晨6点前，则国内可以订昨天的房，国外的可以订今天的房
    var isBeforeSix = new Date().getHours() < 6;

    // myCalendar.cityType == 3 说明是国外城市，则今天不可选
    var
        beginDate = new Date( ( myCalendar.cityType == 3 ? addDays(new Date, (isBeforeSix ? 0 : 1), '/') : addDays(new Date, (isBeforeSix ? -1 : 0), '/') ) + ' 00:00:00' ),
        calendarTds = myCalendar.element.find('.calendar-td-inner');

    for(var i = 0; i < calendarTds.length; i++){
        var _date = new Date( $(calendarTds[i]).attr('data-day') );
        if( beginDate > _date ){
            $(calendarTds[i]).addClass('day-grayed');
        }
    }
}


module.exports = function(options){

    // 新建一个日历对象
    var myCalendar = createComponent_c(options);

    // 初始化日历相关事件
    initEvents(myCalendar);

    // 初始化目标元素的入离日期
    myCalendar.initCheckinCheckout();
    myCalendar.show();

    // 初始化日历的拖拽事件
    setTimeout(function(){
        myCalendar.element.dragable('.calendar-head-bg .calendar-month-head');
    }, 10)

    return myCalendar;
}
