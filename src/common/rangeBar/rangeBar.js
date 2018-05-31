// 自定义 range 组件


// 引入该组件样式文件
require('./sass/rangeBar.scss');

// 引入该组件字符串模板
let rangeTmpl = require('./templates/rangeBar.ejs');

// 默认配置项，后期将用户的设置项和该对象进行合并，就是最终的配置项
let defaults = {

    // range 的第一个初始值，默认为0
    vBegin : 0,

    // range 的第二个初始值，默认为10000
    vEnd : 10000,

    // range 的最小取值
    vMin : 0,

    // range 的最大取值
    vMax : 3000,

    // range 的计量单位，默认为 '元'
    vUnits : '元',

    // rangeBar 的总长度，默认值为 '200px'，传参只要传数值，不用传单位 'px'
    barWidth : 160
}



function fixOptions(options){
    $.extend(defaults, options);
    if( defaults.vBegin < defaults.vMin )   defaults.vBegin = defaults.vMin;
    if( defaults.vEnd > defaults.vMax )   defaults.vEnd = defaults.vMax;
    if( defaults.barWidth < 100 ) defaults.barWidth = 100;
}



function initTmplStr(){
    return rangeTmpl({
        vBegin : defaults.vBegin,
        vEnd : defaults.vEnd,
        vUnits : defaults.vUnits
    })
}



function initRangeState($range){
    var
        vRange = defaults.vMax - defaults.vMin,
        leftPos = (defaults.vBegin - defaults.vMin) / vRange * defaults.barWidth,
        validWidth = (defaults.vEnd - defaults.vBegin) / vRange * defaults.barWidth;

    $range.css('width', defaults.barWidth);
    $range.find('.range-line').css('left', leftPos).css('width', validWidth);
    $range.find('.range-left').css('left', leftPos);
    $range.find('.range-right').css('left', leftPos + validWidth );

    $range[0].rangeObj = $.extend({}, defaults, {vWidth:validWidth, vLeft:leftPos, vRight:leftPos + validWidth});
}



function initRangeEvents($range){
    $range.delegate('.range-bar', 'mousedown', function(e){
        if( e.which !== 1 )    return;

        // 存入全局变量
        $.myRange = {
            target : this,
            beginPos : e.pageX
        }
    })

    $(document).on('mousemove', function(e){
        if( e.which !== 1 || !$.myRange )    return;

        var 
            target = $($.myRange.target),
            parent = target.closest('.i-s-range-bar'),
            leftBar = parent.find('.range-left'),
            rightBar = parent.find('.range-right'),
            rangeLine = parent.find('.range-line'),
            diffX = e.pageX - $.myRange.beginPos,
            
            rangeObj = parent[0].rangeObj,
            vLeft = rangeObj.vLeft,
            vRight = rangeObj.vRight,
            vWidth = rangeObj.vWidth,
            barWidth = rangeObj.barWidth,
            vBegin = rangeObj.vBegin,
            vRange = rangeObj.vMax - rangeObj.vMin;

        if( target.hasClass('range-left') ){    // 滑动左滑块
            var newLeft = vLeft + diffX;
            var newWidth = vWidth - diffX;

            if( newWidth <= 0 ){
                newLeft = vRight;
                newWidth = 0;
            }
            if( newLeft <= 0 ){
                newLeft = 0;
                newWidth = vRight;
            }

            leftBar.css('left', newLeft);
            rangeLine.css('left', newLeft).css('width', newWidth);
            
            leftBar.find('.range-vbegin').html( parseInt(newLeft / barWidth * vRange) );
        }else{  // 滑动右滑块
            var
                newLeft = vLeft + vWidth + diffX,
                newWidth = vWidth + diffX,
                unit2 = $(".range-bar-unit2"),
                vend;
            
            if( newWidth <= 0 ){
                newLeft = vLeft;
                newWidth = 0;
            }
            if( newLeft >= barWidth ){
                newLeft = barWidth;
                newWidth = barWidth - vLeft;
            }

            rightBar.css('left', newLeft);
            rangeLine.css('width', newWidth);

            vend = parseInt(newLeft / barWidth * vRange);
            rightBar.find('.range-vend').html( vend );

            vend >= 3000
                ? unit2.html('以上')
                : unit2.html('');
        }
    })

    $(document).on('mouseup', function(e){
        if( e.which !== 1 )    return;

        if( $.myRange ){
            var
                target = $.myRange.target,
                parent = $(target).closest('.i-s-range-bar'),
                rangeLine = parent.find('.range-line'),
                rangeObj = parent[0].rangeObj,
                vLeft = parseFloat( rangeLine.css('left') ),
                vWidth = parseFloat( rangeLine.css('width') ),
                vRight = vLeft + vWidth;
    
            rangeObj.vLeft = vLeft;
            rangeObj.vRight = vRight;
            rangeObj.vWidth = vWidth;
            rangeObj.vBegin = parent.find('.range-vbegin').html(),
            rangeObj.vEnd = parent.find('.range-vend').html();
            
            $($.myRange.target).trigger('draged');
            $.myRange = null;
        }
    })
}



module.exports = function (options) {

    if( !options )   return '';

    // 校正、合并参数
    fixOptions(options)

    // 初始化模板字符串
    var $range = $( initTmplStr() );

    // 初始化 rangeBar 的初始状态，设置两个滑动条的位置
    initRangeState( $range );

    // 初始化该组件相关事件
    initRangeEvents( $range );

    // 最后将该组件插入到目标 DOM 中
    options.target.append( $range );
}