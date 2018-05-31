var util = require('../src/common/util');

require('should');

var chai = require('chai'),
    expect = chai.expect;


describe('测试 utils 里面的方法', function () {

    it('—— 测试 runAfterContinuousOpt', function () {
        function cb(say){
        }
        expect(util.runAfterContinuousOpt(cb, 300, 'option')).to.be.undefined;

    })

    it('—— 测试 queryString', function () {
        if( history.pushState ){
            history.pushState('test url', 'test url', 'http://localhost:9876/debug.html?test=test');
            expect(util.queryString('test')).to.be.equal('test');
        }
    })

    it('—— 测试 isIE', function () {
        
        expect(util.isIE()).to.be.oneOf([true, false]);
        console.log( 'Is IE?  ' + util.isIE() );
        
    })

    it('—— 测试 ltIE9', function () {        
        if( util.isIE() ){
            expect(util.ltIE9()).to.be.oneOf([true, false]);
        }else{
            expect(util.ltIE9()).to.be.false;
        }        
    })
})