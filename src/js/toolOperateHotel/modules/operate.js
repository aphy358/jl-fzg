const operateTpl = require('../templates/operate.ejs');


const initOperate = {
    //编辑员工
    operateStaff : function () {
        $(document).delegate('.tb-option>button', 'click', function () {
            if ($('.i-t-n-user').attr('data-isadmin') === '1'){
                let hotelObj = {
                    id        : $(this).data('hotelid'),
                    cusid     : $(this).data('cusid'),
                    name      : $(this).closest('tr').find('.tb-hotel>span').text(),
                    dataList  : $.staffList
                };
    
                let operateStr = operateTpl(hotelObj);
    
                let operateDom = layer.open({
                    title   : '酒店分配',
                    btnAlign: 'c',
                    content : operateStr,
                    yes     : function () {
                        let params = {
                            hotelId: +$('#hotelId').text(),
                            customerUserId: $('#staffList>option:selected').val()
                        }
                        $.post('/fzgGroupHelperHotelCustomer/operateFzgGroupHelperHotelCustomer.do', params, function (data) {
                            if (data.returnCode === 1){
                                layer.close(operateDom);
                                layer.msg('保存成功',{time: 1000},function () {
                                    $('.product-tbody').empty();
                                    $('.search-list').trigger('click');
                                });
                            }else{
                                layer.msg(data.returnMsg);
                            }
                        });
                    }
                });
            }else{
                alert('对不起，您没有该权限');
            }
            
        });
    }
}


module.exports = {
    run : function () {
        initOperate.operateStaff();
    }
}