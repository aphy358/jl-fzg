
var
    // 成人小孩选择面板模板
    adultChildrenSelectPanel = require('../templates/adultChildrenSelectPanel.ejs'),

    // 小孩年龄模板
    childrenAgeSelector = require('../templates/childrenAgeSelector.ejs'),

    mySelect = require('../../../common/select/select'),

    _default = {
        adultNum : 2,
        childrenNum : 0,
        childrenAgesStr : '',
        setPos : function(){
            var
                target = this.target,
                targetRect = target.getBoundingClientRect(),
                left = targetRect.left + (this.left || 0) + $(document).scrollLeft(),
                top = targetRect.bottom + 2 + (this.top || 0) + $(document).scrollTop(),
                widthBorder = document.body.scrollWidth - 376;
            
            this.element.css('left', left > widthBorder ? widthBorder : left)
                        .css('top', top)
                        .css('display', 'none');
        },
        show : function(){
            this.setPos();

            // 这里之所以这么写，是因为如果点击的刚好是那个下拉三角形图标，则无法正确下拉，所以...
            var element = this.element;
            setTimeout(function(){
                element.show();
            }, 10)
        },
        hide : function(){
            this.element.hide();
        },
        // 设置目标元素的显示
        setTargetText : function(){
            this.target.value = this.adultNum + '成人，' + this.childrenNum + '小孩';
        },
        // 重置小孩年龄选择下拉框
        resetChildrenAgeSelect : function(){
            var
                _this = this.element,
                newSelectStr = '',
                newChildrenAgeStr = '',
                rowTwo = _this.find('.ac-select-row.row-two'),
                childrenAgeSelectWrap = _this.find('.ac-select-children-age-wrap'),
                childrenNum = parseInt( _this.find('.ac-select-children').attr('data-value') );

            for(var i = 0; i < childrenNum; i++){
                newSelectStr += childrenAgeSelector();
                newChildrenAgeStr += '0,';
            }

            childrenAgeSelectWrap.html(newSelectStr);
            this.childrenAgesStr = newChildrenAgeStr.replace(/,$/, '');
            this.target.childrenAgesStr = newChildrenAgeStr.replace(/,$/, '');

            childrenNum > 0
                ? rowTwo.slideDown('fast')
                : rowTwo.slideUp('fast');
        },
        // 设置小孩年龄字符串
        setChildrenAgeStr : function(){
            var
                _this = this.element,
                newChildrenAgeStr = '',
                childrenAgeSelects = _this.find('.ac-select-children-age');

            for(var i = 0; i < childrenAgeSelects.length; i++){
                var o = childrenAgeSelects[i];
                newChildrenAgeStr += $(o).attr('data-value') + ',';
            }

            this.childrenAgesStr = newChildrenAgeStr.replace(/,$/, '');
            this.target.childrenAgesStr = newChildrenAgeStr.replace(/,$/, '');
        },
    };



// 初始化组件事件
function initEvents(adultChildrenSelect){

    var element = adultChildrenSelect.element;

    $(document).on('mousedown', function(e){
        var
            event = window.event || e,
            target = event.target || event.srcElement,

            // 兼容IE，当点击到滚动条时，chrome下的target显示为document，而IE8下显示是根节点<html>标签，而IE9下是对象{...}
            isScrollBar = target.tagName === 'HTML' || !target.tagName;

        // 当点击的位置既不是该组件，也不是该组件对应的目标元素，也不是滚动条时，则隐藏该组件
		if( !$(target).closest('.ac-select-wrap').length && target !== adultChildrenSelect.target && !isScrollBar && !$(target).closest('.my-select-list').length ){
			adultChildrenSelect.hide();
        }        
    })
    
    element.find('.ac-select-adult').on('mousedown', function(){
        mySelect({
            options: [
                {text: '1人', value: '1'},
                {text: '2人', value: '2', attr: 'selected'},
                {text: '3人', value: '3'},
                {text: '4人', value: '4'},
                {text: '5人', value: '5'},
                {text: '6人', value: '6'},
                {text: '7人', value: '7'},
            ]
        });
    })

    element.find('.ac-select-children').on('mousedown', function(){
        mySelect({
            options: [
                {text: '0人', value: '0', attr: 'selected'},
                {text: '1人', value: '1'},
                {text: '2人', value: '2'},
                {text: '3人', value: '3'},
            ]
        });
    })

    element.delegate('.ac-select-children-age', 'mousedown', function(){
        mySelect({
            options: [
                {text: '&lt;1岁', value: '0', attr: 'selected'},
                {text: '1岁', value: '1'},
                {text: '2岁', value: '2'},
                {text: '3岁', value: '3'},
                {text: '4岁', value: '4'},
                {text: '5岁', value: '5'},
                {text: '6岁', value: '6'},
                {text: '7岁', value: '7'},
                {text: '8岁', value: '8'},
                {text: '9岁', value: '9'},
                {text: '10岁', value: '10'},
                {text: '11岁', value: '11'},
                {text: '12岁', value: '12'},
                {text: '13岁', value: '13'},
                {text: '14岁', value: '14'},
                {text: '15岁', value: '15'},
                {text: '16岁', value: '16'},
                {text: '17岁', value: '17'},
            ]
        });
    })
    
    // 改变成人数
    element.find('.ac-select-adult').on('change', function(){
        adultChildrenSelect.adultNum = $(this).attr('data-value');
        adultChildrenSelect.target.adultNum = $(this).attr('data-value');
        adultChildrenSelect.setTargetText();
    })

    // 改变小孩数
    element.find('.ac-select-children').on('change', function(){
        adultChildrenSelect.childrenNum = $(this).attr('data-value');
        adultChildrenSelect.target.childrenNum = $(this).attr('data-value');
        adultChildrenSelect.setTargetText();
        adultChildrenSelect.resetChildrenAgeSelect();
    })
    
    // 改变小孩年龄
    element.delegate('.ac-select-children-age', 'change', function(){
        adultChildrenSelect.setChildrenAgeStr();
    })


    // 问号的鼠标悬停事件
    element.delegate('.ac-select-info', 'mouseover', function(){
        this.tip = layer.tips('18周岁及以上为成人，<br>0-17周岁未成年请参照各酒店入住政策。', this, {
            tips: [2, '#FF5722'],
            area: '237px',
            time: 0
        });

    })

    // 问号的鼠标悬停事件
    element.delegate('.ac-select-info', 'mouseout', function(){
        layer.close(this.tip);
    })
    
}



// 新建一个日历对象
function acsFactory(options){
    var element = $(adultChildrenSelectPanel());
    
    var adultChildrenSelect = $.extend({}, _default, options);
    adultChildrenSelect.element = element;
    adultChildrenSelect.setPos();       

    $("body").append(element);

    return adultChildrenSelect;
}



// 新建组件的入口函数
module.exports = function(options){

    // 新建一个组件
    var adultChildrenSelect = acsFactory(options);

    // 初始化组件相关事件
    initEvents(adultChildrenSelect);
    
    adultChildrenSelect.show();

    return adultChildrenSelect;
}
