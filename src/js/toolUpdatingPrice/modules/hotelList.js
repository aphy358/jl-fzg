
const Util = require('../../../common/util');



// 初始判断该酒店是不是可以刷新价格
function boolRefresh(o){
    if( o.refreshTime ){
        if( +new Date - +new Date( o.refreshTime.replace(/-/g, '/') ) < 15 * 60 * 1000 ) return false;
    }

    return true;
}

// 格式化时间，传入分钟或秒钟，如果小于10，则前面补 '0'
function formatTime(time){
    return time < 10 ? ('0' + time) : time;
}

// 初始化酒店刷新状态的切换，每次刷新完之后要过15分钟才可以再次刷新
function initRefreshStatusSwitch() {
    setInterval(function(){
        var statusArr = $('.tpchl-status');

        for (let i = 0; i < statusArr.length; i++) {
            var o = $(statusArr[i]);
            var parent = o.closest('li');
            var refreshetime = o.attr('data-refreshetime');

            if( refreshetime && (+new Date - +new Date( refreshetime.replace(/-/g, '/') ) < 15 * 60 * 1000) ){
                o.removeClass('enable').addClass('disable');
                parent.attr('data-bool', 'disable');
            }else{
                o.removeClass('disable').addClass('enable');
                parent.attr('data-bool', 'enable');
            }

            if(parent.hasClass('active')){
                var dBool = parent.attr('data-bool');

                if(dBool === 'disable'){
                    var timeLeft = +new Date - +new Date( refreshetime.replace(/-/g, '/') );
                    timeLeft = 15 * 60 - Math.round( timeLeft / 1000 );
                    var min = formatTime( Math.floor( timeLeft / 60 ) );
                    var sec = formatTime( timeLeft % 60 );
                    var timeLeftStr = min + ':' + sec;

                    $('.tp-opt-btn').html(timeLeftStr)
                }else{
                    $('.tp-opt-btn').html('刷新');
                }

                if( !$('.tp-opt-btn').hasClass(dBool) ){
                    $('.tp-opt-btn').removeClass('enable disable').addClass(dBool);
                }
            }
        }
    }, 300);
}


// 初始化左边的酒店列表数据
function initHotelList() {

    if( window.isAdmin == null ){
        return setTimeout(function () {
            initHotelList();
        }, 100);
    }

    if( window.isAdmin === 0 || window.isAdmin === 1 ){
        $.post('/fzgGroupHelperHotelPrice/searchFzgGroupHelperHotelRefreshTime.do', null, function (res) {
            if (res.returnCode === 1) {

                if (res.dataList && res.dataList.length) {

                    var hotelListStr = '';

                    for (let i = 0; i < res.dataList.length; i++) {

                        var o = res.dataList[i];
                        var isAbleToRefresh = boolRefresh(o) ? 'enable' : 'disable';

                        hotelListStr += 
                            '<li class="tpchl-row" data-hid="' + o.hotelInfoDto.infoId + '" data-bool="' + isAbleToRefresh + '">' +
                                '<span title="' + o.hotelInfoDto.infoName + '">' + (i + 1) + '、' + o.hotelInfoDto.infoName + '</span>' +
                                '<i class="tpchl-status ' + isAbleToRefresh + '" data-refresheTime="' + (o.refreshTime || '') + '"></i>' +
                            '</li>';
                    }

                    $('.tpchl-wrap').html(hotelListStr);

                    // 初始化酒店刷新状态的切换，每次刷新完之后要过15分钟才可以再次刷新
                    initRefreshStatusSwitch();

                    // 触发第一行数据的点击
                    $( $('.tpchl-row')[0] ).click();
                }else{
                    var noHotelListStr =
                        '<li class="tpchl-row">' +
                            '<p style="color:red;">暂无相关酒店！</p>' +        
                        '</li>';
                    
                    $('.tpchl-wrap').html(noHotelListStr);
                }
            } else if (res.returnCode === -400001) {
                Util.login();
            }
        })
    }else{
        alert('您无权限访问该页面！', function(){
            Util.CloseWebPage();
        });
    }
}


module.exports = {
    run: function () {
        // 初始化左边的酒店列表
        initHotelList();
    }
}