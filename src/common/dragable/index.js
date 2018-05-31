(function($) {

	$.fn.dragable = function(selector) {

		var
			// 存储正被拖拽的对象
			dragTarget,

			// 标记控件是否进入开始拖动状态
			dragstart = false,

			// 标记控件是否处于被拖动状态
			draging = false,
			
			// 控件左边界和鼠标X轴的差
			dragOffsetX = 0,
			
			// 控件上边界和鼠标Y轴的差
			dragOffsetY = 0,
			
			_this = this,
			
			that = this[this.length - 1],
			
			_rect = that.getBoundingClientRect(),
			
			thisWidth = _rect.right - _rect.left,
			
			thisHeight = _rect.bottom - _rect.top,
			
			turnToDraging = function(e){
				
				var targetRect = e.currentTarget.getBoundingClientRect();
				
				dragstart = true;
				dragTarget = e.target || e.srcElement;
				
				//获取鼠标和该控件的位置偏移量，并存入全局变量供后续调用
				dragOffsetX = e.clientX - targetRect.left;
				dragOffsetY = e.clientY - targetRect.top;
			};
			
			
		_this.mousedown(function(e) {
			var
				selArr = selector ? selector.split(' ') : [],
				target = e.target || e.srcElement,
				sel;
			
			if( selector ){
				for (var i = 0; i < selArr.length; i++) {
					sel = selArr[i].replace(/^[.#]/, '');
					if( $(target).hasClass(sel) || $(target).attr('id') == sel ){
						turnToDraging(e);
						break;
					}
				}
			}else{
				turnToDraging(e);
			}
		});

		$(document).mousemove(function(e) {
			if (dragstart) {
				draging = true;

				// 不断获取鼠标新的坐标，并计算出控件的新坐标
				var newX = e.clientX - dragOffsetX;
				var newY = e.clientY - dragOffsetY;

				// 边界控制，document.documentElement.clientWidth：可见区域宽度  document.documentElement.clientHeight：可见区域高度
				newX = newX < 0 ? 0 : newX;
				newY = newY < 0 ? 0 : newY;
				newX = newX > (document.documentElement.clientWidth - thisWidth) ? (document.documentElement.clientWidth - thisWidth) : newX;
				newY = newY > (document.documentElement.clientHeight - thisHeight) ? (document.documentElement.clientHeight - thisHeight) : newY;
				
				//把新的坐标重新赋值给控件
				_this.css({
					left: newX + "px",
					top: newY + "px"
				});
				
				_this.addClass('fixed');
			}
		});

		$(document).mouseup(function(e) {
			dragstart = false;

			if(draging){
				draging = false;
				$(dragTarget).trigger('draged');
			}
		});
	};
})(jQuery);