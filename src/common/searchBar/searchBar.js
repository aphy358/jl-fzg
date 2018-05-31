
// 引入样式文件
require('./sass/searchBar.scss');


// 引入子模块
const
    Util                = require('../util.js'),
    range               = require('../rangeBar/rangeBar'),
    keyWords_city       = require('../keyWords_city/keyWords_city'),
    keyWords_hotel      = require('../keyWords_hotel/keyWords_hotel'),
    myCalendar          = require('../myCalendar/myCalendar'),
    mySelect            = require('../select/select'),
    starSelect          = require('../starSelect/starSelect'),
	adultChildrenSelect = require('../adultChildrenSelect/adultChildrenSelect'),
	searchBarTmpl		= require('./templates/searchBar.ejs'),


	initGroupSelect = function (elem){
        elem.find(".i-s-group-select").on('mousedown', function(){
            mySelect({
                options: [
                    {text: '万豪', value: '69', attr: 'selected'},
                    {text: '洲际', value: '66'},
                    {text: '喜达屋', value: '68'},
                    {text: '贝斯特韦斯特', value: '1996'},
                ]
            });
        })
	},

    // 初始化 "国内"、"港澳台"、"境外" 的切换事件
    initCityTypeSwitch = function (elem){
        elem.find(".i-s-origin-switch").on('click', function(){
            var
            _this = $(this),
            cityType = _this.attr('data-val');

            if( this.hasAttribute('checked') )	return;
            
            // 将原先的日历对象删掉
            var calendarTarget = document.querySelector('.i-s-dates-input');
            calendarTarget.value = '';
            if( calendarTarget.myCalendar ){
                $(calendarTarget.myCalendar.element).remove();
                calendarTarget.myCalendar = null;
            }

            // 将关键字输入框清空
            var keyWordsObj = document.querySelector(".i-s-keyword-input");
            keyWordsObj.value = '';
            keyWordsObj.cityid = null;
            keyWordsObj.citytype = cityType;
            if( keyWordsObj.keyWordsCity ){
                keyWordsObj.keyWordsCity.citytype = cityType;
                keyWordsObj.keyWordsCity.show(cityType);
            }
            if( keyWordsObj.keyWordsHotel ){
                keyWordsObj.keyWordsHotel.hide();
            }

            // 切换成人小孩选择框的显示，并重置其值、删除成人小孩选择框组件
            cityType === '0'
                ? $("#index-adult-children").hide()
                : $("#index-adult-children").show();

            var adultChildrenObj = document.querySelector(".i-s-adult-children");
            adultChildrenObj.value = '2成人，0小孩';
            if( adultChildrenObj.adultChildrenSelect ){
                adultChildrenObj.adultChildrenSelect.element.remove();
                adultChildrenObj.adultChildrenSelect = null;
            }
        })
    },

    initCalendar = function (elem){
        elem.find('.i-s-dates-input').on('click', function(){
            myCalendar({
                left: -60,
                validDays: 15,
                cityType: $(".i-s-origin-switch[checked]").attr('data-val'),
            });
        })
    },

    initAdultChildrenSelect = function (elem){
        elem.find('.i-s-adult-children').on('mousedown', function(){
            adultChildrenSelect();
        })
    },

    initStarSelect = function (elem){
        elem.find(".i-s-star").on('mousedown', function(){
            starSelect();
        })
    },

    initRangeBar = function (elem){
        range({
            target : elem.find(".i-s-range-outer"),
            vBegin : 0,
            vEnd : 10000,
        });
    },

    // 点击 "高级搜索条件"
    switchMoreSearch = function (elem){
        elem.find('.i-s-row-slide-bar').on('click', function(){
            var _this = $(this),
                barIcon = _this.find('.slide-bar'),
                parent = _this.closest('section'),
                rowTwo = parent.find('.i-s-row-two-wrap');

            rowTwo.slideToggle('fast');
            
            if( barIcon.hasClass('up') ){
                barIcon.removeClass('up').addClass('down');
                $('.swiper-container').animate({height: '520px'}, 'fast');
            }else{
                barIcon.removeClass('down').addClass('up');
                $('.swiper-container').animate({height: '600px'}, 'fast');
            }
        })
    },

    // 点击 "搜索" 
    initSearch = function (elem){
        elem.find(".i-s-search-btn").on('click', function(){
            //先判断用户是否已登录
	        if (window.hasLoginFzg === 'false'){
		        // 登录组件
		        require('../loginBox/loginBox.js')();
		
		        return false;
	        }
	        
            var
                keyWordsObj = document.querySelector(".i-s-keyword-input"),
                cityId = keyWordsObj.cityid,
                type = keyWordsObj.citytype || $(".i-s-origin-switch[checked]").attr('data-val'),

                datesInput = document.querySelector(".i-s-dates-input"),
                startDate, endDate,
                
                keyWordsVal = $(".i-s-keyword-input").val().replace(/^\s+|\s+$/g, ''),
				selHotelGroup = $(".i-s-group-select").attr('data-value'),
				selRoomNum = $(".i-s-room-num").attr('data-value'),
                
                adultChildren = document.querySelector(".i-s-adult-children"),
                adultNum = adultChildren.adultNum || 2,
                childrenNum = adultChildren.childrenNum || 0,
                childrenAgesStr = adultChildren.childrenAgesStr || '',

                vbegin = parseInt( $(".range-vbegin").html() ),
                vend = parseInt( $(".range-vend").html() ),
                priceRange = getPriceRange(vbegin, vend),

                starSelect = document.querySelector(".i-s-star").starSelect,
                star = starSelect ? starSelect.starVal : '';

            if( keyWordsVal === '' ){
                layer.msg('请输入酒店名或关键字！');

                $(".i-s-keyword-input").addClass('error');
                setTimeout(function(){
                    $(".i-s-keyword-input").removeClass('error');
                }, 1000);
                
                return false;
            }

            if( datesInput.myCalendar ){
                startDate = Util.formatOne(datesInput.checkin),
                endDate = datesInput.checkout
                            ? Util.formatOne(datesInput.checkout)
                            : Util.addDays(startDate, 1);
            }else{
                type == 3
                    ? ( startDate = Util.addDays(new Date(), 1), endDate = Util.addDays(new Date(), 2) )
                    : ( startDate = Util.addDays(new Date(), 0), endDate = Util.addDays(new Date(), 1) );
            }

            var params = {
                "type":             type,
                "cityId":           cityId,
                "star":             star,
                "startDate":        startDate,
                "endDate":          endDate,
                // keyWords 只用于匹配酒店，如果设置了 cityId，则该字段不传
                "keyWords":         cityId ? null : keyWordsVal,
				"searchKey":        keyWordsVal,
				'selHotelGroup':	selHotelGroup,
                "selRoomNum":       selRoomNum,
                "adultNum":         adultNum,
                "childrenNum":      childrenNum,
                "childrenAgesStr":  childrenAgesStr,
                "pageNow":          1,
                "immediate":        $(".i-s-confirm-now").prop('checked') ? "XS-1" : ""
            };

            if(priceRange){
                params.priceRange = priceRange;
            }

            sessionStorage.setItem("initialHotelListParams",  window.JSON.stringify(params));

            //*** */
            window.open('/hotel/toHotelList.do?ch=' + type);
            //window.open('./hotelList.html?ch=' + type);
        })
    },

    // 根据传入的开始值和结束值，获取价格区间字符串
    getPriceRange = function (priceMin, priceMax) {

        priceMin = priceMin || 0;

        if( !priceMax || +priceMax === 3000 ){
            priceMax = 999999999;
        }

        if( priceMin === 0 && priceMax === 999999999 ){
            return '';
        }

        return priceMin + '-' + priceMax;
    },

    initKeyWordsCity = function (elem){
        elem.find('.i-s-keyword-input').on('focus', function(){
            var value = this.value.replace(/^\s+|\s+$/g, '');
            keyWords_hotel({left: -60});
            keyWords_city({left: -60, citytype: $(".i-s-origin-switch[checked]").attr('data-val')});
        })
    },

    initRoomNum = function (elem){
        elem.find(".i-s-room-num").on('mousedown', function(){
            mySelect({
                options: [
                    {text: '1间', value: '1', attr: 'selected'},
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
	
	initEvents = function (options, elem) {
		if(options.hotelGroup){
			// 初始化集团选择下拉组件
			initGroupSelect(elem);
		}

		// 初始化 "国内"、"港澳台"、"境外" 的切换事件
		initCityTypeSwitch(elem);

		// 初始化关键字组件
		initKeyWordsCity(elem);

		// 初始化日历组件
		initCalendar(elem);

		// 初始化房间数
		initRoomNum(elem);

		// 初始化成人小孩选择组件
		initAdultChildrenSelect(elem);
		
		// 初始化价格 range 组件
		initRangeBar(elem);

		// 初始化星级选择组件
		initStarSelect(elem);

		// 点击 "高级搜索条件"
		switchMoreSearch(elem);

		// 点击 "搜索" 
		initSearch(elem);
	};




//首页搜索栏 相关 js
module.exports = function (options) {
    
	// 先用模板生成 dom 对象
	var elem = $(searchBarTmpl({hotelGroup: options.hotelGroup}));

	if(options.hotelGroup){
		elem.find('.index-search-wrap').css('width', '1115px');
	}

	// 再将其插入到页面相关位置
    $(options.elem).html(elem);

	// 最后初始化该组件相关事件
	initEvents(options, elem);
}
