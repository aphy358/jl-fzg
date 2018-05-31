
// 计算当年所有月份的天数，存入一个数组，先计算二月份的总天数，传入当下年份
function getDaysForeachMonth(year) {
	return new Array(31, _leap(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
}


	
// 返回当下年份中二月份的天数，传入当下年份
function _leap(year) {
	return 28 + ( ( year % 4 == 0 && year % 100 != 0 || year % 400 == 0 ) ? 1 : 0 );
}



// 生成一个月的相关HTML（里面所有日期行）
function getOneMonthHTML(y, m, dayCount) {

	var
		// 计算当月第一天是星期几，同时也就说明第一行前面有几个空位 
		week = new Date(y + '/' + m + '/1').getDay(),

		// 该月总行数 
		rows = Math.ceil((dayCount + week) / 7),

		// 该月总 td 数
		total = 7 * rows,

		arr = [],
		
		// 该月月份字符串
		monthStr = y + '/' + m,

		// 该月表头字符串
		headStr  = y + '年' + m + '月',

		// 该月表主体字符串
		bodyStr = '',

		// 一个月的 HTML 模板
		oneMonthTemplate = require('../templates/oneMonthModel.ejs');
		
	// 先把第一行前面几个空位补满
	for(var i = 0; i < week; i++)	arr.push('null');
	
	// 再把当月所有日期放进去
	for(var i = 1; i <= dayCount; i++)	arr.push( new Date(y + '/' + m + '/' + i).Format('yyyy/MM/dd') );
	
	// 最后把最后一行的空位补满
	for(var i = 0; i < total - dayCount - week; i++)	arr.push('null');
						
	for(var i = 0; i < rows; i++) {
		bodyStr += '<tr class="calendar-p-row">';
		for(var j = 0; j < 7; j++) {
			bodyStr += getTDStr( arr[i * 7 + j] );
		}
		bodyStr += '</tr>';
	}
	 
	return oneMonthTemplate({
		month : monthStr,
		head  : headStr,
		body  : bodyStr
	});
}



// 获取单个td单元格内的HTML
function getTDStr(d){
	
	var tdStr = '';
	
	if( d === 'null' ){
		tdStr = '<td><div class="cp-td-inner disabled"></div></td>'
	}else{
		var todayZeroTimeStamp = new Date( (new Date).Format('yyyy/MM/dd') + ' 00:00:00' ),
			clazz = new Date(d) < todayZeroTimeStamp ? ' disabled' : '';

		tdStr = 
			'<td>' +
				'<div class="cp-td-inner disabled' + clazz + '"  data-day="' + d + '">' +
					'<p class="calendar-p-day-num">' + _getDay(d) + '</p>' +
				'</div>' +
			'</td>';
	}
	
	return tdStr;
}



// 获取日期的数字，比如1、2、3...
function _getDay(d){
	
	var dStr = '';
	
	try{
		dStr = d.split('/')[2];
	}catch(e){}
	
	return dStr;
}



// 如果传了参数，则创建一个月的HTML，如果没传参，则创建当月和下月两个月的HTML
function buildMonths(y, m){

	var 
		// 今天
		today = new Date(),
		
		// 今年
		thisYear = today.getFullYear(),
		
		// 当月
		thisMonth = today.getMonth(),

		// 当前年份所有月份日期数的数组
		dayArr = getDaysForeachMonth( y || thisYear );

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