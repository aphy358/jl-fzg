
require('../sass/tipsReset.scss');
require('../sass/orderClauseTip.scss');
require('../sass/priceDetailTip.scss');
require('../sass/roomInfoTip.scss');


const
	Util 				= require('../../../common/util.js'),
	tipShowAndHide 		= Util.tipShowAndHide,
	roomInfoTipTmpl 	= require('../templates/roomInfoTipTmpl.ejs'),
	priceDetailTipTmpl 	= require('../templates/priceDetailTipTmpl.ejs'),
	orderClauseTipTmpl 	= require('../templates/orderClauseTipTmpl.ejs'),
	
	
	// 为预定条款 td 设置数据项
	setDataForOrderClauseTd = function(orderClauseTd, pList){
		var
			dataObj = {},
			clauses = [];
		
		for (var i = 0; i < pList.length; i++) {
			var reserveShowArr = pList[i].reserveShow.split(/[|;]/);
			for (var j = 0; j < reserveShowArr.length; j++) {
				var o = reserveShowArr[j];
				~o.indexOf('限住') ? dataObj['限制晚数'] = o :
				~o.indexOf('提前') ? dataObj['提前预订'] = o :
				~o.indexOf('连住') ? dataObj['连住多晚'] = o :
				~o.indexOf('时间') ? dataObj['限时预订'] = o :
				~o.indexOf('间数') ? dataObj['限制间数'] = o :
									dataObj['无预订条款'] = o;
			}
		}
		
		for(key in dataObj){
			if( key !== '无预订条款' )		clauses.push({name: key, tip: dataObj[key]});
		}
		
		orderClauseTd[0].clauses = clauses;
		
		clauses.length === 0 ? orderClauseTd.html('无预订条款').removeClass('hp-order-clause') :
		clauses.length === 1 ? orderClauseTd.html(clauses[0].name) :
							   orderClauseTd.html('复合条款');				
	},
	
	// 查询房型信息，并将数据设置到相对应的 dom 上
	setDataForRoomTypeTd = function(roomTypeTd){
		var params = {
				hotelId: roomTypeTd.attr("hotelid"),
				suppId: roomTypeTd.attr("supplierid"),
				roomId: roomTypeTd.attr("roomid")
			};

		$.post("/hotel/roomInfo.do", params, function(res){
			if( res.success && res.content ){
				roomTypeTd[0].roomInfo = res.content;
				initRoomInfoTips(roomTypeTd);
			}
		}, 'noAnimation');
	},
		
	// 鼠标悬浮房型名称
	initRoomInfoTips = function(roomTypeTd){
		$(roomTypeTd).on('mouseover', function(){
			var msg = roomInfoTipTmpl(this.roomInfo);
	        tipShowAndHide($(this), msg, {area: '245px'});
		})
	},
	
	// 初始化小礼包的 tips 显示
	initMarketingInfoTips = function(marketingTd){
		marketingTd.on('mouseover', function(){
			var msg = decodeURIComponent( marketingTd.attr('data-tip') );
			tipShowAndHide($(this), msg);
		})
	}
	
	// 预定条款 tips 的显示
	initOrderClauseTips = function(orderClauseTd){
		$(orderClauseTd).on('mouseover', function(){
			if(this.clauses.length){
				var msg = orderClauseTipTmpl({clauses: this.clauses})
				tipShowAndHide($(this), msg);	//, {area: '260px'}
			}
		});
	},
	
	// 初始化价格的 tips
	initHotelPriceTips = function(hotelPriceTd, pList){

		var isTimeLimitConfirSupplier = hotelPriceTd.closest('tr').find('.hp-store-status').text().indexOf('60秒确认') !== -1;

		hotelPriceTd.on('mouseover', function(){
			for (var i = 0; i < pList.length; i++) {
				var o = pList[i];

				// 设置房态显示    0：剩余库存  1畅订  2：待查  3：满房 5不可超售
				if( o.status === 3 ){
					o.statusText = '<span class="red">满房</span>';
				}else if( o.status === 2 ){
					o.statusText = '<span class="purple">待查</span>';
				}else if( o.status === 0 || o.status === 5 ){
					o.statusText = 
						isTimeLimitConfirSupplier
							? '<span class="blue">60秒确认</span>'
							: ( (o.stock - o.sellStock < 1) ? '<span class="red">满房</span>' : '<span class="green">剩' + (o.stock - o.sellStock) + '</span>' );
				}else if( o.status === 1 ){
					o.statusText = 
						isTimeLimitConfirSupplier
							? '<span class="blue">60秒确认</span>'
							: '<span class="green">畅订</span>';
				}
			}

			var msg = priceDetailTipTmpl({list: pList});

			tipShowAndHide($(this), msg, {area: '300px'});
		})
	},
	
	// 初始化取消条款的 tips
	initCancellationTips = function(cancellationTd, pList){
		cancellationTd.on('mouseover', function(){
			var _this = $(this),
				msg = _this.attr('data-tip');
				
			tipShowAndHide($(this), msg);
		})
	},
	
	// 初始化所有 tips 
	initTips = function(_table){

		var trs = _table.find('tbody tr');
		
		for (var i = 0; i < trs.length; i++) {
			var tr = $(trs[i]),
				pList = window.JSON.parse( tr.find('.nightlyPriceList').html() ),
				marketingTd = tr.find('.marketing-icon'),
				orderClauseTd = tr.find('.hp-order-clause'),
				cancellationTd = tr.find('.hp-cancel-clause'),
				hotelPriceTd = tr.find('.hp-currency'),
				roomTypeTd = tr.find('.hp-roomName'),
				roomStatusTd = tr.find('.hp-store-status');
			
			setDataForOrderClauseTd(orderClauseTd, pList);
			setDataForRoomTypeTd(roomTypeTd);
		
			initMarketingInfoTips(marketingTd);
			initOrderClauseTips(orderClauseTd, pList);
			initCancellationTips(cancellationTd, pList);
			initHotelPriceTips(hotelPriceTd, pList);
			initHotelPriceTips(roomStatusTd, pList);	// 房态 tip 和价格详情用同一个 tip
		}
	};
	


// 酒店价格列表的所有 tips 相关js
module.exports = {
    initTips: initTips
}