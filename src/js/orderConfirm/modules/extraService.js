const
	
	//加早模块
	addBreakfast = require('./addBreakfast.js'),
	
	//加床模块
	addBed = require('./addBed.js'),
	
	//加宽带模块
	addNetwork = require('./addNetwork.js'),
	
	//引入入住信息结构
	guestMsg = require('../templates/guestMessage.ejs'),

	// 引入小礼包信息结构
	marketingMsg = require('../templates/marketing.ejs'),
	
	getNationalMsg = require('./sendRequest.js').getNationalMsg,
	
	//跳转到指定页面的函数
	changeToPage = require('./commonTools.js').changeToPage,
	
	Util = require('../../../common/util.js'),
    
    mySelect = require('../../../common/select/select.js');

//获取订单信息
var
	write = $.orderInfo,
	
	//定义每次操作的id以及总加床数
	count = 0,
	
	//存储用户每天加床、加宽带的数目
	totalBedNum = {},
	totalNetNum = {};

/*
* 将日期以yyyy-mm-hh格式逐一递增的函数
* startify 标准格式的日期
* dayCount 要增加的天数(间接决定循环的次数）
* doEveryLoop 每次循环要执行的函数
* */
function addOneDay(startify, dayCount, doEveryLoop) {
	for (var i = 0; i < dayCount; i++) {
		var startDay = new Date((startify / 1000 + i * 86400) * 1000);
		
		var year = startDay.getFullYear();
		var month = startDay.getMonth() + 1;
		month = '' + month;
		var date = startDay.getDate();
		date = '' + date;
		if (month.length == 1) {
			month = '0' + month;
		}
		if (date.length == 1) {
			date = '0' + date;
		}
		var everyDate = year + '-' + month + '-' + date;
		
		doEveryLoop(everyDate);
	}
}

//用户展开加早或加床等列表后，点击“+”在其下方出现增加的条目信息
function addItem(){
	$(document).delegate('.add-msg-option .add-item', 'click', function () {
		//先清除上一次的数据
		var itemMsg = {};
		
		//判断用户点击的是加床还是加早餐
		itemMsg.addCategory = $(this).attr('add-category');
		itemMsg.addNum = $(this).siblings().children('.add-num').val();
		
		//如果添加类型为加早，先验证用户输入的是否为整数及大于0的数
		if (itemMsg.addCategory == 'add-breakfast') {
			var isInt = /^[0-9]*[1-9][0-9]*$/;
			if (!(+itemMsg.addNum > 0) || !isInt.test(itemMsg.addNum)) {
				$(this).siblings().children('.breakfast-num').val('');
				layer.alert('加早数量必须为正整数');
				return;
			}
		}
		
		//获取用户输入或选择的信息
		itemMsg.startDate = $(this).siblings().children('.start-date').val();
		itemMsg.endDate = $(this).siblings().children('.end-date').val();
		
		itemMsg.startify = new Date(itemMsg.startDate);
		itemMsg.endify = new Date(itemMsg.endDate);
		
		var millisecond = itemMsg.endify - itemMsg.startify;//天数*24*60*60*1000=millisecond
		itemMsg.dayCount = millisecond / 86400000;
		
		itemMsg.addType = $(this).attr('add-type') || $(this).siblings().children('select').val();
		itemMsg.ofType = $(this).parent().find('option:selected').attr('ofType');
		
		//先获取用户选择的加早、加床、加宽带信息
		var priceMsg = $(this).attr('data-str');
		//将信息解码
		priceMsg = decodeURI(priceMsg, true);
		priceMsg = window.JSON.parse(priceMsg);
		itemMsg.addPrice = {};
		//遍历信息并与获取的信息作比对，得到价格
		addOneDay(itemMsg.startify, itemMsg.dayCount, function (everyDay) {
			for (var i = 0; i < priceMsg.length; i++) {
				for (var j = 0; j < priceMsg[i].length; j++) {
					if (priceMsg[i][j].date.split(' ')[0] == everyDay && priceMsg[i][j].name == itemMsg.addType) {
						itemMsg.addPrice[everyDay] = Number(priceMsg[i][j].price);
					} else if (priceMsg[i][j].date.split(' ')[0] == everyDay && itemMsg.addType == '宽带') {
						itemMsg.addPrice[everyDay] = Number(priceMsg[i][j].price);
					}
				}
			}
		});
		itemMsg.totalPrice = 0;
		for (var k in itemMsg.addPrice) {
			itemMsg.totalPrice += itemMsg.addPrice[k];
		}
		itemMsg.singleTotal = itemMsg.addNum * itemMsg.totalPrice;
		itemMsg.$this = $(this);
		itemMsg.addBedTotal = itemMsg.$this.attr('addBedTotal');
		
		addItemBot(itemMsg);
	})
}

