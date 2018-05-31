// 该文件定义了订单参数编辑框（弹出层）的相关事件和逻辑

// 引入模块样式
require('./sass/starSelect.scss');



// options 是一个对象，可以重写默认的事件
module.exports = function (options) {
	
	var event = window.event || arguments.callee.caller.arguments[0];

	if( !options ){
		options = {
			target : event.target || event.srcElement,
		}
	}
	
	if( !options.target ){
		options.target = event.target || event.srcElement;
	}

	// 如果点击的刚好是那个下拉三角形图标
	if( options.target.tagName === 'I' ){
		options.target = $(options.target).prev('*')[0];
	}
	
	// 如果找不到对应的星级选择对象，说明是第一次触发，则先为该目标元素创建一个对应的星级选择对象
	var target = options.target;
	if( !target.starSelect ){
		target.starSelect = require('./modules/newComponent_star')(options);
	}
	// 如果不是第一次点击，则直接让它对应的星级选择控件重新显示出来即可
	else{
		// 当点击的位置为该组件的目标元素时
		if( target.starSelect.element.closest('.i-s-star-select-wrap').css('display') != 'none' ){
			target.starSelect.hide();
		}else{
			target.starSelect.show();
		}
	}
}
