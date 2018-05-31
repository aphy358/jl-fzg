const initArea = require('./areaSelect.js');

const
    countryObj = document.getElementById('country'),
    provinceObj = document.getElementById('province'),
    cityObj = document.getElementById('city');

//企业名称
const initCompany = {
    checkCompanyName : function () {
        $('input[name="companyName"], input[name="companyAddress"]').blur(function () {
            let value = $(this).val();
            if ($.trim(value).length < 1){
                $(this).closest('.company-item').find('.warning').html('<i class="icon-warning"></i>' + $(this).data('brief') + '不能为空');
                $(this).addClass('input-error');
            }else if ($(this).attr('name') === 'companyName'){
                let _this = $(this),
                    brief = _this.data('brief'),
                    params = {
                        key : 'allName',
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
            if ($(this).val().length >= 1){
                initCompany.removeErrorState($(this));
            }
        });
    },
    
    changeCountry : function () {
        $('#country').change(function () {
            initArea.countryChangeHandle($(this).val(), provinceObj, cityObj);
            if ($(this).val() !== '-1' && $('select#province').val() !== '-1' && $('select#city').val() !== '-1'){
                initCompany.removeErrorState($(this));
            }
        });
    },
    
    changeProvince : function () {
        $('#province').change(function () {
            initArea.stateChangeHandle($(this).val(), cityObj);
            if ($(this).val() !== '-1' && $('select#country').val() !== '-1' && $('select#city').val() !== '-1'){
                initCompany.removeErrorState($(this));
            }
        });
    },
    
    changeCity : function () {
        $('#city').change(function () {
            if ($(this).val() !== '-1' && $('select#country').val() !== '-1' && $('select#province').val() !== '-1' ){
                initCompany.removeErrorState($(this));
            }
        })
    },
    
    checkCompanyPhone : function () {
        let reg = /^\d{0,}$/,
            _this;
        $('input[name="companyPhone"]').blur(function () {
            _this = $(this);
            if (!reg.test(_this.val())){
                _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>' + _this.data('brief') + '必须由数字组成');
                _this.addClass('input-error');
            }else{
                if (_this.val().length > 0){
                    let
                        params = {
                            key : _this.data('type'),
                            val : _this.val()
                        },
                        flag = true;
                    $.post('/regist/check.do', params, function (data) {
                        if (data.isSucc === false){
                            flag = false;
                            let short = _this.data('short');
                            _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>' + short + '已存在，请使用其他' + short + '或联系0755-33336999');
                            _this.addClass('input-error');
                        }
        
                        //判断用户的收单方式
                        if (flag === true && $('select[name="sdway"]').val() === '2'){
                            $('input[name="sdway"]').val(_this.val());
                        }
        
                    }, 'noAnimation');
                }
            }
        }).keyup(function () {
            _this = $(this);
            
            if (reg.test(_this.val())){
                initCompany.removeErrorState(_this);
            }
        });
    },
    
    checkCompanyFax : function () {
        let reg = /^\d{1,}$/,
            _this;
        $('input[name="companyFax"]').blur(function () {
            initCompany.removeErrorState($(this));
            
            _this = $(this);
            
            let flag = true;
            
            if (_this.val().length < 1){
                flag = false;
                _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>' + _this.data('brief') + '不能为空');
                _this.addClass('input-error');
            }else if (!reg.test(_this.val())){
                flag = false;
                _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>' + _this.data('brief') + '必须由数字组成');
                _this.addClass('input-error');
            }else{
                let
                    params = {
                        key : _this.data('type'),
                        val : _this.val()
                    };
                $.post('/regist/check.do', params, function (data) {
                    if (data.isSucc === false){
                        flag = false;
                        let short = _this.data('short');
                        _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>' + short + '已存在，请使用其他' + short + '或联系0755-33336999');
                        _this.addClass('input-error');
                    }
                }, 'noAnimation');
            }
        }).keyup(function () {
            _this = $(this);
            
            if (_this.val().length >= 1 && reg.test(_this.val())){
                initCompany.removeErrorState(_this);
            }
        });
    },
    
    changeSdway : function () {
        $('select[name="sdway"]').change(function () {
            $('.sdway-message').removeClass('input-error').val('');
            initCompany.removeErrorState($(this));
            
           if($(this).children('option:selected').data('type') === 'direct'){
               $('.sdway-message').hide().removeClass('submit-required');
           }else{
               //如果是传真，则将上面的企业传真copy下来
               if ($(this).children('option:selected').data('type') === 'fax'){
                   let $faxDom = $('input[name="companyFax"]');
                   if ($faxDom.val().length >= 1 && !$faxDom.hasClass('input-error')){
                       $('.sdway-message').val($faxDom.val());
                   }
               }
               
               let brief = $(this).children('option:selected').data('brief'),
                   type = $(this).data('type');
               $('.sdway-message').attr('placeholder', '请填写' + brief).attr('data-brief', brief).attr('data-type', type).show().addClass('submit-required');
           }
        });
    },
    
    sdMessage : function () {
        let _this;
        $('input[name="sdway"]').blur(function () {
            _this = $(this);
            
            initCompany.removeErrorState(_this);
            
            if (_this.val().length < 1){
                _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>' + _this.data('brief') + '不能为空');
                _this.addClass('input-error');
            }else{
                //先确定用户选择的收单方式
                let sdway = $('select[name="sdway"]').children('option:selected').data('type'),
                    reg;
                if (sdway === 'email'){
                    reg = /^[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]\.[a-zA-Z][a-zA-Z\.]*[a-zA-Z]$/;
                }else if (sdway === 'fax'){
                    reg = /^\d{1,}$/;
                }else if (sdway === 'mobile'){
                    reg = /^[0-9]{11}$/;
                }
    
                if (!reg.test(_this.val())){
                    _this.closest('.company-item').find('.warning').html('<i class="icon-warning"></i>请填写正确格式的' + _this.attr('data-brief'));
                    _this.addClass('input-error');
                }else{
                    let
                        params = {
                            key : sdway,
                            val : _this.val()
                        };
                    $.post('/regist/check.do', params, function (data) {
                        if (data.isSucc === true){
                            let $aimdom = $('input[name="' + sdway + '"]');
                            $aimdom.val(_this.val());
                            initCompany.removeErrorState($aimdom);
                        }
                    }, 'noAnimation');
                }
                
            }
        });
    },
    
    selectSdweek : function () {
        $('.sdweek').click(function () {
           $(this).hasClass('selected') ? $(this).removeClass('selected') : $(this).addClass('selected');
            if ($('.sdweek.selected').length >= 1){
                initCompany.removeErrorState($(this));
            }else{
                $(this).closest('.company-item').find('.warning').html('<i class="icon-warning"></i>收单适用星期不能为空');
            }
        });
    },
    
    removeErrorState : function (_this) {
        _this.closest('.company-item').find('.warning').html('');
        _this.removeClass('input-error');
    }
}



module.exports = {
    run : function () {
        //初始化国家省份城市选择
        initArea.initCountry("70007", countryObj);
        initArea.initState("70007",'', provinceObj);
        initArea.initCity('','', cityObj);
        
        //公司名称、公司地址
        initCompany.checkCompanyName();
        
        //企业所在地
        initCompany.changeCountry();
        initCompany.changeProvince();
        
        //城市
        initCompany.changeCity();
        
        //企业电话、企业传真
        initCompany.checkCompanyPhone();
        
        //企业传真
        initCompany.checkCompanyFax();
        
        //收单方式
        initCompany.changeSdway();
        
        //收单联系方式
        initCompany.sdMessage();
        
        //收单星期
        initCompany.selectSdweek();
        
    }
}