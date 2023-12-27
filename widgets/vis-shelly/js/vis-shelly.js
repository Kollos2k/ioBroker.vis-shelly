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
    version: "0.0.1",
    showVersion: function () {
        if (vis.binds["vis-shelly"].version) {
            console.log('Version vis-shelly: ' + vis.binds["vis-shelly"].version);
            vis.binds["vis-shelly"].version = null;
        }
    },
    createAllDevicesWidget: function (widgetID, view, data, style) {
        var $div = $('#' + widgetID);
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds["vis-shelly"].createAllDevicesWidget(widgetID, view, data, style);
            }, 100);
        }
        vis.conn.subscribe("vis-shelly.0.devices.ids",()=>{});
        
        console.log("vis")
        console.log(vis);

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
            let basicUpdateValue=function($dom,newVal,options={},data={}){$dom.html(newVal);}
            let basicUpdateValueName=function($dom,newVal,optons={},data={}){
                var name=null;var oname=null;
                $.each(data,(k,v)=>{
                    if(k.lastIndexOf(".name")>-1)name=v;
                    else if(k.lastIndexOf(".overrideName")>-1)oname=v;
                });if(name==null||typeof name!="object")name={val:""};if(oname==null||typeof oname!="object")oname={val:""};
                $dom.html(oname.val.length>0?oname.val:name.val);
            }
            let basicUpdateValueUnit=function($dom,newVal,options={},data={}){$dom.html(newVal+" "+options.unit);}
            let basicUpdateDevicePower=function($dom,newVal,options={},data={}){
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
            let basicUpdateSwitch=function($dom,newVal,options={},data={}){
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
                    update:{"power":{"name":"power","unit":"W","updateValue":basicUpdateValueUnit},"brightness":{"name":"brightness","unit":"%","updateValue":basicUpdateValueUnit},"name":{"name":"name","updateValue":basicUpdateValueName},"oname":{"name":"name","updateValue":basicUpdateValueName},"switch":{"name":"switch","updateValue":basicUpdateSwitch}},
                    view:{info:{"power":{"name":"power","class":"icon","html":""},"brightness":{"name":"brightness","class":"icon","html":""}},"action":{"switch":{"name":"switch","class":"","html":switchButton}}},
                    action:{"switch":{"name":"switch","click":basicSwitchAction}},
                    dataPoint:{0:{"power":val.stateId+".lights.Power","switch":val.stateId+".lights.Switch","brightness":val.stateId+".lights.brightness","name":val.stateId+".name","oname":vsID+".0.overrideName"}}};
                    break;
                case "SHPLG-S":typeConfig={"domID":domID,
                    update:{"power":{"name":"power","unit":"W","updateValue":basicUpdateValueUnit},"name":{"name":"name","updateValue":basicUpdateValueName},"oname":{"name":"name","updateValue":basicUpdateValueName},"switch":{"name":"switch","updateValue":basicUpdateSwitch}},
                    view:{info:{"power":{"name":"power","class":"icon","html":""}},"action":{"switch":{"name":"switch","class":"","html":switchButton}}},
                    action:{"switch":{"name":"switch","click":basicSwitchAction}},
                    dataPoint:{0:{"power":val.stateId+".Relay0.Power","switch":val.stateId+".Relay0.Switch","name":val.stateId+".name","oname":vsID+".0.overrideName"}}};
                    break;
                case "shellyplus1pm":typeConfig={"domID":domID,
                    update:{"power":{"name":"power","unit":"W","updateValue":basicUpdateValueUnit},"voltage":{"name":"voltage","unit":"V","updateValue":basicUpdateValueUnit},"name":{"name":"name","updateValue":basicUpdateValueName},"oname":{"name":"name","updateValue":basicUpdateValueName},"switch":{"name":"switch","updateValue":basicUpdateSwitch}},
                    view:{info:{"power":{"name":"power","class":"icon","html":""},"voltage":{"name":"voltage","class":"icon","html":""}},"action":{"switch":{"name":"switch","class":"","html":switchButton}}},
                    action:{"switch":{"name":"switch","click":basicSwitchAction}},
                    dataPoint:{0:{"power":val.stateId+".Relay0.Power","switch":val.stateId+".Relay0.Switch","voltage":val.stateId+".Relay0.Voltage","name":val.stateId+".name","oname":vsID+".0.overrideName"}}};
                    break;
                case "shellyplusplugs":typeConfig={"domID":domID,
                    update:{"power":{"name":"power","unit":"W","updateValue":basicUpdateValueUnit},"voltage":{"name":"voltage","unit":"V","updateValue":basicUpdateValueUnit},"name":{"name":"name","updateValue":basicUpdateValueName},"oname":{"name":"name","updateValue":basicUpdateValueName},"switch":{"name":"switch","updateValue":basicUpdateSwitch}},
                    view:{info:{"power":{"name":"power","class":"icon","html":""},"voltage":{"name":"voltage","class":"icon","html":""}},"action":{"switch":{"name":"switch","class":"","html":switchButton}}},
                    action:{"switch":{"name":"switch","click":basicSwitchAction}},
                    dataPoint:{0:{"power":val.stateId+".Relay0.Power","switch":val.stateId+".Relay0.Switch","voltage":val.stateId+".Relay0.Voltage","name":val.stateId+".name","oname":vsID+".0.overrideName"}}};break;     
                case "shellyplus2pm":typeConfig={"domID":domID,
                    update:{"power":{"name":"power","unit":"W","updateValue":basicUpdateValueUnit},"voltage":{"name":"voltage","unit":"V","updateValue":basicUpdateValueUnit},"name":{"name":"name","updateValue":basicUpdateValueName},"oname":{"name":"name","updateValue":basicUpdateValueName},"switch":{"name":"switch","updateValue":basicUpdateSwitch}},
                    view:{info:{"power":{"name":"power","class":"icon","html":""},"voltage":{"name":"voltage","class":"icon","html":""}},"action":{"switch":{"name":"switch","class":"","html":switchButton}}},
                    action:{"switch":{"name":"switch","click":basicSwitchAction}},
                    dataPoint:{0:{"power":val.stateId+".Relay0.Power","switch":val.stateId+".Relay0.Switch","voltage":val.stateId+".Relay0.Voltage","name":val.stateId+".name","oname":vsID+".0.overrideName"},1:{"power":val.stateId+".Relay1.Power","switch":val.stateId+".Relay1.Switch","voltage":val.stateId+".Relay1.Voltage","name":val.stateId+".name","oname":vsID+".1.overrideName"}}};break;     
                case "shellyplusht":typeConfig={"domID":domID,
                    update:{"humidity":{"name":"humidity","unit":"%","updateValue":basicUpdateValueUnit},"batteryPercent":{"name":"devicePower","updateValue":basicUpdateDevicePower},"externalPower":{"name":"devicePower","updateValue":basicUpdateDevicePower},"temperature":{"name":"temperature","unit":"°C","updateValue":basicUpdateValueUnit},"name":{"name":"name","updateValue":basicUpdateValueName},"oname":{"name":"name","updateValue":basicUpdateValueName}},
                    view:{info:{"humidity":{"name":"humidity","class":"icon","html":""},"externalPower":{"name":"devicePower","class":"icon","html":""}},"action":{"temperature":{"name":"temperature","class":"temperature","html":""}}},
                    dataPoint:{0:{"temperature":val.stateId+".Temperature0.Celsius","humidity":val.stateId+".Humidity0.Relative","externalPower":val.stateId+".DevicePower0.ExternalPower","batteryPercent":val.stateId+".DevicePower0.BatteryPercent","name":val.stateId+".name","oname":vsID+".0.overrideName"}}};break;dataPoint:{0:{"temperature":val.stateId+".Temperature0.Celsius","humidity":val.stateId+".Humidity0.Relative","externalPower":val.stateId+".DevicePower0.ExternalPower","batteryPercent":val.stateId+".DevicePower0.BatteryPercent","name":val.stateId+".name","oname":vsID+".0.overrideName"}}};break;
                case "SHTRV-01":typeConfig={"domID":domID,
                    update:{"valvePosition":{"name":"valvePosition","unit":"%","updateValue":basicUpdateValueUnit},"batteryPercent":{"name":"devicePower","updateValue":basicUpdateDevicePower},"externalPower":{"name":"devicePower","updateValue":basicUpdateDevicePower},"temperature":{"name":"temperature","unit":"°C","updateValue":basicUpdateValueUnit},"name":{"name":"name","updateValue":basicUpdateValueName},"oname":{"name":"name","updateValue":basicUpdateValueName}},
                    view:{info:{"temperature":{"name":"temperature","class":"temperature","html":""},"valvePosition":{"name":"valvePosition","class":"icon","html":""},"devicePower":{"name":"devicePower","class":"icon","html":""}},"action":{}},
                    dataPoint:{0:{"temperature":val.stateId+".tmp.temperatureC","valvePosition":val.stateId+".tmp.valvePosition","externalPower":val.stateId+".bat.charger","batteryPercent":val.stateId+".bat.value","name":val.stateId+".name","oname":vsID+".0.overrideName"}}};break;dataPoint:{0:{"temperature":val.stateId+".Temperature0.Celsius","humidity":val.stateId+".Humidity0.Relative","externalPower":val.stateId+".DevicePower0.ExternalPower","batteryPercent":val.stateId+".DevicePower0.BatteryPercent","name":val.stateId+".name","oname":vsID+".0.overrideName"}}};break;                
                
            }
            if(typeof typeConfig.dataPoint=="undefined")return false;
            $.each(typeConfig.dataPoint,(dpKey,dpVal)=>{
                // console.log(dpVal);
                var deviceDomID=typeConfig.domID+dpKey;
                let text=`<div id="${deviceDomID}" class="vis-shelly_DeviceBody" title="${val.stateID}">`;
                text+=`<span name="status"><span><span class="connectionState connectionStateOnline"></span></span></span>`;
                text+=`<span name="icon"></span>`;
                text+=`<span name="name" data_sname="" data_oname="">${deviceDomID}</span>`;
                text+=`<span name="info">`;
                $.each(typeConfig.view.info,(viewKey,viewValue)=>{
                    text+=`<span><span name="${viewValue.name}" class="${viewValue.class}">${viewValue.html}</span></span>`;
                });
                // if(typeof dpVal.power!="undefined"){text+=`<span><span name="power" class="icon"></span></span>`;}
                // if(typeof dpVal.voltage!="undefined"){text+=`<span><span name="voltage" class="icon"></span></span>`;}
                // if(typeof dpVal.humidity!="undefined"){text+=`<span><span name="humidity" class="icon"></span></span>`;}
                // if(typeof dpVal.externalPower!="undefined"||typeof dpVal.batteryPercent!="undefined"){text+=`<span><span name="devicePower" class="icon"></span></span>`;}
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
                // $domDev.data("config",typeConfig);
                // $domDev.find("[name='switch']").click(function(){$(this).addClass("wait");vis.setValue(dpVal.switch,$(this).attr("curState")=="true"?false:true);});
                
                // console.log("GetStates: ");
                // console.log(Object.values(dpVal));
                vis.conn.getStates(Object.values(dpVal),(error, data)=>{
                    $domDev.data("data",data);
                    // console.log("done");
                    vis.updateStates(data);
                    vis.conn.subscribe(Object.values(dpVal));
                    // console.log("");
                    // console.log(deviceDomID);
                    $.each(dpVal,(sType,sID)=>{
                        // console.log("bind "+sType);
                        // console.log(data[sID]);
                        if(typeof data[sID]!="undefined"){
                            vis.binds["vis-shelly"].updateDeviceValue(widgetID,deviceDomID,typeConfig,sType,sID);
                            vis.states.bind(sID+".val" , (e, newVal, oldVal)=>{                           
                                vis.binds["vis-shelly"].updateDeviceValue(widgetID,deviceDomID,typeConfig,sType,sID,newVal);
                            });
                        } else {
                            // console.log(sID+ " == undefined");
                        }
                    });

                    
                    // vis.binds["vis-shelly"].updateDeviceValue(widgetID,deviceDomID,"name",getStateObject(data[dpVal["oname"]]).val.length>0?data[dpVal["oname"]].val:getStateObject(data[dpVal["name"]]).val);


                    // vis.binds["vis-shelly"].updateDeviceValue(widgetID,deviceDomID,typeConfig,"name",sID);
                    // vis.binds["vis-shelly"].updateDeviceValue(widgetID,deviceDomID,"oname",getStateObject(data[dpVal["oname"]]).val);
                    


                    // vis.states.bind(key+".val" , (e, newVal, oldVal)=>{
                    //     console.log(searchText + ": " +newVal);
                    //     vis.binds["vis-shelly"].repaintDeviceValue(widgetID,domID,searchText,key,newVal,type);
                    // });
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
        // if(deviceDomID=="shellyplushtd4d4da7cdcd410"){
        //     console.log(widgetID);
        //     console.log(deviceDomID);
        //     console.log(typeConfig);
        //     console.log(sType);
        //     console.log(sID);
        //     console.log(newVal);
        // }
        if(typeof typeConfig.update=="undefined")return false;
        if(typeof typeConfig.update[sType]=="undefined")return false;
        let configUpdate=typeConfig.update[sType];
        // console.log(configUpdate.getValue(newVal,configUpdate));
        let $domDev=$("#"+deviceDomID);
        // console.log($domDev.length);
        if($domDev.length==0)return false;
        let $dom=$domDev.find("[name='"+configUpdate.name+"']");
        // console.log($dom.length);
        if($dom.length==0)return false;
        
        var data=$domDev.data("data");
        // if(deviceDomID=="shellyplushtd4d4da7cdcd410")console.log(data);
        // console.log(data);
        // console.log(sID);
        if(typeof data[sID]==null)data[sID]={val:""};
        if(typeof newVal=="undefined"){
            newVal=data[sID].val;
        } else {
            if(typeof newVal=="object")data[sID]=newVal;
            else data[sID].val=newVal;
            if(typeof newVal=="object")newVal=newVal.val;
            $domDev.data("data",data);
        }
        configUpdate.updateValue($dom,newVal,configUpdate,data);
        // $dom.html(configUpdate.getValue(newVal,configUpdate,data));

        // console.log(typeConfig.update[sType].value(newVal,{"unit":typeConfig.update[sType].unit}));
        // console.log("NEW VALUE");
        // console.log($("#"+deviceDomID).data("data"));
        // console.log(deviceDomID+"      "+sType+"     "+newVal);
        // console.log(newVal);

        // if(typeof newVal=="object")newVal=newVal.val;
        // if(newVal==null)newVal="";
        // let dom=null;
        // switch(sType){
        //     case "name":dom=$("#"+deviceDomID).find("[name='name']");dom.attr("data_sname",newVal);if(String(dom.attr("data_oname")).length==0)dom.html(newVal+" // "+deviceDomID);break;
        //     case "oname":dom=$("#"+deviceDomID).find("[name='name']");dom.attr("data_oname",newVal);dom.html(newVal.length==0?dom.attr("data_sname")+" // "+deviceDomID:newVal+" // "+deviceDomID);break;
        //     case "power":$("#"+deviceDomID).find("[name='power']").html(newVal+" W");break;
        //     case "voltage":$("#"+deviceDomID).find("[name='voltage']").html(newVal+" V");break;            
            
        //     case "temperature":$("#"+deviceDomID).find("[name='temperature']").html(newVal+" °C");break;
        //     case "humidity":$("#"+deviceDomID).find("[name='humidity']").html(newVal+" V");break;
        //     case "externalPower":$("#"+deviceDomID).find("[name='devicePower']").html(newVal+" V");break;
        //     case "switch":dom=$("#"+deviceDomID).find("[name='switch']");dom.removeClass("wait");if(newVal==true){dom.addClass("active");}else{dom.removeClass("active");} dom.attr("curState",newVal); break;
        // };
        
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
    }
}

vis.binds["vis-shelly"].showVersion();