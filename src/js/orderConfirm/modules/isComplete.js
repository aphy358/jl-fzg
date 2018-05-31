const
	
	//加载确认订单信息的模板
	confirmOrderMsg = require('../templates/confirmOrderMsg.ejs'),
	
	//跳转到指定页面的函数
	changeToPage = require('./commonTools.js').changeToPage,
	
	// 关闭窗口的函数（兼容各个浏览器）
	CloseWebPage = require('./commonTools.js').CloseWebPage;

//用户点击支付时，检查信息是否填写完整
function isComplete() {
	//因为其他地方都是预先填好的，用户只能改不能删，所以只需要验证入住信息与验证方式非在线验证时信息是否为空
	$('#nextToPay').click(function () {
				//******** 提交表单之前进行验证
				if (!$("#orderForm").myValid()) {
					//将页面回滚到第一个验证不通过的地方
					//获取第一个验证不通过的元素的位置
					var failedTest = $('.error')[0].offsetTop - 80;
					
					$('body, html').animate({
						scrollTop: failedTest + "px"
					}, 200);
					
					return;
				} else {
					//验证通过则将页面中信息取出，替换到确认信息框中
					alertConfirmMsg();
				}
			}
	)
}

function alertConfirmMsg() {
	//取得form表单的数据
	var formData = $('form').serialize();
	//处理该数据
	var formify = formData.split('&');
	var formObj = {};
	for (var i = 0; i < formify.length; i++) {
		var formSingle = formify[i].split('=');
		formObj[formSingle[0]] = decodeURIComponent(formSingle[1]);
	}
	//hotelPrice相关
	formObj['roomName'] = $.orderInfo.content.hotelPrice.roomName;
	formObj['breakFastName'] =$.orderInfo.content.hotelPrice.breakFastName;
	formObj['cancellationDesc'] = $.orderInfo.content.hotelPrice.cancellationDesc;
	//将加床、加早、加宽带信息加入到formObj中
	formObj['breakfastNum'] = 0;
	formObj['bedNum'] = 0;
	formObj['networkNum'] = 0;
	var addBreakFastMsg = $('.hotel-breakfast-box .hotel-item .hotel-item-left');
	var addBreakFastNum = $('.hotel-breakfast-box .hotel-item .hotel-item-left .hotel-add-num');
	for (var breakfast = 0; breakfast < addBreakFastNum.length; breakfast++) {
		formObj['breakfastNum'] += +($(addBreakFastNum[breakfast]).text());
	}
	
	//酒店名
	formObj['hotelName'] = formObj['hotelName'].replace(/\+/g, ' ');
	
	var addBedMsg = $('.hotel-bed-box .hotel-item .hotel-item-left');
	var addBedNum = $('.hotel-bed-box .hotel-item .hotel-item-left .hotel-add-num');
	for (var bed = 0; bed < addBedNum.length; bed++) {
		formObj['bedNum'] += +($(addBedNum[bed]).text());
	}
	
	var addNetworkMsg = $('.hotel-network-box .hotel-item .hotel-item-left');
	var addNetworkNum = $('.hotel-network-box .hotel-item .hotel-item-left .hotel-add-num');
	for (var network = 0; network < addNetworkNum.length; network++) {
		formObj['networkNum'] += +($(addNetworkNum[network]).text());
	}
	
	formObj['addBreakfastMsg'] = addBreakFastMsg.eq(0).text();
	formObj['addBedMsg'] = addBedMsg.eq(0).text();
	formObj['addNetworkMsg'] = addNetworkMsg.eq(0).text();
	for (var j = 1; j < addBreakFastMsg.length; j++) {
		formObj['addBreakfastMsg'] += ';' + addBreakFastMsg.eq(j).text();
	}
	for (var y = 1; y < addBedMsg.length; y++) {
		formObj['addBedMsg'] += ';' + addBedMsg.eq(y).text();
	}
	for (var z = 1; z < addNetworkMsg.length; z++) {
		formObj['addNetworkMsg'] += ';' + addNetworkMsg.eq(z).text();
	}
	
	//个性化要求信息
	formObj['specialReq'] =
			decodeURIComponent($("input[name='specialReq']:checked").serialize());
	
	//用户预付款
	formObj['willUsedBalance'] = Math.round($('#usePerPayment').val()*100)/100;
	
	if (isNaN(formObj['willUsedBalance'])) {
		formObj['willUsedBalance'] = 0;
	}
	
	//用户支付总价（用于显示给用户看）
	formObj['userTotalPay'] = Math.round($('#totalPay').text()*100)/100;
	//用户除去预付款之后需支付的总价
	formObj['userNeedPay'] = Math.round((formObj['userTotalPay'] - formObj['willUsedBalance'])*100)/100;
	
	//用户总房费
	formObj['payTotalMoney'] = $.orderInfo.content.payTotalMoney;
	//修改底价
	formObj['toatlBasePrice'] = $.orderInfo.content.toatlBasePrice;
	//totalNowPrice
	formObj['totalNowPrice'] = $.orderInfo.content.nowTotalMoney;
	
	formObj['paymentTermName'] = ["客人前台现付", '单结', '周结', '半月结', '月结', '不固定', '三日结', '十日结', '额度结'];
	
	//入住人信息
	var guestArr = [];
	var guestCollect = $('.guest');
	for (var i = 0; i < guestCollect.length; i++) {
		var surnameCollect = $(guestCollect[i]).find('.first-name');
		var afternameCollect = $(guestCollect[i]).find('.last-name');
		var nationalCollect = $(guestCollect[i]).find('.nationality-msg');
		if (surnameCollect.val().replace(/^\s+|\s+$/g, '')) {
			guestArr[guestArr.length] = {};
			if (nationalCollect) {
				//此时数组的长度已经发生变化，所以下面赋值时需-1
				guestArr[guestArr.length - 1].national = $.trim($(nationalCollect).val());
			}
			//此时数组的长度已经发生变化，所以下面赋值时需-1
			guestArr[guestArr.length - 1].surname = $.trim($(surnameCollect).val());
			guestArr[guestArr.length - 1].aftername = $.trim($(afternameCollect).val());
		}
	}
	
	formObj['guestArr'] = $(guestArr);
	
	//将获取的数据嵌入弹出的确认订单信息框中
	var confirmOrderDOM = layer.open({
		type: 1,
		title: false,
		offset: '60px',
		closeBtn: 0,
		move: '.palce-can-move',
		content: confirmOrderMsg(formObj)
	});
	
	//用户点击确认之后，隐藏确认订单信息框
	$('.confirm-order-msg').on('click', '.confirm-order', function () {
		layer.close(confirmOrderDOM);
		sendData(formObj);
	});
	//用户点击取消之后，隐藏确认订单信息框
	$('.confirm-order-msg').on('click', '.cancel-order', function () {
		layer.close(confirmOrderDOM);
	});
	
	return false;
}

