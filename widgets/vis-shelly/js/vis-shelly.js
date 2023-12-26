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
            switch(val.type){
                case "SHDM-2":typeConfig={"domID":domID,dataPoint:{0:{"power":val.stateId+".lights.Power","switch":val.stateId+".lights.Switch","brightness":val.stateId+".lights.brightness","name":val.stateId+".name","oname":vsID+".0.overrideName"}}};break;
                case "SHPLG-S":typeConfig={"domID":domID,dataPoint:{0:{"power":val.stateId+".Relay0.Power","switch":val.stateId+".Relay0.Switch","name":val.stateId+".name","oname":vsID+".0.overrideName"}}};break;
                case "shellyplus1pm":typeConfig={"domID":domID,dataPoint:{0:{"power":val.stateId+".Relay0.Power","switch":val.stateId+".Relay0.Switch","voltage":val.stateId+".Relay0.Voltage","name":val.stateId+".name","oname":vsID+".0.overrideName"}}};break;
                case "shellyplusplugs":typeConfig={"domID":domID,dataPoint:{0:{"power":val.stateId+".Relay0.Power","switch":val.stateId+".Relay0.Switch","voltage":val.stateId+".Relay0.Voltage","name":val.stateId+".name","oname":vsID+".0.overrideName"}}};break;     
                case "shellyplus2pm":typeConfig={"domID":domID,dataPoint:{0:{"power":val.stateId+".Relay0.Power","switch":val.stateId+".Relay0.Switch","voltage":val.stateId+".Relay0.Voltage","name":val.stateId+".name","oname":vsID+".0.overrideName"},1:{"power":val.stateId+".Relay1.Power","switch":val.stateId+".Relay1.Switch","voltage":val.stateId+".Relay1.Voltage","name":val.stateId+".name","oname":vsID+".1.overrideName"}}};break;     
                case "shellyplusht":typeConfig={"domID":domID,dataPoint:{0:{"temperature":val.stateId+".Temperature0.Celsius","humidity":val.stateId+".Humidity0.Relative","externalPower":val.stateId+".DevicePower0.ExternalPower","batteryPercent":val.stateId+".DevicePower0.BatteryPercent","name":val.stateId+".name","oname":vsID+".0.overrideName"}}};break;

                
            }
            $.each(typeConfig.dataPoint,(dpKey,dpVal)=>{
                // console.log(dpVal);
                var deviceDomID=typeConfig.domID+dpKey;
                let text=`<div id="${deviceDomID}" class="vis-shelly_DeviceBody">`;
                text+=`<span name="status"><span><span class="connectionState connectionStateOnline"></span></span></span>`;
                text+=`<span name="icon"></span>`;
                text+=`<span name="name" data_sname="" data_oname="">${deviceDomID}</span>`;
                text+=`<span name="info">`;
                if(typeof dpVal.power!="undefined"){text+=`<span><span name="power" class="icon"></span></span>`;}
                if(typeof dpVal.voltage!="undefined"){text+=`<span><span name="voltage" class="icon"></span></span>`;}
                if(typeof dpVal.humidity!="undefined"){text+=`<span><span name="humidity" class="icon"></span></span>`;}
                if(typeof dpVal.externalPower!="undefined"||typeof dpVal.batteryPercent!="undefined"){text+=`<span><span name="devicePower" class="icon"></span></span>`;}
                text+=`</span>`;
                text+=`<span name="action">`;
                if(typeof dpVal.switch!="undefined"){text+=`<span name="switch" curState="false"><svg name='svgShellyButton' viewBox="0 0 100 100" width="60" preserveAspectRatio="xMidYMid meet"><use xlink:href="#svgShellyButton" href="#svgShellyButton"></use></svg></span>`;}
                if(typeof dpVal.temperature!="undefined"){text+=`<span name="temperature"></span>`;}
                text+=`</span>`;
                $('#' + widgetID).append(text);
                $('#' + widgetID).find("#"+deviceDomID).find("[name='switch']").click(function(){$(this).addClass("wait");vis.setValue(dpVal.switch,$(this).attr("curState")=="true"?false:true);});
                
                console.log("GetStates: ");
                console.log(Object.values(dpVal));
                vis.conn.getStates(Object.values(dpVal),(error, data)=>{
                    console.log("done");
                    vis.updateStates(data);
                    vis.conn.subscribe(Object.values(dpVal));
                    $.each(dpVal,(sType,sID)=>{
                        console.log(data[sID]);
                        if(typeof data[sID]!="undefined"){
                            vis.binds["vis-shelly"].updateDeviceValue(widgetID,deviceDomID,sType,getStateObject(data[sID]).val);
                            vis.states.bind(sID+".val" , (e, newVal, oldVal)=>{                           
                                vis.binds["vis-shelly"].updateDeviceValue(widgetID,deviceDomID,sType,newVal);
                            });
                        }
                    });

                    
                    // vis.binds["vis-shelly"].updateDeviceValue(widgetID,deviceDomID,"name",getStateObject(data[dpVal["oname"]]).val.length>0?data[dpVal["oname"]].val:getStateObject(data[dpVal["name"]]).val);
                    vis.binds["vis-shelly"].updateDeviceValue(widgetID,deviceDomID,"name",getStateObject(data[dpVal["name"]]).val);
                    vis.binds["vis-shelly"].updateDeviceValue(widgetID,deviceDomID,"oname",getStateObject(data[dpVal["oname"]]).val);
                    
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
                buildDevice(v);
            });
        });

    },
    updateDeviceValue: function (widgetID, deviceDomID, sType, newVal) {
        console.log(deviceDomID+"      "+sType+"     "+newVal);
        console.log(newVal);
        if(newVal==null)newVal="";
        let dom=null;
        switch(sType){
            case "name":dom=$("#"+deviceDomID).find("[name='name']");dom.attr("data_sname",newVal);if(String(dom.attr("data_oname")).length==0)dom.html(newVal+" // "+deviceDomID);break;
            case "oname":dom=$("#"+deviceDomID).find("[name='name']");dom.attr("data_oname",newVal);dom.html(newVal.length==0?dom.attr("data_sname")+" // "+deviceDomID:newVal+" // "+deviceDomID);break;
            case "power":$("#"+deviceDomID).find("[name='power']").html(newVal+" W");break;
            case "voltage":$("#"+deviceDomID).find("[name='voltage']").html(newVal+" V");break;            
            
            case "temperature":$("#"+deviceDomID).find("[name='temperature']").html(newVal+" °C");break;
            case "humidity":$("#"+deviceDomID).find("[name='humidity']").html(newVal+" V");break;
            case "externalPower":$("#"+deviceDomID).find("[name='devicePower']").html(newVal+" V");break;
            case "switch":dom=$("#"+deviceDomID).find("[name='switch']");dom.removeClass("wait");if(newVal==true){dom.addClass("active");}else{dom.removeClass("active");} dom.attr("curState",newVal); break;
        };
        
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