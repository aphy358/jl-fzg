
const
    // 引入公共函数
    Util = require('../../../common/util'),

    // 引入订单页面主模板
    orderMain = require('../templates/orderMain.ejs'),

    // 引入入住信息结构
    guestMsg = require('../templates/guestMessage.ejs'),
    
    // 引入小礼包信息结构
    marketingMsg = require('../templates/marketing.ejs'),

    // 分别引入加床、加早、加宽模块
    addBreakfast = require('./addBreakfast.js'),
    addBed = require('./addBed.js'),
    addNetwork = require('./addNetwork.js'),

    // 验价请求
    isHotelOnline = require('./sendRequest.js').isHotelOnline,

    // 获取初始化信息
    getInitData = require('./sendRequest.js').getInitData,

    //跳转到指定页面的函数
    changeToPage = require('./commonTools.js').changeToPage,

    // 关闭窗口的函数（兼容各个浏览器）
    CloseWebPage = require('./commonTools.js').CloseWebPage;



// 开始初始化页面（先判断酒店是否在线）
function initPage() {
    isHotelOnline(function (res) {

        if (typeof res === 'string') {
            res = window.JSON.parse(res);
        }

        if (res.success) {
            //如果有错误信息，则提示用户
            if (res.content.result != 'success') {
                //将标识的值变为false，表示有错误信息
                $.validateIsComplete = 'false';
                alert(res.content.errinfo, { closeBtn: 0 }, function () {
                    //跳转到指定页面
                    changeToPage();
                    return;
                });
            } else {
                //将标识的值变为true，表示有错误信息
                $.validateIsComplete = 'true';
            }

        } else {
            //用户登录状态已丢失时，提示用户
            if (res.errcode == 'notLogin') {
                //将标识的值变为false，表示有错误信息
                $.validateIsComplete = 'false';
                alert('请先登录', { closeBtn: 0 }, function () {
                    //跳转到首页
                    location.href = '/user/bookHotel.do?';
                });
            } else {
                //将标识的值变为false，表示有错误信息
                $.validateIsComplete = 'false';
                //否则就提示用户错误信息，然后跳转到酒店详情页面
                alert(res.errinfo, { closeBtn: 0 }, function () {
                    changeToPage();
                });
            }
        }
    });
    //请求各个接口，并将返回的数据经模板处理后再填充页面（初始化页面）
    invokeAPIs();
}

// 请求各个接口，并将返回的数据经模板处理后再填充页面（初始化页面）
function invokeAPIs(initHtml) {

    // 获取订单初始信息，并填充到页面
    getOrderInitData();

    // 获取 加床、加早、加宽带 模块，并填充到页面（如果有这些模块）
    addBreakfast();
    addBed();
    addNetwork();
}


function getValidateTag(errorMsg, newPrcie) {
    var checkValidate = setInterval(function () {
        var validateIsComplete = $.validateIsComplete;

        if (validateIsComplete) {
            clearInterval(checkValidate);
            if (validateIsComplete !== 'false') {
                if (errorMsg === 'isAveragePriceRMBChange'){
                    let priceChange = layer.confirm(
                        '最新价格为：￥' + newPrcie + '，是否需要继续预订？',
                        function () {
                            layer.close(priceChange);
                        },
                        function () {
                            changeToPage();
                        }
                    );
    
                }else{
                    alert(errorMsg, { closeBtn: 0 }, function () {
                        CloseWebPage();
                    });
                }
            }
        }
    }, 100);
}


// 获取订单初始信息，并填充到页面
function getOrderInitData() {

    getInitData(function (res) {

        if (res.success == true) {
            //如果请求成功，先判断content有没有报错信息
            if (res.content.errorMsg) {
                getValidateTag(res.content.errorMsg);
                return;
            }else if (res.content.hasOwnProperty('isAveragePriceRMBChange') && res.content.isAveragePriceRMBChange === 1){
                //价格有变动时提醒客户（特殊情况（查价接口没有错误信息返回，但属于提示的一种，且不是弹出框，而是确认框））
                getValidateTag('isAveragePriceRMBChange', res.content.payTotalMoney);
            }

            //再判断酒店是否为客人前台现付方式，如果是，不让客户进入页面
            if (res.content.paymentType == 1) {
                alert('该产品已下线，请选择其他产品', { closeBtn: 0 }, function () {
                    changeToPage();
                })
            }
	
	        //将marketing信息存入$以供后续使用
            if(Util.queryString('isHasMarketing')){
	            res.content.isHasMarketing = Util.queryString('isHasMarketing');
	            // if(Util.queryString('isHasMarketing') == 1){
		        //     res.content.marketingPrice = Util.queryString('marketingPrice') || 0;
                // }
            }else{
                res.content.isHasMarketing = 0;
            }

            // 将返回结果存入全局变量，以便后续取用
            $.orderInfo = res;
            

            res.content.paymentTermName = ["客人前台现付", '单结', '周结', '半月结', '月结', '不固定', '三日结', '十日结', '额度结'];

            // 先用一些初始化的数据填充页面
            $('.main').html(orderMain(res.content));

            // 再将入住人信息填充到页面中
            $('.guest-msg-box').html(guestMsg(res));
            
            if(Util.queryString('isHasMarketing') == 1 && res.content.marketingObj.isPack == 1){
	            //将小礼包信息填充到入住信息中
	            $('.stay-msg').append(marketingMsg(res));
            }

            // 异步加载插件（验证插件、日期插件），这个过程依赖 $.orderInfo
            loadScriptsAsync();
        } else {
            getValidateTag(res.errinfo);
        }
    });
}


// 异步加载插件（验证插件、日期插件）
function loadScriptsAsync() {

    // IE9以下和IE9以上的浏览器采用不同方式加载插件（日期控件、验证控件）
    if (Util.ltIE9()) {

        // 引入页面主交互逻辑
        const initActive = require('./initActive.js').run;

        Util.loadAsync(
            [
                '../../webpacked/static/js/datePick/datepickPacked.js',
                '../../webpacked/static/js/validator/validatorPacked.js'
            ],
            initActive
        );

    } else {

        require.ensure([], function () {

            // 引入页面主交互逻辑
            const initActive = require('./initActive.js').run;

            require('../../../static/js/datePick/datepickPacked');
            require('../../../static/js/validator/validatorPacked');

            initActive();

        }, 'validator');
    }
}



module.exports = {
    run: initPage
};
