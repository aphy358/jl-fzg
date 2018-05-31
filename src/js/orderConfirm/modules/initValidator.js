
function addValidateMethods(){

	// 国内允许输入中文或英文
	$.validator.addMethod("demostic", function (value, element) {
	
		value = value.replace(/^\s+|\s+$/g, '');
		var	demostic = /^([\u4e00-\u9fa5a-zA-Z]+)$/;
	
		return this.optional(element) || (demostic.test(value));
	
	}, "只能输入中文或拼音");
	
	// 新增验证方法，条件必须，满足一定条件则必须
	$.validator.addMethod("required_m", function(value, element){
		
		var holder = $(element).attr("placeholder");
		
		if( $(element).attr("data-required") === "required" ){
			return value != "" && value != holder;
		}
		
		return true;
		
	}, "请输入该信息");
	
	// 新增验证方法，依赖必须，即如果一条记录输入任何一项，则其他项也必须输入，这就叫“依赖必须”
	$.validator.addMethod("subRequired", function(value, element){
		
		value = value.replace(/^\s+|\s+$/g, "");
		var holder = $(element).attr("placeholder");
		
		if( value != "" && value != holder )	return true;
		
		var inputs = $(element).closest(".guest").find("input");
		
		for( var i = 0; i < inputs.length; i++ ){
			
			var o = inputs[i];
			
			var n_value = o.value.replace( $(o).attr("placeholder"), "" )
									.replace(/^\s+|\s+$/g, "");
			
			if( n_value != "" )
				return false;
			
		}
		
		return true;
		
	}, "请输入该信息");
	
	//新增验证方法，用户输入预付款时，最多只允许其输入小数点后两位
	$.validator.addMethod('most2pointnum',function (value, element) {
		
		var	most2pointnum = /^(\d+(.\d{1,2})?)$/;//^d*(?:.d{0,2})?$/;
		
		return this.optional(element) || (most2pointnum.test(value));
	}, "最多只允许输入小数点后两位");
    
    // 中文字三个字节
    $.validator.addMethod("byteRangeLength", function(value, element, param) {
        var length = value.length;
        for(var i = 0; i < value.length; i++){
            if(value.charCodeAt(i) > 127){
                length += 2;
            }
        }
        return this.optional(element) || ( length >= param[0] && length <= param[1] );
    }, $.validator.format("最多允许输入64位字符"));
}


	
// 初始化验证
function InitValidator() {

	if( !$.orderInfo ){
		// 100ms 轮询一次
		return setTimeout(function() {
			InitValidator()
		}, 100);
	}

	// 新增自定义的验证方法
	addValidateMethods();

	var o = {
		rules: {
			surname: {
				required_m: true,
				subRequired: true,
			},
			userName: {
				required_m: true,
				subRequired: true,
			},
            countryId: {
                required_m: true,
                subRequired: true,
            },
			voucherEmail: {
				email: true
			},
			voucherFax: {
				number: true,
				rangelength: [6, 14]
			},
			voucherMobile: {
				number: true,
				rangelength: [6, 14]
			},
			willUsedBalance: {
					number: true,
					min: 0,
					most2pointnum: true
			},
			marketingRemark: {
				required: true,
				number: true,
				rangelength: [6, 14]
			}
		},
		messages: {
			voucherEmail: {
				email: '请输入正确的邮箱地址'
			},
			voucherFax: {
				number: '请输入正确的传真号码',
				rangelength: '传真号码长度必须在6-14之间'
			},
			voucherMobile: {
				number: '请填写正确的手机号码',
				rangelength: '手机号码长度必须为6位到14位之间',
			},
			willUsedBalance: {
				number: '请输入一个数字',
				min: '请输入一个至少大于0的数字',
				max: '您的余额不足或预付款超出本次消费总金额'
			},
			marketingRemark: {
				required: '此项为必填',
				number: '请填写正确的手机号码',
				rangelength: '手机号码长度必须为6位到14位之间',
			}
		}
	};

	var o1 = {};
	if ($.orderInfo.content.staticInfo.country == 70007) {	//国内
		o1 = {
			rules: {
				surname: {
					demostic: true,
					rangelength: [1,30]
				},
				userName: {
					demostic: true,
					rangelength: [1,30]
				},
			},
			messages: {
				surname: {
					rangelength: '请输入1-30个汉字或字母'
				},
				userName: {
					rangelength: '请输入1-30个汉字或字母'
				}
			}
		};
	} else {		//国外
		o1 = {
			rules: {
				surname: {
					letter: true,
					rangelength: [1,30]
				},
				userName: {
					letter: true,
					rangelength: [1,30]
				},
			},
			messages: {
				surname: {
					letter: '请输入英文或拼音',
					rangelength: '请输入1-30个字母'
				},
				userName: {
					letter: '请输入英文或拼音',
					rangelength: '请输入1-30个字母'
				}
			}
		};
	}

	$.extend(true, o, o1);
	$("#orderForm").validate(o);
}

module.exports = InitValidator;
