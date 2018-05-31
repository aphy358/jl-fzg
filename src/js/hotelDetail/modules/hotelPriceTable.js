
const
	Util = require('../../../common/util.js'),
	
	
	// 初始化 "查看更多" 点击事件
	initExpandBtnClick = function(){
		$(".hli-price-list-wrap").delegate('.hli-expand-inner', 'click', function(){
			var
				_this = $(this),
				expandText = _this.find('span'),
				expandIcon = _this.find('.hli-icon'),
				autoHideTrs = _this.closest('.hl-item').find('.auto-hide');
				
			if( expandIcon.hasClass('icon-down') ){
				expandIcon.removeClass('icon-down').addClass('icon-up');
				expandText.html('收起全部房型');

				$.each(autoHideTrs, function(i, o) {
					setTimeout(function(){
						$(o).find('td').removeClass('hidden');
					}, 50);
					
					$(o).slideDown('fast');
				});
			}else{
				expandIcon.removeClass('icon-up').addClass('icon-down');
				expandText.html('展开全部房型');

				$.each(autoHideTrs, function(i, o) {
					setTimeout(function(){
						$(o).find('td').addClass('hidden');
					}, 80);
					
					$(o).slideUp('fast');
				});

				setTimeout(function(){
					// 当重新查询价格时，将搜索栏滚动到页面顶部
					$('.search-line-outer')[0].scrollIntoView();
				}, 200);
			}

			// 点击收起，去除fix样式
			_this.closest('.fix-bottom').removeClass('fix-bottom');
			
			// 异步触发屏幕滚动事件
			setTimeout(function(){
				$(document).trigger('scroll');
			}, 50)
		})
	};
	

// 酒店信息
module.exports = {
    run: function(){
    	// 初始化 "查看更多" 点击事件
    	initExpandBtnClick();
    }
}