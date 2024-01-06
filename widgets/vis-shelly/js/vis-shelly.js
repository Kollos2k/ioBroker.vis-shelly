/*
    ioBroker.vis vis-shelly Widget-Set

    version: "0.0.1"

    Copyright 2023 Kollos2k kollos@vorsicht-bissig.de
*/
"use strict";


/* global $, vis, systemDictionary */

// add translations for edit mode
$.extend(
    true,
    systemDictionary,
    {
        // Add your translations here, e.g.:
        // "size": {
        // 	"en": "Size",
        // 	"de": "Größe",
        // 	"ru": "Размер",
        // 	"pt": "Tamanho",
        // 	"nl": "Grootte",
        // 	"fr": "Taille",
        // 	"it": "Dimensione",
        // 	"es": "Talla",
        // 	"pl": "Rozmiar",
        //  "uk": "Розмір"
        // 	"zh-cn": "尺寸"
        // }
		// "iUniversalValueCount": {
		// 	"en": "Number of states",
		// 	"de": "Anzahl der Zustände"
		// },
		// "group_iUniversalValues": {
		// 	"en": "State",
		// 	"de": "Zustand"
		// },
        // "soid1_1": {
        //     "en":"Sub Item 1_1",
        //     "de":"Sub Item 1_1"
        // },
        // "soid1_": {
        //     "en":"Sub Item 1",
        //     "de":"Sub Item 1"
        // }
    }
);

