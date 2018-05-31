

// 引入子模块
const
    queryZoneAndBiz 	= require('./zoneAndBiz.js').queryZoneAndBiz,
	keyWords_city 		= require('../../../common/keyWords_city/keyWords_city'),
	keyWords_hotel 		= require('../../../common/keyWords_hotel/keyWords_hotel'),
	myCalendar 			= require('../../../common/myCalendar/myCalendar'),
	mySelect 			= require('../../../common/select/select'),
	adultChildrenSelect = require('../../../common/adultChildrenSelect/adultChildrenSelect'),
	
	queryHotelUtil 		= require('./queryHotelUtil.js'),
	getParams 			= queryHotelUtil.getParams,
	queryHotels 		= queryHotelUtil.queryHotels,
	
	addDays				= require('../../../common/util.js').addDays,

	editASI         	= require('./editASI.js'),
    clearAllASI 		= editASI.clearAllASI,
    
	
	firstTimeFocusKeyword = function(_this){
		if(!_this.keyWordsHotel){
			return setTimeout(function(){
				firstTimeFocusKeyword(_this);
			}, 10);
		}

		$(_this).trigger('focus');
	},

	initKeyWordsCity = function (){
	    $('.s-i-keyword-input').on('focus', function(){
			var value = this.value.replace(/^\s+|\s+$/g, '');
			
			if( value !== '' && !this.keyWordsHotel ){
				firstTimeFocusKeyword(this);
			}

	        keyWords_hotel({left: -85, top: 1});
			keyWords_city({left: -85, top: 1, citytype: $.initQueryHotelParams.type});
	    })
	},
	
	initCitySelect = function (){
	    $(document).delegate('.kwh-block-content-item.city, .kwc-city-item', 'click', function(){
	    	var cityid = $(this).attr('data-cityid');
	    	queryZoneAndBiz(cityid);
	    })
	},
	
	initKeyWordChange = function(){
		$(".s-i-keyword-input").on('change', function(){
			queryZoneAndBiz();
		})
	},
	
	initCalendar = function (){
	    $('.s-i-dates-input').on('mousedown', function(){
	        myCalendar({
	            left: -81,
	            top: 1,
	            validDays: 15,
	            cityType: $.initQueryHotelParams.type || 0,
	        });
	    })
	},

	resetCalendar = function(cityType){
		// 将原先的日历对象删掉
		var calendarTarget = document.querySelector('.s-i-dates-input');
		calendarTarget.value = '';
		if( calendarTarget.myCalendar ){
			$(calendarTarget.myCalendar.element).remove();
			calendarTarget.myCalendar = null;
		}

		// 重置日历日期
		if( cityType == 3 ){
			calendarTarget.checkin = addDays(new Date(), 1);
			calendarTarget.checkout = addDays(new Date(), 2);
		}else{
			calendarTarget.checkin = addDays(new Date(), 0);
			calendarTarget.checkout = addDays(new Date(), 1);
		}
	},

	resetKeyword = function(cityType){
		// 将关键字输入框清空
		var keyWordsObj = document.querySelector(".s-i-keyword-input");
		keyWordsObj.value = '';
		keyWordsObj.cityid = null;
		keyWordsObj.citytype = cityType;
		
		if(keyWordsObj.keyWordsCity){
			$(keyWordsObj.keyWordsCity.element).remove();
			keyWordsObj.keyWordsCity = null;
		}

		if(keyWordsObj.keyWordsHotel){
			$(keyWordsObj.keyWordsHotel.element).remove();
			keyWordsObj.keyWordsHotel = null;
		}
	},

	resetAdultChildren = function(cityType){
		// 切换成人小孩选择框的显示，并重置其值、删除成人小孩选择框组件
		cityType === '0'
			? $(".s-i-adult-children-wrap").hide()
			: $(".s-i-adult-children-wrap").show();

		var adultChildrenObj = document.querySelector(".s-i-adult-children");
		adultChildrenObj.value = '2成人，0小孩';
		if( adultChildrenObj.adultChildrenSelect ){
			adultChildrenObj.adultChildrenSelect.element.remove();
			adultChildrenObj.adultChildrenSelect = null;
		}
	},

	resetNavText = function(citytype){
		var navText =
				citytype == 2 ? '港澳台' : 
				citytype == 3 ? '国外' : '国内';
				
		$("#cityTypeText").html(navText);
	},

	initCityType = function(){
		$(".s-i-city-type").on('mousedown', function(){
	        mySelect({
	            options: [
	                {text: '国内', value: '0'},
					{text: '港澳台', value: '2'},
					{text: '国外', value: '3'}
	            ]
	        });
		})
		
		$(".s-i-city-type").on('change', function(){
			
			var cityType = $(this).attr('data-value');

			// 将新的城市类型设置进全局变量
			$.initQueryHotelParams.type = cityType;

			// 设置 nav 上的城市类型
			resetNavText(cityType);

			// 更改浏览器 url
			if(history.replaceState)	history.replaceState({}, "页面标题", "/hotel/toHotelList.do?ch=" + cityType);

			// 清空所有勾选的搜索项
			clearAllASI('dontQuery');

			// 重置日历
			resetCalendar(cityType);

			// 重置关键字
            resetKeyword(cityType);

			// 重置成人小孩面板
			resetAdultChildren(cityType);

			queryHotels( getParams(1), true );
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

	// 将关键字设置为历史记录
	setHistoryKeyword = function(){
		var keyWordObj = document.querySelector('.s-i-keyword-input');
		// TO DO...
	},
	
	// 初始化搜索事件
	initSearchEvent = function (){
		$(".search-line-btn").on('click', function(){
			queryHotels( getParams(1) );
			setHistoryKeyword();
		})

		$(".s-i-room-num").on('change', function(){
			queryHotels( getParams(1) );
			setHistoryKeyword();
		})
	};
	


// 搜索栏 js
module.exports = {
    run: function(){

		// 初始化城市类型
		initCityType();

        // 初始化关键字组件
        initKeyWordsCity();
        
        // 初始化城市选择事件，然后根据选择的城市查询对应的行政区和商业圈
        initCitySelect();
        
        // 初始化关键字改变事件
        initKeyWordChange();
        
        // 初始化日历组件
        initCalendar();

        // 初始化房间数
        initRoomNum();

        // 初始化成人小孩选择组件
        initAdultChildrenSelect();
        
        // 初始化搜索事件
		initSearchEvent();
    }
}