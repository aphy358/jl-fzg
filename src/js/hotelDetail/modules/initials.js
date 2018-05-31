
const
	Util 						= require('../../../common/util.js'),
	queryString 				= Util.queryString,
	addDays						= Util.addDays,
	priceTableTmpl 				= require('../templates/priceTableTmpl.ejs'),
	hotelInfoTmpl 				= require('../templates/hotelInfoTmpl.ejs'),
	hotelInfoDetailsTmpl		= require('../templates/hotelInfoDetailsTmpl.ejs'),
	queryPrices					= require('../../../common/hotelPriceUtil/modules/hotelPriceUtil.js'),
	
	
	
	// 初始化地图的打开
	initOpenMap = function(){
		$(".hdi-open-map").on('click', function(){
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
	
	// 将上个页面传过来的参数设置到相应的项
	setInitParams = function(params){
		var
			datesInput = document.querySelector(".s-i-dates-input"),
			roomNum = document.querySelector(".s-i-room-num"),
			adultChildren = document.querySelector(".s-i-adult-children");
		
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
			$(".s-i-adult-children-wrap").remove();
		}
	},
	
	// 设置酒店信息
	setHotelInfo = function(data){
		
		// 设置酒店图片
		data.picList = data.picList || [];
		var picArr = data.picSrc.split('|');
		if(!data.picList.length)	data.picList = picArr;
		data.picSrc = picArr[0];
		
		// 设置酒店名称
		$("#hotel-name").html(data.infoName);

		// 填充酒店信息
		$(".hotel-detail-info-outer").html( hotelInfoTmpl({o: data}) );
		$(".hotel-detail-outer").html( hotelInfoDetailsTmpl({o: data}) );
		
		initOpenMap();
	},
	
	// 根据参数查询酒店
	queryHotels = function(params){
		$.post('/hotel/getHotelInfoList.do', params, function(res){
			if( res.returnCode === 1 ){
	            if( res.dataList && res.dataList.length ){
	            	setHotelInfo(res.dataList[0]);
	            }
	        }else if( res.returnCode === -400001 ){
	            Util.login();
			}
		});
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
		var hotelId = queryString('hotelId');
		var	hotelIdObj = $("#hotelId");
		var	checkin = queryString('checkin');
		var	checkout = queryString('checkout');
		var	citytype = queryString('ch');

		// 修复由首页广告带过来的日期是以前日期的 bug
		if(citytype == 3){	// 境外
			if( (+new Date() + 24 * 60 * 60 * 1000) > +new Date(checkin.replace(/-/g, '/') + ' 23:59:59') ){
				checkin = addDays( new Date(), 1 );
				checkout = addDays( new Date(), 2 );
			}
		}else{
			if( +new Date() > +new Date(checkin.replace(/-/g, '/') + ' 23:59:59') ){
				checkin = addDays( new Date(), 0 );
				checkout = addDays( new Date(), 1 );
			}
		}
		

		var	params = {
				'infoIds': hotelId,
				"type": citytype,
	            "startDate": checkin,
	            "endDate": checkout,
	            "selRoomNum": 1,
	            "adultNum": 2,
	            "childrenNum": 0,
	            "childrenAgesStr": '',
	            "pageNow": 1
			};
			
		hotelIdObj.attr('data-hotelid', hotelId);
			
		setNavText(citytype);
		
		setInitParams(params);
		
		$.queryingHotelParams = params;

		queryHotels(params);
		
		queryPrices(hotelIdObj[0], params, priceTableTmpl);
	},

	initPageScroll = function(){
		window.onscroll = function(){
			var elem = $('.hli-expand-inner .icon-up')[0],
				clientHeight = document.documentElement.clientHeight;

			if(elem){
				const
					o = $('.hli-expand-inner')[0],
					p = $(o).closest('.hli-price-list-wrap')[0],
					rect = p.getBoundingClientRect();

				if(rect.bottom >= clientHeight){
					$(o).addClass('fix-bottom');
				}else{
					$(o).removeClass('fix-bottom');
				}
				
				if(rect.top >= clientHeight - 300){
					$(o).removeClass('fix-bottom');
				}

				if(rect.top <= 90){
					$('.search-line-outer').addClass('fix-top');
				}else{
					$('.search-line-outer').removeClass('fix-top');
				}
			}else{
				$('.search-line-outer').removeClass('fix-top');
			}
		}
	};




// 刚进入列表页面时，做的一些初始化
module.exports = {
    run: function(){
    	
    	// 获取上个页面传过来的参数，然后初始化页面
		getInitParamsAndInitPage();
		
		// 初始化屏幕滚动
		initPageScroll();
    }
}