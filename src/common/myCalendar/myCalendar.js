// 该文件定义了订单参数编辑框（弹出层）的相关事件和逻辑

// 引入模块样式
require('./sass/myCalendar.scss');



// options 是一个对象，可以重写默认的日期点击事件、下一月、上一月的切换事件等
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
	
	// 如果找不到对应的日历对象，说明是第一次触发，则先为该目标元素创建一个对应的日历对象
	var target = options.target;
	if( !target.myCalendar ){
		target.myCalendar = require('./modules/newComponent_c')(options);
	}
	// 如果不是第一次点击，则直接让它对应的日历控件重新显示出来即可
	else{
		target.myCalendar.show();
	}
}
