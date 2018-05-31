
require('./header.scss');
const Util = require('../../util');
const loginModel = require('../../loginModel/login');
const CloseWebPage = require('../../util.js').CloseWebPage;


// 获取当前用户信息
function getCurUser(pagename){
	
	//根据传入的页面名称，改变对应的板块样式
    $('.i-t-n-group').find('li[data-module="' + pagename + '"]').attr('checked','checked');
	
	$.post('/user/getCurrentUser.do', {}, function (res) {
		if( res.returnCode == 1 ){
			//将用户已登录的信息赋值给window
			window.hasLoginFzg = 'true';
			window.distrbCode = res.data.distributorAccount.distrbCode;
			window.isAdmin = res.data.user.isAdmin;
			if(window.isAdmin == null)	window.isAdmin = 'null';

			$(".i-t-n-user")
				.html(res.data.user.customerUserName)
				.attr('data-distrbid', res.data.distributorAccount.distrbId)
				.attr('data-isadmin', res.data.user.isAdmin);
			sessionStorage.setItem('login','login');    // 老页面用到这个东西，所以为了兼容...
            
            
            if (pagename === 'toolDataIn'){
                //如果是房掌柜小助手基础数据导入页面，则不允许客户编号为SZ2747以外的人进入
                if (res.data.distributorAccount.distrbCode.toUpperCase() !== 'SZ2747'){
                    alert('您不被允许进入该页面',{
                        closeBtn : 0
                    },function () {
                        CloseWebPage();
                    });
                }
                
            }else if (pagename === 'toolOperateHotel'){
            	if (res.data.user.isAdmin !== 1){
                    alert('您不被允许进入该页面',{
                        closeBtn : 0
                    },function () {
                        CloseWebPage();
                    });
	            }
            }
		}else if( res.returnCode == -400001 ){
			//将用户未登录的信息赋值给window
			window.hasLoginFzg = 'false';
			
			//隐藏订单管理模块
			$('.index-concern-order-outer').css('display','none');
			
			if (pagename === 'index' || pagename === 'register'){
				
				$('.i-t-n-triangle').hide();
				
				//如果是首页或注册页，则不做登录检测,用户点击“您好，请登录”时，弹出登录框
				$('.i-t-n-user-wrap').hover(function () {
					//隐藏个人信息的下拉列表
					$('.i-t-n-user-wrap:hover .i-t-n-drop').css('display','none');
				}).click(function () {
					// 登录组件
					require('../../loginBox/loginBox.js')();
				});
				
			}else{
				Util.login();
				//loginModel.loginFirst();
			}
			
		}
	}, 'noAnimation');
    
}


// 初始化退出事件
function initLogout(){
    $("#logout").on('click', function(){
        var loginoutConfirm = confirm('是否确定退出？', function(){
            $.post('/user/loginoutfzg.do', {}, function (res) {
                if( res && res.returnCode == 1 ){
                    //*** 
                    // Util.login();
                    // loginModel.loginFirst();
	
	                $(".i-t-n-user").html("请登录");
                    layer.close(loginoutConfirm);
                    location.reload();
                }
            })
        })
    })
}


//在导航栏三个入口处加一个登录判断
function navbarLink() {
	$('.i-t-n-group>li[name="i-t-n-radio"]>a').click(function () {
		if (window.hasLoginFzg === 'false'){
			// 登录组件
			require('../../loginBox/loginBox.js')();
			
			return false;
		}
		
	})
}



// 首页 顶部导航栏 区域相关 js
module.exports = {
    run: function(pagename){

        // 获取当前用户信息
        getCurUser(pagename);

        // 初始化退出事件
        initLogout();

		//在导航栏三个入口处加一个登录判断
	    navbarLink();
    }
}