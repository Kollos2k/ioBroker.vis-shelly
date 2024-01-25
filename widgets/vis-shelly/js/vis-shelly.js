/*
    ioBroker.vis vis-shelly Widget-Set

    version: "0.0.1"

    Copyright 2023 Kollos2k kollos@vorsicht-bissig.de
*/
"use strict";

/* global $, vis, systemDictionary */

// add translations for edit mode
$.extend(true, systemDictionary, {
	deviceWidth: {
		en: "device width",
		de: "Gerätebreite",
		ru: "ширина",
		pt: "largura do dispositivo",
		nl: "apparaatbreedte",
		fr: "largeur du dispositif",
		it: "larghezza del dispositivo",
		es: "ancho del dispositivo",
		pl: "szerokość urządzenia",
		uk: "ширина пристрою",
		"zh-cn": "设备宽度",
	},
	display: {
		en: "displaymode",
		de: "Anzeigemodus",
		ru: "displaymode",
		pt: "painel de exibição",
		nl: "weergavemodus",
		fr: "mode d'affichage",
		it: "displaymode",
		es: "displaymode",
		pl: "displaymode",
		uk: "дисплей",
		"zh-cn": "显示模式",
	},
	group_iUniversalDeviceValues: {
		en: "Device values",
		de: "Gerätewerte",
		ru: "Значения устройств",
		pt: "Valores de dispositivo",
		nl: "Apparaatwaarden",
		fr: "Valeurs du périphérique",
		it: "Valori del dispositivo",
		es: "Valores de dispositivo",
		pl: "Wartości urządzenia",
		uk: "Значення пристрою",
		"zh-cn": "设备值",
	},
	iUniversalDeviceCount: {
		en: "Device count",
		de: "Anzahl der Geräte",
		ru: "Количество устройств",
		pt: "Contagem de dispositivos",
		nl: "Aantal apparaten",
		fr: "Nombre de périphériques",
		it: "Conteggio dispositivi",
		es: "Conteo de dispositivos",
		pl: "Liczba urządzeń",
		uk: "Кількість пристроїв",
		"zh-cn": "设备计数",
	},
	roomid: {
		en: "Room ID",
		de: "Zimmer ID",
		ru: "Номерное удостоверение",
		pt: "ID do quarto",
		nl: "Kamer-ID",
		fr: "Numéro de chambre",
		it: "ID della camera",
		es: "Identificación de la habitación",
		pl: "Identyfikator pokoju",
		uk: "Ідентифікатор номерів",
		"zh-cn": "房间编号",
	},
	deviceID: {
		en: "Device ID",
		de: "Gerätekennung",
		ru: "ID устройства",
		pt: "ID do dispositivo",
		nl: "Apparaat-ID",
		fr: "ID du périphérique",
		it: "ID dispositivo",
		es: "ID de dispositivo",
		pl: "Identyfikator urządzenia",
		uk: "Код пристрою",
		"zh-cn": "设备标识",
	},
	deviceType: {
		en: "Device type",
		de: "Gerätetyp",
		ru: "Тип устройства",
		pt: "Tipo de dispositivo",
		nl: "Apparaattype",
		fr: "Type de périphérique",
		it: "Tipo di dispositivo",
		es: "Tipo de dispositivo",
		pl: "Typ urządzenia",
		uk: "Тип пристрою",
		"zh-cn": "设备类型",
	},
	deviceRelayNumber: {
		en: "relay number",
		de: "Relaisnummer",
		ru: "номер реле",
		pt: "número de relé",
		nl: "relaisnummer",
		fr: "numéro du relais",
		it: "numero di relè",
		es: "número de relé",
		pl: "numer przekaźnika",
		uk: "кількість релей",
		"zh-cn": "中继号码",
	},
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
		customDevices: function (widgetID, view, widData, style) {
			var $div = $("#" + widgetID);
			if (!$div.length) {
				return setTimeout(function () {
					vis.binds["vis-shelly"].createWidget.customDevices(widgetID, view, widData, style);
				}, 100);
			}
			vis.binds["vis-shelly"].createDevice_helper.setBasicWidgetOptions($div, widData);
			console.debug("CUSTOM WID DATA");
			console.debug(widData);
			for (let count = 1; count <= widData.iUniversalDeviceCount; count++) {
				// $div.append("<div>dev:" + widData["deviceID" + count] + "</div>");
				// $div.append("<div>type:" + widData["deviceType" + count] + "</div>");
				if (
					typeof widData["deviceID" + count] == "undefined" ||
					typeof widData["deviceType" + count] == "undefined" ||
					widData["deviceID" + count] == "" ||
					widData["deviceType" + count] == ""
				) {
					/* empty */
				} else {
					const v = {
						stateId: widData["deviceID" + count],
						type: widData["deviceType" + count],
						id: widData["deviceID" + count].match(/([^.]*)$/g)[1],
						relay: widData["deviceRelayNumber" + count],
					};
					console.debug(widData["deviceID" + count]);
					console.debug(v);
					console.debug(widData["deviceID" + count].match(/([^.]*)$/g));
					vis.binds["vis-shelly"].createDevice_helper.buildDevice(v, widgetID, widData);
				}
			}
			// [{"stateId":"shelly.0.shellyplus2pm#08b61fce0758#1","id":"shellyplus2pm#08b61fce0758#1","type":"shellyplus2pm"}]
			// vis.conn.getStates(["vis-shelly.0.devices.ids"], (error, data) => {
			// 	const deviceIDs = JSON.parse(data["vis-shelly.0.devices.ids"].val);
			// 	$.each(deviceIDs, (k, v) => {
			// 		vis.binds["vis-shelly"].createDevice_helper.buildDevice(v, widgetID, widData);
			// 	});
			// });
		},
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
			console.log("VIS");
			console.log(vis);
			console.log("WID DATA");
			console.log(widData);
			console.log("VIEW");
			console.log(view);
			// var getStateObject = function (state) {
			// 	if (typeof state == "undefined") return { ack: true, from: "", lc: 0, q: 0, ts: 0, user: "", val: "" };
			// 	return state;
			// };
			vis.conn.getStates([`vis-shelly.0.devices.ids`], (error, data) => {
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

		if (typeof data[sID] == "undefined" || data[sID] == null) data[sID] = { val: "" };
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
	visEditor_roomDevices_getRoomSelect: function (wid_attr, options) {
		return this.visEditor.roomDevices.getRoomSelect(wid_attr, options);
	},
	visEditor_customDevices_getDeviceSelect: function (wid_attr, options) {
		return this.visEditor.customDevices.getDeviceSelect(wid_attr, options);
	},
	visEditor_customDevices_getTypeSelect: function (wid_attr, options) {
		return this.visEditor.customDevices.getTypeSelect(wid_attr, options);
	},

	visEditor: {
		roomDevices: {
			getRoomSelect: function (wid_attr, options) {
				const view = vis.activeView;
				const wid = vis.activeWidgets[0];
				const curValue = vis.views[view].widgets[wid].data[wid_attr];

				setTimeout(() => {
					vis.conn.getStates(["vis-shelly.0.devices.roomIds"], (error, data) => {
						const roomObj = JSON.parse(data["vis-shelly.0.devices.roomIds"].val);
						const select = $("#" + wid + "_roomid");
						$.each(roomObj, (k, v) => {
							select.append(`<option value="${k}" ${k == curValue ? "selected" : ""}>${v}</option>`);
						});
					});
				}, 200);
				let inputTxt = `<select id="${wid}_roomid" onchange='vis.binds["vis-shelly"].visEditor.roomDevices.selectRoomID(this,"${wid_attr}")'>`;
				inputTxt += "<option value=''>--Please Choose an Room--</option>";
				inputTxt += "</select>";
				return {
					input: inputTxt,
				};
			},
			selectRoomID: function (select, wid_attr) {
				const view = vis.activeView;
				const wid = vis.activeWidgets[0];
				vis.views[view].widgets[wid].data[wid_attr] = $(select).val();
				const data = vis.views[view].widgets[wid].data;
				data.wid = wid;
				vis.binds["vis-shelly"].createWidget.roomDevices(wid, view, data, vis.views[view].widgets[wid].style);
			},
		},
		customDevices: {
			getDeviceSelect: function (wid_attr, options) {
				const view = vis.activeView;
				const wid = vis.activeWidgets[0];
				// vis.views[view].widgets[wid].data.roomid=1;
				console.debug(vis.views[view].widgets[wid]);
				const curValue = vis.views[view].widgets[wid].data[wid_attr];

				setTimeout(() => {
					vis.conn.getStates([`vis-shelly.0.devices.ids`], (error, data) => {
						const deviceIDs = JSON.parse(data["vis-shelly.0.devices.ids"].val);
						const select = $("#" + wid + "_" + wid_attr);
						select.empty();
						select.append("<option value=''>--Please Choose an Device--</option>");
						$.each(deviceIDs, (k, v) => {
							select.append(
								`<option value="${v.stateId}" ${v.stateId == curValue ? "selected" : ""}>${
									v.id
								}</option>`,
							);
						});
					});
				}, 200);
				let inputTxt = `<select id="${wid}_${wid_attr}" onchange='vis.binds["vis-shelly"].visEditor.customDevices.onSelectDeviceID(this,"${wid_attr}")'>`;
				inputTxt += "<option value=''>--Please Choose an Device--</option>";
				inputTxt += "</select>";
				return {
					input: inputTxt,
				};
			},
			getTypeSelect: function (wid_attr, options) {
				const view = vis.activeView;
				const wid = vis.activeWidgets[0];
				// vis.views[view].widgets[wid].data.roomid=1;
				const curValue = vis.views[view].widgets[wid].data[wid_attr];
				console.error(curValue);
				const types = [
					"SHDM-2",
					"SHPLG-S",
					"shellyplus1pm",
					"shellyplusplugs",
					"shellyplus2pm",
					"shellyplusht",
					"SHTRV-01",
					"SHMOS-02",
				];
				let inputTxt = `<select id="${wid}_${wid_attr}" onchange='vis.binds["vis-shelly"].visEditor.customDevices.onSelectType(this,"${wid_attr}")'>`;
				inputTxt += "<option value=''>--Please Choose an Type--</option>";
				for (const type of types) {
					inputTxt += `<option value="${type}" ${type == curValue ? "selected" : ""}>${type}</option>`;
				}
				inputTxt += "</select>";
				return {
					input: inputTxt,
				};
			},
			onSelectDeviceID: function (select, wid_attr) {
				const view = vis.activeView;
				const wid = vis.activeWidgets[0];
				vis.views[view].widgets[wid].data[wid_attr] = $(select).val();
				const data = vis.views[view].widgets[wid].data;
				data.wid = wid;
				const curValue = vis.views[view].widgets[wid].data[wid_attr];
				const curIndex = wid_attr.match(/[0-9]*$/g)[0];
				// console.debug(curValue);
				// console.debug(curIndex);

				vis.conn.getStates([`vis-shelly.0.devices.ids`], (error, state) => {
					const deviceIDs = JSON.parse(state["vis-shelly.0.devices.ids"].val);
					$.each(deviceIDs, (k, v) => {
						if (v.stateId == curValue) {
							vis.views[view].widgets[wid].data["deviceType" + curIndex] = v.type;
							$("#" + wid + "_deviceType" + curIndex).val(v.type);
							// return false;
						}
					});
					vis.views[view].widgets[wid].data.lastChange = Math.floor(Date.now() / 1000);

					vis.binds["vis-shelly"].createWidget.customDevices(
						wid,
						view,
						data,
						vis.views[view].widgets[wid].style,
						true,
					);
				});
			},
			onSelectType: function (select, wid_attr) {
				const view = vis.activeView;
				const wid = vis.activeWidgets[0];
				vis.views[view].widgets[wid].data[wid_attr] = $(select).val();
				vis.views[view].widgets[wid].data.lastChange = Math.floor(Date.now() / 1000);
				const data = vis.views[view].widgets[wid].data;
				data.wid = wid;
				// vis.updateStates(vis.views[view].widgets[wid].data);
				// console.debug(vis);
				vis.binds["vis-shelly"].createWidget.customDevices(
					wid,
					view,
					data,
					vis.views[view].widgets[wid].style,
					true,
				);
			},
		},
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
				// console.debug("Update Name");
				// console.debug(optons);
				// console.debug(data);
				// console.debug(stageID);
				var name = null;
				var oname = null;
				var deviceID = stageID.match(/[.](.*).[0-9].[^.]*$/g)[1];
				$.each(data, (k, v) => {
					if (/[.]name$/g.test(k)) {
						// deviceID = k.match(/[.](.*).[0-9].name$/g)[1];
						name = v;
					} else if (/[.]overrideName$/g.test(k)) {
						// deviceID = k.match(/[.](.*).[0-9].overrideName$/g)[1];
						oname = v;
					}
				});
				if (name == null || typeof name != "object" || name.val == null || typeof name.val == "undefined") {
					name = { val: "" };
				}
				if (oname == null || typeof oname != "object" || oname.val == null || typeof oname.val == "undefined") {
					oname = { val: "" };
				}
				if (oname.val.length == 0 && name.val.length == 0 && typeof deviceID != "undefined") {
					oname.val = deviceID;
				}
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

			if (typeof typeConfig.dataPoint == "undefined") return false;
			let dataPoint = [];
			if (typeof val.relay != "undefined") {
				dataPoint[0] = typeConfig.dataPoint[val.relay];
			} else {
				dataPoint = typeConfig.dataPoint;
			}
			console.debug("TypeConfig");
			console.debug(typeConfig);
			console.debug("dataPoint");
			console.debug(dataPoint);
			$.each(dataPoint, (dpKey, dpVal) => {
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
