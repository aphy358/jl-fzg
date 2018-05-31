
require('../../static/fonts/iconfont.css');
require('./login.scss');


//验证公司账号不为空，flag=1表示是从页面登录框登录，flag=2表示是从弹出登录框登录
function validate_1(accountCode, flag) {
    return common_validate(accountCode, "f-error1", "公司账号不能为空！", flag);
}

//验证用户名不为空，flag=1表示是从页面登录框登录，flag=2表示是从弹出登录框登录
function validate_2(username, flag) {
    return common_validate(username, "f-error2", "用户名不能为空！", flag);
}

//验证密码不为空，flag=1表示是从页面登录框登录，flag=2表示是从弹出登录框登录
function validate_3(password, flag) {
    return common_validate(password, "f-error3", "密码不能为空！", flag);
}

//验证验证码不为空，flag=1表示是从页面登录框登录，flag=2表示是从弹出登录框登录
function validate_4(checkcode, flag) {
    return common_validate(checkcode, "f-error4", "验证码不能为空！", flag);
}

//flag=1表示是从页面登录框登录，flag=2表示是从弹出登录框登录
function validate(param, flag) {

    if (!validate_1(param.accountCode, flag)) return false;		//验证公司账号不为空

    if (!validate_2(param.username, flag)) return false;		//验证用户名不为空

    if (!validate_3(param.password, flag)) return false;		//验证密码不为空

    if (!validate_4(param.checkcode, flag)) return false;		//验证验证码不为空

    //如果前端四个输入项有任何一个没有通过验证，都return false
    if ($("#validateMsg" + flag).hasClass("f-error1") || $("#validateMsg" + flag).hasClass("f-error2") || $("#validateMsg" + flag).hasClass("f-error3") || $("#validateMsg" + flag).hasClass("f-error4"))
        return false;

    return true;
}

// flag=1表示是从页面登录框登录，flag=2表示是从弹出登录框登录
function login(param, flag) {

    // 先验证各项输入非空
    if (!validate(param, flag)) {
        $('.yzmlogin').attr('src', '/user/getCheckcodeImg.do?time=' + (new Date()).getTime());
        return false;
    }

    $("#loadingImg" + flag).removeClass("hidden");
    $("#p1_RightBody" + flag + " .loginBody").addClass("hidden");

    if (param && param.accountCode && param.username && param.password && param.checkcode) {
        $.post("/user/login.do", param, function (data) {
            if (data.success === 0) {
                if ($.trim(param.accountCode).length > 0) {
                    $.get("/count/record.do?t=ActiveDistrb&d=" + param.accountCode.toUpperCase());
                }

                var loginAccount = localStorage.getItem("LoginAccount");
                if (!loginAccount || loginAccount != param.accountCode) {
                    localStorage.setItem("LoginAccount", param.accountCode);
                }
                var LoginUsername = localStorage.getItem("LoginUsername");
                if (!LoginUsername || LoginUsername != param.username) {
                    localStorage.setItem("LoginUsername", param.username);
                }

                $("#div_User").attr('data-distrb', param.accountCode);
                sessionStorage.setItem('login','login');    // 老页面可能用到这个东西，兼容处理...
                layer.closeAll();
                
                location.reload();
            } else {
                $('.yzmlogin').attr('src', '/user/getCheckcodeImg.do?time=' + (new Date()).getTime());
                showErrorMsg(data.msg, flag);		//显示登录错误信息
            }

            $("#loadingImg" + flag).addClass("hidden");
            $("#p1_RightBody" + flag + " .loginBody").removeClass("hidden");
        });
    }
}


//移除错误信息，flag=1表示是从页面登录框登录，flag=2表示是从弹出登录框登录
function removeErrorMsg(flag) {
    $("#validateMsg" + flag).html("");
    $("#validateMsg" + flag).addClass("hidden");

    if (flag == 1) {
        $("#p1_RightBody1 .loginBody").css("height", "277px");
        $("#loginBody2").css("padding-top", "22px");
    }
    else if (flag == 2) {
        $("#p1_RightBody2 .loginBodyRow").css("margin-top", "15px");
    }
}


// 显示登录错误信息，flag=1表示是从页面登录框登录，flag=2表示是从弹出登录框登录
function showErrorMsg(msg, flag) {
    $("#validateMsg" + flag).html("* " + msg);
    $("#validateMsg" + flag).removeClass("hidden");

    if (flag == 1) {
        $("#p1_RightBody1 .loginBody").css("height", "305px");
        $("#loginBody2").css("padding-top", "14px");
    }
    else if (flag == 2) {
        $("#p1_RightBody2 .loginBodyRow").css("margin-top", "12px");
    }
}


