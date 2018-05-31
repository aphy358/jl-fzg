//引入工具函数
const queryString = require('../../../common/util.js').queryString;

//跳转到指定页面的函数
function changeToPage() {
	var hotelId = queryString('hotelId'),
		checkin = queryString('startDate'),
		checkout = queryString('endDate'),
		ch = queryString('ch');
	
	var url = '/hotel/toHotelDetail.do?hotelId=' + hotelId + '&checkin=' + checkin + '&checkout=' + checkout + '&ch=' + ch;
	
	window.location.href = url;
}


// 关闭窗口（兼容各个浏览器）
function CloseWebPage() {
	if (navigator.userAgent.indexOf("MSIE") > 0) {
		if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
			window.opener = null;
			window.close();
		}
		else {
			window.open('', '_top');
			window.top.close();
		}
	}
	else if (navigator.userAgent.indexOf("Firefox") > 0) {
		// 火狐默认状态非window.open的页面window.close是无效的
		window.location.href = 'about:blank ';
	}
	else {
		window.opener = null;
		window.open('', '_self', '');
		window.close();
	}
}

module.exports = {
	changeToPage,
	CloseWebPage
};