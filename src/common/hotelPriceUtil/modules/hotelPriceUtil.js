
require('../sass/priceTable.scss');


var
	Util 				= require('../../../common/util.js'),
	filterPriceAndFillIntoTable = require('./filterPriceAndFillIntoTable.js'),
	testData 			= require('../testData/testPrice.js'),
	progressBar			= require('../../../common/progressBar/progressBar.js'),
	
	
	// 设置小礼包
	setMarketing = function(o, p, j){
		var copy = $.extend(true, {}, p);
			
		// 将裸房的小礼包信息置空
		p.isHasMarketing = 0;
		p.marketing = null;
		p.marketingStr = 'isHasMarketing=0';
		
		if(copy.marketing){
			var giftStartTime = copy.marketing.startTime.slice(0, 11) + '00:00:00',
				giftEndTime = copy.marketing.endTime.slice(0, 11) + '23:59:59',
				marketingPrice = copy.marketing.marketingPrice || 0,
				totalPrice = 0;
			
			if(copy.marketing.pricingMethod){
				// 将小礼包价格加到每一天的单价里
				for (var k = 0; k < copy.nightlyPriceList.length; k++) {
					totalPrice += copy.nightlyPriceList[k].salePrice;
				}

				// 重新计算总价
				copy.totalPriceRMB = totalPrice * parseInt($.queryingHotelParams.selRoomNum) + marketingPrice;
			}else{
				// 将小礼包价格加到每一天的单价里
				for (var k = 0; k < copy.nightlyPriceList.length; k++) {
					var q = copy.nightlyPriceList[k];
					
					if( new Date(giftStartTime) < new Date(q.date) && new Date(q.date) < new Date(giftEndTime) ){
						q.salePrice += marketingPrice;
					}
					
					totalPrice += q.salePrice;
				}

				// 重新计算总价
				copy.totalPriceRMB = totalPrice * parseInt($.queryingHotelParams.selRoomNum);
			}

			copy.marketingStr = 
				'isHasMarketing=1&marketingPrice=' + copy.marketing.marketingPrice + 
				'&startTime=' + copy.marketing.startTime + 
				'&endTime=' + copy.marketing.endTime;

			// 如果 isPack = 0，则不显示裸房价格
			copy.marketing.isPack
				? o.roomTypePrices.splice((j++ + 1), 0, copy)
				: o.roomTypePrices.splice(j, 1, copy);
			
		}
		
		return j;
	},
	
	// 为价格数据设置新的属性，使之适合模板
	setNewAttrForPriceData = function(res, type){
		
		if(res.data[type]){
			var rowSpan = 0;
			
			for (var i = 0; i < res.data[type].length; i++) {
				var o = res.data[type][i];

				rowSpan += o.roomTypePrices.length;

				for (var j = 0; j < o.roomTypePrices.length; j++) {
					var p = o.roomTypePrices[j];

					p.cancellationText = p.cancellationType ? '可取消' : '不可取消';

					// 设置房态显示    0：剩余库存  1畅订  2：待查  3：满房 5不可超售
					if( p.roomStatus === 3 ){
						p.roomStatusText = '<span class="red">满房</span>';
					}else if( p.roomStatus === 2 ){
						p.roomStatusText = '<span class="purple">待查</span>';
					}else if( p.roomStatus === 0 || p.roomStatus === 5 ){
						p.roomStatusText = 
							p.isTimeLimitConfirSupplier === 1
								? '<span class="blue">60秒确认</span>'
								: '剩余库存';
					}else if( p.roomStatus === 1 ){
						p.roomStatusText = 
							p.isTimeLimitConfirSupplier === 1
								? '<span class="blue">60秒确认</span>'
								: '<span class="green">畅订</span>';
					}
					
					if( p.roomStatusText === '剩余库存' ){
						var stockArr = [];
						for (var k = 0; k < p.nightlyPriceList.length; k++) {
							var q = p.nightlyPriceList[k];
							if( q.status === 1 ){ q.stock = 999; }	// 畅订情况下库存为 0 ！
							stockArr.push(q.stock - q.sellStock);
						}
						
						var minStock = Math.min.apply(this, stockArr);
						p.roomStatusText = 
							minStock < 1
								? '<span class="red">满房</span>'
								: '<span class="green">剩余 [' + Math.min.apply(this, stockArr) + ']</span>';
					}
					
					if(!p.isHasMarketing) p.isHasMarketing = 0;
					j = setMarketing(o, p, j);
				}
			}

			res.data[type].rowSpan = rowSpan;
		}
	},
	
	// 对价格数据进行预处理，使之适合模板
	initPriceData = function(res){
		if(res.data){
			// 分别设置 "推荐"、"其他" 的相关新属性
			setNewAttrForPriceData(res, 'roomTypeBasesRecommend');
			setNewAttrForPriceData(res, 'roomTypeBases');
		}
	},

	queryPriceFunc = function (that, priceTableTmpl, hotelItem, res, firstQuery, progress) {
		//***
		// res = $.extend(true, {}, testData);			//res.data = null;

		if(progress){
			progress.end();

			setTimeout(function (param) {
				$('.search-line-btn').removeClass('disabled');
			}, 200);
		}
		
		that.priceList = res.data || [];

		if( res.returnCode === 1 ){
			var lowestPriceWrap = hotelItem.find('.hli-lowest-price-wrap');
			// 设置起价（只在第二次实查时才设置）
			if(lowestPriceWrap.length && lowestPriceWrap.html().indexOf('起') === -1 && !firstQuery){
				var 
					lowestPriceStr =
						res.data.priceMin 
							? '￥<span class="hli-lowest-price">' + res.data.priceMin + '</span>起'
							: '满房&nbsp;&nbsp;&nbsp;&nbsp;';		// 无相关价格！

				hotelItem.find('.hli-lowest-price-wrap').html(lowestPriceStr);
			}

			// 对价格数据进行预处理，使之适合模板
			initPriceData(res);
			that.priceList = res.data;
			filterPriceAndFillIntoTable( priceTableTmpl, $(that), firstQuery );
			
		}else if( res.returnCode === -400001 ){
			Util.login();
		}else{		//  res.returnCode === -400301/-400501
			var parent = $(that).closest('.hl-item').find('.hli-price-list-wrap');
			var tmpStr = '<div class="hli-error-msg">' + res.errinfo + '</div>';
			
			// 设置起价
			hotelItem.find('.hli-lowest-price-wrap').html(res.errinfo);

			parent.html(tmpStr)
		}
	},
		
	// 查价
	queryPrices = function(that, getParams, priceTableTmpl){
		that.queryingPrice = true;

		var
			p = typeof getParams === 'function' ? getParams() : getParams,
			hotelItem = $(that).closest('.hl-item'),
			params = {
				hotelId				: $(that).attr('data-hotelid'),
				checkInDate			: p.startDate,
				checkOutDate		: p.endDate,
				roomNum				: p.selRoomNum,
				adultNum			: p.adultNum,
				childrenNum			: p.childrenNum,
				childrenAgesStr		: p.childrenAgesStr,
				// 只有在勾选了 "可加早"、"可加床" 才在查价的时候查加床加早
				isSearchSurcharge	: $(".d-s-item[data-attr='bedbreakfast']:checked").length ? 1 : 0
			};
		
		$('.search-line-btn').addClass('disabled');

		var loadingStr = 
                '<div class="fzg-loading-wrap">' +
                    '<img src="https://qnb.oss-cn-shenzhen.aliyuncs.com/real_1514022140288.gif"/>' +
                '</div>';
    
		hotelItem.find('.hli-price-list-wrap').html(loadingStr);

		// 初始化进度条
		var progress = progressBar({
			elem: hotelItem.find('.progress-outer')[0],
		});
		
		// 第一次查价，只查落地
		$.post('/hotel/getHotelPriceListInStock.do', params, function(res){	// getHotelPriceListInStock	getHotelPriceList
			queryPriceFunc(that, priceTableTmpl, hotelItem, res, 'firstQuery');

			if( res.returnCode === 1 ){
				// 第二次查价，查落地和实时
				$.post('/hotel/getHotelPriceList.do', params, function(res){	// getHotelPriceListInStock	getHotelPriceList
					queryPriceFunc(that, priceTableTmpl, hotelItem, res, null, progress);
				}, 'noAnimation');
			}else{
				// 如果第一次查价不能返回正确的内容，则终止进度条
				progress.end();
			}
		}, 'noAnimation');
	};
	


// 酒店价格列表
module.exports = queryPrices