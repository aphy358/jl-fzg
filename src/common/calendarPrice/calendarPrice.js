// 该文件定义了订单参数编辑框（弹出层）的相关事件和逻辑


var
	// 成人小孩选择面板
	childrenAdultSelector = require('./templates/childrenAdultSelector.ejs')(),

	// 在给定的日期基础上加上若干天，并格式化成 '2017-10-01' 的字符串返回
	Util = require('../util'),
	addDays = Util.addDays,

	// 获取价格日历的 HTML
	monthStr = require('./modules/buildMonthHTML'),

	// 价格日历的相关事件
	calendarEvents = require('./modules/calendarEvents'),

	// 查价模块，然后填充日历
	queryPriceForCalendar = require('./modules/queryPriceForCalendar'),

	// 登录模块相关 js
	loginModel = require('../loginModel/login');



// 初始化点击 "预定" 按钮事件
function initOrderBtnClick(y, m, option) {
	// 引入模块样式
	require('./sass/calendarPrice.scss');
	
	//如果是今日主推页，则引入今日主推专属样式
	// if (y && m){
	// 	require('./skin/push-skin.scss');
	// }
	
	$(document).delegate('.nd-hotel-order-btn','click', function () {

		if (!$('#div_User').attr('data-distrb')) return loginModel.loginFirst();

		var
			_this = $(this),
			external  = _this.attr('data-citytype') === '3',
			checkin   = external ? addDays(new Date, 1, '/') : addDays(new Date, 0, '/'),
			checkout  = external ? addDays(new Date, 2, '/') : addDays(new Date, 1, '/'),
			hotelName = _this.closest('.nd-hotel-detail-wrap').find('.nd-hname1').text().replace(/^\s+|\s+$/g,'');//活动页中的td内没有包span，而今日主推中的td包了span

		if (_this.hasClass('disabled')) return;

		// 预定参数设置面板
		var orderParam = {
			startDate            : _this.attr('data-startdate'),
			endDate              : _this.attr('data-enddate'),
			checkin              : checkin,
			checkout             : checkout,
			hotelId              : _this.attr('data-hotelid'),
			supplierId           : _this.attr('data-supplierid'),
			roomId               : _this.attr('data-roomid'),
			rateType             : _this.attr('data-ratetype'),
			cityType             : _this.attr('data-citytype'),
			breakFastId          : _this.attr('data-breakFastId'),
			paymentType          : _this.attr('data-paymentType'),
			hotelName            : hotelName,
			monthStr             : monthStr(y, m),
			childrenAdultSelector: childrenAdultSelector,
			page                 : _this.attr('data-page')
		};
		
		var orderParamPanel = require('./templates/orderParamPanel.ejs')(orderParam);
		

		// 弹出预定参数设置面板，内含价格日历
		layer.open({
			type: 1,
			title: hotelName,
			area: ['850px', 'auto'],
			offset: '50px',
			content: orderParamPanel,
			success: function (layero, index) {

				// 如果是国内，则隐藏小孩的选择框
				if (_this.attr('data-citytype') === '0') {
					layero.find('.opp-children-str-wrap').hide();
				}

				// 如果是国外，则当天也置灰
				resetPriceRangeForExternal(layero);
				
				//给属于主推计划内的日期添加类名
				
				if(y && m) setClassForPush(orderParam);

				// 查价
				queryPriceForCalendar(layero, null, option);
			}
		});

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



// 根据实际选择的入离日期，设置正确的 hotelPriceStrs...
function setHotelPriceStrs(priceStrs_key, checkin, checkout) {

	var
		nightlyPriceList = window.currentHotelPriceStrs.nightlyPriceList,
		dayArr = getDayArr(checkin, checkout);

	nightlyPriceList = $.grep(nightlyPriceList, function (o) { return !!~$.inArray(o.date, dayArr) });
	
	var totalPrice = 0;
	var totalMoney = 0;
	
	for (var nP = 0; nP < nightlyPriceList.length; nP++) {
	  var npl = nightlyPriceList[nP];
	  totalPrice += npl.price;
	  totalMoney += npl.salePrice;
	}
	
	window.currentHotelPriceStrs.nightlyPriceList = nightlyPriceList;
	window.currentHotelPriceStrs.totalPrice = totalPrice;
	//averagePriceRMB等于用户选择的所有天数的总价除以天数，用于兼容需求959（二次查价通知规则）
	window.currentHotelPriceStrs.averagePriceRMB = totalMoney/dayArr.length;
	window.currentHotelPriceStrs.hotelPriceStrs = window.JSON.stringify(nightlyPriceList);

	sessionStorage.setItem(priceStrs_key, encodeURIComponent(window.JSON.stringify(window.currentHotelPriceStrs)));
}



// 例如： 传入 '2017/10/01'、'2017/10/03'，返回 ['2017/10/01', '2017/10/02']
function getDayArr(checkin, checkout) {
	var tmpArr = [],
		endTime = new Date(checkout + ' 00:00:00');

	do {
		tmpArr.push(addDays(checkin, 0));
		checkin = addDays(checkin, 1, '/');
	} while (new Date(checkin) < endTime);

	return tmpArr;
}



// 订单统计
function orderStatistics(_this) {
	var
		// 当前客户
		distrbCode = $("#div_User").attr("data-distrb"),

		// 预定酒店名称
		keyWords = _this.attr('data-hotelName'),

		statisticsFun = require('../statistics/statistics').doRecordByTCV,

		// 促销类型标识，区分 国庆活动、万圣节活动、不忘初心活动等...
		promotionType = $('#promotionType').val() || '';

	return statisticsFun('ActivityClickBookHotelButton' + promotionType, distrbCode, keyWords)
}



// 初始化成人小孩输入框点击事件
function initChildrenInputClick() {
	$(document).delegate("#opp-children-input", "click", function () {
		var parent = $(this).closest('section');
		parent.find('.calendar-price-wrap').hide();
		parent.find('.chidren-select-wrap').slideToggle('fast');
	});
}



// 初始化入离日期输入框的点击事件
function initDateInputClick() {
	$(document).delegate(".oop-date-input", "click", function () {
		var parent = $(this).closest('section');
		parent.find('.chidren-select-wrap').hide();
		parent.find('.calendar-price-wrap').slideToggle('fast');
	});
}



// 初始化预定参数设置面板中 "确定" 按钮的点击事件
function initOrderConfirmBtnClick() {
	$(document).delegate(".nd-order-confirm-btn", "click", function () {
		var
			_this = $(this),
			parent = _this.closest('.order-pp-wrap'),
			checkin = parent.find('.oop-date-input.checkin').attr('data-v'),
			checkout = parent.find('.oop-date-input.checkout').attr('data-v'),
			childrenSelector = parent.find('.adult-children-input'),
			close = _this.closest('.layui-layer').find('.layui-layer-close1'),
			priceStrs_key = "hotelPriceStrs_" + (+new Date);

		close.click();

		// 订单统计
		orderStatistics(_this);

		// 根据实际选择的入离日期，设置正确的 hotelPriceStrs...
		setHotelPriceStrs(priceStrs_key, checkin, checkout);

		var url = '/webpackBasedProject/webpacked/html/orderConfirm.html';

		var params =
			'?staticInfoId=' + _this.attr('data-hotelid') +
			'&roomId=' + _this.attr('data-roomid') +
			'&startDate=' + Util.formatOne(checkin) +
			'&endDate=' + Util.formatOne(checkout) +
			'&supplierId=' + _this.attr('data-supplierid') +
			'&hotelId=' + _this.attr('data-hotelid') +
			'&paymentType=' + _this.attr('data-paymentType') +
			'&roomNum=1' +
			'&breakFastId=' + _this.attr('data-breakfastid') +
			'&rateType=' + _this.attr('data-ratetype') +
			'&isQueryPrice=true' +                                  // 没用
			'&citytype=' + _this.attr('data-citytype') +    // 没用
			'&adultNum=' + childrenSelector.attr('data-adultnum') +
			'&childrenNum=' + childrenSelector.attr('data-childrennum') +
			'&childrenAgeStr=' + (childrenSelector.attr('data-childrenagestr') || '') +
			'&hotelPriceStrsKey=' + priceStrs_key +
			'&isTimeLimitConfirSupplier=' + window.currentHotelPriceStrs.isTimeLimitConfirSupplier;
		
		if (window.currentHotelPriceStrs.isHasMarketing && window.currentHotelPriceStrs.isHasMarketing === 1){
			//小礼包相关参数
			var checkinDate = new Date(checkin).getTime();
			var checkoutDate = new Date(addDays(checkout, -1)).getTime();
			var startTime = new Date(window.currentHotelPriceStrs.marketing.startTime.split(' ')[0]).getTime();
			var endTime = new Date(window.currentHotelPriceStrs.marketing.endTime.split(' ')[0]).getTime();
			
			if ((startTime <= checkinDate && checkinDate <= endTime) ||
				(startTime <= checkoutDate && checkoutDate <= endTime) ||
				(checkinDate <= startTime && endTime <= checkoutDate)){
				params += '&isHasMarketing=' + window.currentHotelPriceStrs.isHasMarketing +
						'&marketingPrice=' + window.currentHotelPriceStrs.marketing.marketingPrice +
						'&startTime=' + window.currentHotelPriceStrs.marketing.startTime +
						'&endTime=' + window.currentHotelPriceStrs.marketing.endTime;
			}else{
				params += '&isHasMarketing=0';
			}
			
		}else{
			params += '&isHasMarketing=0';
		}
		
		window.currentHotelPriceStrs = null;

		_this.attr('href', url + params);
	});
}



// 如果是国外，则今天也置灰
function resetPriceRangeForExternal(layero) {
	var
		external = layero.find('.nd-order-confirm-btn').attr('data-citytype') === '3',
		tdArr = layero.find('.cp-td-inner');

	// 如果是国外则将今天也设置为灰色    
	if (external) {
		$.map(tdArr, function (o) {
			if ($(o).attr('data-day') === addDays(new Date, 0, '/')) {
				$(o).addClass('disabled');
			}
		});
	}
}



module.exports = {

	run: function (y, m, option) {

		// 初始化点击 "预定" 按钮事件
		initOrderBtnClick(y, m, option);

		// 初始化入离日期输入框的点击事件
		initDateInputClick(option);

		// 初始化成人小孩输入框点击事件
		initChildrenInputClick(option);

		// 引入成人小孩的选择面板模块
		require('./modules/childrenSelectPanel').run(option);

		// 初始化预定参数设置面板中 "确定" 按钮的点击事件
		initOrderConfirmBtnClick(option);

		// 初始化价格日历的相关事件
		calendarEvents(option);
	}
}