//用户确认订单信息后，验价并发送数据
function sendData(formObj) {
	//进行验价
	//获取参数
	var params = $('form').serialize();
	//处理该数据
	var paramify = params.split('&');
	var paramObj = {};
	for (var i = 0; i < paramify.length; i++) {
		var paramSingle = paramify[i].split('=');
		paramObj[paramSingle[0]] = paramSingle[1];
	}
	
	//加床加早加宽带
	paramObj['surchargeBref'] = [];
	paramObj['surchargeBed'] = [];
	paramObj['surchargeInternet'] = [];
	var breakfastItem = $('.hotel-breakfast-box .hotel-item');
	var bedItem = $('.hotel-bed-box .hotel-item');
	var networkItem = $('.hotel-network-box .hotel-item');
	//将其中内容取出并放入对应属性中
	paramObj['surchargeBref'] = extraMsg(breakfastItem, paramObj['surchargeBref']);
	paramObj['surchargeBed'] = extraMsg(bedItem, paramObj['surchargeBed']);
	paramObj['surchargeInternet'] = extraMsg(networkItem, paramObj['surchargeInternet']);
	
	//酒店名
	paramObj['hotelName'] = formObj['hotelName'];
	
	//获取入住人
	paramObj['userNames'] = "";
	$.each(formObj['guestArr'], function (index, value) {
		paramObj['surname'] = $.trim(value.surname);
		paramObj['userName'] = $.trim(value.aftername);
		if (value.national) {
			paramObj['countryId'] = $.trim(value.national);
			paramObj['userNames'] += paramObj['surname'] + '#' + paramObj['userName'] + '#' + paramObj['countryId'] + ',';
		} else {
			paramObj['userNames'] += paramObj['surname'] + '#' + paramObj['userName'] + ',';
		}
	});
	paramObj['userNames'] = paramObj['userNames'].replace(/,$/, '');
	
	//用户预付款
	paramObj['willUsedBalance'] = formObj['willUsedBalance'] || 0;
	
	//用户支付总价
	paramObj['payTotalMoney'] = formObj['payTotalMoney'];
	//修改底价
	paramObj['toatlBasePrice'] = formObj['toatlBasePrice'];
	//totalNowPrice
	paramObj['totalNowPrice'] = formObj['totalNowPrice'];
	
	//特殊要求
	paramObj['specialRequire'] =
			formObj['specialReq'].split('specialReq=').join('').split('&').join(',');
	
	//childrenAgeStr
	paramObj['childrenAgeStr'] = formObj['childrenAgeStr'];
	
	//bedTypeStrs
	// var bedTypeList = $.orderInfo.content.hotelPrice.bedTypeList ?
	// 		$.orderInfo.content.hotelPrice.bedTypeList[0] : null;
	paramObj['bedTypeStrs'] = $.orderInfo.content.bedTypeStrs;
	
	//hotelPriceStrs
	var hotelPrice = $.orderInfo.content.hotelPrice ? $.orderInfo.content.hotelPrice : null;
	paramObj['hotelPriceStrs'] = window.JSON.stringify(hotelPrice);
	
	//确认方式
	paramObj['checkType'] = $('input[name=checkType]:checked').attr('checkType');
	
	//用户确认方式
	paramObj['voucherEmail'] = formObj['voucherEmail'];
	paramObj['voucherFax'] = formObj['voucherFax'];
	paramObj['voucherMobile'] = formObj['voucherMobile'];
	
	//单结或者其他结算方式
	paramObj['paymentTerm'] = formObj['paymentTermSon'];
	
	//客户订单号
	paramObj['customerOrderCode'] = $.trim(formObj['customerOrderCode'].replace(/\+/g, ' '));
	
	//是否有小礼包
	paramObj['isHasMarketing'] = $.orderInfo.content.isHasMarketing || 0;
	//小礼包的价格
	if(paramObj['isHasMarketing'] == 1){
		paramObj['marketing.marketingPrice'] = $.orderInfo.content.marketingObj.marketingPrice || 0;
		paramObj['marketing.startTime'] = $.orderInfo.content.marketingObj.startTime;
		paramObj['marketing.endTime'] = $.orderInfo.content.marketingObj.endTime;
		
		if ($.orderInfo.content.marketing.isPack === 1){
			//小礼包客户填写的信息
			paramObj['marketingRemark'] = '客户手机号码：' + formObj['marketingRemark'];
		}
	}
	
	//发送请求
	createOrder(paramObj, formObj);
}

