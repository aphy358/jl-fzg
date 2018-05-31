

var
    // 在给定的日期基础上加上若干天，并格式化成 '2017-10-01' 的字符串返回
    addDays = require('../../util').addDays,

    // 获取星级选择的 HTML
    starSelectPanel = require('../templates/starSelect.ejs'),

    _default = {
        show : function(){
            this.setPos();

            // 这里之所以这么写，是因为如果点击的刚好是那个下拉三角形图标，则无法正确下拉，所以...
            var element = this.element.show();
            setTimeout(function(){
                element.show();
			}, 10);
        },
        hide : function(){
            this.element.hide();
        },
        setPos : function(){
            var
            target = this.target,
            parent = $(target).parent(),
            targetRect = parent[0].getBoundingClientRect(),
            left = targetRect.left + (this.left || 0) + $(document).scrollLeft(),
            top = targetRect.bottom + 2 + (this.top || 0) + $(document).scrollTop(),
            width = this.width || targetRect.width || parent[0].scrollWidth,
            widthBorder = document.body.scrollWidth - 180;
    
            this.element
                .css('left', left > widthBorder ? widthBorder : left)
                .css('top', top)
                .css('width', width)
                .css('display', 'none');
        },
        starVal : '',
        setStarVal : function(){
            var
                inputArr = this.element.find('input'),
                tmpStarStr = [],
                tmpStarVal = [];

            for (var i = 0; i < inputArr.length; i++) {
                var o = inputArr[i];
                if( $(o).prop('checked') ){
                    tmpStarStr.push( $(o).attr('data-text') );
                    tmpStarVal.push( $(o).val() );
                }
            }            

            if( tmpStarStr.length > 3 ){
                tmpStarStr = '所有酒店等级';
                tmpStarVal = '';
            }else{
                tmpStarStr = tmpStarStr.join('、');
                tmpStarVal = tmpStarVal.join('、');
            }

            this.target.tagName == 'INPUT'
                ? this.target.value = tmpStarStr
                : this.target.innerHTML = tmpStarStr;

            this.starVal = tmpStarVal;
        }
    };



// 初始化星级选择事件
function initEvents(starSelect){
    var starS = starSelect.element;

    $(document).on('mousedown', function(e){
        var
        event = window.event || e,
        target = event.target || event.srcElement,

        // 兼容IE，当点击到滚动条时，chrome下的target显示为document，而IE8下显示是根节点<html>标签，而IE9下是对象{...}
        isScrollBar = target.tagName === 'HTML' || !target.tagName;

        // 当点击的位置既不是该组件，也不是该组件对应的目标元素，也不是滚动条时，则隐藏该组件
        if( !$(target).closest('.i-s-star-select-wrap').length && target !== starSelect.target && !isScrollBar ){
            starSelect.hide();
        }
    })
    
    starS.find('input').on('change', function(){
        starSelect.setStarVal();
        $(starSelect.target).trigger('change');
    })
}


// 新建一个星级选择对象
function starFactory(options){
    
    var element = $(starSelectPanel());

    var starSelect = $.extend({}, _default, options);
    starSelect.element = element;
    starSelect.setPos();

    $("body").append(element);

    return starSelect;
}


module.exports = function(options){

    // 新建一个星级选择对象
    var starSelect = starFactory(options);

    // 初始化星级选择相关事件
    initEvents(starSelect);

    starSelect.show();

    return starSelect;
}
