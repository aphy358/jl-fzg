
const Util = require('../../../common/util');
const tipShowAndHide = Util.tipShowAndHide;
const theadTmpl = require('../templates/thead.ejs');
const tbodyTmpl = require('../templates/tbody.ejs');
var dateArr_g = [];



// 获取表头的日期数组
function getDateArr() {
    var cnWeekNameArr = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    var today = new Date();
    var dateArr = [];
    dateArr_g = [];

    for (let i = 0; i < 7; i++) {
        var tmpDate = new Date( Util.addDays(today, i, '/') );
        dateArr.push( tmpDate.Format("MM/dd ") + cnWeekNameArr[tmpDate.getDay()] );
        dateArr_g.push( tmpDate.Format("yyyy-MM-dd") );
    }

    return dateArr;
}

// 更新表头
function updateThead() {
    var dateArr = getDateArr();
    var theadStr = theadTmpl({dateArr: dateArr});
    $('.tpm-table-wrap .hotel-price-thead').html(theadStr)
}

// 更新刷新时间
function updatePreRefreseTime(res) {
    if( res.data && res.data.refreshTime ){
        var lastRefreshTime = new Date(res.data.refreshTime.time).Format("yyyy/MM/dd hh:mm:ss");
        $('.tp-opt-time').html(lastRefreshTime);
    }else{
        $('.tp-opt-time').html('');
    }
}


// 为预定条款 td 设置数据项
function setDataForOrderClauseTd(oneDatePrice){
    var
        dataObj = {},
        clauses = [];
    
    var reserveShowArr = oneDatePrice.roomTypePriceModel.nightlyPriceList[0].reserveShow.split(/[|;]/);
    for (var j = 0; j < reserveShowArr.length; j++) {
        var o = reserveShowArr[j];
        ~o.indexOf('限住') ? dataObj['限制晚数'] = o :
        ~o.indexOf('提前') ? dataObj['提前预订'] = o :
        ~o.indexOf('连住') ? dataObj['连住多晚'] = o :
        ~o.indexOf('时间') ? dataObj['限时预订'] = o :
        ~o.indexOf('间数') ? dataObj['限制间数'] = o :
                            dataObj['无'] = o;
    }
    
    for(key in dataObj){
        if( key !== '无' )		clauses.push({name: key, tip: dataObj[key]});
    }

    clauses.length === 0 ? oneDatePrice.orderTerm = '无' :
    clauses.length === 1 ? oneDatePrice.orderTerm = clauses[0].name :
                           oneDatePrice.orderTerm = '复合条款';

    var tmpArr = [];
    for (let i = 0; i < clauses.length; i++) {
        var p = clauses[i].tip;
        tmpArr.push(p);
    }

    oneDatePrice.orderTermTip = tmpArr.join(',');
}

// 对返回的数据进行结构改造，以适应模板
function processDate(res) {
    if(res.data && res.data.roomTypeForGroupHelperDtoList){
        for (let i = 0; i < res.data.roomTypeForGroupHelperDtoList.length; i++) {
            var o = res.data.roomTypeForGroupHelperDtoList[i];  // 单个房型

            for (let j = 0; j < o.rateTypeForGroupHelperDtoList.length; j++) {
                var p = o.rateTypeForGroupHelperDtoList[j];     // 单个床型
                p.priceList = [];

                for (let k = 0; k < dateArr_g.length; k++) {
                    var date = dateArr_g[k];
                    var oneDatePrice = p.dayPriceForGroupHelperDtoMap[date];
                    
                    if(oneDatePrice){
                        oneDatePrice.dateStr = date;
                        oneDatePrice.endDate = Util.addDays( new Date(date.replace(/-/g, '/')), 1 );
                        setDataForOrderClauseTd(oneDatePrice);
                    }

                    p.priceList.push(oneDatePrice);
                }
            }
        }
    }
}

// 初始化左边单个酒店的点击事件，点击时候查询出该酒店的价格
function initHotelItemClick() {
    $(document).delegate('.tpchl-row', 'click', function () {
        var _this = $(this);
        var hotelId = _this.attr('data-hid');
        var enable = _this.attr('data-bool');

        // 被选中酒店状态切换
        $('.tpchl-row').removeClass('active');
        _this.addClass('active');

        if(hotelId){
            queryAndUpdatePrice(hotelId, enable, 0);
        }
    });
}

// 初始化预订条款和取消条款的 Tips
function initTips(){
    $(document).delegate('.cancel-order-term', 'mouseover', function(){
        var _this = $(this);
        var msg = _this.attr('data-tip');

        if(msg !== ''){
            tipShowAndHide(_this, _this.attr('data-tip'));
        }
    })
}

// 更新link
function updateLink(data, hotelId){
    if(data){
        // var link = '/hotel/toHotelDetail.do?ch=' + data.countryType + '&hotelId=' + hotelId + '&checkin=2018-04-01&checkout=2018-04-02'
        $('#goToHotelDetail').attr('href', data.detailLink);
    }else{
        $('#goToHotelDetail').attr('href', 'javascript:;');
    }
}