//用户展开加早或加床等列表后，点击“+”在其下方出现增加的条目信息
/*
* itemMsg.startDate 用户所加商品的开始日期
* itemMsg.endDate 用户所加商品的结束日期
* itemMsg.addType 用户所加商品的类型
* itemMsg.addNum 用户所加商品的数目
* itemMsg.dayCount 用户所加商品的天数
* itemMsg.singleTotal 添加操作下单条增添信息的总价
* itemMsg.addId 每次增添附带的id，作为每次增添操作的唯一标识符
* itemMsg.$this 触发当前事件的元素
* itemMsg.addPrice 每次增添操作的商品的单价
* itemMsg.startify 用户所加商品的开始日期的标准格式
* itemMsg.endify 用户所加商品的结束日期的标准格式
*/
function addItemBot(itemMsg) {
	//用一个数记录超过最大加床数的天数，如果这个天数大于0 ，则不添加任何元素到下面和右边
	var
		overMaxBed = 0,
		overMaxNet = 0,
		//用一个数组记录每一个超过最大加床数的日期
		overMaxBedArr = [],
		overMaxNetArr = [];
	
	//判断用户此次操作是加床还是加宽带或者加早
	if (itemMsg.addCategory == 'add-breakfast') {
		//如果是早餐则直接添加
		optionAddBot(itemMsg);
	} else {
		if (itemMsg.addCategory == 'add-bed') {
			itemMsg.totalOption = totalBedNum;
			itemMsg.optionMax = itemMsg.addBedTotal;
			itemMsg.overOptionMax = overMaxBed;
			itemMsg.overMaxArr = overMaxBedArr;
			itemMsg.optionType = 'bed';
			addHistory(itemMsg);
		} else {
			itemMsg.totalOption = totalNetNum;
			itemMsg.optionMax = +$('#room-num').val();
			itemMsg.overOptionMax = overMaxNet;
			itemMsg.overMaxArr = overMaxNetArr;
			itemMsg.optionType = 'net';
			addHistory(itemMsg);
		}
	}
}

//用户每次操作都进行相应总数的增减及判断是否超过最大添加数
function addHistory(itemMsg) {
	//将加床数统计到totalBedNum中
	addOneDay(itemMsg.startify, itemMsg.dayCount, function (everyDay) {
		itemMsg.totalOption[everyDay] += Number(itemMsg.addNum);
		//判断添加数是否超过当日最大添加数
		if (itemMsg.totalOption[everyDay] > itemMsg.optionMax) {
			itemMsg.overOptionMax++;
			itemMsg.overMaxArr[itemMsg.overMaxArr.length] = everyDay;
		}
	});
	
	//只要有其中一个日期超过，则全部减回，并弹出提示框
	if (itemMsg.overOptionMax > 0) {
		addOneDay(itemMsg.startify, itemMsg.dayCount, function (everyDay) {
			itemMsg.totalOption[everyDay] -= Number(itemMsg.addNum);
		});
		if (itemMsg.optionType == 'bed') {
			layer.alert(itemMsg.overMaxArr[0] + '已达最大加床数');
		} else {
			layer.alert(itemMsg.startDate + '最多加' + +$('#room-num').val() + '间房的宽带数');
		}
	}
	
	//所有日期的加床数均未超过最大加床数时，则正常添加
	if (itemMsg.overOptionMax <= 0) {
		optionAddBot(itemMsg);
	}
}

