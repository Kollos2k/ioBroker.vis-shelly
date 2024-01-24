/*
    ioBroker.vis vis-shelly Widget-Set

    version: "0.0.1"

    Copyright 2023 Kollos2k kollos@vorsicht-bissig.de
*/
"use strict";

/* global $, vis, systemDictionary */

// add translations for edit mode
$.extend(true, systemDictionary, {
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
});

// this code can be placed directly in vis-shelly.html
vis.binds["vis-shelly"] = {
	version: "0.0.6",
	showVersion: function () {
		if (vis.binds["vis-shelly"].version) {
			console.log("Version vis-shelly: " + vis.binds["vis-shelly"].version);
			vis.binds["vis-shelly"].version = null;
		}
	},
	createWidget: {
		roomDevices: function (widgetID, view, widData, style) {
			var $div = $("#" + widgetID);
			if (!$div.length) {
				return setTimeout(function () {
					vis.binds["vis-shelly"].createWidget.roomDevices(widgetID, view, widData, style);
				}, 100);
			}
			vis.binds["vis-shelly"].createDevice_helper.setBasicWidgetOptions($div, widData);
			let roomID = "";
			roomID = vis.views[view].widgets[widgetID].data.roomid;
			vis.conn.getStates(["vis-shelly.0.devices.ids"], (error, data) => {
				const deviceIDs = JSON.parse(data["vis-shelly.0.devices.ids"].val);
				$.each(deviceIDs, (k, v) => {
					vis.binds["vis-shelly"].createDevice_helper.buildDevice(v, widgetID, widData, roomID);
				});
			});
		},
		allDevices: function (widgetID, view, widData, style) {
			var $div = $("#" + widgetID);
			if (!$div.length) {
				return setTimeout(function () {
					vis.binds["vis-shelly"].createWidget.allDevices(widgetID, view, widData, style);
				}, 100);
			}
			vis.binds["vis-shelly"].createDevice_helper.setBasicWidgetOptions($div, widData);
			// console.log(vis);
			// console.log(widData);
			var getStateObject = function (state) {
				if (typeof state == "undefined") return { ack: true, from: "", lc: 0, q: 0, ts: 0, user: "", val: "" };
				return state;
			};
			vis.conn.getStates(["vis-shelly.0.devices.ids"], (error, data) => {
				const deviceIDs = JSON.parse(data["vis-shelly.0.devices.ids"].val);
				$.each(deviceIDs, (k, v) => {
					vis.binds["vis-shelly"].createDevice_helper.buildDevice(v, widgetID, widData);
				});
			});
		},
	},

	updateDeviceValue: function (widgetID, deviceDomID, typeConfig, sType, sID, newVal = undefined) {
		if (typeof typeConfig.update == "undefined") return false;
		if (typeof typeConfig.update[sType] == "undefined") return false;
		const configUpdate = typeConfig.update[sType];
		// console.log(configUpdate.getValue(newVal,configUpdate));
		const $domDev = $("#" + widgetID).find("#" + deviceDomID);
		// console.log($domDev.length);
		if ($domDev.length == 0) return false;
		const $dom = $domDev.find("[name='" + configUpdate.name + "']");
		// console.log($dom.length);
		if ($dom.length == 0) return false;

		var data = $domDev.data("data");

		if (typeof data[sID] == "undefined") data[sID] = { val: "" };
		if (typeof newVal == "undefined") {
			newVal = data[sID].val;
		} else {
			if (typeof newVal == "object") data[sID] = newVal;
			else data[sID].val = newVal;
			if (typeof newVal == "object") newVal = newVal.val;
			$domDev.data("data", data);
		}
		configUpdate.updateValue($dom, newVal, configUpdate, data, sID);
	},
	updateUniversalDataFields: function (wid, view) {
		vis.activeWidgets.forEach(function (el) {
			const data = vis.views[vis.activeView].widgets[el].data;

			vis.hideShowAttr("iNavWait", false);
		});
	},

	//VIS Editor select Room
	visEditor_selectRoom: function (wid_attr, options) {
		console.log(vis);
		const view = vis.activeView;
		const wid = vis.activeWidgets[0];
		// vis.views[view].widgets[wid].data.roomid=1;
		const curValue = vis.views[view].widgets[wid].data.roomid;

		vis.conn.getStates(["vis-shelly.0.devices.roomIds"], (error, data) => {
			const roomObj = JSON.parse(data["vis-shelly.0.devices.roomIds"].val);
			const select = $("#" + wid + "_roomid");
			$.each(roomObj, (k, v) => {
				select.append(`<option value="${k}" ${k == curValue ? "selected" : ""}>${v}</option>`);
			});
		});
		let inputTxt = `<select id="${wid}_roomid" onchange='vis.binds["vis-shelly"].visEditor_selectRoomSelect(this)'>`;
		inputTxt += "<option value=''>--Please Choose an Option--</option>";
		inputTxt += "</select>";
		return {
			input: inputTxt,
		};
	},
	visEditor_selectRoomSelect: function (select) {
		const view = vis.activeView;
		const wid = vis.activeWidgets[0];
		vis.views[view].widgets[wid].data.roomid = $(select).val();
		const data = vis.views[view].widgets[wid].data;
		data.wid = wid;
		vis.binds["vis-shelly"].createAllDevicesWidget(wid, view, data, vis.views[view].widgets[wid].style, true);
	},
	createDevice_helper: {
		getDeviceConfigByType: function (type, domID, val, vsID) {
			var typeConfig = {};
			const switchButton = `<svg name='svgShellyButton' viewBox="0 0 100 100" width="60" preserveAspectRatio="xMidYMid meet"><use xlink:href="#svgShellyButton" href="#svgShellyButton"></use></svg>`;
			switch (type) {
				case "SHDM-2":
					typeConfig = {
						domID: domID,
						update: {
							power: {
								name: "power",
								unit: "W",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueUnit,
							},
							brightness: {
								name: "brightness",
								unit: "%",
								updateValue:
									vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueBrightness,
							},
							name: {
								name: "name",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueName,
							},
							oname: {
								name: "name",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueName,
							},
							switch: {
								name: "switch",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateSwitch,
							},
						},
						view: {
							info: {
								power: { name: "power", class: "icon", html: "" },
								brightness: { name: "brightness", class: "icon", html: "" },
							},
							action: { switch: { name: "switch", class: "", html: switchButton } },
						},
						action: {
							switch: {
								name: "switch",
								click: vis.binds["vis-shelly"].createDevice_helper.actions.basicSwitchAction,
							},
						},
						dataPoint: {
							0: {
								power: val.stateId + ".lights.Power",
								switch: val.stateId + ".lights.Switch",
								brightness: val.stateId + ".lights.brightness",
								name: val.stateId + ".name",
								oname: vsID + ".0.overrideName",
								room: vsID + ".0.room",
								deviceID: val.id,
							},
						},
					};
					break;
				case "SHPLG-S":
					typeConfig = {
						domID: domID,
						update: {
							power: {
								name: "power",
								unit: "W",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueUnit,
							},
							name: {
								name: "name",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueName,
							},
							oname: {
								name: "name",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueName,
							},
							switch: {
								name: "switch",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateSwitch,
							},
						},
						view: {
							info: { power: { name: "power", class: "icon", html: "" } },
							action: { switch: { name: "switch", class: "", html: switchButton } },
						},
						action: {
							switch: {
								name: "switch",
								click: vis.binds["vis-shelly"].createDevice_helper.actions.basicSwitchAction,
							},
						},
						dataPoint: {
							0: {
								power: val.stateId + ".Relay0.Power",
								switch: val.stateId + ".Relay0.Switch",
								name: val.stateId + ".name",
								oname: vsID + ".0.overrideName",
								room: vsID + ".0.room",
								deviceID: val.id,
							},
						},
					};
					break;
				case "shellyplus1pm":
					typeConfig = {
						domID: domID,
						update: {
							power: {
								name: "power",
								unit: "W",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueUnit,
							},
							voltage: {
								name: "voltage",
								unit: "V",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueUnit,
							},
							name: {
								name: "name",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueName,
							},
							oname: {
								name: "name",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueName,
							},
							switch: {
								name: "switch",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateSwitch,
							},
						},
						view: {
							info: {
								power: { name: "power", class: "icon", html: "" },
								voltage: { name: "voltage", class: "icon", html: "" },
							},
							action: { switch: { name: "switch", class: "", html: switchButton } },
						},
						action: {
							switch: {
								name: "switch",
								click: vis.binds["vis-shelly"].createDevice_helper.actions.basicSwitchAction,
							},
						},
						dataPoint: {
							0: {
								power: val.stateId + ".Relay0.Power",
								switch: val.stateId + ".Relay0.Switch",
								voltage: val.stateId + ".Relay0.Voltage",
								name: val.stateId + ".name",
								oname: vsID + ".0.overrideName",
								room: vsID + ".0.room",
								deviceID: val.id,
							},
						},
					};
					break;
				case "shellyplusplugs":
					typeConfig = {
						domID: domID,
						update: {
							power: {
								name: "power",
								unit: "W",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueUnit,
							},
							voltage: {
								name: "voltage",
								unit: "V",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueUnit,
							},
							name: {
								name: "name",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueName,
							},
							oname: {
								name: "name",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueName,
							},
							switch: {
								name: "switch",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateSwitch,
							},
						},
						view: {
							info: {
								power: { name: "power", class: "icon", html: "" },
								voltage: { name: "voltage", class: "icon", html: "" },
							},
							action: { switch: { name: "switch", class: "", html: switchButton } },
						},
						action: {
							switch: {
								name: "switch",
								click: vis.binds["vis-shelly"].createDevice_helper.actions.basicSwitchAction,
							},
						},
						dataPoint: {
							0: {
								power: val.stateId + ".Relay0.Power",
								switch: val.stateId + ".Relay0.Switch",
								voltage: val.stateId + ".Relay0.Voltage",
								name: val.stateId + ".name",
								oname: vsID + ".0.overrideName",
								room: vsID + ".0.room",
								deviceID: val.id,
							},
						},
					};
					break;
				case "shellyplus2pm":
					typeConfig = {
						domID: domID,
						update: {
							power: {
								name: "power",
								unit: "W",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueUnit,
							},
							voltage: {
								name: "voltage",
								unit: "V",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueUnit,
							},
							name: {
								name: "name",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueName,
							},
							oname: {
								name: "name",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueName,
							},
							switch: {
								name: "switch",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateSwitch,
							},
						},
						view: {
							info: {
								power: { name: "power", class: "icon", html: "" },
								voltage: { name: "voltage", class: "icon", html: "" },
							},
							action: { switch: { name: "switch", class: "", html: switchButton } },
						},
						action: {
							switch: {
								name: "switch",
								click: vis.binds["vis-shelly"].createDevice_helper.actions.basicSwitchAction,
							},
						},
						dataPoint: {
							0: {
								power: val.stateId + ".Relay0.Power",
								switch: val.stateId + ".Relay0.Switch",
								voltage: val.stateId + ".Relay0.Voltage",
								name: val.stateId + ".name",
								oname: vsID + ".0.overrideName",
								room: vsID + ".0.room",
								deviceID: val.id,
							},
							1: {
								power: val.stateId + ".Relay1.Power",
								switch: val.stateId + ".Relay1.Switch",
								voltage: val.stateId + ".Relay1.Voltage",
								name: val.stateId + ".name",
								oname: vsID + ".1.overrideName",
								room: vsID + ".1.room",
								deviceID: val.id,
							},
						},
					};
					break;
				case "shellyplusht":
					typeConfig = {
						domID: domID,
						update: {
							humidity: {
								name: "humidity",
								unit: "%",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueUnit,
							},
							batteryPercent: {
								name: "devicePower",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateDevicePower,
							},
							externalPower: {
								name: "devicePower",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateDevicePower,
							},
							temperature: {
								name: "temperature",
								unit: "°C",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueUnit,
							},
							name: {
								name: "name",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueName,
							},
							oname: {
								name: "name",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueName,
							},
						},
						view: {
							info: {
								humidity: { name: "humidity", class: "icon", html: "" },
								externalPower: { name: "devicePower", class: "icon", html: "" },
							},
							action: { temperature: { name: "temperature", class: "temperature", html: "" } },
						},
						dataPoint: {
							0: {
								temperature: val.stateId + ".Temperature0.Celsius",
								humidity: val.stateId + ".Humidity0.Relative",
								externalPower: val.stateId + ".DevicePower0.ExternalPower",
								batteryPercent: val.stateId + ".DevicePower0.BatteryPercent",
								name: val.stateId + ".name",
								oname: vsID + ".0.overrideName",
								room: vsID + ".0.room",
								deviceID: val.id,
							},
						},
					};
					break;
				case "SHTRV-01":
					typeConfig = {
						domID: domID,
						update: {
							valvePosition: {
								name: "valvePosition",
								unit: "%",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueUnit,
							},
							batteryPercent: {
								name: "devicePower",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateDevicePower,
							},
							externalPower: {
								name: "devicePower",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateDevicePower,
							},
							temperature: {
								name: "temperature",
								unit: "°C",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueUnit,
							},
							name: {
								name: "name",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueName,
							},
							oname: {
								name: "name",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueName,
							},
						},
						view: {
							info: {
								temperature: { name: "temperature", class: "icon", html: "" },
								valvePosition: { name: "valvePosition", class: "icon", html: "" },
								devicePower: { name: "devicePower", class: "icon", html: "" },
							},
							action: {},
						},
						dataPoint: {
							0: {
								temperature: val.stateId + ".tmp.temperatureC",
								valvePosition: val.stateId + ".tmp.valvePosition",
								externalPower: val.stateId + ".bat.charger",
								batteryPercent: val.stateId + ".bat.value",
								name: val.stateId + ".name",
								oname: vsID + ".0.overrideName",
								room: vsID + ".0.room",
								deviceID: val.id,
							},
						},
					};
					break;
				case "SHMOS-02":
					typeConfig = {
						domID: domID,
						update: {
							lux: {
								name: "lux",
								unit: "Lux",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueUnit,
							},
							batteryPercent: {
								name: "devicePower",
								unit: "%",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueUnit,
							},
							motion: {
								name: "motion",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateMotionValue,
							},
							temperature: {
								name: "temperature",
								unit: "°C",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueUnit,
							},
							name: {
								name: "name",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueName,
							},
							oname: {
								name: "name",
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueName,
							},
						},
						view: {
							info: {
								temperature: { name: "temperature", class: "icon", html: "" },
								batteryPercent: { name: "batteryPercent", class: "icon", html: "" },
								lux: { name: "lux", class: "icon", html: "" },
							},
							action: { motion: { name: "motion", class: "", html: "" } },
						},
						dataPoint: {
							0: {
								temperature: val.stateId + ".sensor.temperatureC",
								motion: val.stateId + ".sensor.motion",
								lux: val.stateId + ".sensor.lux",
								batteryPercent: val.stateId + ".sensor.battery",
								name: val.stateId + ".name",
								oname: vsID + ".0.overrideName",
								room: vsID + ".0.room",
								deviceID: val.id,
							},
						},
					};
					break;
			}
			return typeConfig;
		},
		actions: {
			basicUpdateValue: function ($dom, newVal, options = {}, data = {}, stageID = "") {
				$dom.html(newVal);
			},
			basicUpdateMotionValue: function ($dom, newVal, options = {}, data = {}, stageID = "") {
				$dom.removeClass("motionyes");
				$dom.removeClass("motionno");
				if (newVal == true) {
					$dom.addClass("motionyes");
					$dom.html("Ja");
				} else {
					$dom.addClass("motionno");
					$dom.html("Nein");
				}
			},
			basicUpdateValueName: function ($dom, newVal, optons = {}, data = {}, stageID = "") {
				var name = null;
				var oname = null;
				var deviceID = null;
				$.each(data, (k, v) => {
					if (k.lastIndexOf(".name") > -1) name = v;
					else if (k.lastIndexOf(".overrideName") > -1) {
						deviceID = k.match(/[.](.*).[0-9].overrideName/g)[1];
						oname = v;
					}
				});
				if (name == null || typeof name != "object") name = { val: "" };
				if (oname == null || typeof oname != "object") oname = { val: name.val.length == 0 ? deviceID : "" };
				$dom.html(oname.val.length > 0 ? oname.val : name.val);
			},
			basicUpdateValueUnit: function ($dom, newVal, options = {}, data = {}, stageID = "") {
				$dom.html(newVal + " " + options.unit);
			},
			basicUpdateValueBrightness: function ($dom, newVal, options = {}, data = {}, stageID = "") {
				$dom.html(newVal + " " + options.unit);
				const $b1 = $("<button class='brightnessButton'>-</button>");
				const $b2 = $("<button class='brightnessButton'>+</button>");
				$b1.click(() => {
					if (newVal < 10) {
						newVal = 0;
					} else {
						newVal -= 10;
					}
					vis.setValue(stageID, newVal);
				});
				$b2.click(() => {
					if (newVal > 90) {
						newVal = 100;
					} else {
						newVal += 10;
					}
					vis.setValue(stageID, newVal);
				});
				$dom.append($b1);
				$dom.append($b2);
			},
			basicUpdateDevicePower: function ($dom, newVal, options = {}, data = {}, stageID = "") {
				console.log("update external");
				var exP = null;
				var percent = null;
				$.each(data, (k, v) => {
					if (k.lastIndexOf(".ExternalPower") > -1) exP = v;
					else if (k.lastIndexOf(".BatteryPercent") > -1) percent = v;
				});
				$dom.removeClass("externalPower");
				$dom.removeClass("battery");
				if (exP != null && typeof exP == "object" && exP.val == true) {
					$dom.addClass("externalPower");
					$dom.html("Energie");
				} else {
					$dom.addClass("battery");
					$dom.html((percent == null || typeof percent != "object" ? 0 : percent.val) + " %");
				}
			},
			basicUpdateSwitch: function ($dom, newVal, options = {}, data = {}, stageID = "") {
				$dom.removeClass("wait");
				if (newVal == true) {
					$dom.addClass("active");
				} else {
					$dom.removeClass("active");
				}
			},
			basicSwitchAction: function (stateID, $mainDOM) {
				const data = $mainDOM.data("data");
				const newVal =
					typeof data[stateID] != "undefined"
						? data[stateID] == null
							? true
							: data[stateID].val == true
								? false
								: true
						: false;
				vis.setValue(stateID, newVal);
			},
		},
		buildDevice: function (val, widgetID, widData, roomID = "") {
			const vsID = "vis-shelly.0.devices." + val.id;
			const domID = val.id.replaceAll("#", "");
			let typeConfig = {};
			typeConfig = vis.binds["vis-shelly"].createDevice_helper.getDeviceConfigByType(val.type, domID, val, vsID);

			console.log(typeConfig);
			if (typeof typeConfig.dataPoint == "undefined") return false;
			$.each(typeConfig.dataPoint, (dpKey, dpVal) => {
				vis.conn.getStates(Object.values(dpVal), (error, data) => {
					// console.log("data");
					console.log(data);
					if (roomID.length > 0) {
						if (data[dpVal.room] == null || data[dpVal.room].val != roomID) {
							return true;
						}
					}

					console.log(data[dpVal.room]);
					// console.log(roomID);
					// console.log(dpVal);
					var deviceDomID = typeConfig.domID + dpKey;
					let text = `<div id="${deviceDomID}" class="vis-shelly_DeviceBody" title="${val.stateId}" style="width:${widData.deviceWidth};">`;
					text += `<span name="status"><span><span class="connectionState connectionStateOnline"></span></span></span>`;
					text += `<span name="icon"></span>`;
					text += `<span name="name" data_sname="" data_oname="">${val.id}</span>`;
					text += `<span name="info">`;
					$.each(typeConfig.view.info, (viewKey, viewValue) => {
						text += `<span><span name="${viewValue.name}" class="${viewValue.class}">${viewValue.html}</span></span>`;
					});

					text += `</span>`;
					text += `<span name="action">`;
					$.each(typeConfig.view.action, (viewKey, viewValue) => {
						text += `<span><span name="${viewValue.name}" class="${viewValue.class}">${viewValue.html}</span></span>`;
					});
					// if(typeof dpVal.switch!="undefined"){text+=`<span name="switch" curState="false"></span>`;}
					// if(typeof dpVal.temperature!="undefined"){text+=`<span name="temperature"></span>`;}
					text += `</span>`;
					$("#" + widgetID).append(text);
					const $domDev = $("#" + widgetID).find("#" + deviceDomID);
					if (typeof typeConfig["action"] != "undefined") {
						$.each(typeConfig.action, (k, v) => {
							const $aDom = $domDev.find("[name='" + v.name + "']");
							if (typeof v.click == "function")
								$aDom.click(() => {
									v.click(dpVal[k], $domDev);
								});
						});
					}
					$domDev.data("data", data);
					vis.updateStates(data);
					vis.conn.subscribe(Object.values(dpVal));

					$.each(dpVal, (sType, sID) => {
						console.log(sID);
						if (typeof data[sID] != "undefined") {
							vis.binds["vis-shelly"].updateDeviceValue(widgetID, deviceDomID, typeConfig, sType, sID);
							vis.states.bind(sID + ".val", (e, newVal, oldVal) => {
								vis.binds["vis-shelly"].updateDeviceValue(
									widgetID,
									deviceDomID,
									typeConfig,
									sType,
									sID,
									newVal,
								);
							});
						} else {
							/* empty */
						}
					});
				});
			});
		},
		setBasicWidgetOptions: function ($div, widData) {
			$div.empty();
			if (vis.editMode) {
				$div.css("overflow-y", "hidden");
			}
			if (widData.display == "flex") {
				$div.addClass("flex");
			} else {
				$div.removeClass("flex");
			}
			vis.conn.subscribe("vis-shelly.0.devices.ids", () => {});
			vis.conn.subscribe("vis-shelly.0.devices.roomIds", () => {});
		},
	},
};

vis.binds["vis-shelly"].showVersion();
