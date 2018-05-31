//获取需要的模板
var
	choices = require('../templates/choices.ejs'),
	
	// paging = require('../templates/paging.ejs'),
	
	addDays = require('../../../common/util.js').addDays;


const loginModel = require('../../../common/loginModel/login.js');


var initMsg = {};

function getData() {
	$.post('/mainPush/queryMainPushProductList.do', function (data) {
		
		//判断后台是否有错误信息返回
		if (data.returnCode !== 1) {
			if (data.returnCode === -400001) {
				//因为导航栏顶部已经做了登录验证，所以此处
			} else {
				//刷新本页
				alert(data.returnMsg, {closeBtn: 0}, function () {
					location.reload();
				});
			}
			
		} else {
			if (data.data.mainPushCityDtoList === '' || data.data.mainPushCityDtoList === undefined) {
				return;
			}
			
			var cityList = data.data.mainPushCityDtoList;
			
			//将查今日同行价所需要的今日和明日的字符串存进initMsg中
			// initMsg.currentDay = (new Date()).Format('yyyy-MM-dd');
			// initMsg.nextDay    = addDays(initMsg.currentDay, 1, '-');
			
			//先将可供选择的城市及每个产品的信息都提取出来
			initMsg.factCitys = [];
			initMsg.products = [];
			for (var cL = 0; cL < cityList.length; cL++) {
				var everyCity = cityList[cL];
				if (everyCity.mainPushProductDtoList) {
					initMsg.factCitys.push(everyCity.cityName);
					
					for (var mP = 0; mP < everyCity.mainPushProductDtoList.length; mP++) {
						var everyProduct = everyCity.mainPushProductDtoList[mP];
						everyProduct.cityName = everyCity.cityName;
						everyProduct.cityType = everyCity.cityType;
						
						//所有能显示在房掌柜中的产品都一定是预付的，所以所有产品都默认支付方式为预付。既paymentType为0
						everyProduct.paymentType = 0;
						
						
						//将查今日同行价所需要的入离日期的字符串存进everyProduct中
						everyProduct.startDay = new Date(everyProduct.checkOutDate.split(' ')[0]).Format('yyyy-MM-dd');
						everyProduct.endDay = new Date(everyProduct.startDay);
						everyProduct.endDay.setDate(new Date(everyProduct.startDay).getDate() + 1);
						everyProduct.endDay = everyProduct.endDay.Format('yyyy-MM-dd');
						
						initMsg.products.push(everyProduct);
					}
					
					$.todayPushMsg = initMsg;
					
					
				}
			}
			//获取替换后的字符串
			var choicesStr = choices(initMsg);
			
			//添加到页面指定位置
			$('.condition-select').append(choicesStr);
			
			
			//根据initMsg的长度决定分页器的数目
			// initMsg.pagingNum = Math.ceil(initMsg.products.length/5);
			// var pagingStr = paging(initMsg);
			//
			// $('.paging-box').html(pagingStr);
			
		}
	});
}

module.exports = {
	run: function () {
		getData();
	}
};