//引入需要用到的模板
var hasLoginTmp = require('../templates/hasLogin.ejs');

//企业首页所有需要用到的接口
var firstPageApi = {
	login : '/user/loginfzg.do',
	isLogin : '/user/getCurrentUser.do',
	loginout : '/user/loginoutfzg.do'
};

//一进入页面便判断用户是否为已登录状态，如果是，直接跳转到房掌柜
function isLogin() {
	$.get(firstPageApi.isLogin,function (data) {
		if (data.returnCode == 1){
			//隐藏登录框
			$('.login-background,.login-box').hide();
			//展示已登录状态
			var hasLoginStr = hasLoginTmp(data.data);
			$('.banner').append(hasLoginStr);
			
			//将所有“申请合作”改为已登录链接
			$('.application,.service-apply').attr('href','/login/html/joinUs.jsp?id=joinUs_1&isLogin=true');
			sessionStorage.setItem('login','login');
			
			//退出登录
			$('.banner').delegate('.login-out','click',function () {
				layer.confirm('确认退出登录？',function () {
					$.get(firstPageApi.loginout,function (data) {
						if (data.returnCode == 1){
							//将所有“申请合作”改为未登录链接
							$('.application,.service-apply').attr('href','/login/html/joinUs.jsp?id=joinUs_1&isLogin=false');
							sessionStorage.removeItem('login');
							layer.msg('退出成功',{time: 500},function () {
								//刷新页面
								location.reload();
							});
						}else{
							alert(data.returnMsg,{closeBtn : 0},function () {
								//刷新页面
								location.reload();
							});
						}
					})
				});
			})
		}else{
			//如果未登录则保持原样
		}
	});
	
	//判断用户是否记住了账号，如果是，将其值设置到对应输入框中
	if (getCookie('login_account_code_cookie')){
		$('input[name="accountCode"]').val(getCookie('login_account_code_cookie'));
		$('input[name="username"]').val(decodeURIComponent(getCookie('login_user_name_cookie')));
		$('input[name="rememberMe"]').attr('checked', 'true');
	}
}

//获取cookie值
function getCookie(name){
	var strcookie = document.cookie;//获取cookie字符串
	var arrcookie = strcookie.split("; ");//分割
//遍历匹配
	for ( var i = 0; i < arrcookie.length; i++) {
		var arr = arrcookie[i].split("=");
		if (arr[0] == name){
			return arr[1];
		}
	}
	return "";
}

//点击登录时，发送请求
function loginJl() {
	//先判断所有登录必填项是否已填写
	$('#loginIn').click(function () {
		//先清空err-msg中的文字
		$('.err-msg').text('');
		
		//将状态改为“登录中”
		$(this).text('登录中…');
		
		var allInput = $('#loginJl').find('input[emptymsg]');
		
		//一个用于辨认用户是否已填完所有必填项的标识
		var loginFlag = "true";
		for (var aI = 0; aI < allInput.length; aI++) {
			var $requireInput = $(allInput[aI]);
			if (!$requireInput.val()){
				loginFlag = "false";
				$('.err-msg').text($requireInput.attr('emptymsg'));
				$(this).text('登录');
				break;
			}
		}
		
		if (loginFlag == "true"){
			var rememberMe = '';
			if ($('input[name="rememberMe"]').is(':checked')){
				rememberMe = 'true';
			}else{
				rememberMe = 'false';
			}
			var paramObj = {
				accountCode : $.trim($('input[name="accountCode"]').val()),
				username    : $.trim($('input[name="username"]').val()),
				password    : $('input[name="password"]').val(),
				checkcode   : $('input[name="checkcode"]').val(),
				rememberMe  : rememberMe
			};
			
			$.post(firstPageApi.login, paramObj, function (data) {
				if (data.returnCode){
					if (data.returnCode != 1){
						$('.err-msg').text(data.returnMsg);
						$('.yzm-img').trigger('click');
						$('#loginIn').text('登录');
					}else{
						//统计代码
						if($.trim(paramObj.accountCode).length > 0){
							var record_data = encodeURIComponent(paramObj.accountCode.toUpperCase());
							$.get("/count/record.do?t=ActiveDistrb&d="+record_data);
						}
						
						var loginAccount = localStorage.getItem("LoginAccount");
						if(!loginAccount || loginAccount != paramObj.accountCode){
							localStorage.setItem("LoginAccount", paramObj.accountCode);
						}
						var LoginUsername = localStorage.getItem("LoginUsername");
						if(!LoginUsername || LoginUsername != paramObj.username){
							localStorage.setItem("LoginUsername", paramObj.username);
						}
						
						//将所有“申请合作”改为已登录链接
						$('.application,.service-apply').attr('href','/login/html/joinUs.jsp?id=joinUs_1&isLogin=true');
						sessionStorage.setItem('login','login');
						
						//隐藏登录框
						$('.login-background,.login-box').hide();
						//将登录框样式显示为已登录状态
						var hasLoginStr = hasLoginTmp(data.data);
						$('.banner').append(hasLoginStr);
						
						//先判断用户是否是从房掌柜别的页面跳转过来的
						if (data.data.request_old_url_key && data.data.request_old_url_key !== '' && data.data.request_old_url_key !== undefined){
							location.href = data.data.request_old_url_key;
						}else{
							location.href = '/user/bookHotel.do';
						}
					}
				}else{
					alert('系统繁忙，请稍后重试');
					$('#loginIn').text('登录');
				}
			})
		}
		
		return false;
	});
	
}

//点击导航栏的房掌柜和下面进入房掌柜的按钮。先判断用户是否已经登录房掌柜
function isLoginFzg() {
	$('.to-fzg').on('click',function () {
		$.get(firstPageApi.isLogin,function (data) {
			if (data.returnCode == 1){
				location.href = '/user/bookHotel.do';
			}else{
				//弹出提示框
				var promptBoxTmpl = require('../templates/promptBox.ejs');
				var promptBoxDOM = layer.open({
					type: 1,
					title: false,
					area: '530px',
					move: '.palce-can-move',
					content: promptBoxTmpl(data)
				});
				
				//用户点击稍后再说或确定，直接关闭提示框
				$(document).delegate('.see-soon,.prompt-yes','click',function () {
					layer.close(promptBoxDOM);
				});
				
				//用户点击现在登录，页面回滚到顶部登录框位置
				$(document).delegate('.login-now','click',function () {
					layer.close(promptBoxDOM);
					
					$('body, html').animate({
						scrollTop: 0
					}, 200);
				})
			}
		})
	})
}

module.exports = {
	run : function () {
		isLogin();
		
		loginJl();
		
		// isLoginFzg();
	}
};