// this code can be placed directly in vis-shelly.html
vis.binds["vis-shelly"] = {
    version: "0.0.4",
    showVersion: function () {
        if (vis.binds["vis-shelly"].version) {
            console.log('Version vis-shelly: ' + vis.binds["vis-shelly"].version);
            vis.binds["vis-shelly"].version = null;
        }
    },
    createAllDevicesWidget: function (widgetID, view, widData, style,byRoom=false) {
        var $div = $('#' + widgetID);
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds["vis-shelly"].createAllDevicesWidget(widgetID, view, widData, style,byRoom);
            }, 100);
        }
        vis.conn.subscribe("vis-shelly.0.devices.ids",()=>{});
        vis.conn.subscribe("vis-shelly.0.devices.roomIds",()=>{});
        if(widData.display=="flex"){
            $div.addClass("flex");
        } else {
            $div.removeClass("flex");
        }
        
        // console.log("vis")
        console.log(vis);
        console.log(widData);
        let roomID="";
        if(byRoom!=false){
            roomID=vis.views[view].widgets[widgetID].data.roomid;
        }

        $('#' + widgetID).empty();
        var getStateObject=function(state){
            if(typeof state==null)return {"ack":true,from:"",lc:0,q:0,ts:0,user:"",val:""}
            return state;
        }
        var buildDevice=function(val){            
            let vsID="vis-shelly.0.devices."+val.id;
            let domID=val.id.replaceAll('#','');
            let typeConfig={};            
            let switchButton=`<svg name='svgShellyButton' viewBox="0 0 100 100" width="60" preserveAspectRatio="xMidYMid meet"><use xlink:href="#svgShellyButton" href="#svgShellyButton"></use></svg>`;
            let basicUpdateValue=function($dom,newVal,options={},data={},stageID=""){$dom.html(newVal);}
            let basicUpdateMotionValue=function($dom,newVal,options={},data={},stageID=""){$dom.removeClass("motionyes");$dom.removeClass("motionno");if(newVal==true){$dom.addClass("motionyes");$dom.html("Ja");}else{$dom.addClass("motionno");$dom.html("Nein");}}
            let basicUpdateValueName=function($dom,newVal,optons={},data={},stageID=""){
                var name=null;var oname=null;
                $.each(data,(k,v)=>{
                    if(k.lastIndexOf(".name")>-1)name=v;
                    else if(k.lastIndexOf(".overrideName")>-1)oname=v;
                });if(name==null||typeof name!="object")name={val:""};if(oname==null||typeof oname!="object")oname={val:""};
                $dom.html(oname.val.length>0?oname.val:name.val);
            }
            let basicUpdateValueUnit=function($dom,newVal,options={},data={},stageID=""){$dom.html(newVal+" "+options.unit);}
            let basicUpdateValueBrightness=function($dom,newVal,options={},data={},stageID=""){
                $dom.html(newVal+" "+options.unit);
                let $b1=$("<button class='brightnessButton'>-</button>");
                let $b2=$("<button class='brightnessButton'>+</button>");
                $b1.click(()=>{if(newVal<10){newVal=0;}else{newVal-=10;}vis.setValue(stageID,newVal);});
                $b2.click(()=>{if(newVal>90){newVal=100;}else{newVal+=10;}vis.setValue(stageID,newVal);});
                $dom.append($b1);
                $dom.append($b2);
            }
            let basicUpdateDevicePower=function($dom,newVal,options={},data={},stageID=""){
                console.log("update external");
                var exP=null;var percent=null;
                $.each(data,(k,v)=>{
                    if(k.lastIndexOf(".ExternalPower")>-1)exP=v;
                    else if(k.lastIndexOf(".BatteryPercent")>-1)percent=v;
                });
                $dom.removeClass("externalPower");
                $dom.removeClass("battery");
                if(exP!=null&&typeof exP=="object"&&exP.val==true){$dom.addClass("externalPower");$dom.html("Energie");}
                else {$dom.addClass("battery"),$dom.html((percent==null||typeof percent!="object"?0:percent.val)+" %");}                
            }
            let basicUpdateSwitch=function($dom,newVal,options={},data={},stageID=""){
                $dom.removeClass("wait");
                if(newVal==true){$dom.addClass("active");}else{$dom.removeClass("active");}
            }
            let basicSwitchAction=function(stateID,$mainDOM){
                let data=$mainDOM.data("data");
                let newVal=(typeof data[stateID]!="undefined"?(data[stateID]==null?true:(data[stateID].val==true?false:true)):false);
                vis.setValue(stateID,newVal);
            }
            switch(val.type){
                case "SHDM-2":typeConfig={"domID":domID,
                    update:{"power":{"name":"power","unit":"W","updateValue":basicUpdateValueUnit},"brightness":{"name":"brightness","unit":"%","updateValue":basicUpdateValueBrightness},"name":{"name":"name","updateValue":basicUpdateValueName},"oname":{"name":"name","updateValue":basicUpdateValueName},"switch":{"name":"switch","updateValue":basicUpdateSwitch}},
                    view:{info:{"power":{"name":"power","class":"icon","html":""},"brightness":{"name":"brightness","class":"icon","html":""}},"action":{"switch":{"name":"switch","class":"","html":switchButton}}},
                    action:{"switch":{"name":"switch","click":basicSwitchAction}},
                    dataPoint:{0:{"power":val.stateId+".lights.Power","switch":val.stateId+".lights.Switch","brightness":val.stateId+".lights.brightness","name":val.stateId+".name","oname":vsID+".0.overrideName","room":vsID+".0.room"}}};
                    break;
                case "SHPLG-S":typeConfig={"domID":domID,
                        update:{"power":{"name":"power","unit":"W","updateValue":basicUpdateValueUnit},"name":{"name":"name","updateValue":basicUpdateValueName},"oname":{"name":"name","updateValue":basicUpdateValueName},"switch":{"name":"switch","updateValue":basicUpdateSwitch}},
                        view:{info:{"power":{"name":"power","class":"icon","html":""}},"action":{"switch":{"name":"switch","class":"","html":switchButton}}},
                        action:{"switch":{"name":"switch","click":basicSwitchAction}},
                        dataPoint:{0:{"power":val.stateId+".Relay0.Power","switch":val.stateId+".Relay0.Switch","name":val.stateId+".name","oname":vsID+".0.overrideName","room":vsID+".0.room"}}};
                    break;
                case "shellyplus1pm":typeConfig={"domID":domID,
                    update:{"power":{"name":"power","unit":"W","updateValue":basicUpdateValueUnit},"voltage":{"name":"voltage","unit":"V","updateValue":basicUpdateValueUnit},"name":{"name":"name","updateValue":basicUpdateValueName},"oname":{"name":"name","updateValue":basicUpdateValueName},"switch":{"name":"switch","updateValue":basicUpdateSwitch}},
                    view:{info:{"power":{"name":"power","class":"icon","html":""},"voltage":{"name":"voltage","class":"icon","html":""}},"action":{"switch":{"name":"switch","class":"","html":switchButton}}},
                    action:{"switch":{"name":"switch","click":basicSwitchAction}},
                    dataPoint:{0:{"power":val.stateId+".Relay0.Power","switch":val.stateId+".Relay0.Switch","voltage":val.stateId+".Relay0.Voltage","name":val.stateId+".name","oname":vsID+".0.overrideName","room":vsID+".0.room"}}};
                    break;
                case "shellyplusplugs":typeConfig={"domID":domID,
                    update:{"power":{"name":"power","unit":"W","updateValue":basicUpdateValueUnit},"voltage":{"name":"voltage","unit":"V","updateValue":basicUpdateValueUnit},"name":{"name":"name","updateValue":basicUpdateValueName},"oname":{"name":"name","updateValue":basicUpdateValueName},"switch":{"name":"switch","updateValue":basicUpdateSwitch}},
                    view:{info:{"power":{"name":"power","class":"icon","html":""},"voltage":{"name":"voltage","class":"icon","html":""}},"action":{"switch":{"name":"switch","class":"","html":switchButton}}},
                    action:{"switch":{"name":"switch","click":basicSwitchAction}},
                    dataPoint:{0:{"power":val.stateId+".Relay0.Power","switch":val.stateId+".Relay0.Switch","voltage":val.stateId+".Relay0.Voltage","name":val.stateId+".name","oname":vsID+".0.overrideName","room":vsID+".0.room"}}};
                    break;
                case "shellyplus2pm":typeConfig={"domID":domID,
                    update:{"power":{"name":"power","unit":"W","updateValue":basicUpdateValueUnit},"voltage":{"name":"voltage","unit":"V","updateValue":basicUpdateValueUnit},"name":{"name":"name","updateValue":basicUpdateValueName},"oname":{"name":"name","updateValue":basicUpdateValueName},"switch":{"name":"switch","updateValue":basicUpdateSwitch}},
                    view:{info:{"power":{"name":"power","class":"icon","html":""},"voltage":{"name":"voltage","class":"icon","html":""}},"action":{"switch":{"name":"switch","class":"","html":switchButton}}},
                    action:{"switch":{"name":"switch","click":basicSwitchAction}},
                    dataPoint:{0:{"power":val.stateId+".Relay0.Power","switch":val.stateId+".Relay0.Switch","voltage":val.stateId+".Relay0.Voltage","name":val.stateId+".name","oname":vsID+".0.overrideName","room":vsID+".0.room"},1:{"power":val.stateId+".Relay1.Power","switch":val.stateId+".Relay1.Switch","voltage":val.stateId+".Relay1.Voltage","name":val.stateId+".name","oname":vsID+".1.overrideName","room":vsID+".1.room"}}};
                    break;
                case "shellyplusht":typeConfig={"domID":domID,
                    update:{
                        "humidity":{"name":"humidity","unit":"%","updateValue":basicUpdateValueUnit},
                        "batteryPercent":{"name":"devicePower","updateValue":basicUpdateDevicePower},
                        "externalPower":{"name":"devicePower","updateValue":basicUpdateDevicePower},
                        "temperature":{"name":"temperature","unit":"°C","updateValue":basicUpdateValueUnit},
                        "name":{"name":"name","updateValue":basicUpdateValueName},"oname":{"name":"name","updateValue":basicUpdateValueName}
                    },
                    view:{
                        info:{
                            "humidity":{"name":"humidity","class":"icon","html":""},
                            "externalPower":{"name":"devicePower","class":"icon","html":""}},
                        action:{"temperature":{"name":"temperature","class":"temperature","html":""}}
                    },
                    dataPoint:{
                        0:{
                            "temperature":val.stateId+".Temperature0.Celsius",
                            "humidity":val.stateId+".Humidity0.Relative",
                            "externalPower":val.stateId+".DevicePower0.ExternalPower",
                            "batteryPercent":val.stateId+".DevicePower0.BatteryPercent",
                            "name":val.stateId+".name","oname":vsID+".0.overrideName",
                            "room":vsID+".0.room"
                        }
                    }};                            
                    break;
                case "SHTRV-01":
                    typeConfig={"domID":domID,
                    update:{
                        "valvePosition":{"name":"valvePosition","unit":"%","updateValue":basicUpdateValueUnit},
                        "batteryPercent":{"name":"devicePower","updateValue":basicUpdateDevicePower},
                        "externalPower":{"name":"devicePower","updateValue":basicUpdateDevicePower},
                        "temperature":{"name":"temperature","unit":"°C","updateValue":basicUpdateValueUnit},
                        "name":{"name":"name","updateValue":basicUpdateValueName},"oname":{"name":"name","updateValue":basicUpdateValueName}
                    },
                    view:{
                        info:{
                            "temperature":{"name":"temperature","class":"icon","html":""},
                            "valvePosition":{"name":"valvePosition","class":"icon","html":""},
                            "devicePower":{"name":"devicePower","class":"icon","html":""}},
                        "action":{}},
                    dataPoint:{
                        0:{
                            "temperature":val.stateId+".tmp.temperatureC",
                            "valvePosition":val.stateId+".tmp.valvePosition",
                            "externalPower":val.stateId+".bat.charger",
                            "batteryPercent":val.stateId+".bat.value",
                            "name":val.stateId+".name","oname":vsID+".0.overrideName",
                            "room":vsID+".0.room"
                        }
                    }};
                break;
                case "SHMOS-02":
                    typeConfig={"domID":domID,
                    update:{
                        "lux":{"name":"lux","unit":"Lux","updateValue":basicUpdateValueUnit},
                        "batteryPercent":{"name":"devicePower","unit":"%","updateValue":basicUpdateValueUnit},
                        "motion":{"name":"motion","updateValue":basicUpdateMotionValue},
                        "temperature":{"name":"temperature","unit":"°C","updateValue":basicUpdateValueUnit},
                        "name":{"name":"name","updateValue":basicUpdateValueName},"oname":{"name":"name","updateValue":basicUpdateValueName}
                    },
                    view:{
                        info:{
                            "temperature":{"name":"temperature","class":"icon","html":""},
                            "batteryPercent":{"name":"batteryPercent","class":"icon","html":""},
                            "lux":{"name":"lux","class":"icon","html":""}},
                        "action":{"motion":{"name":"motion","class":"","html":""}}},
                    dataPoint:{
                        0:{
                            "temperature":val.stateId+".sensor.temperatureC",
                            "motion":val.stateId+".sensor.motion",
                            "lux":val.stateId+".sensor.lux",
                            "batteryPercent":val.stateId+".sensor.battery",
                            "name":val.stateId+".name","oname":vsID+".0.overrideName",
                            "room":vsID+".0.room"
                        }
                    }};
                break;
            }
            if(typeof typeConfig.dataPoint=="undefined")return false;
            $.each(typeConfig.dataPoint,(dpKey,dpVal)=>{
                vis.conn.getStates(Object.values(dpVal),(error, data)=>{
                    // console.log("data");
                    // console.log(data);
                    if(byRoom!=false){
                        if(data[dpVal.room]==null||data[dpVal.room].val!=roomID){
                            return true;
                        }
                    }
                    // console.log(data[dpVal.room]);
                    // console.log(roomID);
                    // console.log(dpVal);
                    var deviceDomID=typeConfig.domID+dpKey;
                    let text=`<div id="${deviceDomID}" class="vis-shelly_DeviceBody" title="${val.stateId}" style="width:${widData.deviceWidth};">`;
                    text+=`<span name="status"><span><span class="connectionState connectionStateOnline"></span></span></span>`;
                    text+=`<span name="icon"></span>`;
                    text+=`<span name="name" data_sname="" data_oname="">${deviceDomID}</span>`;
                    text+=`<span name="info">`;
                    $.each(typeConfig.view.info,(viewKey,viewValue)=>{
                        text+=`<span><span name="${viewValue.name}" class="${viewValue.class}">${viewValue.html}</span></span>`;
                    });
                    
                    text+=`</span>`;
                    text+=`<span name="action">`;
                    $.each(typeConfig.view.action,(viewKey,viewValue)=>{
                        text+=`<span><span name="${viewValue.name}" class="${viewValue.class}">${viewValue.html}</span></span>`;
                    });
                    // if(typeof dpVal.switch!="undefined"){text+=`<span name="switch" curState="false"></span>`;}
                    // if(typeof dpVal.temperature!="undefined"){text+=`<span name="temperature"></span>`;}
                    text+=`</span>`;
                    $('#' + widgetID).append(text);
                    let $domDev=$('#' + widgetID).find("#"+deviceDomID)
                    if(typeof typeConfig["action"]!="undefined"){
                        $.each(typeConfig.action,(k,v)=>{
                            let $aDom=$domDev.find("[name='"+v.name+"']");
                            if(typeof v.click=="function")$aDom.click(()=>{v.click(dpVal[k],$domDev);});
                        });
                    }
                    $domDev.data("data",data);
                    vis.updateStates(data);
                    vis.conn.subscribe(Object.values(dpVal));

                    $.each(dpVal,(sType,sID)=>{
                        console.log(sID);
                        if(typeof data[sID]!="undefined"){
                            vis.binds["vis-shelly"].updateDeviceValue(widgetID,deviceDomID,typeConfig,sType,sID);
                            vis.states.bind(sID+".val" , (e, newVal, oldVal)=>{                           
                                vis.binds["vis-shelly"].updateDeviceValue(widgetID,deviceDomID,typeConfig,sType,sID,newVal);
                            });
                        } else {
                        }
                    });
                });
            });
        }
        vis.conn.getStates(["vis-shelly.0.devices.ids"],(error, data)=>{
            let deviceIDs=JSON.parse(data["vis-shelly.0.devices.ids"].val);
            // console.log(deviceIDs);
            $.each(deviceIDs,(k,v)=>{
                // console.log(v);
                buildDevice(v);
            });
        });

    },
    updateDeviceValue: function (widgetID, deviceDomID,typeConfig, sType,sID, newVal=undefined) {
        if(typeof typeConfig.update=="undefined")return false;
        if(typeof typeConfig.update[sType]=="undefined")return false;
        let configUpdate=typeConfig.update[sType];
        // console.log(configUpdate.getValue(newVal,configUpdate));
        let $domDev=$("#"+widgetID).find("#"+deviceDomID);
        // console.log($domDev.length);
        if($domDev.length==0)return false;
        let $dom=$domDev.find("[name='"+configUpdate.name+"']");
        // console.log($dom.length);
        if($dom.length==0)return false;
        
        var data=$domDev.data("data");
        
        if(typeof data[sID]==null)data[sID]={val:""};
        if(typeof newVal=="undefined"){
            newVal=data[sID].val;
        } else {
            if(typeof newVal=="object")data[sID]=newVal;
            else data[sID].val=newVal;
            if(typeof newVal=="object")newVal=newVal.val;
            $domDev.data("data",data);
        }
        configUpdate.updateValue($dom,newVal,configUpdate,data,sID);        
    },    
    createWidget: function (widgetID, view, data, style) {
        var $div = $('#' + widgetID);
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds["vis-shelly"].createWidget(widgetID, view, data, style);
            }, 100);
        }

