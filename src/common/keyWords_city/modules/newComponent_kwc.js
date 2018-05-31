var
    // 城市关键字面板模板
    keyWords_cityPanel = require('../templates/keyWords_cityPanel.ejs'),

    // 国内城市模板
    cityListTmpl = require('../templates/cityListTmpl.ejs'),

    // 国内城市数据
    internalCities = require('../tmpData/internalCity'),
    gatCities = require('../tmpData/gatCity'),
    externalCities = require('../tmpData/externalCity'),

    _default = {
    	citytype : '0',
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
        show : function(citytype){
            this.setPos();
            this.initHistory(citytype);
            this.element.show();
        },
        hide : function(){
            this.element.hide();
        },
        initHistory : function(citytype){
            var kwcHistory = localStorage.getItem('kwcHistory');
            var hotCityStr = '', _thisTypeHistory;
            if( kwcHistory ){
                _thisTypeHistory = window.JSON.parse( kwcHistory )[citytype];
                
                if( _thisTypeHistory ){
                    for (var i = 0; i < _thisTypeHistory.length; i++) {
                        var o = _thisTypeHistory[i];
                        hotCityStr += '<li data-track="公共_关键字_城市面板_城市项" class="kwc-city-item" data-citytype="' + o.citytype + '" data-cityid="' + o.cityid + '">' + o.cityname + '</li>';
                    }
    
                    this.element.find('.kwc-city-block').html(hotCityStr);
                    this.element.find('.kwc-history').show();
                }else{
                	this.element.find('.kwc-history').hide();
                }
            }else{
                this.element.find('.kwc-history').hide();
            }
        },
        setHistory : function(cityname, cityid, citytype){
            var kwcHistory = localStorage.getItem('kwcHistory');
            if( kwcHistory ){
                kwcHistory = window.JSON.parse(kwcHistory);
                var _thisTypeHistory = kwcHistory[citytype];

                if( _thisTypeHistory ){
                    for (var i = 0; i < _thisTypeHistory.length; i++) {
                        var o = _thisTypeHistory[i];
                        if( o.cityid == cityid ){
                            _thisTypeHistory.splice(i, 1);
                            break;
                        }
                    }
    
                    // 在数组首部插入一个元素，也可以用 unshift() 函数实现，但是 IE8 不兼容...
                    _thisTypeHistory.splice(0, 0, {
                        cityname: cityname,
                        cityid: cityid,
                        citytype: citytype
                    });
    
                    // 删除数组中超过6位的元素
                    _thisTypeHistory.splice(6);
                }else{
                    kwcHistory[citytype] = [{
                        cityname: cityname,
                        cityid: cityid,
                        citytype: citytype
                    }];
                }
            }else{
            	kwcHistory = {};
            	kwcHistory[citytype] = [{
                    cityname: cityname,
                    cityid: cityid,
                    citytype: citytype
                }];
            }

            localStorage.setItem('kwcHistory', window.JSON.stringify(kwcHistory));
        },
    };



// 初始化组件事件
function initEvents(keyWords_city){

    var element = keyWords_city.element;

    $(document).on('mousedown', function(e){
        var
        event = window.event || e,
        target = event.target || event.srcElement,

        // 兼容IE，当点击到滚动条时，chrome下的target显示为document，而IE8下显示是根节点<html>标签，而IE9下是对象{...}
        isScrollBar = target.tagName === 'HTML' || !target.tagName,

        // 是否是上一级的切换按钮
        isOuterSwitch = !!($(target).attr('name') && $(target).attr('name') === 'i-s-origin-switch');

        // 当点击的位置既不是该组件，也不是该组件对应的目标元素，也不是滚动条时，则隐藏该组件
		if( !$(target).closest('.key-word-city-wrap')[0] && target !== keyWords_city.target && !isScrollBar && !isOuterSwitch ){
			keyWords_city.hide();
        }
	})
    
    $(keyWords_city.target).on('focus', function(){
        var value = this.value.replace(/^\s+|\s+$/g, '');

        if( value === '' || value === $(this).attr('placeholder') ){
            this.keyWordsCity.show(this.keyWordsCity.citytype);
            if( this.keyWordsHotel ){
                this.keyWordsHotel.hide();
            }
        }
    })


    // 点击 "清空" 历史记录
    element.find('.kwc-history-clear').on('click', function(){
        var parent = $(this).closest('.kwc-history'),
            historyList = parent.find('.kwc-city-block');

        historyList.empty();
        parent.hide();
        localStorage.removeItem('kwcHistory');
    })

    // 点击某个城市
    element.delegate('.kwc-city-item', 'click', function(){
        var
            _this = $(this),
            cityid = _this.attr('data-cityid'),
            citytype = _this.attr('data-citytype'),
            city = _this.html();

        keyWords_city.target.cityid = cityid;
        keyWords_city.target.citytype = citytype;
        keyWords_city.target.tagName == 'INPUT'
            ? keyWords_city.target.value = city
            : keyWords_city.target.innerHTML = city;

        keyWords_city.element.hide('fast');
        keyWords_city.setHistory(city, cityid, citytype);
    })
}



// 新建一个对象
function kwcFactory(options){
        
    var element =
            $(keyWords_cityPanel({
                internalPanel: cityListTmpl({cityList: internalCities, area: 'internal'}),
                gatPanel: cityListTmpl({cityList: gatCities, area: 'gat'}),
                externalPanel: cityListTmpl({cityList: externalCities, area: 'external'}),
            }));
    
    if( options.citytype ){
    	var cityBlockArr = element.find('.kwc-block-outer');
    	for (var i = 0; i < cityBlockArr.length; i++) {
    		var o = cityBlockArr[i];
    		~$(o).attr('data-for').indexOf(options.citytype)
    			? $(o).attr('checked', 'checked')
    			: o.removeAttribute('checked');
    	}
    }
    
    var keyWords_city = $.extend({}, _default, options);
    keyWords_city.element = element;
    keyWords_city.setPos();

    $("body").append(element);

    return keyWords_city;
}



// 新建组件的入口函数
module.exports = function(options){

    // 新建一个组件
    var keyWords_city = kwcFactory(options);

    // 初始化组件相关事件
    initEvents(keyWords_city);

    keyWords_city.show(options.citytype);

    return keyWords_city;
}
