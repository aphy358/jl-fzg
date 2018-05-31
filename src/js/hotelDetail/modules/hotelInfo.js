
const
	Util 			= require('../../../common/util.js'),
	queryString 	= Util.queryString,
	
	
	
	// 初始化酒店小图组的上下滚动事件
	initSmallImgListScroll = function(){
		$(".hotel-detail-info-outer").delegate('.hdi-img-scroll', 'click', function(){
			var
				_this = $(this),
				parent = _this.closest('.hdi-img-wrap-small'),
				upIcon = parent.find('.scroll-up .hli-icon'),
				downIcon = parent.find('.scroll-down .hli-icon'),
				target = parent.find('.hdi-img-small-list'),
				liCount = target.find('li').length,
				targetH = liCount * 110 + (liCount - 1) * 5,
				targetNMT;

			if(_this.hasClass('scroll-down')){
				if(downIcon.hasClass('disabled'))	return;
				upIcon.removeClass('disabled');
				
				targetNMT = parseInt( target.css('margin-top') ) - 115;
				
				if(targetNMT <= 400 - targetH){
					targetNMT = 400 - targetH;
					downIcon.addClass('disabled');
				}
				
				target.animate({'margin-top': targetNMT}, 100);
			}else{
				if(upIcon.hasClass('disabled'))	return;
				downIcon.removeClass('disabled');
				
				targetNMT = parseInt( target.css('margin-top') ) + 115;
				
				if(targetNMT >= 0){
					targetNMT = 0;
					upIcon.addClass('disabled');
				}
				
				target.animate({'margin-top': targetNMT}, 100);
			}
			
		})
	},
	
	// 初始化酒店小图的点击事件
	initSmallImgClick = function(){
		$(".hotel-detail-info-outer").delegate('.hdi-img-small-item', 'click', function(){
			var
				_this = $(this),
				thisMask = _this.find('.hdi-isi-mask'),
				maskArr, thisImgSrc, bigImg;
				
			if(!thisMask.hasClass('hidden'))	return;
			
			thisImgSrc = _this.find('img').attr('src');
			bigImg = _this.closest('.hdi-img-outer').find('.hdi-img-wrap-big img').attr('src', thisImgSrc);
			maskArr = _this.closest('.hdi-img-small-list').find('.hdi-isi-mask');
			maskArr.addClass('hidden');
			thisMask.removeClass('hidden');
		})
	};
	
	

// 酒店信息
module.exports = {
    run: function(){
    	
    	// 初始化酒店小图组的上下滚动事件
    	initSmallImgListScroll();
    	
    	// 初始化酒店小图的点击事件
    	initSmallImgClick();
    }
}