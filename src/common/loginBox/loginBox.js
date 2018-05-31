//引入样式
require('./sass/loginBox.scss');


/*
* option 用户传入的配置参数
* option.position 决定登录框以何种方式显示在页面中
* */
module.exports = function (option) {
	//获取登录框模板
	var loginTpl = require('./templates/loginBox.ejs')();
	var event = window.event || arguments.callee.caller.arguments[0];
	
	
	//先判断用户是否传入的参数
	if (!option){
		//如果没有传入配置参数，则默认以遮罩层方式显示
		layer.open({
			type: 1,
			title: false,
			area: ['360px','422px'],
			// move: '.layui-layer-content',
			content : loginTpl,
			success : function () {
				//加载页面交互代码
				require('./modules/interactive.js').run();
			}
		})
	}
	
	if (option){
		//根据用户传入的参数决定以何种方式显示在页面中
		if (option.position === 'mask'){
			//遮罩层方式
			layer.open({
				type: 1,
				title: false,
				area: ['360px','422px'],
				// move: '.layui-layer-content',
				content : loginTpl,
				success : function () {
					//加载页面交互代码
					require('./modules/interactive.js').run();
				}
			})
		}else if (option.position === 'below'){
			//在元素下方的方式
			if (!option.target){
				option.target = event.target || event.srcElement;
			}
			
			var left = +$(option.target).offset().left,
				top = +$(option.target).offset().top,
				height = +$(option.target).height();
			
			if ($('body .login-box').length <= 0){
				$('body').append(loginTpl);
			}else{
				$('div').remove('.login-box');
				return;
			}
			
			$('.login-box').css({
				'position': 'absolute',
				'left': (left - 180) + 'px',
				'top': (top + height) + 'px',
				'z-index': '19950311'
			})
		}
	}
};