
var 

    Util = require('../../../common/util.js'),

    // 引入模板文件
    bannerT = require('../templates/banner.T.ejs'),

    _timer,

    // 加载 banner 区的所有图片
    loadBannerImg = function (){
        $.post('/user/getAdInfoData.do', {channel:1, block:0, pageSize: 100}, function(res){
            if( res.returnCode === 1 ){
                if( res.dataList && res.dataList.length ){
                    var bannerStr = '';

                    res.dataList.forEach((data, i) => {
                        if(data.adImg)  data.adImg = data.adImg.replace(/^http:\/\/image.jladmin.cn/g, 'https://qnb.oss-cn-shenzhen.aliyuncs.com')

                        bannerStr += `
                            <div class="swiper-slide ${i === 0 ? 'hidden' : 'hidden'}">
                                <a href="${data.adLink}" target="_blank" class="" data-hotelid="${data.hotelId}">
                                    <img alt="" src="${data.adImg}">
                                </a>
                            </div>`;
                    });
                    
                    $('.swiper-wrapper').append(bannerStr);

                    // 初始化轮播事件
                    initSwiper();
                }
            }else if( res.returnCode === -400001 ){
                // Util.login();
            }
        }, 'noAnimation');

        // 通过ajax请求获取 banner 区的图片
        $("#bannerWrap").html( bannerT() );
    },

    // 初始化
    initSwiper = function (){
        switchLetMeFly();
        
        // 开启定时器，进行banner图片的切换显示
        if( $(".swiper-slide").length > 1 ) slideTimeOut();
    },

    // 切换 "放飞自我" 字样的显示与隐藏
    switchLetMeFly = function(){
        // $(".swiper-slide.current img").attr('src') === 'https://qnb.oss-cn-shenzhen.aliyuncs.com/real_1510898195726.jpg'
        //     ? $(".let-me-fly").removeClass('visible-hidden')
        //     : $(".let-me-fly").addClass('visible-hidden');
    },

    switchLeft = function(_this){
        var 
            _that = _this || $(".swiper-bar.swiper-left"),
            curBanner = $(".swiper-slide.current"),
            prevBanner = curBanner.prev('.swiper-slide'),
            prevAllLen = curBanner.prevAll('.swiper-slide').length;
    
        if( _that.hasClass('disabled') )    return;

        $(".swiper-bar.swiper-right").removeClass('disabled');
        if( prevAllLen < 2 )    _that.addClass('disabled');

        curBanner.removeClass('current').addClass('hidden');
        prevBanner.removeClass('hidden').addClass('current');

        switchLetMeFly();
    },

    // 点击向左切换一张 banner
    initSwitchLeft = function (){
        $(".swiper-bar.swiper-left").on('click', function(){
            switchLeft( $(this) );
        });
    },

    switchRight = function(_this){
        var
            _that = _this || $(".swiper-bar.swiper-right"),
            curBanner = $(".swiper-slide.current"),
            nextBanner = curBanner.next('.swiper-slide'),
            nextAllLen = curBanner.nextAll('.swiper-slide').length;

        if( _that.hasClass('disabled') )    return;

        $(".swiper-bar.swiper-left").removeClass('disabled');
        if( nextAllLen < 2 )    _that.addClass('disabled');

        curBanner.removeClass('current').addClass('hidden');
        nextBanner.removeClass('hidden').addClass('current');

        switchLetMeFly();
    },

    // 点击向右切换一张 banner
    initSwitchRight = function (){
        $(".swiper-bar.swiper-right").on('click', function(){
            switchRight( $(this) );
        });
    },

    // 重新设置 banner 为初始状态
    reSetBanner = function (){
        var banners = $(".swiper-slide");

        $(".swiper-slide").removeClass('current hidden');
        $(banners[0]).addClass('current');

        $('.swiper-bar.swiper-left').addClass('disabled');
        banners.length > 1
            ? $('.swiper-bar.swiper-right').removeClass('disabled')
            : $('.swiper-bar.swiper-right').addClass('disabled');
    },

    // 开启定时器，进行banner图片的切换显示
    slideTimeOut = function (){
        _timer = setTimeout(function(){

            var curBanner = $(".swiper-slide.current"),
                nextBanner = curBanner.next('.swiper-slide');

            nextBanner.length > 0
                ? switchRight()
                : reSetBanner();
                
            switchLetMeFly();

            slideTimeOut();
        }, 5000);
    },

    initMouseEnter = function(){
        $(".swiper-bar").on('mouseenter', function(){
        	clearTimeout(_timer);
        })
    },

    initMouseOut = function(){
		$(".swiper-bar").on('mouseleave', function(){
        	slideTimeOut();
        })
    };
    



// 首页 banner 区域相关 js
module.exports = {
    run: function(){

        // 加载 banner 区的所有图片
        loadBannerImg();

        // return;     //*** */

        // 点击向左
        initSwitchLeft();

        // 点击向右
        initSwitchRight();

        // 鼠标移入左右切换按钮事件
        initMouseEnter();

        // 鼠标移出左右切换按钮事件
        initMouseOut();

        //*** 年前临时上线 */
        $(document).delegate('.tmp-banner', 'click', function(){
            var checkin = Util.addDays(new Date(), 0),
                checkout = Util.addDays(new Date(), 1);

            $(this).attr('href', '/hotel/toHotelDetail.do?ch=0&hotelId=' + $(this).data('hotelid') + '&checkin=' + checkin + '&checkout=' + checkout);
        });
    }
}