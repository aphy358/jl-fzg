const queryString = require('../../../common/util.js').queryString;

const qrcopde = require('./jquery.qrcode.min.js');

const loginBox = require('../../../common/loginBox/loginBox.js');

function getQRcode () {
    const params = {
        orderId : queryString('orderId'),
        out_trade_no : queryString('out_trade_no'),
        total_fee :queryString('total_fee')
    };
    
    
    $.post('/pay/wx/wxPayStart.do', params, function (data) {
        dealData(data, function () {
            if (data.data.code_url){
                let qrcode_text= data.data.code_url;
                $('.wechat-pay-erweima').qrcode({correctLevel: 0, text: qrcode_text });
                
                $('.order-code').text('订单编号：' + data.data.orderInfo.parentOrderCode);
                $('.order-date').text('预订日期：' + data.data.orderInfo.createTime);
                $('.total-money').text('￥' + data.data.orderInfo.salePrice);
            }else{
                alert(data.returnMsg);
            }
        });
    }, 'noAnimation');
}

function checkPay () {
    let checkTimer = setInterval(function () {
        let params = {
            orderId : queryString('orderId')
        };
        $.post('/pay/wx/isWxPayOk.do', params, function (data) {
            dealData(data, function () {
                if (data.data === 1){
                    clearInterval(checkTimer);
                    
                    $('.wechat-pay-erweima').remove();
                    $('.erweima-means').remove();
                    let str = `<p class="pay-success"><i></i>支付成功</p>
                                <button class="pay-success-yes">确定</button>`;
                    $('.erweima-box').append(str);
                    $('body').delegate('.pay-success-yes', 'click', function () {
                        location.href = '/myinfo/findOrderDetail.do?orderId=' + params.orderId;
                    });
                }
            });
        }, 'noAnimation');
    },2000);
}

function dealData (data, fn) {
    if (data.returnCode === -400001){
        alert(data.returnMsg, function () {
            loginBox();
        })
    }else if (data.returnCode === -3){
        alert(data.returnMsg, function () {
            location.href = '/myinfo/findOrderDetail.do?orderId=' + params.orderId;
        })
    }else if (data.returnCode === 1){
        fn && fn();
    }else{
        alert(data.returnMsg);
    }
}


module.exports = {
    run : function () {
        getQRcode();
        
        checkPay();
    }
}