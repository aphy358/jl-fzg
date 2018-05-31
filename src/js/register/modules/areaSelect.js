// const area = require('./areas.js').initializeArea();

const area = require('./area.json');

const countrys           = area.countrys;
const states             = area.states;
const citys              = area.citys;
const zones              = area.zones;
const defaultContryIndex = area.defaultContryIndex;

//初始化国家下拉，提供一个缺省被选择的国家
function initCountry(defaultCountry,selectForm){
    clearSelectForm(selectForm);
    
    for(i=0;i<countrys.length;i++){
        var oOption = document.createElement("option");
        oOption.text=countrys[i][2];
        oOption.value=countrys[i][1];
        addOption(selectForm,oOption);
    }
    if(defaultCountry==null || defaultCountry=="" || defaultCountry=="-1"){
        selectForm.options[defaultContryIndex].selected=true;
    }else{
        setSelectedByObj(selectForm,defaultCountry);
    }
    
}

//根据国家ID初始化省份下拉，提供一个缺省被选择的省份。
function initState(countryId,defaultstate,selectForm){
    
    clearSelectForm(selectForm);
    for(i=0;i<states.length;i++){
        if(states[i][0].toString()==countryId.toString()){
            var oOption = document.createElement("OPTION");
            oOption.text=states[i][2];
            oOption.value=states[i][1];
            addOption(selectForm,oOption);
        }
        else if(i==0){
            var oOption = document.createElement("OPTION");
            oOption.text=states[i][2];
            oOption.value=states[i][1];
            addOption(selectForm,oOption);
        }
    }
    
    if(defaultstate==null || defaultstate==""|| defaultstate=="-1"){
        if(selectForm){
            selectForm.options[0].selected=true;
        }
    }else{
        setSelectedByObj(selectForm,defaultstate);
    }
    
}

//根据省份ID生成城市的下拉，默认被选择的城市
function initCity(stateId,defaultcity,selectForm){
    
    clearSelectForm(selectForm);
    for(i=0;i<citys.length;i++)
    {
        if(citys[i][0].toString()==stateId.toString())
        {
            var oOption = document.createElement("OPTION");
            oOption.text=citys[i][2];
            oOption.value=citys[i][1];
            addOption(selectForm,oOption);
        }
        else if(i==0)
        {
            var oOption = document.createElement("OPTION");
            oOption.text=citys[i][2];
            oOption.value=citys[i][1];
            addOption(selectForm,oOption);
        }
    }
    
    if(defaultcity==null || defaultcity==""|| defaultcity=="-1"){
        selectForm.options[0].selected=true;
    }else{
        setSelectedByObj(selectForm,defaultcity);
    }
}
//根据城市ID，构建区域下拉，默认为defaultzone被选择

function initZone(cityId,defaultzone,selectForm){
    if(!selectForm){
        return ;
    }
    clearSelectForm(selectForm);
    for(i=0;i<zones.length;i++)
    {
        if(zones[i][0].toString()==cityId.toString())
        {
            var oOption = document.createElement("OPTION");
            oOption.text=zones[i][2];
            oOption.value=zones[i][1];
            addOption(selectForm,oOption);
        }
        else if(i==0)
        {
            var oOption = document.createElement("OPTION");
            oOption.text=zones[i][2];
            oOption.value=zones[i][1];
            addOption(selectForm,oOption);
        }
    }
    
    if(defaultzone==null || defaultzone==""|| defaultzone=="-1"){
        selectForm.options[0].selected=true;
    }else{
        setSelectedByObj(selectForm,defaultzone);
    }
}

function countryChangeHandle(countryId,stateForm,cityForm,zoneForm){
    initState(countryId,"",stateForm);
    initCity("-1","",cityForm);
    // initZone("-1","-1",zoneForm);
}

function stateChangeHandle(stateId,cityForm,zoneForm){
    initCity(stateId,"-1",cityForm);
    initZone("-1","-1",zoneForm);
}

function cityChangeHandle(cityId,zoneForm){
    initZone(cityId,"",zoneForm);
}

function addOption(selectElement,newOption) {
    if(selectElement){
        try {
            selectElement.add(newOption);
        }catch (e) {
            selectElement.add(newOption,null);
        }
    }
}


function clearSelectForm(selectForm) {
    if(selectForm){
        for(j=selectForm.length-1;j>-1;j--) {
            selectForm.remove(j);
        }}
}


function setSelectedByObj(select_Name_idObj, optionValue){
    var obj = select_Name_idObj;
    // alert(optionValue);
    if(obj && obj.options){
        for (i = 0; i < obj.options.length; i++) {
            //alert("bb");
            if (obj.options[i].value == optionValue) {
                obj.options[i].selected = true;
            }
        }
    }
}


module.exports = {
    initCountry,
    initState,
    initCity,
    countryChangeHandle,
    stateChangeHandle,
    cityChangeHandle
};