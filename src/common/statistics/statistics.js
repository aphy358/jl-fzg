var URL = {
    record: "/count/record.do?"
}


/**
* 提交记录
*/
function doRecord(type, data, callback) {
    $.get(URL.record + "&t=" + type + "&d=" + data, function (r) {
        if (callback) {
            callback(r);
        }
    });
}


// 专门为各种活动页设置的统计函数
function doRecordForPromotions(type, distrbCode, value, callback){
    if( !distrbCode )   return;

    distrbCode = encodeURIComponent(distrbCode);
    value = encodeURIComponent(value);
    var data = encodeURIComponent(distrbCode + "|" + value);

    $.get('/count/recordByOrdinal.do?&ordinal=' + type + '&d=' + data, function (r) {
        if (callback) {
            callback(r);
        }
    });
}

/**
* 根据类型type和数据data,提交记录
* type 统计类型
* data 保存的数据
*/
function doRecordByTD(type, data, callback) {
    data = encodeURIComponent(data);
    doRecord(type, data, callback);
}



/**
* 根据类型type和数据(distrbCode|value),提交记录
*  type 统计类型
* distrbCode 用户code
* value 保存的数据
*/
function doRecordByTCV(type, distrbCode, value, callback) {
    if (distrbCode) {
        distrbCode = encodeURIComponent(distrbCode);
        value = encodeURIComponent(value);
        var data = encodeURIComponent(distrbCode + "|" + value);
        doRecord(type, data, callback);
    }
}


/**
* 根据类型type和数据(distrbCode|arr),提交记录
* type 统计类型
* distrbCode 用户code
* arr 保存的数据-数组
*/
function doRecordByTCA(type, distrbCode, arr, callback) {
    if (distrbCode) {
        distrbCode = encodeURIComponent(distrbCode);
        var data = "";
        for (var arr_i = 0; arr_i < arr.length; arr_i++) {
            var value = encodeURIComponent(arr[arr_i]);
            var d_i = "," + distrbCode + "|" + value;
            data += d_i;
        }
        if (data.length > 0) {
            data = data.substr(1);
            data = encodeURIComponent(data);
            doRecord(type, data, callback);
        }
    }
}


// 专门用于后台统计各种类型的点击事件发生的次数，一般运用于活动页的统计
module.exports = {
    doRecordByTD  : doRecordByTD,
    doRecordByTCV : doRecordByTCV,
    doRecordByTCA : doRecordByTCA
}
