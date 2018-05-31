const keyWords_hotel = require('../../../common/keyWords_hotel/keyWords_hotel.js');
const hotelList = require('../templates/hotelList.ejs');


const initAddHotel = {
    //搜索酒店
    searchHotel : function () {
        $('.select-hotel').focus(function () {
            keyWords_hotel({
                city : 0,//不需要城市面板
                hotelClickEvent : function (target) {//点击猜想出的酒店时，执行的回调函数
                    $('.select-hotel')
                        .val(target.find('.kwh-hotel-name').text())
                        .attr('data-hotelid', target.data('hotelid'))
                        .attr('data-cityname', target.find('.area').eq(2).text());
                
                    return false;
                }
            });
        }).change(function () {
            $(this).removeAttr('data-hotelid');
        });
    },
    
    
    //点击“新增酒店”
    addHotel : function () {
        $('.add-hotel').click(function () {
            let params = {
                hotelId       : $('.select-hotel').attr('data-hotelid'),
                distributorId : $('select[name="operateUser"]>option:selected').val()
            };
    
            if (window.distrbCode !== 'SZ2747'){
                alert('您没有该权限');
                return;
            }
        
            if (params.hotelId === '') {
                layer.msg('请选择您需要添加的酒店',{time : 1000});
            }else if (params.hotelId === undefined){
                layer.msg('请选择猜想结果中的酒店',{time : 1000});
            }else if (params.distributorId === '' || params.distributorId === undefined){
                layer.msg('请选择需要添加酒店的客户',{time : 1000});
            }else{
                $.post('/fzgGroupHelperManagedHotel/saveFzgGroupHelperManagedHotel.do',params, function (data) {
                    if (data.returnCode === 1){
                        layer.msg('新增成功',{time : 1000});
                    
                        //将新增的酒店放入酒店列表中
                        let data = {
                            dataList : [
                                {
                                    cityName : $('.select-hotel').attr('data-cityname'),
                                    infoName : $('.select-hotel').val(),
                                    infoId   : params.hotelId,
                                }
                            ]
                        }
                    
                        let trStr = hotelList(data);
                    
                        $('.product-tbody').append(trStr);
                    }else{
                        alert(data.returnMsg);
                    }
                }, 'noAnimation')
            }
        });
    },
    
    
    //切换地区
    switchArea : function () {
        $('.i-s-origin-switch').click(function () {
            $('.i-s-origin-switch').removeAttr('checked');
            $(this).prop('checked','true');
            $(this).attr('checked','true');
        });
    }
};



module.exports = {
    run : function () {
        //搜索酒店
        initAddHotel.searchHotel();
    
        //新增酒店
        initAddHotel.addHotel();
    
        //切换地区
        initAddHotel.switchArea();
    }
}