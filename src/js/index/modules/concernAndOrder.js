const
    Util = require('../../../common/util.js'),
    orderTmpl = require('../templates/order.T.ejs'),
    concernAndOrder = require('../templates/concern.T.ejs'),
    loginBox = require('../../../common/loginBox/loginBox.js'),

    // 查询关注列表
    getConcernList = function (params) {
        $.post('/fzgCustomerFavorite/getMyFavoriteList.do', params, function (data) {
            if (data.returnCode === 1) {
                // 主体逻辑
                let concernStr = concernAndOrder({
                    concernList: data.dataList
                })
                $('#i-concern-wrap').html(concernStr)
                
                //确认起价是否为0
                let listArr = data.dataList
                for (let i = 0; i < listArr.length; i++) {
                    let perHotel = listArr[i]
                    if (!perHotel.hasOwnProperty('minPrice') || +perHotel.minPrice === 0) {
                        let param = {
                            hotelId: perHotel.infoId,
                            checkInDate: Util.addDays(new Date(), 0),
                            checkOutDate: Util.addDays(new Date(), 1),
                            roomNum: 1,
                            adultNum: 2,
                            childrenNum: 0,
                            childrenAgesStr: ''
                        }
                        $.post('/hotel/getHotelPriceList.do', param, function (data) {
                            if (data.returnCode === 1) {
                                if (data.data.hasOwnProperty('priceMin') && data.data.priceMin !== 0) {
                                    $('#i-concern-wrap tbody tr[data-hotelid="' + param.hotelId + '"]').find('td[lastChild]').html('<span class="i-concern-price">￥' + data.data.priceMin + '</span>起')
                                } else {
                                    $('#i-concern-wrap tbody tr[data-hotelid="' + param.hotelId + '"]').find('td[lastChild]').html('<span class="i-concern-price">暂无价格')
                                }
                            } else {
                                $('#i-concern-wrap tbody tr[data-hotelid="' + param.hotelId + '"]').find('td[lastChild]').html('<span class="i-concern-price">暂无价格')
                            }
                        }, 'noAnimation')
                    }
                }
            } else if (data.returnCode === -400001) {
                // 用户未登录
            }
            
        }, 'noAnimation');
    },
    
    // 查询订单列表
    getOrderList = function (params) {
        $.post('/myinfo/queryOrderList.do', params, function (res) {
            if (res.returnCode === 1) {
                if (res.dataList) {
                    // 对订单列表返回的数据进行结构变更，以便适用于模板
                    processData(res.dataList)
                    
                    var orderStr = orderTmpl({
                        orderList: res.dataList
                    })
                    
                    $('#i-order-wrap').html(orderStr)
                    
                    // 给每个订单的 itemname 获取相应的链接
                    for (var i = 0; i < $(".i-c-o-link-item.itemId").length; i++) {
                        getLinkForItemName($('.i-c-o-link-item.itemId')[i])
                    }
                }
            } else if (res.returnCode === -400001) {
                // Util.login();
            }
            
        }, 'noAnimation')
    },
    
    // 对订单列表返回的数据进行结构变更，以便适用于模板
    processData = function (dataList) {
        for (var i = 0; i < dataList.length; i++) {
            var o = dataList[i]
            
            if (o.categoryId === 1) {   // 门票订单
                o.orderLink = '/ticketController/findOrderDetail.do?orderId=' + o.orderInfoId
            } else {      // 酒店订单
                o.orderLink = '/myinfo/findOrderDetail.do?orderId=' + o.orderInfoId
                if (o.status === 1) {
                    o.downloadLink = '/myinfo/exportPdfdownticket.do?orderid=' + o.orderInfoId
                }
            }
            
            o.innerStatusText =
                o.innerStatus === -1 ? '待确认' : o.innerStatus === 0 ? '已确认' : o.innerStatus === 1 ? '已拒单' : o.innerStatus === 2 ? '申请取消中' : o.innerStatus === 3 ? '不能取消' : '已取消'
            
            if (o.paymentTerm === 0 && o.refunded != null) {
                o.paymentStatusText =
                    o.refunded === 0 ? '未支付' : 
                    o.refunded === 1 ? '退款成功' : 
                    o.refunded === 2 ? '已支付' : 
                    o.refunded === 3 ? '退款中' : 
                    o.refunded === 4 ? '快钱支付成功' : 
                    o.refunded === -1 ? '退款失败' : 
                    o.refunded === -4 ? '快钱支付失败' : 
                    o.refunded === -2 ? '支付失败' : ''
            } else {
                o.paymentStatusText =
                    o.paymentStatus === 0 ? '已支付' : 
                    o.paymentStatus === 1 ? '未支付' : 
                    o.paymentStatus === 2 ? '挂账' : ''
            }
        }
    },
    
    // 给每个订单的 itemname 获取相应的链接
    getLinkForItemName = function (target) {
        var
            _this = $(target),
            itemId = _this.attr('data-itemid')
    },
    
    // 第一次进页面，初始化订单列表，初始化关注列表
    initOrderList = function () {
        getConcernList({
            categoryId: 0,
            pageNum: 1,
            pageSize: 5
        })
        
        getOrderList({
            currPage: 1,
            pageSize: 5,
        })
    },
    
    // 初始化 "搜索" 点击事件
    initOrderSearch = function () {
        $('.i-c-order-btn').on('click', function () {
            getOrderList({
                currPage: 1,
                pageSize: 5,
                searchKey: $('#i-order-keyword').val().replace(/^\s+|\s+$/g, '')
            })
        })
    },
    
    //点击“查看全部”事件、鼠标移入关注列表中每一项时，冒出气泡
    getAllConcern = function () {
    let itemLayer = null;
        $('.get-all-concern').click(function () {
            $('.side-item-gz').trigger('click')
        })
        
        $('body').delegate('.i-c-o-link-item', 'mouseenter', function () {
            itemLayer = layer.tips($(this).text(), $(this), {
                    time: 0,
                    tips: [1, '#fffff3']
                }
            )
        }).delegate('.i-c-o-link-item', 'mouseleave', function (e) {
            //用户鼠标移出酒店名时，看情况选择关闭tips层与否
            if ($(e.toElement).hasClass('layui-layer-TipsG') || $(e.toElement).hasClass('layui-layer-tips')) {
                //不关闭tips层
            } else {
                //关闭tips层
                layer.close(itemLayer)
            }
        }).delegate('.layui-layer-tips', 'mouseleave', function () {
            //用户鼠标移出tips层时，关闭tips层
            layer.close(itemLayer)
        }).delegate('.hotel-no-link', 'click', function () {
            //用户点击关注列表中没有链接（已删除）的酒店时，弹出提示框
            alert('该酒店已删除')
            return false
        })
    };

// 我的关注、订单管理 模块
module.exports = {
    run: function () {
        
        // 第一次进页面，初始化订单列表
        initOrderList()
        
        // 初始化 "搜索" 点击事件
        initOrderSearch()
        
        //点击“查看全部”事件、鼠标移入关注列表中每一项时，冒出气泡
        getAllConcern()
    }
}