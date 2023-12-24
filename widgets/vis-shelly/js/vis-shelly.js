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
		"iUniversalValueCount": {
			"en": "Number of states",
			"de": "Anzahl der Zustände"
		},
		"group_iUniversalValues": {
			"en": "State",
			"de": "Zustand"
		},
        "soid1_1": {
            "en":"Sub Item 1_1",
            "de":"Sub Item 1_1"
        },
        "soid1_": {
            "en":"Sub Item 1",
            "de":"Sub Item 1"
        }
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
        vis.conn.subscribe("vis-shelly.0.devices.ids",()=>{
                console.log("sub");
            console.log(vis);

        });
        // vis.subscribeOidAtRuntime("vis-shelly.0.devices.ids",()=>{
        //     console.log("sub");
        //     console.log(vis);
        // },true);
        console.log(vis);
        
        vis.conn.getStates(["vis-shelly.0.devices.ids"],(error, data)=>{
            let deviceIDs=JSON.parse(data["vis-shelly.0.devices.ids"].val);
            var text = '';
            $.each(deviceIDs,(k,v)=>{
                let domID=v.id.replaceAll('#','');
                text+=`<div id="${domID}" class="vis-shelly_DeviceBody"><span name="status"></span><span name="icon"></span><span name="name"></span><span name="info"></span><span name="action"></span></div>`;
            });
            // text+=`<object type="image/svg+xml" data="/vis/widgets/vis-shelly/images/shellyButton_opt.svg"></object>`;
            $('#' + widgetID).html(text);
            $.each(deviceIDs,(k,v)=>{
                let domID=v.id.replaceAll('#','');
                vis.binds["vis-shelly"].getDataAndBuildDevice(widgetID,domID,v.stateId,v.id,v.type);
            });
        });
    },
    getDataAndBuildDevice: function(widgetID,domID,stateID,id,type){
        let dataPoints=[];
        switch(type){
            case "SHDM-2":dataPoints=[stateID+".lights.Power",stateID+".lights.Switch",stateID+".lights.brightness",stateID+".name","vis-shelly.0.devices."+id+".overrideName"];break;
            case "SHPLG-S":dataPoints=[stateID+".Relay0.Power",stateID+".Relay0.Switch",stateID+".name","vis-shelly.0.devices."+id+".overrideName"];break;
            case "shellyplus1pm":dataPoints=[stateID+".Relay0.Power",stateID+".Relay0.Switch",stateID+".Relay0.Voltage",stateID+".name","vis-shelly.0.devices."+id+".overrideName"];break;
            case "shellyplusplugs":dataPoints=[stateID+".Relay0.Power",stateID+".Relay0.Switch",stateID+".Relay0.Voltage",stateID+".name","vis-shelly.0.devices."+id+".overrideName"];break;
            default: dataPoints=[stateID+".name","vis-shelly.0.devices."+id+".overrideName"];break;
        }
        // console.log("GetStates: "+stateID);
        if(dataPoints.length>0){
            vis.conn.getStates(dataPoints,(error, data)=>{
                // console.log(data);
                let bound=[];
                vis.updateStates(data);
                vis.conn.subscribe(dataPoints);

                var dataObj={type:type};
                var fillObjectDevice=function(dataObj,searchText,key,value,type){
                    if(key.endsWith(searchText)){
                        if(value==null){dataObj[searchText]={val:null};}
                        else dataObj[searchText]=value;
                        dataObj[searchText]['id']=key;

                        vis.states.bind(key+".val" , (e, newVal, oldVal)=>{
                            console.log(searchText + ": " +newVal);
                            vis.binds["vis-shelly"].repaintDeviceValue(widgetID,domID,searchText,key,newVal,type);
                        });
                    }
                };
                for (const [k, v] of Object.entries(data)) {
                    fillObjectDevice(dataObj,"Power",k,v,type);
                    fillObjectDevice(dataObj,"Switch",k,v,type);
                    fillObjectDevice(dataObj,"Voltage",k,v,type);
                    fillObjectDevice(dataObj,"brightness",k,v,type);
                    fillObjectDevice(dataObj,"name",k,v,type);
                    fillObjectDevice(dataObj,"overrideName",k,v,type);
                }
                vis.binds["vis-shelly"].buildDevice(widgetID,domID,dataObj,id,type);
            });
        }
    },
    repaintDeviceValue: function(widgetID,domID,searchText,stateID,value,type,$div=null){
        console.log("repaint:"+searchText);
        if($div==null)$div=$("#"+widgetID).find("#"+domID);

        if(type.localeCompare("SHDM-2")){
            if(searchText.localeCompare("Switch")==0){
                let $dom=$div.find(`[name='action']`);
                if($dom.children().length==0)$dom.html(`<svg name='svgShellyButton' viewBox="0 0 100 100" width="60" preserveAspectRatio="xMidYMid meet"><use xlink:href="#svgShellyButton" href="#svgShellyButton"></use></svg>`);
                $dom.removeClass("wait");
                if(value==true){$dom.addClass("active");}
                else{$dom.removeClass("active");}
                console.log($dom);
                $dom.click(function(){
                    $dom.addClass("wait");
                    vis.setValue(stateID,value?false:true);
                });
            } else if(searchText.localeCompare("name")==0||searchText.localeCompare("overrideName")==0) {
                let $dom=$div.find(`[name='name']`);
                $dom.html(value);
            } else if(searchText.localeCompare("Power")==0) {
                let $dom=$div.find(`[name='info']`);
                if($dom.children().length==0)$dom.html(`<span class="icon power"></span><span class="value"></span>`);
                $dom.find(".value").html(value+" W");
            }
        }else if(type.localeCompare("SHPLG-S")){
            if(searchText.localeCompare("Switch")==0){
                let $dom=$div.find(`[name='action']`);
                if($dom.children().length==0)$dom.html(`<svg name='svgShellyButton' viewBox="0 0 100 100" width="60" preserveAspectRatio="xMidYMid meet"><use xlink:href="#svgShellyButton" href="#svgShellyButton"></use></svg>`);
                $dom.removeClass("wait");
                if(value==true){$dom.addClass("active");}
                else{$dom.removeClass("active");}
                console.log($dom);
                $dom.click(function(){
                    $dom.addClass("wait");
                    vis.setValue(stateID,value?false:true);
                });
            } else if(searchText.localeCompare("name")==0||searchText.localeCompare("overrideName")==0) {
                let $dom=$div.find(`[name='name']`);
                $dom.html(value);
            } else if(searchText.localeCompare("Power")==0) {
                let $dom=$div.find(`[name='info']`);
                if($dom.children().length==0)$dom.html(`<span class="icon power"></span><span class="value"></span>`);
                $dom.find(".value").html(value+" W");
            }
        }else if(type.localeCompare("shellyplus1pm")){
            if(searchText.localeCompare("Switch")==0){
                let $dom=$div.find(`[name='action']`);
                if($dom.children().length==0)$dom.html(`<svg name='svgShellyButton' viewBox="0 0 100 100" width="60" preserveAspectRatio="xMidYMid meet"><use xlink:href="#svgShellyButton" href="#svgShellyButton"></use></svg>`);
                $dom.removeClass("wait");
                if(value==true){$dom.addClass("active");}
                else{$dom.removeClass("active");}
                console.log($dom);
                $dom.click(function(){
                    $dom.addClass("wait");
                    vis.setValue(stateID,value?false:true);
                });
            } else if(searchText.localeCompare("name")==0||searchText.localeCompare("overrideName")==0) {
                let $dom=$div.find(`[name='name']`);
                $dom.html(value);
            } else if(searchText.localeCompare("Power")==0) {
                let $dom=$div.find(`[name='info']`);
                if($dom.children().length==0)$dom.html(`<span class="icon power"></span><span class="value"></span>`);
                $dom.find(".value").html(value+" W");
            }
        }else if(type.localeCompare("shellyplusplugs")){
            if(searchText.localeCompare("Switch")==0){
                let $dom=$div.find(`[name='action']`);
                if($dom.children().length==0)$dom.html(`<svg name='svgShellyButton' viewBox="0 0 100 100" width="60" preserveAspectRatio="xMidYMid meet"><use xlink:href="#svgShellyButton" href="#svgShellyButton"></use></svg>`);
                $dom.removeClass("wait");
                if(value==true){$dom.addClass("active");}
                else{$dom.removeClass("active");}
                console.log($dom);
                $dom.click(function(){
                    $dom.addClass("wait");
                    vis.setValue(stateID,value?false:true);
                });
            } else if(searchText.localeCompare("name")==0||searchText.localeCompare("overrideName")==0) {
                let $dom=$div.find(`[name='name']`);
                $dom.html(value);
            } else if(searchText.localeCompare("Power")==0) {
                let $dom=$div.find(`[name='info']`);
                if($dom.children().length==0)$dom.html(`<span class="icon power"></span><span class="value"></span>`);
                $dom.find(".value").html(value+" W");
            }
        } else {
            if(searchText.localeCompare("name")==0||searchText.localeCompare("overrideName")==0) {
                let $dom=$div.find(`[name='name']`);
                $dom.html(value);
            }
        }
    },
    buildDevice: function(widgetID,domID,data,id,type){
        var $div = $("#"+widgetID).find("#"+domID);
        vis.binds["vis-shelly"].repaintDeviceValue(widgetID,domID,"Switch",data['Switch'].id,data['Switch'].val,type,$div);
        vis.binds["vis-shelly"].repaintDeviceValue(widgetID,domID,"Power",data['Power'].id,data['Power'].val,type,$div);
        vis.binds["vis-shelly"].repaintDeviceValue(widgetID,domID,"name",data['name'].id,data['overrideName'].val==null?data['name'].val:data['overrideName'].val,type,$div);
        
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
};

vis.binds["vis-shelly"].showVersion();