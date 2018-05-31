
// 成人小孩选择组件

require('./sass/adultChildrenSelect.scss');



// options 是一个对象，可以重写相关事件事件
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
	
	// 如果找不到对应的成人小孩面板对象，说明是第一次触发，则先为该目标元素创建一个对应的成人小孩面板对象
	var target = options.target;
	if( !target.adultChildrenSelect ){
		target.adultChildrenSelect = require('./modules/newComponent_acs')(options);
	}
	// 如果不是第一次点击，则直接让它对应的日历控件重新显示出来即可
	else{
		// 当点击的位置为该组件的目标元素时
		if( target.adultChildrenSelect.element.closest('.ac-select-wrap').css('display') != 'none' ){
			target.adultChildrenSelect.hide();
		}else{
			target.adultChildrenSelect.show();
		}
	}
}