//单独抽离出一个函数用于向下方添加结构的操作
function optionAddBot(itemMsg) {
	count++;
	//引入用于添加到选项下面的结构
	var finalStr = require('../templates/extraServiceBotItem.ejs');
	
	itemMsg.count = count;
	//将数据替换到模板中
	finalStr = finalStr(itemMsg);
	
	var addId,
		$finalStr = $(finalStr);
	
	//给用户删除单条加床、加早信息的元素绑定事件
	//用户点击删除按钮时，删除当前条
	$finalStr.on('click', '.del-msg-item', function () {
		$(this).parent().parent().detach();
		
		//更新右边的条数
		addId = $(this).attr('add-id');
		
		//确定要删的内容属于加床、加早还是加宽带
		itemMsg.addCategory = $(this).attr('add-category');
		//确定删除的起始日期及天数
		itemMsg.delSatrtDate = $(this).attr('add-start');
		itemMsg.delDayCount = $(this).attr('add-count');
		//确定删除的份数
		itemMsg.delNum = +$(this).attr('add-num');
		
		delAddItem(addId, itemMsg);
	});
	
	itemMsg.$this.parent().parent().append($finalStr);
	itemMsg.addId = count;
	
	addItemRight(itemMsg);
}

//用户展开加早或加床等列表后，点击“+”在右方"您的选择"中出现增加的条目信息
function addItemRight(itemMsg) {
	//用于添加到页面右边合集部分的结构
	var hotelStr = "";
	
	addOneDay(itemMsg.startify, itemMsg.dayCount, function (everyDay) {
		if (itemMsg.addPrice[everyDay]) {
			//加载增加单条加床、加早时右边添加的结构
			var rightStr = require('../templates/extraServiceRightItem.ejs');
			itemMsg.everyDate = everyDay;
			//将数据替换进模板
			hotelStr += rightStr(itemMsg);
		} else {
			// alert(everyDay + '没有该类型早餐');
		}
	});
	var $hotelStr = $(hotelStr);
	//将结构添加到右边对应的项目下
	$('.hotel-msg-mid ul').show()
		.find('li[add-category="' + itemMsg.addCategory + '"]')
		.show()
		.find('div[add-category="' + itemMsg.addCategory + '"]')
		.append($hotelStr);
	
	//更新用户所需支付的总费用
	updateTotal();
}

//删除对应加床或加早信息
function delAddItem(addId, itemMsg) {
	//判断用户删除的是否为加床或加宽带信息
	if (itemMsg.addCategory != 'add-breakfast') {
		if (itemMsg.addCategory == 'add-bed') {
			var totalOptionNum = totalBedNum;
		}
		if (itemMsg.addCategory == 'add-network') {
			var totalOptionNum = totalNetNum;
		}
		//更新总加床数
		var delStartDate = new Date(itemMsg.delSatrtDate);
		addOneDay(delStartDate, itemMsg.delDayCount, function (everyDay) {
			totalOptionNum[everyDay] -= itemMsg.delNum;
		});
	}
	
	$('*[add-id="' + addId + '"]').remove();
	
	if ($('.hotel-msg-mid ul li').find('div[add-category="' + itemMsg.addCategory + '"]').children('.hotel-item').length == 0) {
		
		$('.hotel-msg-mid ul').find('li[add-category="' + itemMsg.addCategory + '"]')
			.hide();
		
		if ($('.hotel-item').length == 0) {
			$('.hotel-msg-mid ul').hide();
		}
	}
	//更新用户需要支付的总价格
	updateTotal();
}

//初始化国籍点击事件，然后设置选中的国籍
function initClickEventForNational() {
	$('.main').on('click', '.national-single-result', function (e) {
		//将国家的id也赋值给input标签
		var countryId = $(e.target).attr('data-cid');
		$(this).closest('.nation-box').find('.nationality-msg').attr('data-cid', countryId)
			.val($(this).text());
		
		// 发送可用市场验证
		sendProperMarket($(this), countryId);
		
		//将遮罩层的父元素列表隐藏
		$(this).closest('.national-result-wrap').hide();
	});
}

