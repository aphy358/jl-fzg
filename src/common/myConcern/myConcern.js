//加载样式
require('./sass/myConcern.scss');

const initConcernEvent = function (){
	
	$('body').delegate('.icon-gz-on', 'click', function (e) {
		let _this = $(this),
			collectParam = {
			categoryId : 0,
			infoId : _this.data('hotelid')
		},
			collectUrl = '/fzgCustomerFavorite/removeFavorite.do';
		
		//发送取消收藏请求
		$.post(collectUrl, collectParam, function (data) {
			if (data.returnCode !== 1){
				//提示用户错误信息
				layer.msg(data.returnMsg);
			}else{
				//取消收藏成功则改变样式
				_this.removeClass('icon-gz-on').addClass('icon-gz-off');
				//若为详情页，则改变字样
				if (_this.parent().siblings('.icon-gz-on-tips').length >= 1 )_this.parent().siblings('.icon-gz-on-tips').text('未关注');
			}
		}, 'noAnimation');
		
		e.preventDefault();
		e.stopPropagation();
	})
		.delegate('.icon-gz-off', 'click', function (e) {
		let _this = $(this),
			collectParam = {
				categoryId : 0,
				infoId : _this.data('hotelid')
			},
			collectUrl = '/fzgCustomerFavorite/saveFavorite.do';
		
		//发送收藏请求
		$.post(collectUrl, collectParam, function (data) {
			if (data.returnCode !== 1){
				//提示用户错误信息
				layer.msg(data.returnMsg);
			}else{
				//收藏成功则改变样式
				_this.removeClass('icon-gz-off').addClass('icon-gz-on');
				//若为详情页，则改变字样
				if (_this.parent().siblings('.icon-gz-on-tips').length >= 1 )_this.parent().siblings('.icon-gz-on-tips').text('已关注');
			}
		}, 'noAnimation');
		
		e.preventDefault();
		e.stopPropagation();
	})
};

module.exports = initConcernEvent();