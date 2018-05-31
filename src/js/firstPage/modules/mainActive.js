//首页banner图
function carousel() {
	var carouselVal = null;
	
	//外层盒子的宽度
	var outerW = $('.banner').width();
	function carouselFn() {
		var index = 0;
		carouselVal = setInterval(function () {
			if (index == 0){
				index = 1;
			}else{
				index = 0;
			}
			
			//第二张图片显示到最上层
			$('.banner-image>li').eq(index).fadeIn('slow').siblings().fadeOut();
			
			//更换point
			$('.banner-point>li').eq(index).addClass('this-point').siblings().removeClass('this-point');
			
		},5000);
	}
	
	carouselFn();
	
	
	//当鼠标移入banner图时，暂停自动动画
	$('.banner-image').mouseenter(function () {
		clearInterval(carouselVal);
	})//移出时，重新继续播放动画
		.mouseleave(function () {
			carouselFn();
		});
	
	//用户点击point时，将对应图片移动到显示区
	$('.banner-point>li').click(function () {
		//先暂停定时器
		clearInterval(carouselVal);
		
		//改变被点击point的样式
		$(this).addClass('this-point').siblings().removeClass('this-point');
		
		$('.banner-image>li').eq($(this).attr('pindex')).fadeIn('slow').siblings().fadeOut();
	});
}

//用户鼠标移入合作商家的logo，背景颜色变深并出现box-shadow
function partner() {
	$('.pre-partner-box').mouseenter(function (e) {
		var _index = $(this).attr('p-index');
		$(this).closest('.partner').find('.pre-partner-bg').removeClass('pre-partner-bg-hover').eq(_index-1).addClass('pre-partner-bg-hover');
	}).mouseleave(function () {
		$(this).closest('.partner').find('.pre-partner-bg').removeClass('pre-partner-bg-hover');
	});
}

//用户点击导航栏时，改变样式
function navbar() {
	$('.navbar-right .nav-tab').click(function () {
		$('.nav-tab').removeClass('selected-nav');
		$(this).addClass('selected-nav');
	});
}

//忘记密码
function other() {
	var findPassword = null;
	$('.find-password').mouseenter(function () {
		findPassword = layer.tips('请联系账户管理员或致电<b class="jl-phone">0755-33336999</b>', $(this), {
			time: 0,
			tips: [3,'#ffffff'],
			offset: ['0','1200px']
		});
	})
		.mouseleave(function () {
			layer.close(findPassword);
		});
	
	//点击图片更换验证码
	$('.yzm-img').click(function () {
		$(this).attr('src','/user/getCheckcodeImg.do?time='+ new Date().getTime())
	});
}

module.exports = {
	run : function(){
		partner();
		
		carousel();
		
		navbar();
		
		other();
	}
};