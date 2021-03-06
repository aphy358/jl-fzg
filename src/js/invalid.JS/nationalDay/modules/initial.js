// 在给定的日期基础上加上若干天，并格式化成 '2017-10-01' 的字符串返回
const addDays = require('../../../common/util').addDays;



// 初始化顶部导航按钮的点击事件
function initNavClickEvent(){
    $(".nd-top-item").on('click', function(){
        var _this  = $(this),
            target = _this.attr('data-target');

        _this.parent().find('.nd-top-item').removeClass('current');

        _this.addClass('current');

        document.querySelector('#' + target).scrollIntoView();
    });
}



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
            '/hotel/detail.do' +
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
            msg = _this.hasClass('book-type')
                    ? '预定条款请看详情'
                    : '取消条款请看详情';
        
        var tip = layer.tips(msg, _this, {
            time: 0, //0表示不自动关闭
            tips: [1, '#3595CC'],
        });

        _this.on('mouseleave', function(){
            layer.close(tip);
        });
    });
}



// 获取当前用户信息
function getCurrentUser(){
    $.get('/user/getCurrentUser.do', function(res){
        if( res.returnCode === 1 ){
            $("#div_User").attr('data-distrb', res.data.distributorAccount.distrbCode);
        }
        if( res.errcode === 'notLogin' ){
            alert('请先登录！', {closeBtn : 0}, function () {
                //跳转到首页
                location.href = '/hotel/index.do?';
            });
        }
    });
}



// 初始化屏幕滚动事件
function initSceenScroll(){
    // 设置两个全局变量
    $.scrollparam1 = $.scrollparam2 = 0;
    $(window).scroll(function() {
        var 
            internalTop = document.querySelector("#internalAnchor").getBoundingClientRect().top,
            gatTop = document.querySelector("#gatAnchor").getBoundingClientRect().top,
            externalTop = document.querySelector("#externalAnchor").getBoundingClientRect().top;

        $.scrollparam1 = document.body.getBoundingClientRect().top;

        if( $.scrollparam1 >= $.scrollparam2 ){ // 下滚
            if( 700 < gatTop ){
                $('.nd-top-item').removeClass('current');
                $(".nd-top-item[data-target='internalAnchor']").addClass('current');
            }

            if( 700 < externalTop && gatTop < 700 ){
                $('.nd-top-item').removeClass('current');
                $(".nd-top-item[data-target='gatAnchor']").addClass('current');
            }
        }else{  // 上滚
            if( gatTop < 120 && externalTop > 120 ){
                $('.nd-top-item').removeClass('current');
                $(".nd-top-item[data-target='gatAnchor']").addClass('current');
            }

            if( externalTop < 120 ){
                $('.nd-top-item').removeClass('current');
                $(".nd-top-item[data-target='externalAnchor']").addClass('current');
            }
        }

        setTimeout(function(){ $.scrollparam2 = $.scrollparam1; },0);
    });
}


// 促销类型标识，区分 国庆活动、万圣节活动、不忘初心活动等...
const statisticsFun = require('../../../common/statistics/statistics').doRecordByTCV;
function test(){
    window.onbeforeunload = function(){
        statisticsFun('ActivityClickBookHotelButton9', 'distrbCode', 'testing');
    }
}


module.exports = {
    run : function(){

        // 获取当前用户信息
        getCurrentUser();
        test()

        // 初始化屏幕滚动事件
        initSceenScroll();

        // 初始化顶部导航按钮的点击事件
        initNavClickEvent();

        // 初始化所有 "查看详情" 按钮的链接
        initHrefForDetailBtns();

        // 初始化 "预订条款"， "取消条款" 的 tips 事件
        initMouseOverEvent();
    }
};
