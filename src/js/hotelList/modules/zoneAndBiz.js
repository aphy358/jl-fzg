

const
	Util = require('../../../common/util.js'),
	
	
	// 隐藏 "行政区"、"商业圈" 
	hideZoneBiz = function (){
		$(".a-s-zone-biz-list").slideUp('fast');
		$(".a-s-zone-biz").removeClass('active');
	},
	
	// 初始化 "行政区"、"商业圈" 的显示与隐藏切换事件
    initZoneBizSwitch = function (){
        $('.a-s-zone-biz').on('click', function(e){
            var
	            _this = $(this),
	            isActive = _this.hasClass('active'),
	            code = _this.attr('data-code'),
	            target = $(".a-s-zone-biz-list[data-for='" + code + "']");

            if( _this.find('.a-s-item-wrap').hasClass('disabled') )  return false;

			hideZoneBiz();
			
            if ( !isActive ){
                _this.addClass('active');
                target.slideDown('fast');
            }
        })
    },
    
	// 设置行政区
	setZone = function (datalist){
		var zoneStr = '';
    	if( datalist && datalist.length ){
    		for (var i = 0; i < datalist.length; i++) {
    			var o = datalist[i];
        		zoneStr += 
            		'<li class="a-s-item">' +
	                    '<label>' +
	                        '<input type="checkbox" data-track="列表页_高级搜索_行政区_选择项" class="a-s-checkbox" data-attr="zoneId" data-code="asi-zone-' + o.zoneid + '" data-value="' + o.zoneid + '">' +
	                        o.name +
	                    '</label>' +
	                '</li>';
    		}
    		
    		$(".a-s-zone-biz[data-code='a-s-zone']").find('.a-s-item-wrap').removeClass('disabled');
    	}else{
    		$(".a-s-zone-biz[data-code='a-s-zone']").find('.a-s-item-wrap').addClass('disabled');
    	}
    	
    	$(".a-s-zone-biz-list[data-for='a-s-zone']").html(zoneStr);
	},
	
	// 设置商业圈
	setBiz = function (datalist){
		var bizStr = '';
    	if( datalist && datalist.length ){
    		for (var i = 0; i < datalist.length; i++) {
    			var o = datalist[i];
        		bizStr += 
            		'<li class="a-s-item">' +
	                    '<label>' +
	                        '<input type="checkbox" data-track="列表页_高级搜索_商业圈_选择项" class="a-s-checkbox" data-attr="bizCircleId" data-code="asi-biz-' + o.bizzoneid + '" data-value="' + o.bizzoneid + '">' +
	                        o.description +
	                    '</label>' +
	                '</li>';
    		}
    		
    		$(".a-s-zone-biz[data-code='a-s-biz']").find('.a-s-item-wrap').removeClass('disabled');
    	}else{
    		$(".a-s-zone-biz[data-code='a-s-biz']").find('.a-s-item-wrap').addClass('disabled');
    	}
    	
    	$(".a-s-zone-biz-list[data-for='a-s-biz']").html(bizStr);
	},
	
	// 查询并设置 "行政区"、"商业圈"
	queryZoneAndBiz = function(cityId){
		
		// 先将之前可能设置的 "行政区"、"商业圈" 清空
		$(".no-limit.zone-biz").click();
		
		if( cityId ){
			$.post('/hotel/getZone.do', {cityid: cityId}, function(res){
				if( res.returnCode === 1 ){
		            if( res.data ){
		            	// 设置行政区域
		            	setZone(res.data.zoneList);	            	
		            	
		            	// 设置商业圈
		            	setBiz(res.data.bizzoneList);
		            }
		        }else if( res.returnCode === -400001 ){
		            Util.login();
		        }
			}, 'noAnimation');
		}else{
			$(".a-s-zone-biz[data-code='a-s-biz']").find('.a-s-item-wrap').addClass('disabled');
			$(".a-s-zone-biz[data-code='a-s-zone']").find('.a-s-item-wrap').addClass('disabled');
		}
	};
	
	

// "行政区"、"商业圈" 相关 js
module.exports = {
    hideZoneBiz			: hideZoneBiz,
    setZone				: setZone,
    setBiz				: setBiz,
    queryZoneAndBiz		: queryZoneAndBiz,
    initZoneBizSwitch	: initZoneBizSwitch
}