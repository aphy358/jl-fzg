const operateUserTpl = require('../templates/operateUser.ejs');
const getHotelList = require('./hotelList.js').getHotelList;


const initUser = {
    //客户下拉框
    initUserSelect : function () {
        $.post('/fzgGroupHelperDistributor/searchFzgGroupHelperDistributor.do',function (data) {
            if (data.returnCode === 1){
                let operateUserStr = operateUserTpl(data);
    
                $('.operate-user').append(operateUserStr);
            }
        }, 'noAnimation');
    },
    //新增客户
    addUser : function () {
        $('body').delegate('.add-user','click',function () {
            if (window.distrbCode !== 'SZ2747'){
                alert('您没有该权限');
                return;
            }
            
            layer.prompt({
                title : '请输入客户编号'
            }, function(value, index, elem){
                //得到value
                let params = {
                    distributorCode : value
                }
                $.post('/fzgGroupHelperDistributor/saveFzgGroupHelperDistributor.do',params, function (data) {
                    if (data.returnCode === 1){
                        layer.msg('添加成功',{
                            time: 1000
                        },function () {
                            location.reload();
                        });
                    }else{
                        alert(data.returnMsg);
                    }
                }, 'noAnimation')
                
                layer.close(index);
            });
        })
    },
    
    
    //删除客户
    delUser : function () {
        $('body').delegate('.del-user','click',function () {
            if (window.distrbCode !== 'SZ2747'){
                alert('您没有该权限');
                return;
            }
            
            layer.prompt({
                title : '请输入客户编号'
            }, function(value, index, elem){
                //得到value
                let params = {
                    distributorCode : value
                }
                $.post('/fzgGroupHelperDistributor/removeFzgGroupHelperDistributor.do',params, function (data) {
                    if (data.returnCode === 1){
                        layer.msg('删除成功',{
                            time: 1000
                        },function () {
                            location.reload();
                        });
                    }else{
                        alert(data.returnMsg);
                    }
                }, 'noAnimation')
                
                layer.close(index);
            });
        })
    },
    
    
    //用户切换select中的选项时，查询选中客户的酒店列表
    switchUser : function () {
        $('body').delegate('select[name="operateUser"]','change',function () {
            if (window.distrbCode !== 'SZ2747'){
                alert('您没有该权限');
                return;
            }
            
            let loadShade = layer.load(1);
            getHotelList(function () {
                layer.close(loadShade);
            });
        });
    },
};



module.exports = {
    run : function () {
        //客户下拉框
        initUser.initUserSelect();
    
        //新增客户
        initUser.addUser();
    
        //删除客户
        initUser.delUser();
    
        //用户切换select中的选项时，查询选中客户的酒店列表
        initUser.switchUser();
    }
}