// 控制错误信息的显示，四个输入框的错误信息从上到下的优先级进行显示，flag=1表示是从页面登录框登录，flag=2表示是从弹出登录框登录
function handleErrorMsg(flag) {
    if ($("#validateMsg" + flag).hasClass("f-error1")) {
        showErrorMsg("公司账号不能为空！", flag);
        return false;
    }

    if ($("#validateMsg" + flag).hasClass("f-error2")) {
        showErrorMsg("用户名不能为空！", flag);
        return false;
    }

    if ($("#validateMsg" + flag).hasClass("f-error3")) {
        showErrorMsg("密码不能为空！", flag);
        return false;
    }

    if ($("#validateMsg" + flag).hasClass("f-error4")) {
        showErrorMsg("验证码不能为空！", flag);
        return false;
    }

    removeErrorMsg(flag);		// 如果四个输入框都有值，则将验证信息移除
    return true;
}	


//flag=1表示是从页面登录框登录，flag=2表示是从弹出登录框登录
function common_validate(value, className, errorMsg, flag) {
    if (value === "") {
        $("#validateMsg" + flag).addClass(className);		//用于标记没有通过前端验证
        showErrorMsg(errorMsg, flag);
        return false;
    }
    else {
        $("#validateMsg" + flag).removeClass(className);
        handleErrorMsg(flag)
    }
    return true;
}


// 初始化事件
function initEvents() {

    //先判断浏览器是不是万恶的IE，判定IE678最短的语句：var ie = !-[1,];
    var bind_name = 'input';
    var ver = navigator.userAgent;
    if (ver.indexOf("MSIE 6.0") != -1 || ver.indexOf("MSIE 7.0") != -1 || ver.indexOf("MSIE 8.0") != -1) {
        bind_name = 'propertychange';
    }

    //动态验证页面登录框的各个输入框
    $(".accountCode").bind(bind_name, function () {		    //动态验证公司账号
        var flag = this.parentElement.parentElement.attributes["data-flag"].value;
        validate_1($("#p1_RightBody" + flag + " .accountCode").val().replace(" ", ""), flag);
    })

    $(".username").bind(bind_name, function () {			//动态验证用户名
        var flag = this.parentElement.parentElement.attributes["data-flag"].value;
        validate_2($("#p1_RightBody" + flag + " .username").val().replace(" ", ""), flag);
    })

    $(".password").bind(bind_name, function () {			//动态验证密码
        var flag = this.parentElement.parentElement.attributes["data-flag"].value;
        validate_3($("#p1_RightBody" + flag + " .password").val().replace(" ", ""), flag);
    })

    $(".varificationCode").bind(bind_name, function () {	//动态验证验证码
        var flag = this.parentElement.parentElement.attributes["data-flag"].value;
        validate_4($("#p1_RightBody" + flag + " .varificationCode").val().replace(" ", ""), flag);
    })

    // 验证码刷新
    $(document).delegate(".yzmlogin", 'click', function () {
        $(this).attr('src', '/user/getCheckcodeImg.do?time=' + (new Date()).getTime());
    });

    // 点击“注册”按钮
    $(document).delegate(".registerBtn", 'click', function () {
        location.href = "/login/html/register.jsp";
    });

    // 弹出登录框，点击“登录”按钮
    $(document).delegate('#login_layer .loginBtn', 'click', function () {
        login({
	        'accountCode': $("#p1_RightBody2 .accountCode").val().replace(" ", ""),
	        'username': $("#p1_RightBody2 .username").val().replace(" ", ""),
	        'password': $("#p1_RightBody2 .password").val().replace(" ", ""),
	        'checkcode': $("#p1_RightBody2 .varificationCode").val().replace(" ", ""),
	        'rememberMe': $("#rememberMe").is(':checked') === true ? "true" : "false"
        });
    });

    // 登录框响应 enter 键
    $(".accountCode,.username,.password,.varificationCode").on("keydown", function (e) {
        if (e.keyCode == 13) {
            $(this).closest(".loginBody").find(".loginBtn").click();
        }
    });
}


// 先登录
function loginFirst(){
    layer.open({
        type: 1,
        shade: ['0.25', 'rgb(0,0,0)'],
        title: false, //不显示标题
        content: require('./login.ejs')(), //捕获的元素
        area: ["290px", "350px"],
        cancel: function (index) {
            layer.close(index);
        },
        success: function (layero, index) {
            // 初始化登录模块的相关 js
            initEvents();
        }
    });
}


module.exports = {
    initEvents : initEvents,
    loginFirst : loginFirst,
}