//初始化国籍遮罩层点击事件
function initClickEventForNationalMask() {
	//用户点击遮罩层时，获取输入框中的countryId
	$('.main').on('click', '.national-result-mask', function (e) {
		//对用户输入的内容作验证
		//获取用户输入的内容
		var countryId = $(this).closest('.nation-box').find('.nationality-msg').attr('data-cid');
		
		if (countryId) {
			//发送验证请求
			sendProperMarket($(this), countryId);
		} else {
			var isAlertMsg = $(this).attr('isAlertMsg');
			
			//直接隐藏遮罩层，并清空对应国家输入框内的内容
			hideNationalMask($(this));
			
			if (isAlertMsg == 'true') {
				//提示用户输入正确的国籍
				layer.msg('请输入正确的国籍');
			}
		}
		
		//将遮罩层的父元素列表隐藏
		$(this).closest('.national-result-wrap').hide();
	});
}

//根据关键字，查找国籍
function getCountries(_this) {
	
	//取得用户输入的值并作为key发送请求
	var inputMsg = $.trim(_this.val());
	
	//当用户输入的内容为空时，隐藏结果显示框
	if (!inputMsg) {
		_this.closest('.national-result-wrap').hide();
		return;
	}
	
	//获取一个临时时间戳
	var tmpTimeStamp = new Date().getTime();
	
	//和全局的一个时间戳对比，如果临时时间戳比全局存的时间戳大，则更新全局时间戳
	if (!window.timeStampKW || window.timeStampKW < tmpTimeStamp) {
		window.timeStampKW = tmpTimeStamp
	}
	
	//发送请求
	getNationalMsg(inputMsg, function (data) {
		
		// 如果ajax之前存的临时时间戳比全局时间戳小，则说明这是一个较早的查询，而且花了比较长的时间，比后面的查询还要晚的返回了结果，
		// 有覆盖后来查询结果的风险，所以直接return，不让它执行函数体
		if (window.timeStampKW > tmpTimeStamp) {
			return;
		}
		
		var countries = "";
		for (var i = 0; i < data.list.length && i < 10; i++) {
			if ($.trim(inputMsg) === data.list[i].name.split("-")[1]) {
				_this.attr('data-cid', data.list[i].countryid)
			}
			countries +=
				'<li class="national-single-result" ' + 'data-cid="' + data.list[i].countryid + '">' +
				data.list[i].name.split("-")[1] +
				'</li>';
		}
		
		_this.parent().find('.search-result').html(countries)
			.closest('.national-result-wrap').show();
	});
}

//用户在护照国籍框输入内容时，展示搜索结果
function openSearchNationalResult() {
	$('.main').on('keyup input paste', '.nationality-msg', function (e) {
		//先将isAlertMsg该回true
		$('.national-result-mask').attr('isAlertMsg', true);
		
		//先把已绑定的data-cid清空
		$(this).attr('data-cid', '');
		//getCountries( $(this) );
		Util.throttle(getCountries, $(this));
	});
	
	//初始化国籍点击事件，然后设置选中的国籍
	initClickEventForNational();
	
	//初始化国籍遮罩层点击事件
	initClickEventForNationalMask();
}

function sendProperMarket(_this, countryId) {
	const isProperMarket = require('./sendRequest.js').isProperMarket;
	isProperMarket(countryId, function (data) {
		if (data.inProperMarket) {
			if (_this.attr('isAlertMsg') == 'false') {
			} else {
				layer.msg('当前价格不适于该国籍客人，请联系捷旅客服后下单，电话33397777');
			}
			hideNationalMask(_this);
		}
	})
}

//隐藏国家关键字的遮罩层，并清空对应国籍输入框的内容
function hideNationalMask(_this) {
	//隐藏wrap层
	_this.closest('.national-result-wrap').hide();
	//清空用户输入的内容
	_this.closest('.nation-box').find('.nationality-msg').val('');
	//清空国家id
	$(this).attr('data-cid', '');
}

