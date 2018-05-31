var
	singleProduct = require('../templates/singleProduct.ejs'),
	
	paging = require('../templates/paging.ejs'),

	aimCityProducts = {},

	pagenation = require('../../../common/pagenation/pagenation');


//点击城市条件筛选
function selectByCity() {
	$('.condition-select').delegate('.city-list li','click',function () {
		var aimCity = $(this).html();
		$(this).addClass('city-selected').siblings().removeClass('city-selected');
		
		//将选择的城市的相关数据筛选出来
		var cityData = $.todayPushMsg.products;
		
		aimCityProducts.products=[];
		
		for (var cD = 0; cD < cityData.length; cD++) {
		  var singleCity = cityData[cD];
		  
		  if (singleCity.cityName === aimCity){
		  	aimCityProducts.products.push(singleCity);
		  }
		}
		
		
		//重置分页器和产品列表
		setPagenation(1, aimCityProducts);
	});
	
	//点击不限
	$('.condition-select').delegate('.unlimit','click',function () {
		$('.city-list li').removeClass('city-selected');
		//重置分页器和产品列表
		setPagenation(1, $.todayPushMsg);
	})
}

//鼠标移入表格时，出现十字架,移入溢出的内容时，出现弹框
function showCross() {
	$(document).delegate('.product-tbody td','mouseenter',function () {
		if ($(this).hasClass('tb-option')){
			return;
		}
		
		var aimClass = $(this).data('class');
		
		$('.product-tbody td').removeClass('tb-mouse-in').removeClass('tb-compare');
		$('.product-tbody tr').removeClass('tb-mouse-in').removeClass('tb-compare');
		$('.product-tbody td[data-class="' + aimClass + '"]').addClass('tb-compare');
		$(this).closest('tr').addClass('tb-compare');
		$(this).addClass('tb-mouse-in');
	});
	
	$(document).delegate('.product-tbody td','mouseleave',function () {
		$('.product-tbody td').removeClass('tb-mouse-in').removeClass('tb-compare');
		$('.product-tbody tr').removeClass('tb-mouse-in').removeClass('tb-compare');
	});
	
	
	let remarkTips;
	$(document).delegate('.product-tbody .tb-overflow','mouseenter',function () {
		remarkTips = layer.tips(decodeURIComponent($(this).data('title')), $(this), {
			time: 0,
			tips: [1, '#fffff3']
		});
	});
	
	
	$(document).delegate('.product-tbody .tb-overflow','mouseleave',function () {
		layer.close(remarkTips);
	});
	
	
	//鼠标移入小礼包图标
	let giftTips;
	$(document).delegate('.icon-gift','mouseenter',function () {
		giftTips = layer.tips($(this).data('title'), $(this), {
			time: 0,
			tips: [1, '#fffff3']
		});
	});
	
	
	$(document).delegate('.icon-gift','mouseleave',function () {
		layer.close(giftTips);
	});
}


//获取产品数据
function getPrductData() {
	if($.todayPushMsg){
		// 初始化分页
		setPagenation(1, $.todayPushMsg);
	}else{
		setTimeout(function(){
			getPrductData();
		}, 100);
	}
}


// 设置分页
function setPagenation(current, todayPushMsg){
	// 因为全局变量 $.todayPushMsg 是异步获取的，所以这里要判断，如果数据还未获取，则需要轮询
	var pages = Math.ceil( todayPushMsg.products.length / 20 );
	var toBeRenderData = todayPushMsg.products.slice((current - 1) * 20, current * 20);
	var productsStr = singleProduct({
		products: toBeRenderData,
		currentDay: $.todayPushMsg.currentDay,
		nextDay: $.todayPushMsg.nextDay
	});
	$('.product-tbody').html(productsStr);
	
	// 数据分页
	pagenation({
		elem: '.paging-box', 			// 组件容器
		pages: pages, 					// 总页数
		current: current,				// 当前显示的第几页
		jump: function(cur){			// 触发分页后的回调
			//先确定所有同行价已请求完毕
			setPagenation(cur, todayPushMsg);
		}
	});
	
	getPrice();
	
}


function getPrice() {
	if ($('.product-tbody').children().length > 0){
		
		$('.tb-peer').click(function () {
			if ($(this).data('hasrequest') !== true){
				//查询今日同行价
				var productParams = {
					hotelId    : $(this).data('hotelid'),
					supplierId : $(this).data('supplierid'),
					roomId     : $(this).data('roomid'),
					rateType   : $(this).data('ratetype'),
					checkin    : $(this).data('checkin'),
					checkout   : $(this).data('checkout'),
					roomNum    : 1
				};
				
				var pageNum = +$('.page-fzgpage-curr').children('em').eq(1).text();
				var rank = +$(this).data("index");
				var index = rank + ((pageNum - 1) * 20);
				
				$.post('/hotel/getPriceListCache.do',productParams,function (priceData) {
					layer.closeAll();
					priceData = JSON.parse(priceData);
					if (priceData.success === true && priceData.content.result === 'success'){
						if (priceData.content.roomTypeBases === undefined || priceData.content.roomTypeBases.length === 0){
							$.todayPushMsg.products[index].showSalePrice = '暂无价格';
						}else{
							$.todayPushMsg.products[index].showSalePrice = '￥' + priceData.content.roomTypeBases[0].roomTypePrices[0].showSalePrice || '暂无价格';
							
							if (priceData.content.roomTypeBases[0].roomTypePrices[0].isHasMarketing === 1){
								$('.product-tbody tr').eq(rank).find('.tb-breakfast>span').after('<i class="iconfont icon-gift" data-title="' + priceData.content.roomTypeBases[0].roomTypePrices[0].marketingInfo + '"></i>');
							}
						}
						
						
						$('.product-tbody tr').eq(rank).find('.tb-peer>span').text($.todayPushMsg.products[index].showSalePrice);
						
					}else{
						alert(priceData.errinfo,{closeBtn : 0},function () {
							//刷新页面
							location.reload();
						})
					}
				});
			}
		});
		
		
		$('.tb-peer').trigger('click').unbind('click');
	}else{
		setTimeout(function () {
			getPrice();
		},100);
	}
	
}


module.exports = {
	run : function () {
		
		//初始化产品列表和分页器
		getPrductData();

		selectByCity();
		
		showCross();
	}
};