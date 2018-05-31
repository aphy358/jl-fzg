
const
	Util 				= require('../../../common/util.js'),
	queryString 		= Util.queryString,
	addDays				= Util.addDays,
	facilities			= require('../testData/facilities.js'),
	hotelGroup			= require('../testData/hotelGroup.js'),
	addASI 				= require('./editASI.js').addASI,

	queryHotelUtil 		= require('./queryHotelUtil.js'),
	getParams 			= queryHotelUtil.getParams,
	queryHotels 		= queryHotelUtil.queryHotels,
	
	queryZoneAndBiz 	= require('./zoneAndBiz.js').queryZoneAndBiz,
	
	paramsReset = function(arr, param){
		for (var i = 0; i < arr.length; i++) {
			var o = arr[i];
			var _value = $(o).attr('data-value');
			if( ~param.indexOf(_value) ){
				$(o).prop('checked', true);
				addASI($(o), 'dontQuery');
			}
		}
	},		
	
	// 将上个页面传过来的参数设置到相应的项
	setInitParams = function(params){
		var
			cityType = document.querySelector(".s-i-city-type"),
			keywordInput = document.querySelector(".s-i-keyword-input"),
			datesInput = document.querySelector(".s-i-dates-input"),
			roomNum = document.querySelector(".s-i-room-num"),
			adultChildren = document.querySelector(".s-i-adult-children"),

			cityTypeText =
				params.type == '3' ? '国外' :
				params.type == '2' ? '港澳台' :
								     '国内';
		
		$(cityType).attr('data-value', params.type)
				   .html(cityTypeText);

		keywordInput.cityid = params.cityId;
        keywordInput.citytype = params.type;
		$(keywordInput).val(params.searchKey);
		
		datesInput.checkin = params.startDate;
		datesInput.checkout = params.endDate;
		$(datesInput).val(params.startDate.replace(/-/g, '/') + ' - ' + params.endDate.replace(/-/g, '/'));
		
		$(roomNum).html(params.selRoomNum + '间').attr('data-value', params.selRoomNum);
		
		adultChildren.adultNum = params.adultNum;
		adultChildren.childrenNum = params.childrenNum;
		adultChildren.childrenAgesStr = params.childrenAgesStr;
		$(adultChildren).val(params.adultNum + '成人，' + params.childrenNum + '小孩');
		
		// 如果是国内酒店，则隐藏成人小孩的选择框
		if( params.type === '0' ){
			$(".s-i-adult-children-wrap").hide();
		}
		
		// 设置价格区间
		if(params.priceRange){
			var priceArr = params.priceRange.split('-'),
				p1 = priceArr[0],
				p2 = priceArr[1],
				dataValue =
					p2 === '999999999'
						? ('大于' + p1 + '元')
						: (params.priceRange + '元');

			$('#cusPriceRange').attr('data-value', params.priceRange);
			$('#cusPriceRange').next('span').html(dataValue);
			$('#cusPriceRange').prop('checked', true);
			addASI($('#cusPriceRange'), 'dontQuery');
		}
		
		// 设置酒店星级
		if(params.star){
			var starArr = $("input[data-attr='star']");
			paramsReset(starArr, params.star);
		}
		
		// 设置确认时间，"立即确认"、"60秒确认"、"待查"、
		if(params.immediate){
			var immediateArr = $("input[data-attr='immediate']");
			paramsReset(immediateArr, params.immediate);
		}

		// 设置酒店集团
		if(params.selHotelGroup){
			var hotelgroupArr = $("input[data-attr='hotelgroup']");
			paramsReset(hotelgroupArr, params.selHotelGroup);
		}
	},
	
	// 设置 nav 上的城市类型
	setNavText = function(citytype){
		var navText =
				citytype == 2 ? '港澳台' : 
				citytype == 3 ? '国外' : '国内';
				
		$("#cityTypeText").html(navText);
	},
	
	// 获取上个页面传过来的参数，然后初始化页面
	getInitParamsAndInitPage = function(){

		var params = sessionStorage.getItem("initialHotelListParams");
		var citytype = queryString('ch');
		setNavText(citytype);
		
		if(params){
			params = window.JSON.parse(params);
		}
		
		if( !params || citytype !== params.type ){
			params = {
				"type": citytype,
	            "startDate": citytype == 3 ? addDays(new Date(), 1) : addDays(new Date(), 0),
	            "endDate": citytype == 3 ? addDays(new Date(), 2) : addDays(new Date(), 1),
	            "selRoomNum": 1,
	            "adultNum": 2,
	            "childrenNum": 0,
	            "childrenAgesStr": '',
	            "pageNow": 1
			}
		}
		
		$.initQueryHotelParams = params;

		setInitParams(params);
		
		queryHotels(getParams(1));
	},	
	
	// 初始化行政区和商圈
	initZoneAndBiz = function(){
		queryZoneAndBiz( $.initQueryHotelParams.cityId );
	},
	
	// 初始化特殊要求
	initFacilities = function(facilities){
		var totalStr = '';
		for (var i = 0; i < facilities.length; i++) {
			var o = facilities[i];
			totalStr += `
				<li class="a-s-item">
					<label>
						<input type="checkbox" data-track="列表页_高级搜索_特殊要求_选择项" class="a-s-checkbox" data-attr="hotelFacility" data-code="asi-facility-${o.optioncode}" data-value="${o.optioncode}">
						${o.optionname}
					</label>
				</li>`;
		}
		
		$(".a-s-zone-biz-list[data-for='a-s-requirements']").append(totalStr);
	},
	
	getHotelGroupItemStr = (i, o) => {
		return  `
				<li class="a-s-item">
					<label>
						<input type="checkbox" name="hotelgroup" class="a-s-checkbox" data-attr="hotelgroup" data-code="asi-hotelgroup-v${i}" data-value="${o.id}">
						${o.groupname}
					</label>
				</li>`;
	},

	// 初始化酒店集团
	initHotelGroup = function(hotelGroup){
		var totalStr1 = '';
		var totalStr2 = '';

		hotelGroup.forEach((o, i) => {
			(i < 20)
				? totalStr1 += getHotelGroupItemStr(i, o)
				: totalStr2 += getHotelGroupItemStr(i, o);
		});

		totalStr2 = `<div class="hgroup-list-auto-hide">${totalStr2}</div>`;
		
		$(".a-s-zone-biz-list[data-for='a-s-hotelgroup']").append(totalStr1 + totalStr2);
	},

	//初始化酒店特别提示中鼠标移入的弹出框
	initHotelSpecialTips = function () {
		var hotelSpecialTips;
		$(document).delegate('.hli-notice-text', 'mouseenter', function () {
			hotelSpecialTips = layer.tips($(this).data('title'), $(this), {
				time: 0,
				tips: [1, '#fffff3']
			});
		}).delegate('.hli-notice-text', 'mouseleave', function () {
			layer.close(hotelSpecialTips);
		})
	},

	initPageScroll = function(){
		window.onscroll = function(){
			var expandArr = $('.hli-expand-inner .icon-up').closest('.hli-expand-wrap'),
				clientHeight = document.documentElement.clientHeight,
				scrollElem = document.scrollingElement || document.documentElement || document.body,
				scrollTop = scrollElem.scrollTop;
				
			for (let i = 0; i < expandArr.length; i++) {
				const o = expandArr[i],
					  p = $(o).closest('.hl-item').find('.hli-price-list-wrap')[0],
				      rect = p.getBoundingClientRect();

				if(rect.bottom >= clientHeight){
					$(o).addClass('fix-bottom');
				}else{
					$(o).removeClass('fix-bottom');
				}
				
				if(rect.top >= clientHeight - 30){
					$(o).removeClass('fix-bottom');
				}
			}

			if(scrollTop >= 90){
				$('.search-line-outer').addClass('fix-top');
			}else{
				$('.search-line-outer').removeClass('fix-top');
			}

		}
	};



// 刚进入列表页面时，做的一些初始化
module.exports = {
    run: function(){
		
		// 初始化酒店集团各个选项
		initHotelGroup(hotelGroup);
		
    	// 获取上个页面传过来的参数，然后初始化页面
    	getInitParamsAndInitPage();
    	
    	// 初始化行政区和商圈
    	initZoneAndBiz();
    	
    	// 初始化特殊要求
    	initFacilities(facilities);
	
    	//初始化酒店特别提示中鼠标移入的弹出框
		initHotelSpecialTips();

		// 初始化屏幕滚动
		initPageScroll();
    }
}