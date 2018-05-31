
// 设置 '惠' tag，顺便处理国外城市下置灰今天
function setHuiTag(layero){
    var 
        target     = layero.find('.nd-order-confirm-btn'),
        startDate  = target.attr('data-startdate').replace(/-/g, '/'),
        endDate    = target.attr('data-enddate').replace(/-/g, '/'),
        compareD   = +new Date(endDate + ' 23:59:59'),
        tdArr      = layero.find('.cp-td-inner'),
        dateStrArr = [startDate],
        external   = target.attr('data-citytype') === '3';
    
    do{
        dateStrArr.push( new Date(startDate).Format('yyyy/MM/dd') );
        startDate = +new Date(startDate) + 24 * 60 * 60 * 1000;
    }while( startDate < compareD )

    for(var i = 0; i < tdArr.length; i++){
        var o = tdArr[i],
            dStr = $(o).attr('data-day');

        if( dStr && ~$.inArray(dStr, dateStrArr) && !$(o).hasClass('disabled') && $(o).find('.calendar-p-price').length ){
            $(o).append('<div class="cp-hui-tag"></div>');
        }       
    }
}


module.exports = function(layero){
    setHuiTag( layero );
};
