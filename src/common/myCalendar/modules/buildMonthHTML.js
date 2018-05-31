

// 计算当年所有月份的天数，存入一个数组，先计算二月份的总天数，传入当下年份
function getDaysForeachMonth(year) {
	return new Array(31, _leap(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
}


	
// 返回当下年份中二月份的天数，传入当下年份
function _leap(year) {
	return 28 + ( ( year % 4 == 0 && year % 100 != 0 || year % 400 == 0 ) ? 1 : 0 );
}



// 返回一天的毫秒数
function oneDayTime(){
	return 24 * 60 * 60 * 1000;
}



// 生成一个月的相关HTML（里面所有日期行）
function getOneMonthHTML(y, m, dayCount) {

	var
		// 当月的第一天（不一定是第一行的第一格）
		firstDay = new Date(y + '/' + m + '/1'),
		
		// 计算当月前面要补充的天数，先计算当月第一天是星期几，就说明了第一行前面有几个空位，如果当月第一天是星期日，则补充天数为7天
		daysPrev = firstDay.getDay() || 7,
		
		// 注意，这里的 firstDayTime 是指第一行第一格所处的日期的 dayTime
		firstDayTime = firstDay.getTime() - daysPrev * oneDayTime(),
		
		// 计算当月末尾补充的天数，一个 "日历月" 一共有六行，42个TD，所以做一下减法就能算出
		daysAfter = 42 - daysPrev - dayCount,

		i, tdArr = [],
		
		// 该月月份字符串
		monthStr = y + '/' + m,

		// 该月表头字符串
		headStr  = y + '年' + m + '月',

		// 该月表主体字符串
		bodyStr = '',

		// 一个月的 HTML 模板
		oneMonthTemplate = require('../templates/oneMonthModel.ejs');
		
	
	for (i = 0; i < 42; i++){
		var
			dayStr = new Date( firstDayTime + i * oneDayTime() ).Format('yyyy/MM/dd'),
			
			// 首尾两端补充的天数要设置成灰色
			isValidDay = (daysPrev <= i && i < (42 - daysAfter)),

			isWeekend = (i % 7) === 0 || (i % 7) === 6;
			
			tdArr.push({
				dayStr : dayStr,
				isValidDay : isValidDay,
				isWeekend : isWeekend
			});
	}

	return oneMonthTemplate({
		month : monthStr,
		head  : headStr,
		tdArr  : tdArr
	});
}



// 如果传了参数，则创建一个月的HTML，如果没传参，则创建当月和下月两个月的HTML
function buildMonths(y, m){

	var 
		// 今天
		today = new Date(),
		
		// 今年
		thisYear = y || today.getFullYear(),
		
		// 当月
		thisMonth = today.getMonth(),

		// 当前年份所有月份日期数的数组
		dayArr = getDaysForeachMonth( thisYear );

	if( y && m ){
		return getOneMonthHTML(y, m, dayArr[m - 1]);
	}else{
		var 
			monthStr1 = getOneMonthHTML(thisYear, thisMonth + 1, dayArr[thisMonth]),
			monthStr2 = thisMonth == 11
						 ? getOneMonthHTML(thisYear + 1, 1, 31)
						 : getOneMonthHTML(thisYear, thisMonth + 2, dayArr[thisMonth + 1]);

		return monthStr1 + monthStr2;
	}
}



module.exports = function(y, m) {
	return buildMonths(y, m);
}