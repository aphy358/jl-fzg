const initSubmit = {
    getData : function () {
        $('.submit').click(function () {
            let requiredGroup = $('.submit-required'),
                flag = true;
            
            requiredGroup.each(function (index, dom) {
                if ($(dom).val().length < 1){
                    flag = false;
                    $(dom).closest('.company-item').find('.warning').html('<i class="icon-warning"></i>' + $(dom).data('brief') + '不能为空');
                    $(dom).closest('.company-item').find('input').addClass('input-error');
                }else if ($(dom).hasClass('input-error')){
                    flag = false;
                }
            });
            
            
            //用户填了企业电话但格式错误时
            if ($('input[name="companyPhone"]').hasClass('input-error')){
                flag = false;
            }
            
            let weekStr = "",
                $sdweekDom = $('.sdweek.selected');
            //由于收单适用星期结构独特，所以单独判断
            if ($sdweekDom.length < 1){
                $('.sdweek').closest('.company-item').find('.warning').html('<i class="icon-warning"></i>适用星期不能为空');
                flag = false;
            }else{
                $sdweekDom.each(function (index, dom) {
                    weekStr += String($(dom).text());
                })
            }
            
            
            if ($('select#country').val() === '-1' || $('select#province').val() === '-1' || $('select#city').val() === '-1'){
                $('select#country').closest('.company-item').find('.warning').html('<i class="icon-warning"></i>国家、省份、城市信息均为必填');
                flag = false;
            }
            
            
            if (flag === true){
                let params = {
                    "registercountry"    : $("#country").val(),
                    "registerProvince"   : $("#province").val(),
                    "registerCity"       : $("#city").val(),
                    "registerCompanyName": $.trim($("input[name='companyName']").val()),
                    "registerAccount"    : $("input[name='customerName']").val(),
                    "registerAddress"    : $.trim($("input[name='companyAddress']").val()),
                    "registerName"       : $("input[name='userName']").val(),
                    "registerEmail"      : $("input[name='email']").val(),
                    "registerMobile"     : $("input[name='mobile']").val(),
                    "registerTel"        : $("input[name='companyPhone']").val(),
                    "registerFax"        : $("input[name='companyFax']").val(),
                    "registerReference"  : $("input[name='recommendMessage']").val(),
                    "confirmStart"       : $("select[name='starttime']").val(),
                    "confirmEnd"         : $("select[name='endtime']").val(),
                    "confirmWeek"        : weekStr,
                    "confirmType"        : $("select[name='sdway']").val(),
                    "confirmWay"         : $("input[name='sdway']").val() || "0",
                    "registerPassWord"   : $("input[name='password']").val(),
                    "vcode"              : $("input[name='vcode']").val()
                };
    
                $.post('/regist/save.do', params, function(data){
                    //更换验证码
                    $('.yzm-img').trigger('click');
                    $('input[name="vcode"]').val('');
                    
                    if(data.isSucc === true){
                        let successStr = require('../templates/success.ejs');
                        $('.main-box').html(successStr);
                    }else{
                        alert(data.msg);
                    }
                });
            }else{
                //将页面滚动到第一个报错的位置
                $('html').animate({
                    scrollTop: ($('.icon-warning')[0].offsetTop - 80) + "px"
                }, 200);
            }
        })
    }
};


module.exports = {
    run : function () {
        initSubmit.getData();
    }
}