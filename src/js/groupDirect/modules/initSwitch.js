//切换集团
const initSwitch = {
    //切换集团
    switchGroup : function () {
        $('.switch-group-btn').click(function () {
            let dataGroup = $(this).data('group');
            
            //更换tab栏的样式
            $('.switch-group-btn').removeClass('selected');
            $(this).addClass('selected');
            
            $('.per-group').removeClass('shown');
            $('.per-group[data-group="' + dataGroup + '"]').addClass('shown');
        });
    },
    
    //初始化品牌列表
    initBrand : function () {
      const
          wBrand1 = require('../templates/wanhao_brand_1.ejs'),
          wBrand2 = require('../templates/wanhao_brand_2.ejs'),
          wBrand3 = require('../templates/wanhao_brand_3.ejs'),
          wBrand4 = require('../templates/wanhao_brand_4.ejs'),
          wBrand5 = require('../templates/wanhao_brand_5.ejs');
      
      $('.wanhao-main-brand').append(wBrand1).append(wBrand2).append(wBrand3).append(wBrand4).append(wBrand5);
      
      const
          xBrand1 = require('../templates/xidawu_brand_1.ejs'),
          xBrand2 = require('../templates/xidawu_brand_2.ejs');
      
      $('.xidawu-main-brand').append(xBrand1).append(xBrand2);
      
      const
          zBrand1 = require('../templates/zhouji_brand_1.ejs'),
          zBrand2 = require('../templates/zhouji_brand_2.ejs');
      
      $('.zhouji-main-brand').append(zBrand1).append(zBrand2);
      
      const
          bBrand1 = require('../templates/bestwest_brand_1.ejs');
      
      $('.bestwest-main-brand').append(bBrand1);
    },
    
    //切换品牌
    switchBrand : function () {
        $('.switch-brand-btn').click(function () {
            let dataBrand = $(this).data('brand');
            
            //更换tab栏的样式
            $(this).closest('.switch-brand').find('.switch-brand-btn').removeClass('selected');
            $(this).addClass('selected');
            
            $(this).closest('.per-group').find('.brand-introduce').removeClass('shown');
            $(this).closest('.per-group').find('.brand-introduce[data-brand="' + dataBrand + '"]').addClass('shown');
        });
    },
    
    
    //鼠标移入品牌时，显示关于该品牌的介绍
    onBrand : function () {
        $(document).delegate('.brand', 'mouseenter', function () {
            if ($('.per-brand-bg').length > 0){
                $('.per-brand-bg').css({
                    top: $(this).offset().top,
                    left: $(this).offset().left
                }).show();
            }else{
                let $bg = $('<div class="per-brand-bg"></div>');
                $bg.css({
                    position: 'absolute',
                    width: '299px',
                    height: '200px',
                    top: $(this).offset().top,
                    left: $(this).offset().left,
                    boxShadow: '0 0 20px #e0e0e0',
                    zIndex: 99
                })
                $('body').append($bg);
            }
        })
            .delegate('.brand', 'mouseleave', function () {
                $('.per-brand-bg').hide();
            })
    }
}


module.exports = {
    run :function () {
        initSwitch.switchGroup();
        
        initSwitch.initBrand();
        
        initSwitch.switchBrand();
        
        initSwitch.onBrand();
    }
}