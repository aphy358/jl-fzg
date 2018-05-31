//用于获取页面主要信息的数据的模块

//引入工具类
const queryString = require('../../../common/util.js').queryString;

//用于页面一开始加载的时候进行验价（包括酒店是否下线以及供应商价格是否已修改）
//（与用户填写完订单并确认之后调的接口是同一个，但是此次验价的参数是从地址栏中取出）
function isHotelOnline(callback) {
	var hotelPriceStrsKey = queryString("hotelPriceStrsKey");
	var hotelPriceStrs    = sessionStorage.getItem(hotelPriceStrsKey);
	hotelPriceStrs        = decodeURIComponent(hotelPriceStrs);
	
	var checkParams = {
		staticInfoId   : queryString("staticInfoId"),
		adultNum       : queryString("adultNum"),
		hotelId        : queryString("staticInfoId"),
		supplierId     : queryString("supplierId"),
		roomId         : queryString("roomId"),
		startDate      : queryString("startDate"),
		endDate        : queryString("endDate"),
		paymentType    : queryString("paymentType"),
		roomNum        : queryString("roomNum"),
		childrenNum    : queryString("childrenNum"),
		childrenAgeStr : queryString("childrenAgeStr"),
		hotelPriceStrs : hotelPriceStrs,
		isHasMarketing : queryString('isHasMarketing') || 0
	};
	
	var breakFastId    = queryString("breakFastId"),
		rateType       = queryString("rateType"),
		isHasMarketing = queryString("isHasMarketing") || 0;
	
	if(isHasMarketing == 1){
		checkParams['marketing.marketingPrice'] = queryString('marketingPrice') || 0;
		checkParams['marketing.startTime']      = queryString('startTime').replace(/\s+/g, ' ');
		checkParams['marketing.endTime']        = queryString('endTime').replace(/\s+/g, ' ');
	}
	
	if (breakFastId) {
		checkParams['breakFastId'] = breakFastId;
	}
	
	if (rateType) {
		checkParams['rateType'] = rateType;
	}
	
	$.post('/order/validate.do', checkParams, function (data) {
		callback(data);
	});
}

// 获取订单页面的初始化信息
function getInitData(callback, roomNum) {
	//请求页面中用于显示信息的数据
	var hotelPriceStrsKey = queryString("hotelPriceStrsKey");
	var hotelPriceStrs    = sessionStorage.getItem(hotelPriceStrsKey);
	hotelPriceStrs        = decodeURIComponent(hotelPriceStrs);
	var writeParams = {
		hotelPriceStrs : hotelPriceStrs,
		childrenAgeStr : queryString('childrenAgeStr'),
		childrenNum    : queryString('childrenNum'),
		adultNum       : queryString('adultNum'),
		citytype       : queryString('citytype'),
		isQueryPrice   : queryString('isQueryPrice'),
		rateType       : queryString('rateType'),
		breakFastId    : queryString('breakFastId'),
		roomNum        : roomNum || queryString('roomNum'),
		paymentType    : queryString('paymentType'),
		hotelId        : queryString('hotelId'),
		supplierId     : queryString('supplierId'),
		endDate        : queryString('endDate'),
		startDate      : queryString('startDate'),
		roomId         : queryString('roomId'),
		staticInfoId   : queryString('staticInfoId'),
		isHasMarketing : queryString('isHasMarketing') || 0,
        isRoomNumChange: roomNum ? 1 : 0
	};
	$.post('/order/write.do', writeParams, function (data) {
		callback(data);
	});
}


//请求护照国籍信息
function getNationalMsg(key, callback) {
	$.post('/order/countrySuggest.do', {'key': key}, function (data) {
		callback(data);
	})
}

//验证酒店价格是否适合于某国际客户
function isProperMarket(countryId, callback) {
	$.get('/order/properMarket.do',
		{'suppId': queryString('supplierId'), 'countryId': countryId},
		function (data) {
			callback(data);
		})
}

//验价
function checkThePrice(params, callback) {
	$.post('/order/validate.do', params, function (data) {
		callback(data);
	})
}

//验价成功后，保存订单
function saveOrder(params, callback) {
	$.post('/order/saveOrder.do', params, function (data) {
		callback(data);
	});
}


/**
 * 加床、加早、加宽带的ajax公共函数
 * @param {*} cb 回调函数
 * @param {*} flag 1：加早；2：加床；3：加宽带
 */
function loadBBN(cb, flag) {
	var params = {
		startDate  : queryString('startDate'),
		endDate    : queryString('endDate'),
		infoId     : queryString('staticInfoId'),
		suppId     : queryString('supplierId'),
		roomtypeId : queryString('roomId'),
		roomNum    : queryString('roomNum'),
		typeId     : flag
	};
	
	$.post('/order/surchargeRoom.do', params, function (res) {
		cb(res);
	});
}


/**
 * 加床、加早、加宽带 的公共渲染函数
 * @param {*} context 这里指相关 DOM 的类名，将 htmlStr 渲染到指定 DOM
 * @param {*} htmlStr 用于渲染页面的 html 字符串
 * @param {*} option 其他操作，比如有回调函数，参数等...
 */
function renderBBN(context, htmlStr, option) {
	if (!$.orderInfo) {
		return setTimeout(function () {
			renderBBN(context, htmlStr, option);
		}, 100);
	}
	
	// 当 $.orderInfo 有值则说明已经完成了页面初步初始化，就可以在页面找到 '.network-msg-box' 元素
	$('.main').find(context)
		.show()
		.html(htmlStr);
	
	if (option) {
		option.cb(option.params);
	}
}

module.exports = {
	isHotelOnline  : isHotelOnline,
	getInitData    : getInitData,
	getNationalMsg : getNationalMsg,
	isProperMarket : isProperMarket,
	checkThePrice  : checkThePrice,
	saveOrder      : saveOrder,
	loadBBN        : loadBBN,
	renderBBN      : renderBBN
};
