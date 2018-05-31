
const
	pagenation 		= require('../../../common/pagenation/pagenation'),
	Util 			= require('../../../common/util.js'),
	Statistics 		= require('../../../common/statistics/statistics.js'),
	hotelListTmpl 	= require('../templates/hotelListTmpl.ejs'),
	priceTableTmpl 	= require('../templates/priceTableTmpl.ejs'),
	queryPrices 	= require('../../../common/hotelPriceUtil/modules/hotelPriceUtil'),



	// 初始化地图的打开
	initOpenMap = function (hotelListTable) {
		hotelListTable.find(".hli-open-map").on('click', function () {
			var
				_this = $(this),
				_link = _this.attr('data-link'),
				hotelName = _this.attr('data-hotelname'),
				iWidth = 650,
				iHeight = 500,
				iTop = (window.screen.availHeight - 30 - iHeight) / 2,
				iLeft = (window.screen.availWidth - 10 - iWidth) / 2;

			window.open(_link, hotelName, 'height=' + iHeight + ',innerHeight=' + iHeight + ',width=' + iWidth + ',innerWidth=' + iWidth + ',top=' + iTop + ',left=' + iLeft + ',toolbar=no,menubar=no,scrollbars=auto,resizeable=no,location=no,status=no');
		})
	},

	// 初始化 "展开全部房型" 点击事件
	initExpandBtnClick = function (hotelListTable) {
		hotelListTable.find(".hli-expand-inner").on('click', function () {
			if (!this.priceList && !this.queryingPrice) {
				// 如果之前还未对此酒店查价，则查价
				queryPrices(this, getParams, priceTableTmpl);
			}

			var
				_this = $(this),
				expandText = _this.find('span'),
				expandIcon = _this.find('.hli-icon'),
				hotelItem = _this.closest('.hl-item'),
				hotelListWrap = hotelItem.find('.hli-price-list-outer');

			if (expandIcon.hasClass('icon-down')) {
				expandIcon.removeClass('icon-down').addClass('icon-up');
				expandText.html('收起全部房型');
				hotelListWrap.slideDown('fast');
				if(hotelItem.find('.progress-outer')[0].progress){
					hotelItem.find('.progress-outer')[0].progress.animateStart('animating');
				}
			} else {
				expandIcon.removeClass('icon-up').addClass('icon-down');
				expandText.html('展开全部房型');
				hotelListWrap.slideUp('fast');

				setTimeout(function () {
					var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
					var _top = hotelItem[0].getBoundingClientRect().top;

					if (_top < 75) {
						$(document).scrollTop(scrollY + _top - 75);
					}
				}, 150);
			}

			// 点击收起，去除fix样式
			_this.closest('.fix-bottom').removeClass('fix-bottom');

			// 异步触发屏幕滚动事件
			setTimeout(function () {
				$(document).trigger('scroll');
			}, 300)
		});
	},

	// 验证是否输入了关键字，如果两个关键字输入框都没输入，则提示用户输入
	validateKeyWord = function () {

		var
			keyword1 = $(".s-i-keyword-input").val().replace(/^\s+|\s+$/g, ''),
			keyword2 = $(".ssl-search-input").val().replace(/^\s+|\s+$/g, ''),
			keywordWrap1 = $(".siw-hotel-list");

		if (keyword1 === '' && keyword2 === '') {
			keywordWrap1.addClass('error');

			setTimeout(function () {
				keywordWrap1.removeClass('error');
			}, 1000)

			layer.msg('请输入关键字，查询你想要的酒店！');
		}
	},

	fixPriceRange = function (params) {
		var tmpArr = params.priceRange.split('-');
		if (tmpArr[1] === '0') {
			params.priceRange = tmpArr[0] + '-999999999';
		}
	},

	getLowestPirceForRealTimeHotels = function () {
		var lowestPriceArr = $('.hli-lowest-price');

		for (let i = 0; i < lowestPriceArr.length; i++) {
			var o = $(lowestPriceArr[i]);
			if (o.html() === '0') {
				var priceWrap = o.closest('.hli-lowest-price-wrap'),
					parent = o.closest('.hl-item'),
					expandBar = parent.find('.hli-expand-inner')[0];

				priceWrap.html('正在查询最优价...');
				queryPrices(expandBar, getParams, priceTableTmpl);
			}
		}
	},

	// 搜索酒店时发送统计
	statistics1 = function (params) {
		var distrbCode = window.distrbCode;

		if(!distrbCode){
			return setTimeout(function (param) {  
				statistics1(params);
			}, 1000);
		}

		if (params.keyWords.length > 0) {
			Statistics.doRecordByTCV("KeyWords", distrbCode, params.keyWords);
		}

		if (params.cityId) {
			var cityName = $('#s-i-keyword-input').val().replace(/^\s+|\s+$/g, '');
			Statistics.doRecordByTCV("CitySearch", distrbCode, cityName);
		}
	},

	// 搜索酒店返回各个酒店再将这些酒店名发到后台统计
	statistics2 = function (dataList) {
		if(!dataList)	return;

		var value_arr = dataList.map(o => o.infoName);
		
		if(value_arr.length){
			Statistics.doRecordByTCA("EffectiveHotelClick", window.distrbCode, value_arr);
		}
	},

	// 根据参数查询酒店
	queryHotels = function (params, dontValidate) {

		if (!dontValidate) {
			validateKeyWord();
		}

		$.queryingHotelParams = $.extend(true, {}, params);		// 深拷贝

		// 修正价格区间
		if (params.priceRange) {
			fixPriceRange(params);
		}

		// 搜索酒店时发送统计
		statistics1(params);

		$.post('/hotel/queryHotelListNew.do', params, function (res) {

			// 搜索酒店返回各个酒店再将这些酒店名发到后台统计
			statistics2(res.dataList);
			
			// 先清空酒店列表
			$(".hotel-list-outer").html('');

			if (res.returnCode === 1) {
				if (res.dataList && res.dataList.length) {

					res.data
						? $('.hotel-list-auto-hide').show()
						: $('.hotel-list-auto-hide').hide();


					// 去除垃圾数据
					res.dataList = res.dataList.filter(item => item.infoId)

					// 填充酒店列表
					var hotelListTable = $(hotelListTmpl({ datalist: res.dataList }));
					$(".hotel-list-outer").html(hotelListTable);
					initExpandBtnClick(hotelListTable);
					initOpenMap(hotelListTable);

					// 为那些没有起价的酒店实时查价
					getLowestPirceForRealTimeHotels()
				}

				$(".ssl-hotel-num").html(res.data ? 0 : res.pageRecordCount);
			} else if (res.returnCode === -400001) {
				Util.login();
			}

			var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
			if (scrollTop > 90) {
				// 滚动到页面顶部
				$('.search-line-outer').hasClass('fix-top')
					? $(document).scrollTop(89)
					: $(document).scrollTop(0);
			}

			// 数据分页
			pagenation({
				elem: '.hotel-list-page-outer', // 组件容器
				pages: res.pageTotal,           // 总页数
				current: params.pageNow,        // 当前显示的第几页
				jump: function (cur) {          // 触发分页后的回调
					params.pageNow = cur;
					queryHotels(params, dontValidate);
				}
			})
		});
	},

	// 获取查询酒店的参数
	getParams = function (cur) {
		var
			keywordInput = document.querySelector(".s-i-keyword-input"),
			datesInput = document.querySelector(".s-i-dates-input"),
			roomNum = document.querySelector(".s-i-room-num"),
			adultChildren = document.querySelector(".s-i-adult-children"),

			params = {
				cityId: keywordInput.cityid,
				type: keywordInput.citytype || $.initQueryHotelParams.type,
				// 注意：如果选择了城市，则第一个关键字框的 keyWords 参数不能带过去
				keyWords: ((keywordInput.cityid ? '' : keywordInput.value.replace(/^\s+|\s+$/g, '')) + '&nbsp;' + $(".ssl-search-input").val().replace(/^\s+|\s+$/g, '')).replace(/^&nbsp;|&nbsp;$/g, ''),
				startDate: Util.formatOne(datesInput.checkin),
				endDate: datesInput.checkout ? Util.formatOne(datesInput.checkout) : Util.addDays(datesInput.checkin, 1),
				selRoomNum: $(roomNum).attr('data-value'),
				adultNum: adultChildren.adultNum,
				childrenNum: adultChildren.childrenNum,
				childrenAgesStr: adultChildren.childrenAgesStr,
				pageNow: cur || 1
			},
			asiArr = $(".a-s-s-item"),
			star = [], priceRange = [], bizCircleId = [], zoneId = [], hotelFacility = [], hotelGroup = [];

		for (var i = 0; i < asiArr.length; i++) {
			var
				o = $(asiArr[i]),
				_value = o.attr('data-value'),
				_attr = o.attr('data-attr');

			_attr === 'priceRange' ? priceRange.push(_value) :
			_attr === 'star' ? star.push(_value) :
			_attr === 'bizCircleId' ? bizCircleId.push(_value) :
			_attr === 'zoneId' ? zoneId.push(_value) :
			_attr === 'hotelgroup' ? hotelGroup.push(_value) :
			_attr === 'hotelFacility' ? hotelFacility.push(_value) : '';
		}

		if (star.length) params.star = star.join(',');
		if (priceRange.length) params.priceRange = priceRange.join(',');
		if (bizCircleId.length) params.bizCircleId = bizCircleId.join(',');
		if (zoneId.length) params.zoneId = zoneId.join(',');
		if (hotelFacility.length) params.hotelFacility = hotelFacility.join(',');
		if (hotelGroup.length) params.hotelGroup = hotelGroup.join(',');

		return params;
	};


// 高级搜索框 js
module.exports = {
	queryHotels,
	getParams
}