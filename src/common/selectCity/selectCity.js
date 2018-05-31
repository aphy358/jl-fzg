//引入模板文件
var inlandCityTemplate = require('./inlandCity.T.ejs');

//引入测试文件（后续用 ajax 请求真实数据）
var citys          = require('./citys.js');
var inlandHotCitys = require('./inlandHotCitys.js');

//先将所有城市按国内（arr1）、国外（arr2）分组到两个数组，并且按照字母顺序排列好
var arr1 = [],
    arr2 = [],
    letterArr = ['ABCD', 'EFGHI', 'JKLM', 'NOPQRS', 'TUVWX', 'YZ'];

//按照字母 A、B、C、D... 分组，然后分别 push 到国内、国外两个数组内
function groupByLetter(arr) {
    for (var i = 0; i < arr.length; i++) {

        var o = arr[i];
        var index = o.w.toUpperCase();

        if (+o.t === 0) { // 国内
            !arr1[index] ? arr1[index] = [o] : arr1[index].push(o);
        } else if (+o.t === 1) { // 国外
            !arr2[index] ? arr2[index] = [o] : arr2[index].push(o);
        }
    }
}

//按照给定的字母序列分组，如 'ABCD', 'EFGHI', 'JKLM', 'NOPQRS', 'TUVWX', 'YZ'
function groupByArr(arr, inputArr) {

    var tmpArr = {};

    for (var i = 0; i < inputArr.length; i++) {

        var iStr = inputArr[i]; // 'ABCDE'
        var cArr = iStr.toUpperCase().split(''); // 'ABCDE'  =>  ['A', 'B', 'C', 'D', 'E']

        for (var j = 0; j < cArr.length; j++) {

            for (key in arr) {
                if (key === cArr[j]) {
                    var obj = {
                        w: key,
                        item: arr[key]
                    };
                    !tmpArr[iStr] ? tmpArr[iStr] = [obj] : tmpArr[iStr].push(obj);
                }
            }
        }
    }

    return tmpArr;
}

//显示城市选择面板
function showCitySelect(){
    $('.select-city-box').show();
}

//隐藏城市选择面板
function hideCitySelect(){
    $('.select-city-box').hide();
}

//切换显示的城市分组
function switchCityGroup(_this){
    if( _this.hasClass('active') )  return;

    $(".select-city-mid li").removeClass('active');
    _this.addClass('active');

    var key = _this.html();
    var cGroup = $('.city-group li');
    for(var i = 0; i < cGroup.length; i++){
        var o = cGroup[i];
        if( $(o).attr('data-key') === key ){
            $(o).addClass('active');
        }
        else{
            $(o).removeClass('active');
        }
    }
}

//将选中的城市设置到输入框
function setSelectCity(_this){

    var cityInput = $('.aim-city');

    cityInput.attr('data-citytype', _this.attr('data-citytype'))
             .attr('data-cityid', _this.attr('data-cityid'))
             .val( _this.html() );
}

//初始化城市选择面板上的相关事件
function initCitySelectEvents(){

    //点击输入框，弹出结果层
    $('.aim-city').on('focus', function() {
        showCitySelect();
    });

    //点击删除显示框按钮
    $('.del-select-city').click(function() {
        hideCitySelect();
    });

    //点击城市选择顶部 title，在‘热门’、‘ABCD’、‘EFGHI’...之间切换，同时切换其对应的城市
    $(".s-city-title").on('click', function() {
        switchCityGroup( $(this) );
    });

    //选中城市，将之设置到输入框
    $(".city-item").on('click', function() {
        setSelectCity( $(this) );
        hideCitySelect();
    });

    //点击展示框以外的区域时隐藏展示框
    $(document).click(function(e) {
        hideCitySelect();
    });

    $('.s-h-i-input').click(function(e) {
        e.stopPropagation();
    })
}

module.exports = {
    run: function() {

        //先将所有城市按国内（arr1）、国外（arr2）分组到两个数组，并且按照字母顺序排列好
        groupByLetter(citys);

        //按照给定的字母序列分组，如 'ABCD', 'EFGHI', 'JKLM', 'NOPQRS', 'TUVWX', 'YZ'
        arr1 = groupByArr(arr1, letterArr);
        arr2 = groupByArr(arr2, letterArr);

        var arr = {
            citys : arr1,
            inlandHotCitys : inlandHotCitys
        };
        //将国内所有城市组装到模板，并插入到页面相应位置
        $(".select-city").html( inlandCityTemplate({arr : arr}) );

        //初始化城市选择面板上的相关事件
        initCitySelectEvents();
    }
};