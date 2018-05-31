// 该文件定义了关键字（弹出层）的相关事件和逻辑

// 引入模块样式
require('./sass/keyWords_city.scss');



// options 是一个对象，可以重写默认事件等
module.exports = function (options) {

	var event = window.event || arguments.callee.caller.arguments[0];
	
	if( !options ){
		options = {
			target : event.target || event.srcElement,
			citytype : 0
		}
	}
	
	if( !options.target ){
		options.target = event.target || event.srcElement;
	}
	
	// 如果找不到对应的对象，说明是第一次触发，则先为该目标元素创建一个对应的对象
	var target = options.target;
	if( !target.keyWordsCity ){
		//用户传入city值以表示是否需要城市面板，0表示不需要，1表示需要
		if (options.city && options.city === 0){
			//不需要任何操作
		}else{
            target.keyWordsCity = require('./modules/newComponent_kwc')(options);
		}
		
	}
	// 如果不是第一次点击，则直接让它对应的控件重新显示出来即可
	else{
		target.keyWordsCity.show( (options.citytype || 0) );
	}
}
