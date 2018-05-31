

const
	Util 						= require('../../../common/util.js'),
	filterPriceAndFillIntoTable = require('../../../common/hotelPriceUtil/modules/filterPriceAndFillIntoTable.js'),
	priceTableTmpl				= require('../templates/priceTableTmpl.ejs'),
	
	queryHotelUtil 				= require('./queryHotelUtil.js'),
	getParams 					= queryHotelUtil.getParams,
	queryHotels 				= queryHotelUtil.queryHotels,

	pagenation 					= require('../../../common/pagenation/pagenation'),
	

	// 检查并重新设置所有 "不限" 按钮的状态
	resetNoLimits = function (){
		var limits = $(".no-limit");
		for (var i = 0; i < limits.length; i++) {
			var
				o = $(limits[i]),
				parent = o.closest('.a-s-row'),
				checkboxs = parent.find('input[type=checkbox]:checked'),
				radios = parent.find('input[type=radio]:checked');
			
			(checkboxs.length > 0 || radios.length > 0)
				? o.removeClass('active')
				: o.addClass('active');
		}
	},
	
	// 检查已选择的搜索条件，如果一项搜索条件都没有，则隐藏这一行元素
	checkASINum = function (){
		$(".a-s-s-item").length > 0
			? $(".advanced-search-selected-wrap").slideDown('fast')
			: $(".advanced-search-selected-wrap").slideUp('fast');
	},
	
	// 编辑完搜索选项之后查询酒店列表
	queryHotelsAfterEditASI = function(_attr, dontQuery){
		if( _attr !== 'immediate' && _attr !== 'canceltype' ){
			if( !dontQuery ){
				// 控制在 100 毫秒的时间段内只执行一次 queryHotels
	        	Util.throttle(queryHotels, getParams(1), 100 );
			}
        }else{
        	filterPriceAndFillIntoTable(priceTableTmpl);
        }
		
		checkASINum();
        resetNoLimits();
	},
	
	// 新增一条搜索项
	addASI = function (asi, dontQuery){
		var
			dataCode = asi.attr('data-code'),
			_attr = asi.attr('data-attr'),
			tmpStr = 
		        '<li class="a-s-s-item" data-value="' + asi.attr('data-value') + '" data-attr="' + asi.attr('data-attr') + '">' +
		            '<span>' + asi.parent().text() + '</span>' +
		            '<i class="delete-icon" data-track="列表页_高级搜索_删除搜索项" data-target="' + dataCode + '"></i>' +
		        '</li>';
	                
	    $(".a-s-s-list").append(tmpStr);
	    
	    queryHotelsAfterEditASI(_attr, dontQuery);
    },
    
	// 删除一条搜索项
	deleteASI = function (asi, dontQuery){
		var
			dataCode = asi.attr('data-code'),
			_attr = asi.attr('data-attr');
		
	    asi.prop('checked', false);
	    $(".delete-icon[data-target=" + dataCode + "]").closest('.a-s-s-item').remove();
	    
	    queryHotelsAfterEditASI(_attr, dontQuery);
	},

	// 重置 '行政区'、'商业圈'、'更多要求'
	resetBizAndZone = function(){
		$('.a-s-zone-biz').removeClass('active');
		$('.a-s-zone-biz-list').hide();
		$(".a-s-zone-biz[data-code='a-s-biz']").find('.a-s-item-wrap').addClass('disabled');
		$(".a-s-zone-biz[data-code='a-s-zone']").find('.a-s-item-wrap').addClass('disabled');
		// $(".a-s-zone-biz-list[data-for='a-s-biz']").html('');
		// $(".a-s-zone-biz-list[data-for='a-s-zone']").html('');
	},

	// 清空所有勾选的搜索项
	clearAllASI = function(dontQuery){
		var array = $('.delete-icon');
		for (let i = 0; i < array.length; i++) {
			var
				o = array[i],
				dataCode = $(o).attr('data-target'),
				asi = $(".a-s-checkbox[data-code=" + dataCode + "]");

			deleteASI(asi, dontQuery);
		}

		resetBizAndZone();
	};
	


// 编辑酒店查询项，比如新增、删除，然后相关的一些交互
module.exports = {
    deleteASI,
	addASI,
	checkASINum,
	clearAllASI,
}