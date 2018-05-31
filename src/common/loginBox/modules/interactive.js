var firstPageApi = {
	login : '/user/loginfzg.do',
	isLogin : '/user/getCurrentUser.do',
	loginout : '/user/loginoutfzg.do'
};


//点击登录时，发送请求
function loginJl() {
	//先判断所有登录必填项是否已填写
	$('#loginIn').click(function () {
		//先清空err-msg中的文字
		$('.err-msg').text('');
		
		//清空类名
		$('#loginJl>ul>li').removeClass('li-error');
		
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
				
				$requireInput.parent().addClass('li-error');
				
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
				accountCode : $.trim($('#accountCode').val()),
				username    : $.trim($('#username').val()),
				password    : $('#password').val(),
				checkcode   : $('#checkcode').val(),
				rememberMe  : rememberMe
			};
			
			$.post(firstPageApi.login, paramObj, function (data) {
				if (data.returnCode){
					if (data.returnCode != 1){
						$('.err-msg').text('*' + data.returnMsg);
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
						
						//隐藏登录框
						// $('.login-background,.login-box').hide();
						
						layer.closeAll();
						location.reload();
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


//忘记密码
function other() {
	var findPassword = null;
	$('.find-password').mouseenter(function () {
		findPassword = layer.tips('请联系账户管理员或致电<b class="jl-phone">0755-33336999</b>', $(this), {
			time: 0,
			tips: [3, '#ffa825'],
			offset: ['0','1200px']
		});
	}).mouseleave(function () {
			layer.close(findPassword);
		});
	
	//点击图片更换验证码
	$('.yzm-img').click(function () {
		$(this).attr('src','/user/getCheckcodeImg.do?time='+ new Date().getTime())
	});
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


module.exports = {
	run : function () {

//判断用户是否记住了账号，如果是，将其值设置到对应输入框中
		if (getCookie('login_account_code_cookie')){
			$('input[name="accountCode"]').val(getCookie('login_account_code_cookie'));
			$('input[name="username"]').val(decodeURIComponent(getCookie('login_user_name_cookie')));
			$('input[name="rememberMe"]').attr('checked', 'true');
		}
		
		loginJl();
		
		other();
	}
};