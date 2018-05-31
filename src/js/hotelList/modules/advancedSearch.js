
const
    editASI         	= require('./editASI.js'),
    deleteASI 			= editASI.deleteASI,
    addASI 				= editASI.addASI,
    checkASINum         = editASI.checkASINum,

	zoneAndBiz			= require('./zoneAndBiz.js'),
    hideZoneBiz     	= zoneAndBiz.hideZoneBiz,
    initZoneBizSwitch	= zoneAndBiz.initZoneBizSwitch,
    priceTableTmpl		= require('../templates/priceTableTmpl.ejs'),
    filterPriceAndFillIntoTable = require('../../../common/hotelPriceUtil/modules/filterPriceAndFillIntoTable.js'),
	
    
    // 初始化 "高级搜索条件" 按钮点击事件
    initExpandBtnClick = function (){
        $(".a-s-expand-btn").on('click', function(){
            var btn = $(this).find('.slide-bar');
            if (btn.hasClass('down')){
                btn.removeClass('down').addClass('up');
                $(".a-s-toggle-show").slideDown('fast');
            }else{
                btn.removeClass('up').addClass('down');
                $(".a-s-toggle-show").slideUp('fast');
                hideZoneBiz();
            }
        })
    },

    // 初始化点击 "不限"
    initNoLimitClick = function (){
        $(".no-limit").on('click', function(){
            var
	            _this = $(this),
	            parent = _this.closest('.a-s-row'),
	            asiArr = parent.find('.a-s-checkbox:checked'),
                _attr = asiArr.attr('data-attr'),
                dataCode = asiArr.attr('data-code');

            _this.addClass('active');

            asiArr.prop('checked', false);
            asiArr.trigger('change');

            if(_attr === 'priceRange'){
                $('.delete-icon[data-target=' + dataCode + ']').closest('.a-s-s-item').remove();
                checkASINum();
                
                checkBoxChange( $('#cusPriceRange') );             // 手动触发一下价格区间的清空
            }

            if ( parent.find('.a-s-zone-biz-list').length ){
                hideZoneBiz();
            }
        })
    },

    // 点击搜索项的删除键
    initASIDelete = function (){
        $(document).delegate('.delete-icon', 'click', function(){
            var
	            dataCode = $(this).attr('data-target'),
                asi = $(".a-s-checkbox[data-code=" + dataCode + "]"),
                _attr = asi.attr('data-attr');
            
            if( _attr === 'priceRange' ){
                $('#noLimitPriceRange').click();
                checkBoxChange( asi );
            }else{
                asi.prop('checked', false);
                asi.trigger('change');
            }
        })
    },

    // 点击 "清空条件"
    initClearASI = function (){
        $(".a-s-s-btn").on('click', function(){
            $('.no-limit').trigger('click');

            // 手动触发一下价格区间的清空
            checkBoxChange( $('#cusPriceRange') );
        })
    },    
    
    // 高级搜索条件的 check change
    checkBoxChange = function (_this){
        var
            parent = _this.closest('.a-s-row'),
            asiCheckBoxArr = parent.find('.a-s-checkbox'),
            asCheckedItems = parent.find('.a-s-checkbox:checked');

        if ( _this.prop('checked') ){
            if ( asiCheckBoxArr.length === asCheckedItems.length ){
                // 如果某一类的搜索条件全选了，也就相当于全不选
                for (var i = 0; i < asiCheckBoxArr.length; i++) {
                    deleteASI( $(asiCheckBoxArr[i]) );
                }
            }else{
                // 处理当前项被选中，即新增该项
                addASI(_this);
            }
        }else{
            // 处理当前项不被选中，即删除该项
            deleteASI(_this);
        }
    },
    
    // 高级搜索条件的 check change
    initCheckBoxChange = function () {
    	$(document).delegate(".a-s-checkbox", 'change', function(){
            var attr = $(this).attr('data-attr');
            if( attr !== 'priceRange' ){
                checkBoxChange( $(this) );
            }
        })

        $(document).delegate(".a-s-checkbox[data-attr=priceRange]", 'click', function(){
            var
                _this = $(this),
                dataCode = _this.attr('data-code');

            $('.delete-icon[data-target=' + dataCode + ']').closest('.a-s-s-item').remove();
            checkBoxChange(_this);
        })
    },

	showPriceRangeBtn = function(){
		$(".search-item-price-wrap").addClass('move-left');
        $('.search-line-price-btn').show();
	},
	
	hidePriceRangeBtn = function(){
		$(".search-item-price-wrap").removeClass('move-left');
        $('.search-line-price-btn').hide();
        $('#slp_1').val('');
        $('#slp_2').val('');
	},
	
    // 初始化价格区间的相关事件
    initPriceRangeEvents = function(){
        $(".search-line-price").on('keyup input paste', function(){
            this.value = this.value.replace(/[^\d]/g, '');
        })

        $(".search-line-price").on('focus', function(){
            showPriceRangeBtn();
        })

        $(".search-line-price-btn").on('click', function(){
            var
                p1 = $('#slp_1').val(),
                p2 = $('#slp_2').val(),
                dataValue = '';

            if(p1 === '' && p2 === ''){
                // 什么都不做
            }else{
                if( +p2 <= +p1 ){
                    p2 = '';
                }

                if(+p2 === 0){
                    dataValue = '大于' + p1 + '元';
                    p2 = 999999999;
                }else{
                    dataValue = +p1 + '-' + p2 + '元';
                }
    
                $('#cusPriceRange').attr('data-value', (+p1) + '-' + (+p2));
                $('#cusPriceRange').next('span').html(dataValue);

                $('.delete-icon[data-target=asi-price-v]').closest('.a-s-s-item').remove();
                $('#cusPriceRange').prop('checked', true);
                checkBoxChange( $('#cusPriceRange') );
            }

            hidePriceRangeBtn();
        })
        
        $(document).on('click', function(e){
			var target = $(e.target || e.srcElement).closest('.search-item-price-wrap');
	    	if( !target.length ){
	    		hidePriceRangeBtn();
	    	}
		});
    },

    initHGroupMoreClick = () => {
        $('.hgroup-more').on('click', function(e){
            var _this = $(this);
            var downUp = _this.find('i');
            var span = _this.find('.hgroup-more-span');

            if(_this.hasClass('expanded')){
                _this.removeClass('expanded');
                $('.hgroup-list-auto-hide').slideUp('fast');
                downUp.removeClass('up').addClass('down');
                span.html('更多');
            }else{
                _this.addClass('expanded');
                $('.hgroup-list-auto-hide').slideDown('fast');
                downUp.removeClass('down').addClass('up');
                span.html('收起');
            }
		});
    };




// 高级搜索框 js
module.exports = {
    run: function(){

        // 初始化 "高级搜索条件" 按钮点击事件
        initExpandBtnClick();

        // 初始化 "行政区"、"商业圈" 的显示与隐藏切换事件
        initZoneBizSwitch();

        // 初始化点击 "不限"
        initNoLimitClick();

        // 高级搜索条件的 check change
        initCheckBoxChange();

        // 搜索项被删除事件
        initASIDelete();

        // 点击 "清空条件"
        initClearASI();

        // 初始化价格区间的相关事件
        initPriceRangeEvents();

        // 初始化酒店集团 "更多" 点击事件
        initHGroupMoreClick();
    }
}