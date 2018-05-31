// 进度条

// 引入模块样式
require('./progressBar.scss');

var 
	progressBarTmpl = require('./progressBar.ejs'),
	
	_default = {
		elem: null, 							 // 组件容器
		showText: '正在查询最低价，请稍候...',	   // 进度条显示的文字
		target: null,							 // 进度条DOM元素

		// 开始动画
		animateStart: function(animating){
			var
				img = this.target.find('img'),
				width = parseInt( this.target.css('width') ),
				elem = this.elem;

			// 判断 elem 下的 animating 标识（只是起到标识的作用）
			if(!elem.animating){
				elem.animating = animating;

				img.stop().css('left', '-1200px');
				img.animate(
					// 前 80% 部分 3 秒钟走完
					{left: (width * 0.8 - 1200) + 'px'}, 
					3000,
					'linear',
					function () { 
						// 80% ~ 95% 的部分用 5 秒钟走完
						img.animate(
							{left: (width * 0.95 - 1200) + 'px'}, 
							5000,
							'linear',
							function () {
								// 95% ~ 99% 的部分用 5 秒钟走完
								img.animate(
									{left: (width * 0.99 - 1200) + 'px'}, 
									5000,
									'linear',
									function () {
										elem.animating = null;
									}
								);
							}
						);
					}
				);
			}
		},

		// 结束进度条动画
		end: function () { 
			var
				that = this,
				img = that.target.find('img'),
				width = parseInt( img.closest('.progress-wrap').css('width') );
	
			// 先停止之前没完成的动画，然后剩余部分用 0.1 秒钟快速走完
			img.stop();
			img.animate(
				{left: (width - 1200) + 'px'}, 
				100,
				'linear',
				function () { 
					img.closest('.progress-outer').slideUp(function(){
						that.target.remove();
						that.elem.progress = null;
					});
				}
			);
		},
	},
	

	// 新建一个对象
	progressBarFactory = function (options){
		if(options.elem && options.elem.progress){
			var elem = $(options.elem);
			elem.find('img').css('left', '-1200px');
			elem.show();
		}else{
			var target = $( progressBarTmpl(options) );
			options.elem.progress = $.extend({}, options, {target: target});
			$(options.elem).html(target).show();
		}
		
		// 异步执行，让进度条 DOM 先显示出来。
		setTimeout(function(){
			options.elem.progress.animateStart();
		}, 10);

		return options.elem.progress;
	};



// 新建组件的入口函数
module.exports = function(options){
	return progressBarFactory( $.extend({}, _default, options) );
}