//创建订单
function createOrder(params, formObj) {
	//验价
	const checkThePrice = require('./sendRequest.js').checkThePrice;
	checkThePrice(params, function (data) {
		
		if( typeof data === 'string' ){
			data = window.JSON.parse( data );
		}
		
		if (data.success) {
			//如果有错误信息，则提示用户
			if(data.content.result != 'success'){
				if(data.content.errtype == "sameOrder"){
					//已有重复订单情况下，提示用户
					layer.confirm(
						data.content.errinfo,
						{
							btn : ['继续下单','取消'], // 设置按钮文字
							closeBtn : 0, // 设置无关闭按钮
							btnAlign : 'c' ,// 设置按钮水平居中
							title : '重复订单' //设置标题
						},
						function () {
							saveOrder(params,formObj); // 用户点击“继续下单”，则继续下单
						},
						function (index) {
							layer.close(index); // 用户点击“取消下单”，则关闭确认框，不发送保存订单的请求
							return;
						}
					);
				}else{
					alert(data.content.errinfo,{closeBtn: 0},function () {
						//跳转到指定页面
						changeToPage();
						return;
					});
				}
			}else{
				//保存订单
				saveOrder(params,formObj);
			}
			
		} else {
			//用户登录状态已丢失时，提示用户
			if(data.errcode == 'notLogin'){
				alert('请先登录',{closeBtn : 0},function () {
					//跳转到首页
					location.href = '/user/home.do';
				});
			}else{
				//否则就提示用户错误信息，然后跳转到酒店详情页面
				alert(data.errinfo,{closeBtn : 0},function(){
					changeToPage();
				});
			}
		}
	})
}

