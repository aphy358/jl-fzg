// 引入子模块
const
	Util						= require('../../../common/util.js'),
	myCalendar 					= require('../../../common/myCalendar/myCalendar'),
	mySelect 					= require('../../../common/select/select'),
	adultChildrenSelect 		= require('../../../common/adultChildrenSelect/adultChildrenSelect'),
	queryPrices					= require('../../../common/hotelPriceUtil/modules/hotelPriceUtil.js'),
	priceTableTmpl      		= require('../templates/priceTableTmpl.ejs'),
	filterPriceAndFillIntoTable = require('../../../common/hotelPriceUtil/modules/filterPriceAndFillIntoTable.js'),
	
	
	
	// 根据传入的开始值和结束值，获取价格区间字符串
    getPriceRange = function (priceMin, priceMax) {
        priceMin = priceMin || 0;
        priceMax = priceMax || 4000;
        
        var priceArr = [0, 200, 300, 500, 800, 1500, 3000, 30000];
        var falg_start = false;//是否找到开始区间
        var falg_end = false;//是否找到结束区间
        var priceRange_result_str = "";
        for (var p_i = 0; p_i < 7; p_i++) {
            var priceArr_min = priceArr[p_i];//0
            var priceArr_max = priceArr[p_i + 1] - 1;//199
            if (priceMin >= priceArr_min && priceMin <= priceArr_max) {
                //找到开始区间
                falg_start = true;
            }
            if (falg_start && !falg_end) {
                if (priceRange_result_str == "") {
                    priceRange_result_str = priceArr_min + "-" + priceArr_max;
                } else {
                    priceRange_result_str += "," + priceArr_min + "-" + priceArr_max;
                }
            }
            if (priceMax >= priceArr_min && priceMax <= priceArr_max) {
                //找到结束区间
                falg_end = true;
            }
        }
		if( priceRange_result_str.lastIndexOf(',') >= 48 )  priceRange_result_str = '';
        return priceRange_result_str;
    },
    	
	// 获取查询酒店的参数
	getParams = function(){
		var
			datesInput = document.querySelector(".s-i-dates-input"),
			roomNum = document.querySelector(".s-i-room-num"),
			adultChildren = document.querySelector(".s-i-adult-children"),
			params = {
				type		   	: 0,
				startDate	   	: Util.formatOne(datesInput.checkin),
				endDate		   	: datesInput.checkout ? Util.formatOne(datesInput.checkout) : Util.addDays(datesInput.checkin, 1),
				selRoomNum	   	: $(roomNum).attr('data-value'),
				adultNum	   	: adultChildren ? adultChildren.adultNum : 2,
				childrenNum	   	: adultChildren ? adultChildren.childrenNum : 0,
				childrenAgesStr	: adultChildren ? adultChildren.childrenAgesStr : ''
			},
			priceRange = getPriceRange( +$("#slp_1").val(), +$("#slp_2").val() );
		
		if(priceRange)	params.priceRange = priceRange;

		$.extend($.queryingHotelParams, params);
		
		return params;
	},
	
	searchLineScrollIntoView = function(){
		if( $('.search-line-outer').hasClass('fix-top') ){
			setTimeout(function(){
				// 当重新查询价格时，将搜索栏滚动到页面顶部
				$('.search-line-outer')[0].scrollIntoView();
			}, 50);
		}
	},

	searchHotelPrice = function(){
		// 先验证价格区间是否合理
		var price1 = $("#slp_1").val(),
			price2 = $("#slp_2").val();
			
		if( price1 && price2 && parseInt(price1) > parseInt(price2) ){
			layer.msg('请设置正确的价格区间！')
			return false;
		}
		
		var loadingStr = 
			'<div class="fzg-loading-wrap">' +
                '<img src="https://qnb.oss-cn-shenzhen.aliyuncs.com/real_1514022140288.gif"/>' +
            '</div>';
            
		$(".hli-price-list-wrap").html(loadingStr);
		queryPrices(document.querySelector('#hotelId'), getParams, priceTableTmpl);
		searchLineScrollIntoView();
	},
	
	// 初始化 "搜索" 按钮点击事件、改变房间数、勾选 "可加早"、"可加床"
	initSearchBtnClick = function(){
		$(".search-line-btn").on('click', function(){
			if( !$(this).hasClass('disabled') ){
				searchHotelPrice();
			}
		})

		$(".s-i-room-num, .d-s-item.bedbreakfast").on('change', function(){
			searchHotelPrice();
		})
	},
	
	initCalendar = function (){
	    $('.s-i-dates-input').on('mousedown', function(){
	        myCalendar({
	            left: -81,
	            top: 1,
	            validDays: 15,
	            cityType: $.queryingHotelParams.type || 0,
	        });
		})
		
		$('.s-i-dates-input').on('datePicked', function(){
	        searchHotelPrice();
	    })
	},
	
	initRoomNum = function (){
	    $(".s-i-room-num").on('mousedown', function(){
	        mySelect({
	            options: [
	                {text: '1间', value: '1'},
	                {text: '2间', value: '2'},
	                {text: '3间', value: '3'},
	                {text: '4间', value: '4'},
	                {text: '5间', value: '5'},
	                {text: '6间', value: '6'},
	                {text: '7间', value: '7'},
	            ]
	        });
	    })
	},
	
	initAdultChildrenSelect = function (){
	    $('.s-i-adult-children').on('mousedown', function(){
	        adultChildrenSelect();
	    })
	},
	
	// 初始化前端过滤条件的勾选事件，包括 "立即确认"、"60秒确认"、"只显示可订"、"可取消"、"可加床"、"可加早"
	initFrontEndParamsChange = function(){
		$(".d-s-item").on('click', function(){
			if( !$(this).hasClass('bedbreakfast') ){
				filterPriceAndFillIntoTable(priceTableTmpl);
			}

			searchLineScrollIntoView();
		});
	},
	
	// 初始化价格区间的输入事件
	initPriceRangeInput = function(){
		$(".search-line-price").on('keyup input paste', function(){
			this.value = this.value.replace(/[^\d]/g, '');
		})
	},

	// 初始化 "最低价"、"最高价" 的编辑事件
	initLowestHighestEdit = function(){
		$(".search-line-price").on('change', function(){
			filterPriceAndFillIntoTable(priceTableTmpl);
		})
	};
	


// 搜索栏 js
module.exports = {
    run: function(){
        
        // 初始化价格区间的输入事件
        initPriceRangeInput();
        
        // 初始化日历组件
        initCalendar();

        // 初始化房间数
        initRoomNum();

        // 初始化成人小孩选择组件
        initAdultChildrenSelect();
        
        // 初始化 "搜索" 按钮点击事件
        initSearchBtnClick();
        
        // 初始化前端过滤条件的勾选事件，包括 "立即确认"、"60秒确认"、"只显示可订"、"可取消"、"含早"
        initFrontEndParamsChange();
        
        // 初始化 "最低价"、"最高价" 的编辑事件
        initLowestHighestEdit();
    }
}