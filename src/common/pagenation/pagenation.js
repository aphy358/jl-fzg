// 该文件定义了分页组件

// 引入模块样式
require('./sass/pagenation.scss');

var 
	pagenationTmpl = require('./templates/pagenation.ejs'),
	
	_default = {
	    elem: null, 			// 组件容器
	    pages: 1, 				// 总页数
	    groups: 5,				// 连续显示分页数
	    current: 1,				// 当前显示的第几页
	    limits: 10,				// 每页限制显示多少条
	    jump: null				// 触发分页后的回调
	},
	
	// 初始化组件事件
	initEvents = function(options, pagenation){

		// 点击任意一页码，包括 "上一页"、"下一页"
	    pagenation.find('a').on('click', function(){
	    	var _this = $(this),
				page = parseInt( _this.attr('data-page') );
			
			if( !_this.hasClass('page-disabled') ){
				options.jump( Math.min(options.pages, page) );
			}
	    })
		
		pagenation.find('input').on('keyup input paste', function(e){
	    	this.value = this.value.replace(/\D/g,'');
	    	
	    	// 响应 input 框的 enter 键被按下
	    	if( e.type === 'keyup' && e.keyCode === 13 ){
	    		pagenation.find('.page-fzgpage-btn').trigger('click');
	    	}
	    })
		
		// 点击 "确定"
		pagenation.find('.page-fzgpage-btn').on('click', function(){
			var _input = pagenation.find('input'),
				page = parseInt( _input.val() );
				
			if(page){
				if( page !== options.current ){
					options.jump( Math.min(options.pages, page) );
				}else{
					pagenation.find('input').val('');
				}
			}
	    })
	},
	
	/**
	 * 分页组件有一部分是相对固定的，如 "上一页"、"下一页"、"确定"按钮、输入框等元素，这部分放在模板文件里
	 * 而页码的显示部分相对是动态的，遵循的规则是：
	 * 1、首页和尾页总是显示
	 * 2、当前页所处的连续页码区最多为5页（首页和尾页不包含在内），超出的页码不显示
	 * 3、首页和尾页如果和连续页码区不连贯，则插入一个 '...' 元素
	 */
	getPagenationHTML = function (options){
	
		options.current = parseInt(options.current);
		options.pages = parseInt(options.pages);
		options.current = Math.min(options.current, options.pages);
		
		var pageStr = '';
			dArr = [],
			pages = options.pages,
			current = options.current;
			
		for (var i = 1; i <= pages; i++) {
			var tmpV = i === current ? ('cur' + i) : i;
			
			if( i === 1 || i === pages || 
				( current - 2 <= i && i <= current + 2 ) ||
				( i <= 5 && current <= 3 ) ||
				( pages - 4  <= i && pages - current <= 3 ) ){
					
				dArr.push(tmpV);
			}
		}
		
		// 如果第一个元素和第二个元素之差大于1，则插入一个元素 '...'
		if( dArr[1] - dArr[0] > 1  ){
			dArr.splice(1, 0, '...');
		}
		
		// 如果倒数第一个元素和倒数第二个元素之差大于1，则插入一个元素 '...'
		if( dArr[dArr.length - 1] - dArr[dArr.length - 2] > 1  ){
			dArr.splice(dArr.length - 1, 0, '...');
		}
		
		for (var i = 0; i < dArr.length; i++) {
			var o = dArr[i];
			if( typeof o === 'string' && o.indexOf('cur') !== -1 ){
				o = o.replace(/cur/g, '');
				pageStr += '<span class="page-fzgpage-curr" data-page="' + o + '"><em class="page-fzgpage-em"></em><em>' + o + '</em></span>';
			}else if( o === '...' ){
				pageStr += '<span class="page-fzgpage-spr">…</span>';
			}else{
				pageStr += '<a href="javascript:;" data-track="公共_分页_选择某一页" data-page="' + o + '">' + o + '</a>';
			}
		}
		
		options.pageStr = pageStr;
		
		return $( pagenationTmpl(options) );
	},
	
	// 新建一个对象
	pagenationFactory = function (options){
        
	    var pagenation = getPagenationHTML( $.extend({}, _default, options) );
	    
	    $(options.elem).html(pagenation);
	
	    return pagenation;
	};



// 新建组件的入口函数
module.exports = function(options){

	if(!options.pages || options.pages < 1)	options.pages = 1;
	
    // 新建一个组件
    var pagenation = pagenationFactory(options);

    // 初始化组件相关事件
    initEvents(options, pagenation);
}