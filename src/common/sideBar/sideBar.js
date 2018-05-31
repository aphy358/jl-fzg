
require('./sass/sideBar.scss');
const sideBarTpl = require('./templates/sideBar.ejs'),
	Util = require('../util.js');

// 初始化侧边栏的 DOM
function initSideBarHTML(){
 
	$('body').append( sideBarTpl({
		concernList: {
			dataList : []
		},
		pageNum : 0
	}) );
	
}

//点击“关注”弹出关注列表
function myConcern() {
    $('body').delegate('.side-item-gz', 'click', function (e) {
        if ($('.sidebar-gz-outer').css('right') === '-336px'){
	        $('.sidebar-gz-outer').animate({right : 0});
	        $('.sidebar-gz-mask').show();
	        initConcernShow(1);
        }else{
	        $('.sidebar-gz-outer').animate({right : '-336px'});
	        $('.sidebar-gz-mask').hide();
        }
    })
	    .delegate('.sidebar-gz-mask', 'click', function (e) {
		$('.sidebar-gz-outer').animate({right : '-336px'});
		$('.sidebar-gz-mask').hide();
	})
	    .delegate('.sidebar-gz-outer', 'click', function (e) {
		return false;
	})
	    .delegate('.sidebar-hotel-link', 'click', function () {
		    $(this).attr('href') ? window.open($(this).attr('href')) : alert('该酒店已删除');
    }).delegate('.side-bar-item[data-rank]', 'mouseenter', function () {
	    //用户移入“微信关注”时，显示二维码
	    // let aimDom = $('.side-content>li').eq($(this).data('rank'));
	    // aimDom.hasClass('sidebar-hidden') ? aimDom.removeClass('sidebar-hidden') : aimDom.addClass('sidebar-hidden');
        $('.side-content>li').eq($(this).data('rank')).removeClass('sidebar-hidden');
    }).delegate('.side-bar-item[data-rank]', 'mouseleave', function () {
        $('.side-content>li').eq($(this).data('rank')).addClass('sidebar-hidden')
    });
}


// 初始化关注面板显示
function initConcernShow(pageNum){
	let params = {
		categoryId: 0,
		pageNum: pageNum,
		pageSize: 8
	};
	//查询用户的关注列表
	$.post('/fzgCustomerFavorite/getMyFavoriteList.do', params, function (data) {
		if (data.returnCode === 1){
			let concernStr = sideBarTpl({
				concernList : data,
				pageNum : pageNum
			});
			
			$(concernStr).replaceAll('.side-bar-wrap');
			$('.sidebar-gz-outer').css({'right' : 0});
			$('.sidebar-gz-mask').show();
		}
		
		//关注列表接口中暂无价格的酒店需要实查
		getReallyPrice(data);
	}, 'noAnimation');
}


// 初始化关注面板的顶部按钮点击事件，点击隐藏面板
function initConcernHide(){
    $('body').delegate('.sidebar-gz-icon-hide', 'click', function(){
        $('.sidebar-gz-outer').animate({right: '-336px'}, function(){
            // $(document).one('mousemove', function(){
            //     $('.sidebar-gz-outer').css({
            //         'right' : 0,
            //         'display' : 'none'
            //     });
            // });
        });
	
	    $('.sidebar-gz-mask').hide();
    })

}