//更新用户需要支付的总价格
function updateTotal() {
	//更新用户需要支付的总价格
	var roomCost = Number($('#roomCost').text());
	
	// var extraPay = 0;
	var extraPay = +$('#extraCost').data('extrafees');
	for (var i = 0; i < $('.line-total').length; i++) {
		extraPay += Number($('.line-total').eq(i).html());
	}
	var totalPay = roomCost + extraPay;
	
	//更新用户所需支付的总费用
	$('#extraCost').text(extraPay);
	$('#totalPay').text(totalPay);
	
	
	//用户使用预收款的阈值发生改变,需要重新设定,所以直接清空预付款
	if($('#usePerPayment').length){//非单结客户将没有这个dom元素
		$('#usePerPayment').val('');
		$('#usePerPayment').rules('remove','max');
		$('#usePerPayment').valid(false);
	}
}

//用户点击+房间或-房间时，更改对应可增加的床数
function changeRoomNum() {
	// if (write.content.isChangeNum == true) {
	// 	$('.reduce').click(function () {
	// 		//发送请求
	// 		resendRequest(false, write);
	// 	});
	//
	// 	$('.increase').click(function () {
	// 		//发送请求
	// 		resendRequest(true, write);
	// 	});
	// }
	
	$(document).delegate('.room-num', 'mousedown', function () {
		let roomNumArr = [],
			stock = $(this).data('stock');
		for (let i = 0; i < stock; i++) {
			roomNumArr.push({
				text : (i + 1) + '间',
				value : (i + 1),
			});
		}
        mySelect({
            options: roomNumArr,
	        fn     : function (value) {
            	//设置roomNum隐藏域的值为当前用户所选房间数
		        $('input[name="roomNum"]').attr('value', value);
                //发送请求
                resendRequest(value);
            }
        });
    })
}

//进行入住人国籍适用市场验证
function checkProperMarket() {
	//不用提示用户该酒店不适合中国国籍
	$('.national-result-mask').attr('isAlertMsg', false);
	$('.national-result-mask').trigger('click');
}

function resendRequest(roomNum) {
	//引入用于获取页面主要数据的请求函数
	const getInitData = require('./sendRequest.js').getInitData;
	
	//请求页面中用于显示信息的数据
	// var roomNum = Number($('#room-num').val());
	// var maxRoomNum = write.content.stock > 7 ? 7 : write.content.stock;
	// if (isIncrease) {
	// 	roomNum++;
	// 	if (roomNum > maxRoomNum) {
	// 		alert('该房型最多预订' + maxRoomNum + '间');
	// 		return;
	// 	}
	// } else {
	// 	roomNum--;
	// 	if (roomNum < 1) {
	// 		return;
	// 	}
	// }
	// $('#room-num').val(roomNum);
	
	getInitData(function (writeData) {
		
		
		if (writeData.success == true) {
            //如果请求成功，先判断content有没有报错信息
            if (writeData.content.errorMsg) {
                //如果有报错信息，则提示用户，并关掉当前页面，回到前一个页面
                alert(writeData.content.errorMsg,{closeBtn: 0}, function () {
                    changeToPage();
                });
            }else if (writeData.content.hasOwnProperty('isAveragePriceRMBChange') && writeData.content.isAveragePriceRMBChange === 1){
                let priceChange = layer.confirm(
                    '最新价格为：￥' + writeData.content.payTotalMoney + '，是否需要继续预订？',
                    function () {
                        layer.close(priceChange);
                    },
                    function () {
                        changeToPage();
                    }
                );
            }
			
			
			writeData.content.paymentTermName = ["客人前台现付", '单结', '周结', '半月结', '月结', '不固定', '三日结', '十日结', '额度结'];
			
			//将isHasMarketing信息带入
			if($('#isHasMarketing').val()){
				writeData.content.isHasMarketing = +($('#isHasMarketing').val() || 0);
			}else{
				writeData.content.isHasMarketing = 0;
			}
			
			//对全局的write重新赋值
			$.orderInfo = writeData;
			
			write = $.orderInfo;
			
			//更改房费和服务费
			$('#roomCost').text(write.content.payTotalMoney - write.content.taxesAndFeesRMB);
			$('#extraCost').text(write.content.taxesAndFeesRMB).data('extrafees',write.content.taxesAndFeesRMB);
			
			//更改销售税和额外税
			if (write.content.hasOwnProperty('isExpediaSupplier') && write.content.isExpediaSupplier === 1){
				$('#saleTax').text('（已包含的销售税：' + write.content.hotelPrice.salesTaxRMB + '）');
				
				if ($('#totalExtraFeesDesc').length > 0 && write.content.hotelPrice.hasOwnProperty('extraTaxesAndFeesDesc')){
					//之前有，现在也有
					$('#totalExtraFeesDesc').text('*上述报价不包含' + write.content.hotelPrice.extraTaxesAndFeesDesc + '到酒店后另外支付给酒店（因汇率问题可能存在波动）');
				}else{
					if ($('#totalExtraFeesDesc').length > 0){
						//之前有，现在没有
						$('#totalExtraFeesDesc').empty();
					}else if (write.content.hotelPrice.hasOwnProperty('extraTaxesAndFeesDesc')){
						//之前没有，现在有
						$('.hotel-msg-bot>ul').append('<li class="small-lh">*上述报价不包含' + write.content.hotelPrice.extraTaxesAndFeesDesc + '到酒店后另外支付给酒店（因汇率问题可能存在波动）</li>');
					}
				}
			}
			
			reloadAddItem(write);
		} else {
			alert(writeData.errinfo,{closeBtn: 0},function () {
				changeToPage();
			});
		}
	}, roomNum);
}

