const staffTpl = require('../templates/staff.ejs');
const hotelListTpl = require('../templates/hotelList.ejs');
const pagenation = require('../../../common/pagenation/pagenation.js');

const initSearch = {
    //获取员工名字
    searchStaff : function () {
        if ($('.i-t-n-user').attr('data-isadmin') === '1'){
            let params = {
                distributorid : $('.i-t-n-user').attr('data-distrbid'),
                pageSize      : -1,
                isAdmin       : 0
            }
            //判断是否已经请求过
            if ($('#staffName').attr('hasrequest') === 'false'){
                $.post('/myinfo/searchCustomerUser.do', params, function (data) {
                    if (data.returnCode === 1){
                        //将员工列表挂载到$上
                        $.staffList = data.dataList;
    
                        let staffStr = staffTpl(data);
                        $('#staffName').attr('hasrequest','true').append(staffStr);
                    }
                }, 'noAnimation');
            }
        }
    },
    
    
    getStaff : function () {
      let staffInterval = setInterval(function () {
          if ($('.i-t-n-user').attr('data-distrbid')){
              initSearch.searchStaff();
              clearInterval(staffInterval);
          }
      },500)
    },
    
    
    //搜索员工管理的酒店
    searchHotel : function () {
        $('.search-list').click(function () {
            if ($('.i-t-n-user').attr('data-isadmin') === '1'){
                let loadShade = layer.load(1);
                
                
                //获取相关参数
                let params = {
                    hotelName      : $('.hotel-name').val(),
                    customerUserId : $('#staffName>option:selected').val(),
                    pageNum        : 1,
                    pageSize       : 20
                };
    
                $.post('/fzgGroupHelperHotelCustomer/searchFzgGroupHelperHotelCustomer.do', params,  function (data) {
                    layer.close(loadShade);
                    
                    
                    if (data.returnCode === 1){
                        //先清空上一个管理员的酒店列表
                        $('.product-tbody').empty();
                        $('.paging-box').empty();
                        
                        //判断数据长度
                        if (data.dataList.length <= 0){
                            if (params.customerUserId === '' || params === undefined){
                                layer.msg('无酒店信息，请联系销售人员', {time : 3000});
                                return;
                            }else{
                                layer.msg('该员工暂无分配酒店', {time : 3000});
                                return;
                            }
                        }
                        
                        let hotelListStr = hotelListTpl(data);
                        $('.product-tbody').html(hotelListStr);
            
                        //设置分页器
                        initSearch.setPagenation(data.pageTotal, 1);
                    }else{
                        alert(data.returnMsg);
                    }
                }, 'noAnimation');
            }else{
                alert('对不起，您没有该权限');
            }
        });
    },
    
    
    setOverFlow : function () {
        let remarkTips;
        $(document).delegate('.product-tbody .tb-overflow','mouseenter',function () {
            remarkTips = layer.tips(decodeURIComponent($(this).data('title')), $(this), {
                time: 0,
                tips: [1, '#fffff3']
            });
        });
    
    
        $(document).delegate('.product-tbody .tb-overflow','mouseleave',function () {
            layer.close(remarkTips);
        });
    },
    
    
    //设置分页器
    setPagenation : function (pageTotal, current) {
        // 数据分页
        pagenation({
            elem: '.paging-box', 			// 组件容器
            pages: pageTotal, 					// 总页数
            current: current,				// 当前显示的第几页
            jump: function(cur){			// 触发分页后的回调
                let loadShade = layer.load(1);
                
                let params = {
                    hotelName      : $('.hotel-name').val(),
                    customerUserId : $('#staffName>option:selected').val(),
                    pageNum        : cur,
                    pageSize       : 20
                };
                
                $.post('/fzgGroupHelperHotelCustomer/searchFzgGroupHelperHotelCustomer.do', params,  function (data) {
                    layer.close(loadShade);
                    
                    //判断数据长度
                    if (data.dataList.length <= 0){
                        layer.msg('暂无数据', {time : 1000});
                        return;
                    }
                    let hotelListStr = hotelListTpl(data);
                    $('.product-tbody').html(hotelListStr);
                    
                    //设置分页器
                    initSearch.setPagenation(data.pageTotal, cur);
                }, 'noAnimation');
            }
        });
    }
}



module.exports = {
    run : function () {
        //获取员工列表
        initSearch.getStaff();
        
        //搜索酒店
        initSearch.searchHotel();
        
        initSearch.setOverFlow();
    }
}