//保存订单
function saveOrder(params,formObj) {
	//创建订单
	const saveOrder = require('./sendRequest.js').saveOrder;
	saveOrder(params, function (data) {
		//判断后台是否有错误信息返回
		if (data.returnCode != 1){
			if (data.returnCode == -400001){
				//用户未登录,跳转到首页
				alert(data.returnMsg,{closeBtn : 0},function () {
					location.href = '/user/home.do';
				});
			}else if (data.returnCode == -400207 || data.returnCode == -400201){
				//刷新页面
				alert(data.returnMsg,{closeBtn : 0},function () {
					location.reload();
				});
			}else if (data.returnCode == -400203 || data.returnCode == -400210 || data.returnCode == -400212 || data.returnCode == -400214 || data.returnCode == -400215){
				//关闭弹出框，并不做任何其他操作
				var onlyForMsg = alert(data.returnMsg,{closeBtn : 0},function () {
					layer.close(onlyForMsg);
					return;
				});
			}else if (data.returnCode == -400211 || data.returnCode == -400213 || data.returnCode == -400216){
				//跳转到详情页
				alert(data.returnMsg,{closeBtn : 0},function () {
					changeToPage();
				});
			}else{
				//关闭本页
				alert(data.returnMsg,{closeBtn : 0},function () {
					CloseWebPage();
				});
			}
			
		}else{
			//下单成功 //发送统计数据
			charts();
			var orderInfo = data.data.orderInfo;
			if (orderInfo.paymentStatus == 1 && orderInfo.paymentTerm == 0 && orderInfo.innerStatus != 4) {
				// alert('去支付宝页面'); //先判断国内还是国外
				if (formObj['country'] == 70007) {
					location.href = "/internalOrder/pay.do?orderId=" + data.data.orderId;
				} else {
					location.href = "/order/orderPay.do?orderId=" + data.data.orderId;
				}
			} else {
				// alert('订单提交成功');
				if (orderInfo.isLimitConfir && orderInfo.isLimitConfir == 1){
					location.href = "/internalOrder/orderSucc.do?orderId=" + data.data.orderId + "&subOrderCode=" + data.data.subOrderCode + "&isLimitConfir=" + orderInfo.isLimitConfir;
				}else{
					location.href = "/internalOrder/orderSucc.do?orderId=" + data.data.orderId + "&subOrderCode=" + data.data.subOrderCode;
				}
			}
		}
	})
}

function extraMsg(aimDom, resKey) {
	for (var o = 0; o < aimDom.length; o++) {
		resKey[o] = {};
		var obj = resKey[o];
		obj['date'] = $(aimDom[o]).attr('date');
		obj['count'] = $(aimDom[o]).attr('count');
		obj['type'] = $(aimDom[o]).attr('type');
		obj['name'] = $(aimDom[o]).attr('name');
	}
	return window.JSON.stringify(resKey);
}

//发送统计数据
function charts() {
	var hotelName = $("#hotelName").text();
	var distrbCode = $("#consumer").data("distrb");
	$.get("/count/record.do?" + "t=EffectiveOrder&d=" + distrbCode + "|" + hotelName);
}

module.exports = isComplete;