// 根据传入的参数，查缓存价，或者是更新实时价格
function queryAndUpdatePrice(hotelId, enable, type, callback){

    // 重置 '刷新' 按钮状态，先删掉所有类名，使得暂时无法点击，等价格返回之后再可点击
    $('.tp-opt-btn').removeClass('enable disable');

    $.post('/fzgGroupHelperHotelPrice/searchFzgGroupHelperHotelPrice.do', {hotelId:hotelId, isRefresh:type}, function (res) {
        res.data = window.JSON.parse(res.data);

        if (res.returnCode === 1) {

            // 如果有回调函数，则执行回调
            if(callback){
                callback();
            }

            // 处理 '刷新' 按钮的状态
            $('.tp-opt-btn').addClass(enable);

            // 更新表头
            updateThead();

            // 更新刷新时间
            updatePreRefreseTime(res);

            // 对返回的数据进行结构改造，以适应模板
            processDate(res)

            // 更新link
            updateLink(res.data, hotelId);

            $('.tpm-table-wrap .hotel-price-tbody').html('');
            // 填充价格列表
            if(res.data && res.data.roomTypeForGroupHelperDtoList && res.data.roomTypeForGroupHelperDtoList.length){
                

                var tbodyStr = tbodyTmpl({roomList: res.data.roomTypeForGroupHelperDtoList, countryType: res.data.countryType});
                $('.tpm-table-wrap .hotel-price-tbody').html(tbodyStr)
            }

        } else if (res.returnCode === -400001) {
            Util.login();
        } else{
            alert(res.returnMsg);
        }
    })
}

// 初始化 '搜索' 按钮点击事件
function clickRefresh(){
    $('.tp-opt-btn').on('click', function(){
        if(!$(this).hasClass('enable')) return;

        var hotelId = $('.tpchl-row.active').attr('data-hid');
        var enable = 'enable';

        queryAndUpdatePrice(hotelId, enable, 1, function(){
            $('.tpchl-row.active .tpchl-status').attr('data-refreshetime', (new Date).Format("yyyy/MM/dd hh:mm:ss"));
        });
    })
}


function goToOrderConfirmPage(_this) {
    var
        priceStrs = _this.find('.hotelPriceStrs'),
        priceStrs_key = "hotelPriceStrs_" + (+new Date()),
        params = [
            'staticInfoId=' 		+ _this.attr('data-hotelid'),
            'hotelId=' 				+ _this.attr('data-hotelid'),
            'supplierId=' 			+ _this.attr('data-supplierid'),
            'roomId=' 				+ _this.attr('data-roomId'),
            'breakFastId=' 			+ _this.attr('data-breakFastId'),
            'paymentType=' 			+ _this.attr('data-paymentType'),
            'rateType=' 			+ _this.attr('data-rateType'),
            
            'isQueryPrice=true',
            _this.attr('data-marketingStr'),
            
            'startDate=' 			+ _this.attr('data-startDate'),
            'endDate=' 				+ _this.attr('data-endDate'),
            'citytype=' 			+ _this.attr('data-type'),
            'adultNum=2',
            'childrenNum=0',
            'childrenAgeStr=',
            'roomNum=1',
            'ch=' 					+ _this.attr('data-type'),
            'hotelPriceStrsKey=' 	+ priceStrs_key
        ];

    setTimeout(function () {
        sessionStorage.setItem(priceStrs_key, priceStrs.html());
        
        var url = "/order/orderConfirm.do?" + params.join('&');
        // var url = "./orderConfirm.html?" + params.join('&');
    
        _this.attr("href", url);

        setTimeout(function () {
            sessionStorage.removeItem(priceStrs_key);
            _this.attr("href", "javascript:;");
        }, 200)
    }, 10)
}


// 初始化单个价格 TD 的点击事件，跳转到下单页面
function tdClick(){
    $(document).delegate('.hp-order-btn', 'click', function(){
        var _this = $(this);
        if(_this.attr("href") === 'javascript:;'){
            goToOrderConfirmPage(_this)
        }
    })
}

// 初始化跳转链接的点击事件
function initLinkClick(){
    $('#goToHotelDetail').on('click', function(){
        if($(this).attr('href') === 'javascript:;'){
            alert('该酒店从未刷新，请先刷新！');
        }
    })
}


module.exports = {
    run: function () {
        // 初始化左边单个酒店的点击事件，点击时候查询出该酒店的价格
        initHotelItemClick();

        // 初始化预订条款和取消条款的 Tips
        initTips();

        // 初始化 '搜索' 按钮点击事件
        clickRefresh();

        // 初始化单个价格 TD 的点击事件，跳转到下单页面
        tdClick();

        // 初始化跳转链接的点击事件
        initLinkClick();
    }
}