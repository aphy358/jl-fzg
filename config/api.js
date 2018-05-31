
//所有被代理的api
let proxy_addr = 'http://192.168.101.204:8083';
// let proxy_addr = 'http://192.168.101.232:8083';
let ex = {};

var test = [
	// 企业首页验证码的获取
	'/user/getCheckcodeImg.do',
	
	
	'/user/indexMainData.do',					// 主页主广告
	
	'/user/indexHotSeasonData.do',				// 当季热销
	'/user/indexInternalhotelData.do',			// 国内酒店
	'/user/indexForeignhotelData.do',			// 国际酒店
	'/user/indexTicketData.do',					// 景点门票
	'/user/indexPromotionalSaleData.do',		// 促销特卖
	'/user/indexSellWellMonthData.do',			// 本月热销
	
	
	// 确认酒店是否下线
	// '/internalOrder/check.do',
	
	// 页面最开始加载时用户及系统的状态
	'/order/validate.do',

	// 获取页面主要信息
	'/order/write.do',

	// 获取加床、加早、加宽带信息、
	'/order/surchargeRoom.do',

	// 获取护照国籍信息
	'/order/countrySuggest.do',

	// 验证酒店价格是否适合于某国际客户
	'/order/properMarket.do',

	// 用户确认订单信息后进行验价
	'/order/orderValidate.do',

	// 验价成功后，保存订单
	'/order/save.do',

	// 发送统计数据
	'/count/record.do',

	// 国庆活动页，按具体房型查价
	'/hotel/getPriceList.do',

	// 获取登录态
	'/user/getCurrentUser.do',



	// 房掌柜首页接口
	'/user/loginoutfzg.do',
	'/city/searchCity.do',
	'/suggest/searchHotel.do',
	'/suggest/getHotHotels.do',
	'/myinfo/queryOrderList.do',
	'/mainPush/queryMainPushProductList.do',
	'/hotel/getPriceList.do',
	'/user/getAdInfoData.do',
	'/hotel/price.do',
	'/hotel/priceCache.do',
	'/hotel/getPriceListCache.do',


	// 房掌柜酒店列表接口
	'/hotel/queryHotel.do',
	'/hotel/getHotelParam.do',
	'/hotel/getZone.do',
	'/city/getCitys.do',
	'/hotel/getHotelPrice.do',
	'/hotel/getHotelPriceListInStock.do',
	'/qnbOption/getQnbOptionListByTypeCode.do',


	// 酒店详情接口
	'/user/bookHotel.do',
	'/hotel/toHotelDetail.do',
	'/hotel/getHotelInfoList.do',
	'/hotel/getNearbyHotelList.do',
	'/hotel/queryHotelList.do',
	'/hotel/queryHotelListNew.do',
	'/hotel/getHotelPriceList.do',

	'/hotel/roomInfo.do',
	'/hotel/getZone.do',
	
	// 我的关注
	'/fzgCustomerFavorite/getMyFavoriteList.do',

	//酒店详情页接口
	'/hotel/getHotelInfoList.do',
	
	//接送机活动页接口
	'/hotel/getMarketing.do',



	// 房掌柜小助手
	'/fzgGroupHelperDistributor/toFzgGroupHelper.do',
	'/fzgGroupHelperDistributor/saveFzgGroupHelperDistributor.do',
	'/fzgGroupHelperDistributor/removeFzgGroupHelperDistributor.do',
	'/fzgGroupHelperDistributor/searchFzgGroupHelperDistributor.do',
	'/fzgGroupHelperManagedHotel/saveFzgGroupHelperManagedHotel.do',
	'/fzgGroupHelperManagedHotel/removeFzgGroupHelperManagedHotel.do',
	'/fzgGroupHelperManagedHotel/searchFzgGroupHelperManagedHotel.do',
	'/fzgGroupHelperHotelCustomer/toFzgGroupHelperHotelCustomer.do',
	'/myinfo/searchCustomerUser.do',
	'/fzgGroupHelperHotelCustomer/searchFzgGroupHelperHotelCustomer.do',
	'/fzgGroupHelperHotelCustomer/operateFzgGroupHelperHotelCustomer.do',
	'/fzgGroupHelperHotelPrice/toFzgGroupHelperHotelPrice.do',
	'/fzgGroupHelperHotelPrice/searchFzgGroupHelperHotelRefreshTime.do',
	'/fzgGroupHelperHotelPrice/searchFzgGroupHelperHotelPrice.do',

].forEach(function (o, i) {
	ex[o] = proxy_addr;
});

module.exports = ex;
