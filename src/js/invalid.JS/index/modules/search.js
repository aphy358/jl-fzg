//引入模板文件
const searchT = require('../templates/search.T.ejs');


//引入城市选择框模块
const selectCity = require('../../../common/selectCity/selectCity.js');

//引入日期控件模块
//const selectDate=require('../../../common/selectDate/selectDate.js');

//填充搜索框的 html
function fillSearchHtml() {
    $("#searchWrap").html(searchT());
}

//初始化搜索框点击切换事件，酒店、门票、手机版
function initSearchTypeSwithClick() {
    $("li.s-tab-item").on('click', function() {
        var _this = $(this);
        if (_this.hasClass('current')) return;

        _this.parent().find('.s-tab-item').removeClass('current');
        _this.addClass('current');

        var target = _this.attr('data-for');
        var arr = $('.s-box-wrap .s-box');
        arr.removeClass('current');
        arr.filter(function(i, o) {
                return $(o).attr('data-target') == target;
            })
            .addClass('current');
    });

    //国内酒店和国外酒店点击切换事件
    $('.s-h-item').on('click', function() {
        //先清空输入框中的内容
        $('.aim-city').val("");
        //切换样式
        $(this).addClass('current')
            .siblings().removeClass('current');

        //判断用户点击的是国内酒店还是国外酒店
        var isAbroad = $(this).text();
        if (isAbroad == '国内酒店') {
            //加载国内酒店模块
            selectCity.run(false);
        } else {
            //加载国际酒店模块
            selectCity.run(true);
        }
    })
}


//首页搜索栏 相关 js
module.exports = {
    run: function() {

        //填充搜索框的 html
        fillSearchHtml();

        //初始化搜索框点击切换事件，酒店、门票、手机版
        initSearchTypeSwithClick();

        //默认加载国内酒店模块
        selectCity.run(false);

        //加载日期控件
        //selectDate.run();

    }
};