
//引入模板文件
const ticketT           = require('../templates/ticket.T.ejs');


console.log('fdf')
//初始化景点门票各项
function initTicketItems(){
    $("#ticketWrap").html( ticketT() );
}



//首页景点门票 相关 js
module.exports = {
    run: function(){
        //初始化景点门票各项
        initTicketItems()
    }
}