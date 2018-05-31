require('../sass/priceTable.scss');
require('../sass/packageTmpl.scss');


const
	initTips 	= require('./hotelPriceTableTips.js').initTips,
	packageTmpl = require('../templates/packageTmpl.ejs'),
	
	
	// 获取价格是否显示的 bool 值， true 表示要显示， false 表示不要显示
	// immediate:       XS-1 立即确认     XS-2 60秒确认   XS-0 待查
	// canceltype：     canceltype-0 可取消     canceltype-1 不可取消
	// bedbreakfast：   bedbreakfast-0 可加早     bedbreakfast-1 可加床
	getIsShowBoolean = function(priceObj, frontEndParams){
		var
			subIsShow1 = true,
			subIsShow2 = true,
			subIsShow3 = true,
			subIsShow4 = true,
			subIsShow5 = false,
			subIsShow6 = true,
			
			// 价格区间过滤（酒店详情页）
			price1 = +$("#slp_1").val() || 0.01,
			price2 = +$("#slp_2").val() || 999999999,		
			avePrice = priceObj.averagePriceRMB;

		// 确认时间
		if( frontEndParams.immediate ){
			subIsShow1 = false;
			
			if( ~frontEndParams.immediate.indexOf('XS-0') ){
				subIsShow1 |= (priceObj.roomStatus === 2);
			}
			
			if( ~frontEndParams.immediate.indexOf('XS-1') ){
				subIsShow1 |= (priceObj.isTimeLimitConfirSupplier === 0 && priceObj.confirm === true && priceObj.roomStatus != 3);
			}
			
			if( ~frontEndParams.immediate.indexOf('XS-2') ){
				subIsShow1 |= (priceObj.isTimeLimitConfirSupplier === 1);
			}
		}
		
		// 可否取消
		if( frontEndParams.canceltype ){
			subIsShow2 = false;
			
			if( ~frontEndParams.canceltype.indexOf('canceltype-0') ){
				subIsShow2 |= (priceObj.cancellationType === 1);
			}
			
			if( ~frontEndParams.canceltype.indexOf('canceltype-1') ){
				subIsShow2 |= (priceObj.cancellationType !== 1);
			}
		}

		// 加床、加早
		if( frontEndParams.bedbreakfast ){
			if( ~frontEndParams.bedbreakfast.indexOf('bedbreakfast-0') ){
				subIsShow3 &= (priceObj.isHasSurchargeBref === 1);
			}
			
			if( ~frontEndParams.bedbreakfast.indexOf('bedbreakfast-1') ){
				subIsShow3 &= (priceObj.isHasSurchargeBed === 1);
			}
		}
		
		// 价格区间
		if( frontEndParams.priceRange ){
			subIsShow4 = false;

			var priceRangeArr = frontEndParams.priceRange.split(',');
			for(var i = 0; i < priceRangeArr.length; i++){
				var p1 = +priceRangeArr[i].split('-')[0] || 1;	// 避免价格为0的被选上
				var p2 = +priceRangeArr[i].split('-')[1] || 1;	// 避免价格为0的被选上
				
				subIsShow4 |= ( p1 <= avePrice && avePrice <= p2 );
			}
		}
		
		// 价格区间筛选（酒店详情页的 最低价、最高价）
		subIsShow5 |= ( price1 <= avePrice && avePrice <= price2 );

		// 只显示可订
		if( frontEndParams.isbook ){
			subIsShow5 = false;
			subIsShow5 |= priceObj.isBook;
		}
		
		return subIsShow1 && subIsShow2 && subIsShow3 && subIsShow4 && subIsShow5 && subIsShow6;
	},
	
	// 分别为 'roomTypeBasesRecommend' 和 'roomTypeBases' 过滤数据
	filterDataForEachType = function(list, frontEndParams){
		if( !list ) return;

		var rowSpan = 0;
		
		for (var i = 0; i < list.length; i++) {
			var o = list[i];
		
			for (var j = 0; j < o.roomTypePrices.length; j++) {
				var p = o.roomTypePrices[j];
				var isShow = getIsShowBoolean(p, frontEndParams);
				if( !isShow ){
					o.roomTypePrices.splice(j--, 1);
				}
			}
			
			rowSpan += o.roomTypePrices.length;

			if( o.roomTypePrices.length < 1 ){
				list.splice(i--, 1);
			}
		}
		
		list.rowSpan = rowSpan;
	},
	
	// 获取前端的参数
	getFrontEndParams = function(){
		var
			params = {},
			immediateArr = $("input[data-attr='immediate']:checked"),
			canceltypeArr = $("input[data-attr='canceltype']:checked"),
			bedbreakfastArr = $("input[data-attr='bedbreakfast']:checked"),
			priceRangeArr = $("input[data-attr='priceRange']:checked"),
			immediateStr = [],
			canceltypeStr = [],
			bedbreakfastStr = [],
			priceRangeStr = [],

			isbookStr = $("input[data-attr='isbook']:checked").attr('data-value');

		
		for (var i = 0; i < immediateArr.length; i++)	immediateStr.push( $(immediateArr[i]).attr('data-value') );
		for (var i = 0; i < canceltypeArr.length; i++)	canceltypeStr.push( $(canceltypeArr[i]).attr('data-value') );
		for (var i = 0; i < bedbreakfastArr.length; i++)	bedbreakfastStr.push( $(bedbreakfastArr[i]).attr('data-value') );
		for (var i = 0; i < priceRangeArr.length; i++)	priceRangeStr.push( $(priceRangeArr[i]).attr('data-value') );
		
		if( immediateStr.length )		params.immediate = immediateStr.join(',');
		if( canceltypeStr.length )		params.canceltype = canceltypeStr.join(',');
		if( bedbreakfastStr.length )	params.bedbreakfast = bedbreakfastStr.join(',');
		if( priceRangeStr.length )		params.priceRange = priceRangeStr.join(',');
		if( isbookStr )					params.isbook = isbookStr;
		
		return params;
	},
	
	goToOrderConfirmPage = function (_this) {
		var
			priceStrs = _this.find('.hotelPriceStrs'),
			priceStrs_key = "hotelPriceStrs_" + (+new Date()),
			params = [
				'staticInfoId=' 		+ _this.attr('data-hotelid'),
				'hotelId=' 				+ _this.attr('data-hotelid'),
				'supplierId=' 			+ _this.attr('data-supplierid'),
				'roomId=' 				+ _this.attr('data-roomId'),
				'breakFastId=' 			+ _this.attr('data-breakFastId'),
				'paymentType=' 			+ _this.attr('data-paymentType'),
				'rateType=' 			+ _this.attr('data-rateType'),
				
				'isQueryPrice=true',
				_this.attr('data-marketingStr'),
				
				'startDate=' 			+ $.queryingHotelParams.startDate,
				'endDate=' 				+ $.queryingHotelParams.endDate,
				'citytype=' 			+ $.queryingHotelParams.type || '0',
				'adultNum=' 			+ $.queryingHotelParams.adultNum,
				'childrenNum=' 			+ $.queryingHotelParams.childrenNum,
				'childrenAgeStr=' 		+ $.queryingHotelParams.childrenAgesStr,
				'roomNum=' 				+ $.queryingHotelParams.selRoomNum,
				'ch=' 					+ $.queryingHotelParams.type || '0',
				'hotelPriceStrsKey=' 	+ priceStrs_key
			];

		sessionStorage.setItem(priceStrs_key, priceStrs.html());
		
		//*** */
		var url = "/order/orderConfirm.do?" + params.join('&');
		//var url = "./orderConfirm.html?" + params.join('&');
	
		return url;
	},

	// 初始化 "预订" 按钮点击事件
	initOrderClick = function(_table){
		_table.find('.hp-order-btn').not('.disabled').on('click', function(){

			var _this = $(this);

			// 当有 package 标识时，弹出框
			if( _this.closest('tr').find('.pagekage-icon').length > 0 ){
				var index = layer.open({
					content: packageTmpl({link: goToOrderConfirmPage(_this)}),
					btn: []
				});
			}else{
				_this.attr("href", goToOrderConfirmPage(_this));
			}
		});

		// 初始化 package 加价弹出框 checkbox 点击事件
		$(document).delegate('.hli-package-checkbox', 'click', function(){
			var _this = $(this)
				nextClickBtn = _this.closest('.hli-package-confirm-wrap').find('.hli-package-btn');
			
			_this.prop('checked')
				? nextClickBtn.removeClass('disabled')
				: nextClickBtn.addClass('disabled');
		});

		// 初始化 package 加价弹出框点击按钮事件
		$(document).delegate('.hli-package-btn', 'click', function(){
			if( $(this).hasClass('disabled') )	return false;
			layer.closeAll();
		});
	},
	
	// 初始化房型名称的点击事件
	initRoomTypeNameClick = function(_table){
		_table.find(".hp-roomName").on('click', function(){
			var _this = $(this),
				typeText = _this.attr('data-type'),
				typeTd = _this.closest('table').find('.first-td[data-type=' + typeText + ']'),
				spanRow = +typeTd.attr('rowspan'),
				thisTd = _this.closest('td'),
				dragIcon = _this.find('.room-type-icon'),
				sameRoomTypeTr, sameRoomTypeTrs = [];
			
			if(dragIcon.length){
				sameRoomTypeTr = _this.closest('tr').next('.auto-hide-tr');
				
				while(sameRoomTypeTr.length){
					sameRoomTypeTrs.push(sameRoomTypeTr);
					sameRoomTypeTr = sameRoomTypeTr.next('.auto-hide-tr');
				}
				
				if(dragIcon.hasClass('drag-down')){
					$.each(sameRoomTypeTrs, function(i, o) {
						setTimeout(function(){
							$(o).find('td').removeClass('hidden');
						}, 50);
						
						$(o).slideDown('fast');
					});
					
					setTimeout(function(){
						dragIcon.removeClass('drag-down').addClass('drag-up');
					}, 50);

					if(typeText === 'recommend'){
						typeTd.attr('rowspan', spanRow + sameRoomTypeTrs.length);
					}
					
					thisTd.removeClass('force-border');
				}else{
					$.each(sameRoomTypeTrs, function(i, o) {
						setTimeout(function(){
							$(o).find('td').addClass('hidden');
						}, 80);
						
						$(o).slideUp('fast');
					});
					
					setTimeout(function(){
						dragIcon.removeClass('drag-up').addClass('drag-down');

						if(typeText === 'recommend'){
							typeTd.attr('rowspan', spanRow - sameRoomTypeTrs.length);
						}
					}, 80);

					thisTd.addClass('force-border');
				}
			}
		})
	},
	
	// 根据前端的一些参数对要显示的价格进行进一步过滤，如 "确认时间"、"可否取消"、"加床加早" 等，然后再将数据填充到页面，并初始化一些事件
	filterPriceAndFillIntoTable = function(priceTableTmpl, _table, firstQuery){
		var tableList = _table || $(".hli-expand-inner");
		
		for (var i = 0; i < tableList.length; i++) {
			var item = tableList[i];
			
			var
				priceList = $.extend(true, {}, item.priceList),		// 深拷贝，不影响原来的数据，因为原数据后续还要用
				wraper = $(item).closest('.hl-item').find('.hli-price-list-wrap'),
				frontEndParams = getFrontEndParams(),
				noPriceMsg = '<div class="hli-error-msg">无相关价格！</div>',
				_table;
				
			if( item.priceList ){
				// 过滤数据
				filterDataForEachType(priceList.roomTypeBasesRecommend, frontEndParams);
				filterDataForEachType(priceList.roomTypeBases, frontEndParams);

				// 填充数据，并初始化 tips，如果是第一次查价且没有价格时，则先不显示无价提示信息，等第二次查价再作判断
				if( (!priceList.roomTypeBasesRecommend || !priceList.roomTypeBasesRecommend.length) && 
					(!priceList.roomTypeBases || !priceList.roomTypeBases.length) && !firstQuery ){
					wraper.html(noPriceMsg);
				}else{
					if( !priceList.roomTypeBasesRecommend )	priceList.roomTypeBasesRecommend = [];
					if( !priceList.roomTypeBases )	priceList.roomTypeBases = [];

					_table = $(priceTableTmpl(priceList));
					wraper.html(_table);
					
					// 针对详情页首次渲染超过5行的隐藏
					_table.find('.auto-hide').hide();
					_table.find('.auto-hide td').addClass('hidden');
					
					initTips(_table);
					initOrderClick(_table);
					initRoomTypeNameClick(_table);
				}
			}else{
				if( !firstQuery ){
					wraper.html(noPriceMsg);
				}
			}
		}
	};
	
	
// 前端条件过滤酒店价格，条件有 "确认时间"、"可否取消"、"加床加早"
module.exports = filterPriceAndFillIntoTable;
