// 该文件自定义了 select 控件，使它在各个浏览器下表现一致

// 引入模块样式
require('./sass/select.scss');



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

	// 如果找不到对应的 select 对象，说明是第一次触发，则先为该目标元素创建一个对应的 select 对象
	var target = options.target;
	if( !target.mySelect ){
		target.mySelect = require('./modules/newComponent_select')(options);
	}
	// 如果不是第一次点击，则直接让它对应的 select 重新显示出来即可
	else{
		// 当点击的位置为该组件的目标元素时
		if( target.mySelect.element.closest('.my-select-list').css('display') != 'none' ){
			target.mySelect.hide();
		}else{
			target.mySelect.show();
		}
	}
}
