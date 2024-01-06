"use strict";

/*
 * Created with @ioBroker/create-adapter v1.21.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
class visShelly extends utils.Adapter {

	/**
	 * @param {Partial<ioBroker.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		// @ts-ignore
		super({
			...options,
			name: "vis-shelly"
		});
		this.on("ready", this.onReady.bind(this));
		this.on("objectChange", this.onObjectChange.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		this.setState("info.connection", false, true);
		await this.subscribeForeignObjectsAsync("shelly.*");
		await this.subscribeObjectsAsync("rooms.*");
		// Initialize your adapter here


		// await this.setForeignObjectAsync("vis-shelly.0", {
		// 	type: "meta",
		// 	common: {
		// 		"name": {
		// 		  "en": "Meta storage for user files1",
		// 		  "de": "Meta-Speicher für Benutzerdateien",
		// 		  "ru": "Meta Storage для файлов пользователей",
		// 		  "pt": "Meta de armazenamento para arquivos de usuário",
		// 		  "nl": "Meta opslag voor gebruikersbestanden",
		// 		  "fr": "Stockage Meta pour les fichiers utilisateur",
		// 		  "it": "Meta storage per i file utente",
		// 		  "es": "Meta almacenamiento para archivos de usuario",
		// 		  "pl": "Meta storage for user files",
		// 		  "uk": "Зберігання мета для файлів користувачів",
		// 		  "zh-cn": "用户档案的储存"
		// 		},
		// 		"type": "meta.user"
		// 	},
		// 	native: {},
		// });

		// this.log.info("config option1: " + this.config.option1);
		// this.log.info("config option2: " + this.config.option2);
		// await this.setObjectNotExistsAsync("rooms", {
		// 	type: "channel",
		// 	common: {
		// 		name: {
		// 			"en":"Rooms",
		// 			"de":"Räume"
		// 		}
		// 	},
		// 	native: {},
		// });
		this.updateDeviceList();
		this.setState("info.connection", true, true);

	}

	async updateDeviceList(){
		var shellyDevices = await this.getForeignObjectsAsync("shelly.*","device");
		var keysDevices=Object.keys(shellyDevices);	
	   	var devJSON=[];



		// "_id": "enum.rooms",
		// "type": "enum",
		// "common": {
		// 	"icon": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCI+DQogICAgPHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTIgNS42OWw1IDQuNVYxOGgtMnYtNkg5djZIN3YtNy44MWw1LTQuNU0xMiAzTDIgMTJoM3Y4aDZ2LTZoMnY2aDZ2LThoM0wxMiAzeiIvPg0KPC9zdmc+",
		// 	"name": {
		// 		"en": "Rooms",
		// 		"de": "Räume",
		// 		"ru": "Комнаты",
		// 		"pt": "Quartos",
		// 		"nl": "Kamers",
		// 		"fr": "Pièces",
		// 		"it": "Camere",
		// 		"es": "Habitaciones",
		// 		"pl": "Pokoje",
		// 		"uk": "Номери",
		// 		"zh-cn": "客房"
		// 	},
		// 	"desc": {
		// 		"en": "List of the rooms",
		// 		"de": "Liste der Räume",
		// 		"ru": "Список комнат",
		// 		"pt": "Lista dos quartos",
		// 		"nl": "Lijst met kamers",
		// 		"fr": "Liste des chambres",
		// 		"it": "Elenco delle stanze",
		// 		"es": "Lista de las habitaciones",
		// 		"pl": "Lista pokoi",
		// 		"uk": "Список номерів",
		// 		"zh-cn": "房间清单"
		// 	},
		// 	"members": [],
		// 	"dontDelete": true
		// },

		await this.setObjectNotExistsAsync("devices.ids", {
			type: "state",
			common: {
				name: "Shelly DeviceList",
				type: "array",
				role: "shelly.deviceList",
				read: true,
				write: true,
			},
			native: {},
		});
		
		for(let deviceID of keysDevices){
			await this.setObjectNotExistsAsync(deviceID, {
				type: 'device',
				common: {
					name: deviceID
				},
				native: {}
			});
			let deviceName=deviceID.substring(deviceID.lastIndexOf(".")+1,deviceID.length);

			await this.setObjectNotExistsAsync("devices."+deviceName, {
				type: "device",
				common: {
					name: deviceName
				},
				native: {},
			});				

			await this.setObjectNotExistsAsync("devices."+deviceName+".type", {
				type: "state",
				common: {
					name: deviceName+".type",
					type: "string",
					role: "name",
					read: true,
					write: true,
				},
				native: {},
			});

			let relayCount=1;
			let typeState=await this.getForeignStateAsync(deviceID+".type");
			if(typeState!=null){
				this.setState("devices."+deviceName+".type", { val: typeState.val, ack: true });
				devJSON.push({"stateId":deviceID,"id":deviceName,"type":typeState.val});
				if(typeState.val=="shellyplus2pm")relayCount=2
			}

			for(let i=0;i<relayCount;i++){

				await this.setObjectNotExistsAsync("devices."+deviceName+"."+i, {
					type: "device",
					common: {
						name: "Device Realay "+deviceName
					},
					native: {},
				});	
				this.setObjectNotExists("devices."+deviceName+"."+i+".overrideName", {
					type: "state",
					common: {
						name: deviceName+".overrideName",
						type: "string",
						role: "name",
						read: true,
						write: true,
					},
					native: {},
				},()=>{});	
			}
		}	
        await this.setStateAsync("devices.ids", { val: JSON.stringify(devJSON), ack: true });
		this.log.info("Devices updated");
	}

	async updateRoomsList(){
		var roomList = await this.getStatesOfAsync("","rooms");
		var shellyDevices = await this.getObjectViewAsync("system","device",{startkey:`vis-shelly.${this.instance}.devices.`,endkey:`vis-shelly.${this.instance}.devices.\u9999`});
		// this.log.info(JSON.stringify(roomList));
		// this.log.info(JSON.stringify(shellyDevices));
		let roomEnum={};
		for(let roomKey of Object.keys(roomList)){
			let room=roomList[roomKey];
			roomEnum[room._id]=room.common.name;
		}
		for(let devKey of Object.keys(shellyDevices.rows)){
			let dev=shellyDevices.rows[devKey];
			
			let devName = [...dev.id.matchAll(/[.]([^.]*[.][0-9]*)$/g)];
			this.log.info(JSON.stringify(devName))
			if(devName.length==0)continue;
			// String(dev.id).substring(String(dev.id).lastIndexOf(".")+1);
			// @ts-ignore
			this.setObjectAsync("devices."+devName[0][1]+".room", {
				type: "state",
				common: {
					name: "room",
					type: "multistate",
					role: "name",
					read: true,
					write: true,
					"states":roomEnum
				},
				native: {},
			});

		}

		this.setObjectAsync("devices.roomIds", {
			type: "state",
			common: {
				name: "room",
				type: "array",
				role: "name",
				read: true,
				write: false
			},
			native: {},
		});
        await this.setStateAsync("devices.roomIds", { val: JSON.stringify(roomEnum), ack: true });

		
	}
	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			this.setState("info.connection", false, true);
			this.log.info("cleaned everything up...");
			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed object changes
	 * @param {string} id
	 * @param {ioBroker.Object | null | undefined} obj
	 */
	onObjectChange(id, obj) {
		// this.log.info(id);
		// this.log.info(JSON.stringify(obj));

		if(id.indexOf("vis-shelly")>-1){
			if(id.indexOf(".rooms.")>-1){
				this.updateRoomsList();
			}
		}else{
			if (obj) {
				if(obj.type=="device")this.updateDeviceList();
			}
		}
	}

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	createAndSetStateIfExists(foreignID,selfID,name,role) {
		this.getForeignState(foreignID,(err,state)=>{
			if((typeof state.val!="undefined")){		
				this.setObjectNotExists(selfID, {
					type: "state",
					common: {
						name: name,
						type: "string",
						role: role,
						read: true,
						write: true,
					},
					native: {},
				},()=>{
					this.setState(selfID, { val: foreignID, ack: true });
				});
			}
		});
	}

	createAndSetState(foreignID,selfID,name,role) {	
		this.setObjectNotExists(selfID, {
			type: "state",
			common: {
				name: name,
				type: "string",
				role: role,
				read: true,
				write: true,
			},
			native: {},
		},()=>{
			this.setState(selfID, { val: foreignID, ack: true });
		});
	}

	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.message" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<ioBroker.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new visShelly(options);
} else {
	// otherwise start the instance directly
	new visShelly();
}