// 选择成人小孩的面板  的相关 js 逻辑

var 
// 查价模块，然后填充日历
queryPriceForCalendar = require('./queryPriceForCalendar');

// 初始化 "确定" 按钮点击事件
function initChildrenConfirmClick(option){
$(document).delegate(".children-select-confirm", 'click', function(){

    var _this          = $(this),
        parent         = _this.closest('.chidren-select-wrap').parent(),
        adultNum       = parent.find('.children-adult-select.adult').val(),
        childrenNum    = parent.find('.children-adult-select.children').val(),
        target         = parent.find('.adult-children-input'),
        finalStr       = adultNum + '成人',
        childrenAgeStr = _this.attr('data-childrenAgeStr');

    closeChildrenSelectPanel( _this );

    if( +childrenNum > 0 ){
        finalStr += '，' + childrenNum + '小孩';
    }

    target.val( finalStr )
          .attr('data-adultNum', adultNum)
          .attr('data-childrenNum', childrenNum)
          .attr('data-childrenAgeStr', childrenAgeStr);
          
    var parent = $(this).closest('section').parent();
    parent.find('.chidren-select-wrap').hide();
    parent.find('.calendar-price-wrap').slideToggle('fast');
    
    // 先清空原先的数据
    parent.find('.cp-td-inner').children().not('.calendar-p-day-num').remove();

    queryPriceForCalendar(parent, null, option);
});
}



// 初始化 "取消" 按钮点击事件
function initChildrenCancelClick(){
$(document).delegate(".children-select-cancel", 'click', function(){
    closeChildrenSelectPanel( $(this) );
});
}



// 关闭选择成人小孩的面板
function closeChildrenSelectPanel(_this){
_this.closest('.chidren-select-wrap').slideUp('fast');
}



// 初始化小孩个数选择事件
function initChildrenNumberSelect(){
$(document).delegate(".children-adult-select.children", "change", function(){
    var _this       = $(this),
        childrenNum = +this.value,
        target      = _this.closest('.chidren-select-wrap').find('.children-list-wrap');
        
    childrenNum > 0 ? target.show() : target.hide();

    buildChildrenAgeSelectors( childrenNum, _this );

    setChildrenAgeStr( _this );
});
}



// 初始化儿童年龄选择事件
function initChildAgeChange(){
$(document).delegate(".children-item-select", "change", function(){
    setChildrenAgeStr( $(this) );
});
}



// 创建儿童年龄选择框
function buildChildrenAgeSelectors( childrenNum, _this ){

var finalStr = '',
    tmpl     = require('../templates/childrenAgeSelector.ejs'),
    target   = _this.closest('.chidren-select-wrap').find('.children-list');

for(var i = 0; i < childrenNum; i++){
    finalStr +=  tmpl( {index : (i + 1)} );
}

target.html( finalStr );
}



// 把儿童年龄字符串设置到相关 DOM 的一个属性上
function setChildrenAgeStr( _this ){

var finalStr    = '',
    target      = _this.closest('.chidren-select-wrap').find('.children-select-confirm'),
    childrenArr = _this.closest('.chidren-select-wrap').find('.children-item-select');

for(var i = 0; i < childrenArr.length; i++){
    finalStr += $( childrenArr[i] ).val() + ','
}

target.attr( 'data-childrenAgeStr', finalStr.replace(/,$/, '') );
}



module.exports = {
run : function(option){
    
    // 初始化 "确定" 按钮点击事件
    initChildrenConfirmClick(option);

    // 初始化 "取消" 按钮点击事件
    initChildrenCancelClick(option);

    // 初始化小孩个数选择事件
    initChildrenNumberSelect(option);
    
    // 初始化儿童年龄选择事件
    initChildAgeChange(option);
}
}