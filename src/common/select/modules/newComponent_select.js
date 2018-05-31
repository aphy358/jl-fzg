

var
    // 在给定的日期基础上加上若干天，并格式化成 '2017-10-01' 的字符串返回
    addDays = require('../../util').addDays,

    // select 的 HTML 模板
    mySelectPanel = require('../templates/select.ejs'),

    _default = {
        show : function(){
            this.setPos();

            // 这里之所以这么写，是因为如果点击的刚好是那个下拉三角形图标，则无法正确下拉，所以...
            var element = this.element;
            setTimeout(function(){
                element.show();
            }, 10);
        },
        hide : function(){
            this.element.find('.selected-flag').addClass('selected').removeClass('selected-flag');
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
        // 选中之后设置值
        setSelectVal : function(_this){
            if( !_this.hasClass('selected') && !_this.hasClass('selected-flag') ){
                var
                    parent = _this.closest('.my-select-list'),
                    target = $(this.target),
                    newVal = _this.attr('data-value'),
                    newText = _this.text();
    
                parent.find('.selected').removeClass('selected');
                parent.find('.selected-flag').removeClass('selected-flag');
                _this.addClass('selected');
                target.attr('data-value', newVal);
    
                this.target.tagName == 'INPUT'
                    ? target.val(newText)
                    : target.html(newText);

                $(this.target).trigger('change');
            }
    
            this.hide();
        }
    },

    // 初始化控件的相关事件
    initEvents = function (mySelect, options){
        var element = mySelect.element;

        $(document).on('mousedown', function(e){
            var
                event = window.event || e,
                target = event.target || event.srcElement,

                // 兼容IE，当点击到滚动条时，chrome下的target显示为document，而IE8下显示是根节点<html>标签，而IE9下是对象{...}
                isScrollBar = target.tagName === 'HTML' || !target.tagName;

            // 当点击的位置既不是该组件，也不是该组件对应的目标元素，也不是滚动条时，则隐藏该组件
            if( !$(target).closest('.my-select-list').length && target !== mySelect.target && !isScrollBar ){
                mySelect.hide();
            }
        })
        
        element.on('mouseover', function(){
            mySelect.element.find('.selected').addClass('selected-flag').removeClass('selected');
        })

        element.find('li').on('click', function(){
            mySelect.setSelectVal($(this));
            
            //选中下拉框选项时的回调函数
            options.fn && options.fn($(this).attr('data-value'));
        })
    },

    setDefaultSelect = function(options, element){
        var _thisVal = $(options.target).attr('data-value');

        if(_thisVal){
            var liArr = element.find('li');
            for(var i = 0; i < liArr.length; i++){
                var li = $(liArr[i]);
                if( li.attr('data-value') === _thisVal ){
                    li.addClass('selected');
                }
            }
        }
    },

    // 新建一个星级选择对象
    selectFactory = function (options){
        
        var element = $(mySelectPanel({
            options: options.options,
        }));

        // 设置默认选中项
        setDefaultSelect(options, element);

        var mySelect = $.extend({}, _default, options);
        mySelect.element = element;
        mySelect.setPos();

        $("body").append(element);

        return mySelect;
    };



module.exports = function(options){

    // 新建一个星级选择对象
    var mySelect = selectFactory(options);

    // 初始化星级选择相关事件
    initEvents(mySelect, options);

    mySelect.show();

    return mySelect;
}