//用户改变房间数时，需要清除及重新加载对应的加床加早加宽带信息
function reloadAddItem(write) {
	//先清除上一个加床、加早、加宽带和住客信息
	$('.need-reload-box').empty();
	
	//重新加载这几个模块
	addBed();
	addBreakfast();
	addNetwork();
	
	//再将入住信息及小礼包信息替换好并添加进页面中
	var guestMsgStr = guestMsg(write);
	
	$('.guest-msg-box').empty().append(guestMsgStr);
	
	if(Util.queryString('isHasMarketing') == 1 && write.content.marketingObj.isPack == 1){
		//将小礼包信息填充到入住信息中
		var marketingMsgStr = marketingMsg(write);
		$('.stay-msg').append(marketingMsgStr);
	}
	
	//进行入住人国籍适用市场验证
	checkProperMarket();
	
	//用户填写了姓或名或护照任何一个时，同一栏的其他信息也必填
	const validateTheSame = require('./initActive.js').validateTheSame;
	validateTheSame();
	
	//清除右边的所有加床、加早、加宽带信息
	$('.hotel-msg-mid ul li .hotel-item-box').empty()
		.closest('.hotel-msg').hide()
		.parent().hide();
	
	//更新存储用户每天加床的数目
	var addBedStart = new Date(write.content.startDate);
	addOneDay(addBedStart, write.content.dateNum, function (everyDay) {
		totalBedNum[everyDay] = 0;
		totalNetNum[everyDay] = 0;
	});
	
	//更新总加床数
	
	//更新需要付款的总额
	updateTotal();
}

module.exports = {
	run: function () {
		//存储用户每天加床、加宽带的数目
		var addBedStart = new Date(write.content.startDate);
		addOneDay(addBedStart, write.content.dateNum, function (everyDay) {
			totalBedNum[everyDay] = 0;
			totalNetNum[everyDay] = 0;
		});
		
		//用户展开加早或加床等列表后，点击“+”在其下方出现增加的条目信息
		addItem();
		
		//用户点击+房间或-房间时，更改对应可增加的床数
		changeRoomNum();
		
		//用户在护照国籍框输入内容时，展示搜索结果
		openSearchNationalResult();
	}
};