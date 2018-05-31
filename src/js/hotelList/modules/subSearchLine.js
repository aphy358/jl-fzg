
const
	queryHotelUtil 		= require('./queryHotelUtil.js'),
	getParams 			= queryHotelUtil.getParams,
	queryHotels 		= queryHotelUtil.queryHotels,
	
	
	// 初始化搜索事件
	initSearchEvent = function (){
		$(".ssl-search-btn").on('click', function(){
			queryHotels( getParams(1) );
		})
	};


// 子搜索栏 js
module.exports = {
    run: function(){
		// 初始化搜索事件
        initSearchEvent();
    }
}