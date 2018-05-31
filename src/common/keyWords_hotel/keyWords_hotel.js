// 该文件定义了关键字（弹出层）的相关事件和逻辑

// 引入模块样式
require('./sass/keyWords_hotel.scss');



// options 是一个对象，可以重写默认事件等
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
	
	// 如果找不到对应的对象，说明是第一次触发，则先为该目标元素创建一个对应的对象
	var target = options.target;
	if( !target.keyWordsHotel ){
		target.keyWordsHotel = require('./modules/newComponent_kwh')(options);
	}
	// 如果不是第一次点击，则直接让它对应的控件重新显示出来即可
	else{
		target.keyWordsHotel.show();
	}
	
	//如果传入了点击酒店列表的回调函数，则将其绑定在target中
	if (options.hotelClickEvent){
		target.hotelClickEvent = options.hotelClickEvent;
	}
}
