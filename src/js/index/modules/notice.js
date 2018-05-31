

var height = 0;
function interval() {
	
	var noticeInterval = setTimeout(function () {
		height -= 40;
		$('.index-notice-content-box').animate({
			top : height + 'px'
		},1000,function () {
			if (height <= -80){
				clearInterval(noticeInterval);
				height = 0;
				$('.index-notice-content-box').css('top', 0);
				interval();
			}else{
				interval();
			}
		});
	},2000);
	
}



//获取cookie值
function getCookie(name){
	var strcookie = document.cookie;//获取cookie字符串
	var arrcookie = strcookie.split("; ");//分割
//遍历匹配
	for ( var i = 0; i < arrcookie.length; i++) {
		var arr = arrcookie[i].split("=");
		if (arr[0] == name){
			return arr[1];
		}
	}
	return "";
}

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function clearCookie(name) {
	setCookie(name, "", -1);
}


module.exports = function () {
	interval();
	
	
	if (getCookie('notice_has_alert') !== 'true'){
		var noticeTpl = require('../templates/notice.T.ejs');
		
		layer.open({
			type: 1,
			title: false,
			offset: '100px',
			area: ['400px', '540px'],
			move: '.notice-title',
			content: noticeTpl()
		});
		
		setCookie('notice_has_alert', 'true', 30);
	}
}