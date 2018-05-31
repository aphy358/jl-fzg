var
	Util = require('../../../common/util.js'),
	
	// 城市关键字面板模板
	keyWords_hotelPanel = require('../templates/keyWords_hotelPanel.ejs'),
	cityBlock = require('../../../common/keyWords_hotel/templates/cityBlock.ejs'),
	hotelBlock = require('../../../common/keyWords_hotel/templates/hotelBlock.ejs'),
	
	_default = {
	    setPos : function(){
	        var
	        target = this.target,
	        targetRect = target.getBoundingClientRect(),
	        left = targetRect.left + (this.left || 0) + $(document).scrollLeft(),
	        top = targetRect.bottom + 2 + (this.top || 0) + $(document).scrollTop(),
	        widthBorder = document.body.scrollWidth - 550;
	        
	        this.element.css('left', left > widthBorder ? widthBorder : left)
	                    .css('top', top)
	                    .css('display', 'none');
	    },
	    show : function(){
	        this.setPos();
	        this.element.show();
	    },
	    hide : function(){
	        this.element.hide();
	    }
	},
	
	queryCities = function (_this, noContent, params1){
		$.post('/city/searchCity.do', params1, function(res){
	        var element = _this.keyWordsHotel.element;
	        if( res.returnCode === 1 ){
	            if( res.dataList.length ){
	                noContent.hide();
	                for (var i = 0; i < res.dataList.length; i++) {
	                    var o = res.dataList[i];
		
		                //搜索关键词高亮
		                o.cityStr = '';
		                for (var oname = 0; oname < o.aname.length; oname++) {
			                if (params1.key.indexOf(o.aname[oname]) !== -1){
				                o.cityStr += '<span class="key">' + o.aname[oname] + '</span>';
			                }else{
				                o.cityStr += o.aname[oname];
			                }
		                }
		                
	                    o.provinceName = o.provinceName.replace(/[A-Za-z-]/g, '');
	                    o.countryName = o.countryName.replace(/[A-Za-z-]/g, '');
	                }
	                var cityStr = cityBlock({
	                    dataList: res.dataList
	                });
	                element.find('.kwh-block.city').html(cityStr);
	            }else{
	                element.find('.kwh-block.city').empty();
	                if(element.find('.kwh-block.hotel').html() === '') noContent.show();
	            }
	        }else if( res.returnCode === -400001 ){
	            Util.login();
	        }
	    }, 'noAnimation');
	},
	
	queryHotels = function (_this, noContent, params2){
		$.post('/suggest/searchHotel.do', params2, function(res){
	        var element = _this.keyWordsHotel.element;
	        if( res.returnCode === 1 ){
	            if( res.dataList.length ){
					noContent.hide();

					// 当直接点击关键字搜出来的酒店时，将日历选中的日期也带过去（如果有日历的话）
					var 
						datesInput = document.querySelector(".my-calendar-input"),
						checkin,
						checkout;

					if( datesInput && datesInput.myCalendar ){
						checkin = Util.formatOne(datesInput.checkin),
						checkout = datesInput.checkout
									? Util.formatOne(datesInput.checkout)
									: Util.addDays(checkin, 1);
					}else{
						params2.type == 3
							? ( checkin = Util.addDays(new Date(), 1), checkout = Util.addDays(new Date(), 2) )
							: ( checkin = Util.addDays(new Date(), 0), checkout = Util.addDays(new Date(), 1) );
					}

	                for (var i = 0; i < res.dataList.length; i++) {
	                    var o = res.dataList[i];
	                    o.link = '/hotel/toHotelDetail.do?ch=' + params2.type + '&hotelId=' + o.id + '&checkin=' + checkin + '&checkout=' + checkout;
	                    
	                    //搜索关键词高亮
		                o.hotelStr = '';
		                for (var oname = 0; oname < o.name.length; oname++) {
			                if (params2.keys.indexOf(o.name[oname]) !== -1){
				                o.hotelStr += '<span class="key">' + o.name[oname] + '</span>';
			                }else{
				                o.hotelStr += o.name[oname];
			                }
		                }
		                
	                    o.cityName = o.cityName ? o.cityName.replace(/[A-Za-z-]/g, '') : '';
	                    o.provinceName = o.provinceName.replace(/[A-Za-z-]/g, '');
	                    o.countryName = o.countryName.replace(/[A-Za-z-]/g, '');
	                }
	                var hotelStr = hotelBlock({
	                    dataList: res.dataList
	                });
	                element.find('.kwh-block.hotel').html(hotelStr);
	            }else{
	                element.find('.kwh-block.hotel').empty();
	                if(element.find('.kwh-block.city').html() == '') noContent.show();
	            }
	        }else if( res.returnCode === -400001 ){
	            Util.login();
	        }
	    }, 'noAnimation');
	},
	
	getKeyWordData = function (keyWords_hotel){
		var _this = keyWords_hotel.target;
		var noContent = keyWords_hotel.element.find('.kwh-no-content');
		var cityType = $(".i-s-origin-switch[checked]").attr('data-val') || $.initQueryHotelParams.type;
		var key = _this.value.replace(/^\s+|\s+$/g, '');
		
		_this.cityid = null;
		_this.citytype = null;
			
		if( key !== '' ){
			if (_this.keyWordsCity)_this.keyWordsCity.hide();
			if (_this.keyWordsHotel)_this.keyWordsHotel.show();
	
			var params1 = {
				type: cityType,
				key: key
			};
	
			var params2 = {
				type: cityType,
				keys: key
			};
			
			// 查询城市
            if (_this.keyWordsCity)queryCities(_this, noContent, params1);
	
			// 查询酒店
            if (_this.keyWordsHotel)queryHotels(_this, noContent, params2);
			
		}else{
            if (_this.keyWordsCity)_this.keyWordsCity.show(cityType);
            if (_this.keyWordsHotel)_this.keyWordsHotel.hide();
		}
	},
	
	// 初始化组件事件
	initEvents = function (keyWords_hotel){
	
	    var element = keyWords_hotel.element;
	    var target = $(keyWords_hotel.target);
	
	    $(document).on('mousedown', function(e){
	        var
	        event = window.event || e,
	        target = event.target || event.srcElement,
	
	        // 兼容IE，当点击到滚动条时，chrome下的target显示为document，而IE8下显示是根节点<html>标签，而IE9下是对象{...}
	        isScrollBar = target.tagName === 'HTML' || !target.tagName,
	
	        // 是否是上一级的切换按钮
	        isOuterSwitch = !!($(target).attr('name') && $(target).attr('name') === 'i-s-origin-switch');
	
	        // 当点击的位置既不是该组件，也不是该组件对应的目标元素，也不是滚动条时，则隐藏该组件
			if( !$(target).closest('.key-word-hotel-wrap')[0] && target !== keyWords_hotel.target && !isScrollBar && !isOuterSwitch ){
	            keyWords_hotel.hide();
	        }
		})
	
	    target.on('focus', function(){
	        var value = this.value.replace(/^\s+|\s+$/g, '');
			
			if( !(value === '' || value === $(this).attr('placeholder')) ){
				this.keyWordsHotel.show();
				Util.throttle( getKeyWordData, keyWords_hotel, 10 );

				if( this.keyWordsCity ){
					this.keyWordsCity.hide();
				}
			}
	    })
	
	    // 点击某个城市
	    element.delegate('.kwh-block-content-item.city', 'click', function(){
	        var
		        _this = $(this),
		        cityid = _this.attr('data-cityid'),
		        citytype = _this.attr('data-citytype'),
		        cityname = _this.attr('data-cityname');
	
	        keyWords_hotel.target.cityid = cityid;
	        keyWords_hotel.target.citytype = citytype;
	        keyWords_hotel.target.tagName == 'INPUT'
	            ? keyWords_hotel.target.value = cityname
	            : keyWords_hotel.target.innerHTML = cityname;
	
	        keyWords_hotel.element.hide('fast');
	    })
	
	    // 点击某个酒店
	    element.delegate('.kwh-block-content-item.hotel', 'click', function(){
		    if (window.hasLoginFzg === 'true'){
			    keyWords_hotel.element.hide('fast');
		    }
	    });
		
		//点击酒店链接
		element.delegate('.kwh-block-content-item.hotel>a', 'click', function (e) {
			if (window.hasLoginFzg === 'false'){
				require('../../loginBox/loginBox.js')();
				return false;
			}
			
			//如果传入了点击酒店列表的回调函数，则执行传入的回调函数
			if (keyWords_hotel.hotelClickEvent){
                keyWords_hotel.hotelClickEvent($(this));
				e.preventDefault();
			}
		});
	
	    // 城市、酒店名关键字的输入事件
	    target.on('keyup input paste', function(e){
	        Util.throttle( getKeyWordData, keyWords_hotel );
	    });
	},
	
	// 新建一个对象
	createComponent_kwh = function (options){
	        
	    var element = $(keyWords_hotelPanel());
	        
	    var keyWords_hotel = $.extend({}, _default, options);
	    keyWords_hotel.element = element;
	    keyWords_hotel.setPos();
	    
	    $("body").append(element);
	
	    return keyWords_hotel;
	};



// 新建组件的入口函数
module.exports = function(options){

    // 新建一个组件
    var keyWords_hotel = createComponent_kwh(options);

    // 初始化组件相关事件
	initEvents(keyWords_hotel);	

    return keyWords_hotel;
}
