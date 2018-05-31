const initUser = {
    checkCustomerName : function () {
        let reg = /^[a-zA-Z0-9]{4,16}$/,
            _this;
        $('input[name="customerName"], input[name="password"]').blur(function () {
            _this = $(this);
            let brief = _this.data('brief');
            
            if (!reg.test(_this.val())){
                if (brief === '密码'){
                    _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>只能输入数字或字母');
                }else{
                    _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>请填写正确格式的' + brief);
                }
                _this.addClass('input-error');
    
                if (_this.val().length < 4 || _this.val().length > 16){
                    _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>' + brief + '长度为4到16位');
                    $(this).addClass('input-error');
                }
            }else{
                initUser.removeErrorState($(this));
            }
        }).keyup(function () {
            _this = $(this);
            if (reg.test($(this).val())){
                initUser.removeErrorState($(this));
            }
        });
    },
    
    
    //用户输入的密码有变动时，清空确认密码中的内容
    refreshPassword : function () {
        $('input[name="password"]').keyup(function () {
            $('input[name="passwordAgain"]').val('');
        });
    },
    
    
    confirmPassword : function () {
        $('input[name="passwordAgain"]').blur(function () {
            let _this = $(this);
            if (_this.val() !== $('input[name="password"]').val()){
                _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>确认密码错误');
                _this.addClass('input-error');
            }
        }).keyup(function () {
            if ($(this).val().length >= 1){
                initUser.removeErrorState($(this));
            }
        });
    },
    
    
    checkUserName : function () {
        let reg = /^[\u4e00-\u9fa5_a-zA-Z]{1,}$/,
            _this;
        $('input[name="userName"]').blur(function () {
            _this = $(this);
            
            if (_this.val().length < 1){
                _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>姓名不能为空');
                $(this).addClass('input-error');
            }else if (!reg.test(_this.val())){
                _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>请填写正确格式的姓名');
                _this.addClass('input-error');
            }
        }).keyup(function () {
            _this = $(this);
            if (reg.test(_this.val())){
                initUser.removeErrorState(_this);
            }
        }).keyup(function () {
            _this = $(this);
    
            if (_this.val().length >= 1 && reg.test(_this.val())){
                initUser.removeErrorState(_this);
            }
        });
    },
    
    
    checkMobile : function () {
        let reg,
            _this,
            brief;
        
        $('input[name="mobile"], input[name="email"]').blur(function () {
            _this = $(this);
            
            brief = _this.data('brief');
    
            initUser.removeErrorState(_this);
            
            if (brief === '手机号'){
                reg = /^[0-9]{11}$/;
            }else if (brief === '邮箱'){
                reg = /^[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]\.[a-zA-Z][a-zA-Z\.]*[a-zA-Z]$/;
            }
            
            
            if (_this.val().length < 1){
                _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>' + brief + '不能为空');
                $(this).addClass('input-error');
            }else if (!reg.test(_this.val())){
               _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>请填写正确格式的' + brief);
               _this.addClass('input-error');
            }else{
               let
                   params = {
                       key : _this.attr('name'),
                       val : _this.val()
                   };
               $.post('/regist/check.do', params, function (data) {
                   if (data.isSucc === false){
                       _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>' + brief + '已存在，请使用其他' + brief + '或联系0755-33336999');
                       _this.addClass('input-error');
                   }
               }, 'noAnimation');
           }
        }).keyup(function () {
            _this = $(this);
            brief = _this.data('brief');
    
            if (brief === '手机号'){
                reg = /^[0-9]{11}$/;
            }else if (brief === '邮箱'){
                reg = /^[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]\.[a-zA-Z][a-zA-Z\.]*[a-zA-Z]$/;
            }
    
            if (_this.val().length >= 1 && reg.test(_this.val())){
                initUser.removeErrorState(_this);
            }
        });
    },
    
    changeYzm : function () {
        //点击图片更换验证码
        $('.yzm-img').click(function () {
            $(this).attr('src','/user/getCheckcodeImg.do?time='+ new Date().getTime())
        })
        
        
        $('input[name="vcode"]').keyup(function () {
            if ($(this).val().length >= 1){
                initUser.removeErrorState($(this));
            }
        });
    },
    
    
    checkRecommend : function () {
        let reg = /^[A-Za-z0-9\u4e00-\u9fa5]{0,}$/,
            _this;
        $('input[name="recommendMessage"]').blur(function () {
            _this = $(this);
            if (!reg.test(_this.val())){
                _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>只允许输入数字、字母、数字');
            }
        }).keyup(function () {
            _this = $(this);
            if (reg.test(_this.val())){
                initUser.removeErrorState(_this);
            }
        });
    },
    
    
    removeErrorState : function (_this) {
        _this.closest('.company-item').find('.warning').html('');
        _this.removeClass('input-error');
    }
};


module.exports = {
    run : function () {
        //用户名、密码
        initUser.checkCustomerName();
    
        //用户输入的密码有变动时，清空确认密码中的内容
        initUser.refreshPassword();
        
        //确认密码
        initUser.confirmPassword();
        
        //用户名
        initUser.checkUserName();
        
        //手机号、邮箱
        initUser.checkMobile();
        
        //推荐人信息
        initUser.checkRecommend();
        
        //验证码
        initUser.changeYzm();
    }
}