/*
        oid(1-iUniversalValueCount)/id;
        unit(1-iUniversalValueCount)/text;
        icon(1-iUniversalValueCount)/image;
        title(1-iUniversalValueCount)/text;
        soid1_(1-iUniversalValueCount)/id;
        sunit1_(1-iUniversalValueCount)/text;
        sicon1_(1-iUniversalValueCount)/image;
        soid2_(1-iUniversalValueCount)/id;
        sunit2_(1-iUniversalValueCount)/text;
        sicon2_(1-iUniversalValueCount)/image;"
*/
        var text = '1';
        text += 'OID: ' + data.oid1 + '</div><br>';
        text += 'OID value: <span class="vis-shelly-value">' + vis.states[data.oid1 + '.val'] + '</span><br>';
        text += 'test: <span class="vis-shelly-value">' + vis.states[data.soid1_1 + '.val']  + '</span><br>';
        text += 'Color: <span style="color: ' + data.myColor + '">' + data.myColor + '</span><br>';
        text += 'extraAttr: ' + data.extraAttr + '<br>';
        text += 'Browser instance: ' + vis.instance + '<br>';
        text += 'htmlText: <textarea readonly style="width:100%">' + (data.htmlText || '') + '</textarea><br>';

        // console.log("OID:"+data.oid1 + '.val    val:'+vis.states[data.oid1 + '.val']);

        // console.log(data.soid1_1 + '.val    val:'+vis.states[data.soid1_1 + '.val'])

        $('#' + widgetID).html(text);

        // subscribe on updates of value
        function onChange(e, newVal, oldVal) {
            $div.find('.template-value').html(newVal);
        }
        if (data.oid) {
            vis.states.bind(data.oid + '.val', onChange);
            //remember bound state that vis can release if didnt needed
            $div.data('bound', [data.oid + '.val']);
            //remember onchange handler to release bound states
            $div.data('bindHandler', onChange);
            // console.log("OID:"+data.oid + '.val')
            // console.log(data.soid1_1 + '.val')
        }
        if (data.soid1_1) {
            vis.states.bind(data.soid1_1 + '.val', onChange);
            $div.data('bound', [data.soid1_1 + '.val']);
            $div.data('bindHandler', onChange);
        }
    },
    updateUniversalDataFields: function (wid, view) {
        vis.activeWidgets.forEach(function (el) {
			let data = vis.views[vis.activeView].widgets[el].data;

			vis.hideShowAttr("iNavWait", false);
        });
    },

    //VIS Editor select Room
    visEditor_selectRoom: function(wid_attr, options){
        console.log(vis);
        let view=vis.activeView;
        let wid=vis.activeWidgets[0];
        // vis.views[view].widgets[wid].data.roomid=1;
        let curValue=vis.views[view].widgets[wid].data.roomid;

        vis.conn.getStates(["vis-shelly.0.devices.roomIds"],(error, data)=>{
            let roomObj=JSON.parse(data["vis-shelly.0.devices.roomIds"].val);
            let select=$("#"+wid+"_roomid")
            $.each(roomObj,(k,v)=>{
                select.append(`<option value="${k}" ${k==curValue?"selected":""}>${v}</option>`);
            });
        });
        let inputTxt=`<select id="${wid}_roomid" onchange='vis.binds["vis-shelly"].visEditor_selectRoomSelect(this)'>`;
        inputTxt+="<option value=''>--Please Choose an Option--</option>";
        inputTxt+="</select>"
		return {
            input: inputTxt
        };
    },
    visEditor_selectRoomSelect: function(select){
        let view=vis.activeView;
        let wid=vis.activeWidgets[0];
        vis.views[view].widgets[wid].data.roomid=$(select).val();
        let data=vis.views[view].widgets[wid].data;
        data.wid=wid;
        vis.binds['vis-shelly'].createAllDevicesWidget(wid, view, data, vis.views[view].widgets[wid].style,true);
    }
}

vis.binds["vis-shelly"].showVersion();

