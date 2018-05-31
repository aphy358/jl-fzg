
require('./footer.scss');


const Util =  require('../../../common/util.js');


module.exports = {
    run: function(){
        if( Util.ltIE9() ){
            alert('为了更好的使用体验，请不要使用IE浏览器，谢谢！');
        }
    }
}