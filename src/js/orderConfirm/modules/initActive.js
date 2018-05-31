//引入日期控件模块
const selectDate = require('../../../common/selectDate/selectDate.js');

//请求静态数据
var write = $.orderInfo;

//引入加床、加早、加宽带的交互模块
const extraService = require('./extraService.js');

//引入初始化验证模块
const InitValidator = require('./initValidator.js');


//引入用户点击支付时，检查信息是否填写完整的模块
const isComplete = require('./isComplete.js');


//进行入住人国籍适用市场验证
function checkProperMarket() {
	//不用提示用户该酒店不适合中国国籍
	$('.national-result-mask').attr('isAlertMsg', false);
	$('.national-result-mask').trigger('click');
}

//鼠标移入“费用明细”时，显示具体费用明细内容，鼠标移出时，隐藏费用明细内容
function showCostDetail() {
	$('.warning-in').on('mouseover', function(){
		var _this = $(this),
		msg = 
			'<div class="cost-detail">' +
				'<h5>费用说明</h5>' +
				'<h6>在线支付订单：</h6>' +
				'<p>当您主动取消订单时，若支付渠道为：快钱、支付宝，需扣手续费千分之五，与我司公账转出费4元（金额1万以下）；微信需扣手续费千分之六。</p>' +
				'<h6>公账支付：</h6>' +
				'<p>当您主动取消订单时，若支付渠道为：我司公账（招行、建行、工行、农行、中行、兴业），需扣手续费4元（金额1万以下）。</p>' +
			'</div>';
		
		var tip = layer.tips(msg, _this, {
			time: 0, //0表示不自动关闭
			tips: [1, '#fffff3'],
			area: '450px'
		});
	
		_this.on('mouseleave', function(){
			layer.close(tip);
		});
    });
}

//用户点击加早或加床等的“+”号时展开操作列表
function openAddMsg() {
	$(document).delegate('.open-detail-msg', 'click', function () {
		var parent = $(this).closest('.need-reload-box');
		parent.find('.other-msg').hide();
		parent.find('.open-add-msg').show();
		
		//加载日期控件
		addSelectDate();
	})
}

//加载日期控件
function addSelectDate() {
	var minDate = $('.main').find('.start-date').text();
	var maxDate = $('.main').find('.end-date').text()
	
	var breakfastStart = $('.main').find('.breakfast-start');
	var breakfastEnd = $('.main').find('.breakfast-end');
	selectDate.run(1, breakfastStart, breakfastEnd, minDate, maxDate);
	
	var bedStart = $('.main').find('.bed-start');
	var bedEnd = $('.main').find('.bed-end');
	selectDate.run(1, bedStart, bedEnd, minDate, maxDate);
	
	var networkStart = $('.main').find('.network-start');
	var networkEnd = $('.main').find('.network-end');
	selectDate.run(1, networkStart, networkEnd, minDate, maxDate);
}

//用户切换确认方式时，自动将用户预留的相关信息显示在对应区域内
function changeConfirmWay() {
	$('.other-confirm-way').click(function () {
		var confirmWay = $(this).attr('confirm-way');
		var confirmId = '#' + $(this).attr('confirm-way');
		
		//先清空确认方式下所有输入框的内容并设为只读
		$('.confirm-way-msg li input').val('').siblings('i').hide();
		//再显示当前确认方式下的内容
		$('.confirm-way-msg').find(confirmId).val(write.content.distributor[confirmWay]).siblings('i').show();
		
		//更改验证规则
		$("input[name^=voucher]").each(function (i, n) {
			$(n).rules("remove", "required");
			
			if ($(n).hasClass("usingPlaceHolder")) {		//***  针对IE浏览器有placeholder的特殊情况进行特殊处理
				n.value = '';
			}
			
			$(n).focus();
			$(n).blur();
		});
		
		//给当前确认方式添加必填验证
		$(confirmId).rules("add", {required: true, messages : {
			required : $(confirmId).attr('title') + '不能为空'
		}});
	});
}

//用户填写了姓或名或护照任何一个时，同一栏的其他信息也必填
function validateTheSame() {
	$('.guest').on('keyup blur', 'input', function () {
		if ($(this).closest('.guest').find('input').val()) {
			$(this).closest('.guest').find('input').valid();
		} else {
			$(this).closest('.guest').find('input').valid(false);
		}
	})
}

//用户选择使用预收款时，数目不能小于0，不能大于需要支付的总金额，不能大于能预支付的总金额
function limitPerPayment() {
	$('#usePerPayment').keyup(function () {
		//判断用户所能预支付的最大款项
		var totalPayment = Number($('#totalPay').text());
		var maxPayment = write.content.balance > totalPayment ? totalPayment : write.content.balance;
		
		var payMent = +$(this).val();
		
		if (payMent > maxPayment) {
			$('#usePerPayment').rules('add', {max: maxPayment});
			$('#usePerPayment').valid();
		}
	})
}

//限制用户输入的客户订单号最长为64个字符
function customerCode () {
	$('input[name="customerOrderCode"]').keyup(function () {
		$(this).rules("add", {byteRangeLength: [0, 64]});
		$(this).valid();
    }).blur(function () {
		if ($.trim($(this)).length <= 0){
			$(this).rules('remove', 'byteRangeLength');
		}
    })
}


module.exports = {
	run: function () {
		//鼠标移入“费用明细”时，显示具体费用明细内容
		showCostDetail();
		
		//用户点击加早或加床等的“+”号时展开操作列表
		openAddMsg();
		
		//初始化验证
		InitValidator();
		
		validateTheSame();
		
		//引入加床、加早、加宽带的交互模块
		extraService.run();
		
		//进行入住人国籍适用市场验证
		checkProperMarket();
		
		//用户切换确认方式时，自动将用户预留的相关信息显示在对应区域内
		changeConfirmWay();
		
		//用户使用预收款时，数目不能小于0，不能大于需要支付的总金额或能预支付的总金额
		limitPerPayment();
		
		//用户点击支付时，检查信息是否填写完整
		isComplete();

		//限制用户输入的客户订单号最长为64个字符
		customerCode();
	},
	validateTheSame: validateTheSame
};
