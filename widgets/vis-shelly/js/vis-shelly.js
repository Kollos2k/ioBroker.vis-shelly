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

const moveDirectionVS = {
	up: 0,
	down: 1,
};

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
			console.debug(vis);
			var $div = $("#" + widgetID);
			if (!$div.length) {
				return setTimeout(function () {
					vis.binds["vis-shelly"].createWidget.customDevices(widgetID, view, widData, style);
				}, 100);
			}
			vis.binds["vis-shelly"].createDevice_helper.setBasicWidgetOptions($div, widData);
			// console.debug("CUSTOM THIS");
			// console.debug(this);
			// vis.states.bind(vis.activeView, function (e, newVal, oldVal) {
			// 	if (newVal != oldVal)
			// 		updateWidget();
			// });

			// console.debug("CUSTOM WID DATA");
			// console.debug(widData);
			for (let count = 1; count <= widData.iUniversalDeviceCount; count++) {
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
						id: widData["deviceID" + count].match(/([^.]*)$/g)[0],
						relay: widData["deviceRelayNumber" + count],
					};
					// console.debug("CUSTOM FOR EACH DEVICE");
					// console.debug(widData["deviceID" + count]);
					// console.debug(v);
					// console.debug(widData["deviceID" + count].match(/([^.]*)$/g));
					const ret = vis.binds["vis-shelly"].createDevice_helper.buildDevice(v, widgetID, widData);
					// console.error(ret.dom[0]);
					// $(ret.dom).append("<button>test</button>");
					// console.error(ret.domid[0]);
					if (vis.editMode) {
						const $l = $("#" + widgetID).find("#" + ret.domid[0]);
						// console.error($l.length);
						if (count > 1) {
							const $bUp = $("<button class='editModeMoveButton' style='top: 0px;'>up</button>");
							$bUp.click((e) => {
								vis.binds["vis-shelly"].visEditor.customDevices.moveDevicePosition(
									widgetID,
									view,
									widData,
									count,
									moveDirectionVS.up,
									style,
								);
								// vis.reRenderWidgetEdit($(".vis-view"), view, widgetID);
								// e.preventDefault();
								// e.stopPropagation();
								// return false;
							});
							$l.append($bUp);
						}
						if (count < widData.iUniversalDeviceCount) {
							const $bDown = $("<button class='editModeMoveButton' style='bottom: 0px;'>down</button>");
							$bDown.click((e) => {
								vis.binds["vis-shelly"].visEditor.customDevices.moveDevicePosition(
									widgetID,
									view,
									widData,
									count,
									moveDirectionVS.down,
									style,
								);
							});
							$l.append($bDown);
						}
					}
				}
			}
			// console.debug(vis);
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
			// roomID = vis.views[view].widgets[widgetID].data.roomid;
			// roomID = vis.widgets[widgetID].data.roomid;
			roomID = widData["roomid"];
			if (typeof roomID != "undefined" && roomID.length > 0) {
				vis.conn.getStates(["vis-shelly.0.devices.ids"], (error, data) => {
					const deviceIDs = JSON.parse(data["vis-shelly.0.devices.ids"].val);
					$.each(deviceIDs, (k, v) => {
						// console.error(v);
						vis.binds["vis-shelly"].createDevice_helper.buildDevice(v, widgetID, widData, roomID);
					});
				});
			}
		},
		allDevices: function (widgetID, view, widData, style) {
			var $div = $("#" + widgetID);
			if (!$div.length) {
				return setTimeout(function () {
					vis.binds["vis-shelly"].createWidget.allDevices(widgetID, view, widData, style);
				}, 100);
			}
			vis.binds["vis-shelly"].createDevice_helper.setBasicWidgetOptions($div, widData);
			// console.log("VIS");
			// console.log(vis);
			// console.log("WID DATA");
			// console.log(widData);
			// console.log("VIEW");
			// console.log(view);
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

	updateDeviceValue: function (widgetID, deviceDomID, typeConfig, sType, sID, newVal = undefined, dataPoint = {}) {
		if (typeof typeConfig.update == "undefined") return false;
		if (typeof typeConfig.update[sType] == "undefined") return false;
		const configUpdate = typeConfig.update[sType];
		const $domDev = $("#" + widgetID).find("#" + deviceDomID);
		if ($domDev.length == 0) return false;
		const $dom = $domDev.find("[name='" + configUpdate.name + "']");
		if ($dom.length == 0) return false;

		var data = $domDev.data("data");
		if (typeof data != "undefined") {
			if (typeof data[sID] == "undefined" || data[sID] == null) data[sID] = { val: "" };
			if (typeof newVal == "undefined") {
				newVal = data[sID].val;
			} else {
				if (typeof newVal == "object") data[sID] = newVal;
				else data[sID].val = newVal;
				if (typeof newVal == "object") newVal = newVal.val;
				$domDev.data("data", data);
			}
			configUpdate.updateValue($dom, newVal, configUpdate, data, sID, dataPoint);
		}
	},
	updateDeviceAck: function (widgetID, deviceDomID, typeConfig, sType, sID, newVal) {
		if (typeof typeConfig.update == "undefined") return false;
		if (typeof typeConfig.update[sType] == "undefined") return false;
		const configUpdate = typeConfig.update[sType];
		const $domDev = $("#" + widgetID).find("#" + deviceDomID);
		if ($domDev.length == 0) return false;
		const $dom = $domDev.find("[name='" + configUpdate.name + "']");
		if ($dom.length == 0) return false;

		var data = $domDev.data("data");
		if (typeof data != "undefined") {
			if (typeof data[sID] == "undefined" || data[sID] == null) data[sID] = { ack: false };
			if (typeof newVal == "undefined") {
				// newVal = data[sID].ack;
			} else {
				if (typeof newVal == "object") data[sID] = newVal;
				else data[sID].ack = newVal;
				// if (typeof newVal == "object") newVal = newVal.ack;
				$domDev.data("data", data);
			}
			configUpdate.updateAck($dom, sID, data);
		}
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
	roomIdFilter: function (wid_attr, options) {
		// console.error(options);
		return { input: `<input type='text' id='inspect_${wid_attr}'/>` };
	},
	visEditor: {
		roomDevices: {
			getRoomSelect: function (wid_attr, options) {
				// const view = vis.activeView;
				// const wid = vis.activeWidgets[0];
				// const curValue = vis.views[view].widgets[wid].data[wid_attr];

				// setTimeout(() => {
				// 	vis.conn.getStates(["vis-shelly.0.devices.roomIds"], (error, data) => {
				// 		const roomObj = JSON.parse(data["vis-shelly.0.devices.roomIds"].val);
				// 		const select = $("#" + `inspect_${wid_attr}`);
				// 		select.empty();
				// 		select.append("<option value=''>--Please Choose an Room--</option>");
				// 		$.each(roomObj, (k, v) => {
				// 			select.append(`<option value="${k}" ${k == curValue ? "selected" : ""}>${v}</option>`);
				// 		});
				// 	});
				// }, 200);
				// let inputTxt = `<select id="inspect_${wid_attr}" onchange='vis.binds["vis-shelly"].visEditor.roomDevices.selectRoomID(this, "${wid_attr}");'>`;
				// inputTxt += "<option value=''>--Please Choose an Room--</option>";
				// inputTxt += "</select>";
				return {
					input: `<select id="inspect_${wid_attr}" onchange='vis.binds["vis-shelly"].visEditor.roomDevices.selectRoomID(this, "${wid_attr}");'>`,
					init: function (_wid_attr, data) {
						const view = vis.activeView;
						const wid = vis.activeWidgets[0];
						// console.error(wid);
						const curValue = vis.views[view].widgets[wid].data[_wid_attr];
						const select = $("#" + `inspect_${_wid_attr}`);
						select.empty();
						select.append("<option value=''>--Please Choose an Room--1</option>");
						vis.conn.getStates(["vis-shelly.0.devices.roomIds"], (error, data) => {
							const roomObj = JSON.parse(data["vis-shelly.0.devices.roomIds"].val);
							$.each(roomObj, (k, v) => {
								select.append(`<option value="${k}" ${k == curValue ? "selected" : ""}>${v}</option>`);
							});
						});
					},
				};
			},
			selectRoomID: function (select, wid_attr) {
				// if (vis.binds["vis-shelly"].visEditor.roomDevices.stopOnClick == true) return;
				// console.error("SET VALUE: " + $(select).val());
				// console.error($(select).data());
				const view = vis.activeView;
				const wid = vis.activeWidgets[0];
				// console.error(this);
				// vis.binds["vis-shelly"].visEditor.roomDevices.stopOnClick = true;
				// $(select).trigger("change", $(select).val());
				// vis.binds["vis-shelly"].visEditor.roomDevices.stopOnClick = false;
				vis.views[vis.activeView].widgets[wid].data[wid_attr] = $(select).val();
				// vis.setValue(wid_attr, $(select).val());
				// vis.widgets[wid].data["roomid"] = $(select).val();
				// vis.setAttrValue(view, wid, wid_attr, false, $(select).val());
				// console.debug("SET ROOM");
				// console.debug(vis.widgets[wid].data._getAttrs());
				// vis.widgets[wid].data.attr(wid_attr, $(select).val());
				const data = vis.views[view].widgets[wid].data;
				vis.binds["vis-shelly"].createWidget.roomDevices(wid, view, data, vis.views[view].widgets[wid].style);
			},
		},
		customDevices: {
			getDeviceSelect: function (wid_attr, options) {
				const view = vis.activeView;
				const wid = vis.activeWidgets[0];
				// vis.views[view].widgets[wid].data.roomid=1;
				// console.debug(vis.views[view].widgets[wid]);
				const curValue = vis.views[view].widgets[wid].data[wid_attr];

				setTimeout(() => {
					vis.conn.getStates([`vis-shelly.0.devices.ids`], (error, data) => {
						const deviceIDs = JSON.parse(data["vis-shelly.0.devices.ids"].val);
						const select = $("#" + wid + "_" + wid_attr);
						select.empty();
						select.append("<option value=''>--Please Choose an Device--</option>");
						$.each(deviceIDs, (k, v) => {
							// console.debug(v);
							select.append(
								`<option value="${v.stateId}" ${v.stateId == curValue ? "selected" : ""}>${
									vis.states[`vis-shelly.0.devices.${v.id}.0.name.val`]
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
				// console.error(curValue);
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
				// vis.setAttrValue(view, wid, wid_attr, false, $(select).val());
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

			/*
			 * Moves the Device up or down
			 * @param {Object} widgetID "the WidgetID from Widget"
			 * @param {String} view
			 * @param {Object} widData
			 * @param {Integer} curPosition
			 * @param {moveDirectionVS} direction "up or down"
			 */
			moveDevicePosition: function (widgetID, view, widData, curPosition, direction, style) {
				// console.debug(widData);
				const nextPosition = direction == moveDirectionVS.down ? curPosition + 1 : curPosition - 1;
				if (nextPosition == 0 || nextPosition > Number(widData.iUniversalDeviceCount)) {
					return false;
				}
				const attrs = ["deviceID", "deviceRelayNumber", "deviceType"];
				const data = { ...widData };
				for (const attr of attrs) {
					// vis.views[view].widgets[widgetID].data[`${attr}${nextPosition}`] = data[`${attr}${curPosition}`];
					// vis.views[view].widgets[widgetID].data[`${attr}${curPosition}`] = data[`${attr}${nextPosition}`];
					// 	vis.widgets[widgetID].data[`${attr}${curPosition}`] =
					// 	vis.views[view].widgets[widgetID].data[`${attr}${nextPosition}`];
					// vis.widgets[widgetID].data[`${attr}${nextPosition}`] =
					// 	vis.views[view].widgets[widgetID].data[`${attr}${curPosition}`];
					vis.widgets[widgetID].data[`${attr}${curPosition}`] = data[`${attr}${nextPosition}`];
					vis.widgets[widgetID].data[`${attr}${nextPosition}`] = data[`${attr}${curPosition}`];
					vis.views[view].widgets[widgetID].data[`${attr}${nextPosition}`] = data[`${attr}${curPosition}`];
					vis.views[view].widgets[widgetID].data[`${attr}${curPosition}`] = data[`${attr}${nextPosition}`];
				}
				vis.save($("#visview_" + view), view, () => {
					vis.reRenderWidgetEdit(vis.activeViewDiv, vis.activeView, widgetID);
				});

				// console.error(vis);
				vis.binds["vis-shelly"].createWidget.customDevices(widgetID, view, vis.widgets[widgetID].data, style);
				$("#vis_container").trigger("click");
				// console.log("VIS VIEW");
				// console.log($("#visview_" + view));
				$("#" + widgetID).trigger("click");
				$("#visview_" + view).trigger("click");
				$("#" + widgetID).trigger("click");
			},
		},
	},
	createDevice_helper: {
		/** TYPE DECLARATIONS */
		getDeviceConfigByType: function (type, domID, val, vsID) {
			var typeConfig = {};
			// const switchButton = `<svg name='svgShellyButton' viewBox="0 0 100 100" width="60" preserveAspectRatio="xMidYMid meet"><use xlink:href="#svgShellyButton" href="#svgShellyButton"></use></svg>`;
			const switchButton = `<object name='svgShellyButton' type="image/svg+xml" data="/vis/widgets/vis-shelly/images/shellySwitchButton.svg"></object>`;
			// const switchTRVButton = `<img src="/vis/widgets/vis-shelly/images/shellyTRVButton.svg" style="margin-top:5px;margin-right: 3px;width:135px;"/>`;
			const switchTRVButton = `<object name='svgShellyTRVButton' type="image/svg+xml" data="/vis/widgets/vis-shelly/images/shellyTRVButton.svg" style="margin:5px;width:125px;"></object>`;
			// const switchTRVButton = `<svg name='svgShellyTRVButton' viewBox="0 0 226.67 90.04" width="130" style="margin-top:5px;margin-right: 3px;" preserveAspectRatio="xMidYMid meet"><use name='svgShellyTRVBorder' xlink:href="#svgShellyTRVBorder" href="#svgShellyTRVBorder"></use><use xlink:href="#svgShellyTRVButton" href="#svgShellyTRVButton"></use></svg>`;
			// const switchTRVBorder = `<svg name='svgShellyTRVBorder' viewBox="0 0 226.67 90.04" width="130" style="margin-top:5px;margin-right: 3px;" preserveAspectRatio="xMidYMid meet"><use xlink:href="#svgShellyTRVBorder" href="#svgShellyTRVBorder"></use></svg>`;
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
								updateAck: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateSwitchAck,
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateSwitch,
							},
						},
						view: {
							info: {
								power: { name: "power", class: "icon", html: "" },
								brightness: { name: "brightness", class: "icon", html: "" },
							},
							action: {
								switch: { name: "switch", style: "width: 70px;", class: "", html: switchButton },
							},
						},
						action: {
							switch: {
								name: "switch",
								x: "0px",
								y: "0px",
								w: "100%",
								h: "100%",
								dataPoint: "switch",
								click: vis.binds["vis-shelly"].createDevice_helper.actions.basicActionBooleanToggle,
							},
						},
						dataPoint: {
							0: {
								power: val.stateId + ".lights.Power",
								switch: val.stateId + ".lights.Switch",
								brightness: val.stateId + ".lights.brightness",
								name: vsID + ".0.name",
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
								updateAck: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateSwitchAck,
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateSwitch,
							},
						},
						view: {
							info: { power: { name: "power", class: "icon", html: "" } },
							action: {
								switch: { name: "switch", style: "width: 70px;", class: "", html: switchButton },
							},
						},
						action: {
							switch: {
								name: "switch",
								x: "0px",
								y: "0px",
								w: "100%",
								h: "100%",
								dataPoint: "switch",
								click: vis.binds["vis-shelly"].createDevice_helper.actions.basicActionBooleanToggle,
							},
						},
						dataPoint: {
							0: {
								power: val.stateId + ".Relay0.Power",
								switch: val.stateId + ".Relay0.Switch",
								name: vsID + ".0.name",
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
								updateAck: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateSwitchAck,
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateSwitch,
							},
						},
						view: {
							info: {
								power: { name: "power", class: "icon", html: "" },
								voltage: { name: "voltage", class: "icon", html: "" },
							},
							action: {
								switch: { name: "switch", style: "width: 70px;", class: "", html: switchButton },
							},
						},
						action: {
							switch: {
								name: "switch",
								x: "0px",
								y: "0px",
								w: "100%",
								h: "100%",
								dataPoint: "switch",
								click: vis.binds["vis-shelly"].createDevice_helper.actions.basicActionBooleanToggle,
							},
						},
						dataPoint: {
							0: {
								power: val.stateId + ".Relay0.Power",
								switch: val.stateId + ".Relay0.Switch",
								voltage: val.stateId + ".Relay0.Voltage",
								name: vsID + ".0.name",
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
								updateAck: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateSwitchAck,
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateSwitch,
							},
						},
						view: {
							info: {
								power: { name: "power", class: "icon", html: "" },
								voltage: { name: "voltage", class: "icon", html: "" },
							},
							action: {
								switch: { name: "switch", style: "width: 70px;", class: "", html: switchButton },
							},
						},
						action: {
							switch: {
								name: "switch",
								x: "0px",
								y: "0px",
								w: "100%",
								h: "100%",
								dataPoint: "switch",
								click: vis.binds["vis-shelly"].createDevice_helper.actions.basicActionBooleanToggle,
							},
						},
						dataPoint: {
							0: {
								power: val.stateId + ".Relay0.Power",
								switch: val.stateId + ".Relay0.Switch",
								voltage: val.stateId + ".Relay0.Voltage",
								name: vsID + ".0.name",
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
								updateAck: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateSwitchAck,
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateSwitch,
							},
						},
						view: {
							info: {
								power: { name: "power", class: "icon", html: "" },
								voltage: { name: "voltage", class: "icon", html: "" },
							},
							action: {
								switch: { name: "switch", style: "width: 70px;", class: "", html: switchButton },
							},
						},
						action: {
							switch: {
								name: "switch",
								x: "0px",
								y: "0px",
								w: "100%",
								h: "100%",
								dataPoint: "switch",
								click: vis.binds["vis-shelly"].createDevice_helper.actions.basicActionBooleanToggle,
							},
						},
						dataPoint: {
							0: {
								power: val.stateId + ".Relay0.Power",
								switch: val.stateId + ".Relay0.Switch",
								voltage: val.stateId + ".Relay0.Voltage",
								name: vsID + ".0.name",
								room: vsID + ".0.room",
								deviceID: val.id,
							},
							1: {
								power: val.stateId + ".Relay1.Power",
								switch: val.stateId + ".Relay1.Switch",
								voltage: val.stateId + ".Relay1.Voltage",
								name: vsID + ".1.name",
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
							action: {
								temperature: {
									name: "temperature",
									style: "width: 70px;",
									class: "temperature",
									html: "",
								},
							},
						},
						dataPoint: {
							0: {
								temperature: val.stateId + ".Temperature0.Celsius",
								humidity: val.stateId + ".Humidity0.Relative",
								externalPower: val.stateId + ".DevicePower0.ExternalPower",
								batteryPercent: val.stateId + ".DevicePower0.BatteryPercent",
								// name: val.stateId + ".name",
								name: vsID + ".0.name",
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
							temperatureTarget: {
								name: "temperatureTarget",
								unit: "°C",
								updateAck: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateTRVAck,
								updateValue: vis.binds["vis-shelly"].createDevice_helper.actions.basicUpdateValueUnit,
							},
						},
						view: {
							info: {
								temperature: { name: "temperature", class: "icon", html: "" },
								valvePosition: { name: "valvePosition", class: "icon", html: "" },
								devicePower: { name: "devicePower", class: "icon", html: "" },
							},
							action: {
								temperatureTarget: {
									name: "temperatureTarget",
									style: "",
									class: "TRVValue",
									html: "",
								},
								buttons: {
									name: "buttons",
									style: "width: 135px;",
									class: "TRVButton",
									html: switchTRVButton,
								},
							},
						},
						action: {
							down: {
								name: "buttons",
								x: "5px",
								y: "5px",
								w: "45px",
								h: "50px",
								minValue: 15,
								maxValue: 30,
								step: -0.5,
								dataPoint: "temperatureTarget",
								click: vis.binds["vis-shelly"].createDevice_helper.actions.basicActionNumberStepper,
							},
							up: {
								name: "buttons",
								x: "85px",
								y: "5px",
								w: "45px",
								h: "50px",
								minValue: 15,
								maxValue: 30,
								step: +0.5,
								dataPoint: "temperatureTarget",
								onClick: {
									find: `[name='svgShellyTRVButton']`,
									contentDocument: true,
									className: "animatedAction",
								},
								click: vis.binds["vis-shelly"].createDevice_helper.actions.basicActionNumberStepper,
							},
						},
						dataPoint: {
							0: {
								temperature: val.stateId + ".tmp.temperatureC",
								temperatureTarget: val.stateId + ".tmp.temperatureTargetC",
								valvePosition: val.stateId + ".tmp.valvePosition",
								externalPower: val.stateId + ".bat.charger",
								batteryPercent: val.stateId + ".bat.value",
								name: vsID + ".0.name",
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
							action: { motion: { name: "motion", style: "width: 70px;", class: "", html: "" } },
						},
						dataPoint: {
							0: {
								temperature: val.stateId + ".sensor.temperatureC",
								motion: val.stateId + ".sensor.motion",
								lux: val.stateId + ".sensor.lux",
								batteryPercent: val.stateId + ".sensor.battery",
								name: vsID + ".0.name",
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
				$dom.html(newVal);
				if (vis.editMode) {
					$dom.prop("title", newVal);
				}
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
			basicUpdateDevicePower: function ($dom, newVal, options = {}, data = {}, stageID = "", curDataPoint = {}) {
				// console.log("update external");
				var exP = null;
				var percent = null;

				$.each(data, (k, v) => {
					if (typeof curDataPoint.externalPower != "undefined" && curDataPoint.externalPower == k) exP = v;
					else if (typeof curDataPoint.batteryPercent != "undefined" && curDataPoint.batteryPercent == k)
						percent = v;
				});
				$dom.removeClass("externalPower");
				$dom.removeClass("battery");
				if (exP != null && typeof exP == "object" && exP.val == true) {
					$dom.addClass("externalPower");
					$dom.html("Energie");
				} else {
					$dom.addClass("battery");
					$dom.html((percent == null || typeof percent != "object" ? percent : percent.val) + " %");
				}
			},
			basicUpdateTRVAck: function ($dom, stateID, data) {
				let element;
				if ($dom.find("[name='svgShellyTRVButton']").length > 0) {
					element = $dom.find("[name='svgShellyTRVButton']").get(0).contentDocument.firstChild;
				} else {
					element = $dom.get(0);
				}
				if (data[stateID].ack == true) {
					element.classList.remove("animatedAction");
				} else {
					element.classList.add("animatedAction");
				}
			},
			basicUpdateSwitchAck: function ($dom, stateID, data) {
				let element;
				if ($dom.find("[name='svgShellyButton']").length > 0) {
					element = $dom.find("[name='svgShellyButton']").get(0).contentDocument.firstChild;
				} else {
					element = $dom.get(0);
				}
				if (data[stateID].ack == true) {
					element.classList.remove("animatedAction");
				} else {
					element.classList.add("animatedAction");
				}
			},
			basicUpdateSwitch: function ($dom, newVal, options = {}, data = {}, stateID = "") {
				// console.error(data);
				let element;
				if ($dom.find("[name='svgShellyButton']").length > 0) {
					element = $dom.find("[name='svgShellyButton']").get(0).contentDocument.firstChild;
				} else {
					element = $dom.get(0);
				}
				if (data[stateID].val == true) {
					element.classList.add("active");
				} else {
					element.classList.remove("active");
				}
			},
			basicActionNumberStepper: function (stateID, $mainDOM, action) {
				// if (typeof action.onClick != "undefined") {
				// 	let element = undefined;
				// 	if (typeof action.onClick.find != "undefined") {
				// 		element = $mainDOM.find(action.onClick.find).get(0);
				// 	}
				// 	if (action.onClick.contentDocument == true) {
				// 		element = element.contentDocument.firstChild;
				// 	}
				// 	console.debug(element);
				// 	element.classList.add(action.onClick.className);
				// }
				// const $border = $mainDOM.find(`#radialGradient881`);
				// const $border2 = document.getElementById("testid");
				// console.debug($border2.contentDocument);
				// console.debug($border2.contentDocument.getElementById("radialGradient8811"));
				//$border2.contentDocument.getElementById("radialGradient8811").style.setProperty("--test", "#44f");
				// $border2.contentDocument.getElementsByTagName("svg")[0].classList.add("animate");
				// console.debug($mainDOM);
				// console.debug("length:" + $border.length);
				// console.debug($border2);
				// $border.prop("class", "trvOuterBorderAction");
				const data = $mainDOM.data("data");
				let newVal =
					typeof data[stateID] == "undefined" || data[stateID] == null ? action.minValue : data[stateID].val;
				newVal += action.step;
				if (newVal < action.minValue) newVal = action.minValue;
				if (newVal > action.maxValue) newVal = action.maxValue;
				// if (data[stateID].ack)
				vis.conn.setState(stateID, { val: newVal, ack: false });
			},
			basicActionBooleanToggle: function (stateID, $mainDOM, action) {
				const data = $mainDOM.data("data");
				const newVal =
					typeof data[stateID] != "undefined"
						? data[stateID] == null
							? true
							: data[stateID].val == true
								? false
								: true
						: false;
				if (data[stateID].ack == true) vis.conn.setState(stateID, { val: newVal, ack: false });
			},
		},
		buildDevice: function (val, widgetID, widData, roomID = null) {
			// console.debug(vis);
			const ret = { dom: $(), domid: [] };
			// ret.dom=${""}
			const vsID = "vis-shelly.0.devices." + val.id;
			const domID = val.id.replaceAll("#", "");
			let typeConfig = {};
			typeConfig = vis.binds["vis-shelly"].createDevice_helper.getDeviceConfigByType(val.type, domID, val, vsID);

			if (typeof typeConfig.dataPoint == "undefined") return false;
			let dataPoint = [];
			if (typeof val.relay != "undefined") {
				dataPoint = { [val.relay]: typeConfig.dataPoint[val.relay] };
			} else {
				dataPoint = typeConfig.dataPoint;
			}
			// console.debug("TypeConfig");
			// console.debug(typeConfig);
			// console.debug("dataPoint");
			// console.debug(dataPoint);
			$.each(dataPoint, (dpKey, dpVal) => {
				vis.conn.subscribe(Object.values(dpVal));
				var deviceDomID = typeConfig.domID + dpKey;
				ret.domid.push(deviceDomID);
				let text = `<div id="${deviceDomID}" class="vis-shelly_DeviceBody" title="${val.stateId}" style="width:${widData.deviceWidth};">`;
				text += `<span name="status"><span><span class="connectionState connectionStateOnline"></span></span></span>`;
				text += `<span name="icon"></span>`;
				text += `<span name="name">${val.id}</span>`;
				text += `<span name="info">`;
				$.each(typeConfig.view.info, (viewKey, viewValue) => {
					text += `<span><span name="${viewValue.name}" class="${viewValue.class}" style="${viewValue.style}">${viewValue.html}</span></span>`;
				});

				text += `</span>`;
				text += `<span name="action">`;
				$.each(typeConfig.view.action, (viewKey, viewValue) => {
					// text += `<span><span name="${viewValue.name}" class="${viewValue.class}" style="${viewValue.style}">${viewValue.html}</span></span>`;
					text += `<span name="${viewValue.name}" class="${viewValue.class}" style="${viewValue.style}">${viewValue.html}</span>`;
				});
				// if(typeof dpVal.switch!="undefined"){text+=`<span name="switch" curState="false"></span>`;}
				// if(typeof dpVal.temperature!="undefined"){text+=`<span name="temperature"></span>`;}
				text += `</span>`;
				const $domBody = $("<div>");
				if (roomID != null) $domBody.css("display", "none");
				const $domObj = $(text);
				$domBody.append($domObj);
				// ret.dom.push(domObj);
				ret.dom = ret.dom.add($domObj);
				$("#" + widgetID).append($domBody);
				// const $domDev = $("#" + widgetID).find("#" + deviceDomID);
				if (typeof typeConfig["action"] != "undefined") {
					$.each(typeConfig.action, (k, action) => {
						const $aDom = $domObj.find("[name='" + action.name + "']");
						if (typeof action.click == "function") {
							const $actionDom = $(
								`<div class="actionButton" style="top:${action.y};left:${action.x};width:${action.w};height:${action.h}"></div>`,
							);
							$aDom.append($actionDom);
							$actionDom.click(() => {
								action.click(dpVal[action.dataPoint], $domObj, action);
							});
						}
					});
				}
				vis.conn.getStates(Object.values(dpVal), (error, data) => {
					// console.log("data");
					// console.log(data);
					if (roomID != null) {
						if (roomID.length == 0) return false;
						if (data[dpVal.room] == null || data[dpVal.room].val != roomID) {
							return true;
						}
					}
					$domBody.css("display", "block");
					$domObj.data("data", data);

					$.each(dpVal, (sType, sID) => {
						if (typeof data[sID] != "undefined") {
							vis.binds["vis-shelly"].updateDeviceValue(
								widgetID,
								deviceDomID,
								typeConfig,
								sType,
								sID,
								undefined,
								dpVal,
							);
							vis.states.bind(sID + ".val", (e, newVal, oldVal) => {
								vis.binds["vis-shelly"].updateDeviceValue(
									widgetID,
									deviceDomID,
									typeConfig,
									sType,
									sID,
									newVal,
									dpVal,
								);
							});
							// console.debug(typeConfig.update[sType]);
							if (
								typeof typeConfig.update[sType] != "undefined" &&
								typeof typeConfig.update[sType].updateAck != "undefined"
							) {
								vis.states.bind(sID + ".ack", (e, newVal, oldVal) => {
									// console.debug("ACK");
									// console.debug(newVal);
									vis.binds["vis-shelly"].updateDeviceAck(
										widgetID,
										deviceDomID,
										typeConfig,
										sType,
										sID,
										newVal,
									);
								});
							}
						} else {
							/* empty */
						}
					});
				});
			});
			return ret;
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
