const hotelListTpl = require('../templates/hotelList.ejs');


const initHotelList = {
    //查询当前客户下的酒店列表
    getHotelList : function (fn) {
        let params = {
            distributorId : $('select[name="operateUser"]>option:selected').val()
        };
        $.post('/fzgGroupHelperManagedHotel/searchFzgGroupHelperManagedHotel.do',params,  function (data) {
            fn && fn();
            
            if (data.returnCode === 1){
                if (data.dataList.length <= 0){
                    layer.msg('该客户下暂无酒店',{time : 1000});
                    $('.product-tbody').empty();
                    return;
                }
                let hotelListStr = hotelListTpl(data);
    
                $('.product-tbody').html(hotelListStr);
            }else{
                alert(data.returnMsg);
            }
        }, 'noAnimation')
    },
    
    
    //删除酒店
    delHotel : function () {
        $('body').delegate('.tb-option>button','click',function () {
            let _this = $(this);
            layer.confirm('确认要删除该酒店吗？',function (index) {
                //从表格中删除该行
                _this.parent().parent().remove();
                
                //发送请求
                let params = {
                    hotelId : _this.data('hotelid'),
                    distributorId : $('select[name="operateUser"]>option:selected').val()
                };
                $.post('/fzgGroupHelperManagedHotel/removeFzgGroupHelperManagedHotel.do', params, function (data) {
                    if (data.returnCode === 1){
                        layer.msg('删除成功',{time : 1000});
                    }else{
                        layer.msg(data.returnMsg,{time : 2000});
                    }
                }, 'noAnimation')
            })
        });
    }
}


module.exports = {
    run : function () {
        //删除酒店
        initHotelList.delHotel();
    },
    getHotelList : initHotelList.getHotelList
}