//点击“加载更多”
function getMoreConcern(){
	$('body').delegate('.sidebar-get-more', 'click', function () {
		//获取当前页码
		let pageNum = +$('.side-item-gz').data('page') + 1;
		
		let params = {
			categoryId: 0,
			pageNum: pageNum,
			pageSize: 8
		};
		//查询用户的关注列表
		$.post('/fzgCustomerFavorite/getMyFavoriteList.do', params, function (data) {
			if (data.returnCode === 1){
				let concernStr = '';
				for (let i = 0; i < data.dataList.length; i++) {
				  let item = data.dataList[i];
				  
				  if (item.hasOwnProperty('infoName') && item.infoName !== '' && item.infoName !== undefined && item.infoName !== null){
				  
				  concernStr += '<li class="sidebar-gz-item" data-hotelid="' + item.infoId + '">' +
					                '<a href="' + item.detailLink + '" class="sidebar-hotel-link">'+
										'<div class="sidebar-gz-content-wrap">' +
											'<div class="sidebar-gz-img">' +
												'<img src="' + item.picSrc + '" alt="">' +
											'</div>' +
											'<div class="sidebar-gz-info">' +
												'<p class="sidebar-gz-hotel-name">' + item.infoName + '</p>' +
												'<p class="sidebar-gz-hotel-price">' +
					                                (item.minPrice ? '￥' + item.minPrice + '起' : '加载中<img src="https://qnb.oss-cn-shenzhen.aliyuncs.com/real_1520825964429.gif" class="price-loading" alt="">') + '</p>' +
												'<i class="sidebar-gz-icon icon-gz-on"></i>' +
											'</div>' +
										'</div>' +
					                '</a>'+
								'</li>';
				  }
				  
				}
				
				$(concernStr).insertBefore('.sidebar-get-more');
				if (data.pageTotal <= pageNum){
					$('.sidebar-get-more').remove();
					$('.sidebar-gz-list').append('<li class="sidebar-no-more">没有更多了</li>');
				}

				//关注列表接口中暂无价格的酒店需要实查
				getReallyPrice(data);
				
			}
		}, 'noAnimation');
	})
}


//关注列表接口中暂无价格的酒店需要实查
function getReallyPrice(data) {
	//确认起价是否为0
	let listArr = data.dataList;
	if (listArr !== undefined){
        for (let i = 0; i < listArr.length; i++) {
            let o = listArr[i];
            if (!o.hasOwnProperty('minPrice') || + o.minPrice === 0){
                if (o.hasOwnProperty('detailLink')){
                    let param = {
                        hotelId         : o.infoId,
                        checkInDate     : Util.addDays(new Date(), 0),
                        checkOutDate    : Util.addDays(new Date(), 1),
                        roomNum         : 1,
                        adultNum        : 2,
                        childrenNum     : 0,
                        childrenAgesStr : ''
                    };
                    
                    $.post('/hotel/getHotelPriceList.do', param, function (data) {
                        if (data.returnCode === 1){
                            if (data.data.hasOwnProperty('priceMin') && data.data.priceMin !== 0 ){
                                $('.sidebar-gz-list>.sidebar-gz-item[data-hotelid="' + param.hotelId + '"]').find('.sidebar-gz-hotel-price').html('￥' + data.data.priceMin + '起');
                            }else{
                                $('.sidebar-gz-list>.sidebar-gz-item[data-hotelid="' + param.hotelId + '"]').find('.sidebar-gz-hotel-price').html('暂无价格');
                            }
                        }else{
                            $('.sidebar-gz-list>.sidebar-gz-item[data-hotelid="' + param.hotelId + '"]').find('.sidebar-gz-hotel-price').html('暂无价格');
                        }
                    }, 'noAnimation');
                }
            }
        }
	}
}


// 初始化向上按钮的点击事件
function initUpBtnClick(){
    $('body').delegate('.to-page-top', 'click', function(){
        $(document).scrollTop(0);
    })
}

module.exports = {
    run : function(){

        // 初始化侧边栏的 DOM
        initSideBarHTML();
        
        //点击“关注”弹出关注列表
        myConcern();
        
		//点击“加载更多”
	    getMoreConcern();

        // 初始化关注面板显示
        // initConcernShow();

        // 初始化关注面板的顶部按钮点击事件，点击隐藏面板
        initConcernHide();

        // 初始化向上按钮的点击事件
        initUpBtnClick();

        //收藏与取消关注功能
	    require('../myConcern/myConcern.js');
	    
    }
};