"use strict";

/*
 * Created with @iobroker/create-adapter v2.6.2
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");

// Load your modules here, e.g.:
// const fs = require("fs");

class visShelly extends utils.Adapter {
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "vis-shelly",
		});
		this.isUnloaded = false;
		this.on("ready", this.onReady.bind(this));
		this.on("objectChange", this.onObjectChange.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
		this.setState("info.connection", false, true);
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		if (typeof this.config["knownShellyIDs"] == "undefined") this.config["knownShellyIDs"] = {};
		await this.subscribeForeignObjectsAsync("shelly.*");
		// await this.subscribeObjectsAsync("rooms.*");
		this.updateDeviceList(true);
		this.updateRoomsList();
		this.setState("info.connection", true, true);
	}

	async updateDeviceList(forceUpdate = false) {
		const shellyDevices = await this.getForeignObjectsAsync("shelly.*", "device");
		const keysDevices = Object.keys(shellyDevices);
		let devJSON = [];
		let changeDeviceIds = false;

		await this.setObjectNotExistsAsync("devices.ids", {
			type: "state",
			common: {
				name: "Shelly DeviceList",
				type: "array",
				role: "shelly.deviceList",
				read: true,
				write: true,
				def: "[]",
			},
			native: {},
		});
		if (!forceUpdate) {
			const devIdsState = await this.getStateAsync("devices.ids");
			if (typeof devIdsState === "string") devJSON = JSON.parse(devIdsState);
			if (!Array.isArray(devJSON)) devJSON = [];
		} else {
			this.config["knownShellyIDs"] = {};
		}
		for (const deviceID of keysDevices) {
			if (await this.updateDevice(deviceID, devJSON, forceUpdate)) changeDeviceIds = true;
		}
		if (changeDeviceIds) await this.setStateAsync("devices.ids", { val: JSON.stringify(devJSON), ack: true });
		this.log.info(`Devices updated (Force:${forceUpdate ? "yes" : "no"})`);
	}
	async updateDevice(deviceID, devJSON, forceUpdate) {
		let changeDeviceIds = false;
		const deviceName = deviceID.substring(deviceID.lastIndexOf(".") + 1, deviceID.length);

		const existDev = await this.getStatesAsync(`devices.${deviceName}`);
		if (typeof existDev === "undefined" || forceUpdate) {
			await this.setObjectNotExistsAsync("devices." + deviceName, {
				type: "device",
				common: {
					name: deviceName,
				},
				native: {},
			});
			/** Create DEVICE TYPE */
			await this.setObjectNotExistsAsync("devices." + deviceName + ".type", {
				type: "state",
				common: {
					name: deviceName + ".type",
					type: "string",
					role: "name",
					read: true,
					write: true,
				},
				native: {},
			});

			/** GET RELAY COUNT example: plus2pm with more than 1 relay */
			let relayCount = 1;
			const typeState = await this.getForeignStateAsync(deviceID + ".type");
			if (typeState != null) {
				this.setState("devices." + deviceName + ".type", { val: typeState.val, ack: true });
				devJSON.push({ stateId: deviceID, id: deviceName, type: typeState.val });
				this.config["knownShellyIDs"][deviceID] = true;
				changeDeviceIds = true;
				if (typeState.val == "shellyplus2pm") relayCount = 2;
			}
			/** CREATE vis-shelly DEVICE FROM shelly OBJECTS*/
			for (let i = 0; i < relayCount; i++) {
				await this.setObjectNotExistsAsync("devices." + deviceName + "." + i, {
					type: "device",
					common: {
						name: "Device Realay " + deviceName,
					},
					native: {},
				});
				/** Set Name */
				this.setObjectNotExists(
					"devices." + deviceName + "." + i + ".name",
					{
						type: "state",
						common: {
							name: deviceName + ".name",
							type: "string",
							role: "name",
							read: true,
							write: true,
							def: null,
						},
						native: {},
					},
					() => {
						/* Update default Name */
						this.getState(`devices.${deviceName}.${i}.name`, (err, state) => {
							if (state == null) {
								this.getForeignState(deviceID + ".name", (err, state) => {
									let newName = "";
									if (state == null || state.val == null || state.val == "") newName = deviceName;
									else newName = state.val.toString();
									if (relayCount > 1) newName += `-${i}`;
									this.setState(`devices.${deviceName}.${i}.name`, { val: newName, ack: true });
								});
							}
						});
					},
				);
			}
		}
		return changeDeviceIds;
	}

	async updateRoomsList() {
		const roomEnum = {};
		for (const roomKey of Object.keys(this.config["rooms"])) {
			const curRoom = this.config["rooms"][roomKey];
			roomEnum[curRoom.id] = curRoom.name;
		}
		const shellyDevices = await this.getObjectViewAsync("system", "device", {
			startkey: `vis-shelly.${this.instance}.devices.`,
			endkey: `vis-shelly.${this.instance}.devices.\u9999`,
		});
		for (const devKey of Object.keys(shellyDevices.rows)) {
			const dev = shellyDevices.rows[devKey];

			const devName = [...dev.id.matchAll(/[.]([^.]*[.][0-9]*)$/g)];
			// this.log.info(JSON.stringify(devName))
			if (devName.length == 0) continue;
			// String(dev.id).substring(String(dev.id).lastIndexOf(".")+1);
			// @ts-ignore
			this.setObjectAsync("devices." + devName[0][1] + ".room", {
				type: "state",
				common: {
					name: "room",
					type: "string",
					role: "name",
					read: true,
					write: true,
					states: roomEnum,
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
				write: false,
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
			this.unsubscribeForeignObjects("shelly.*");
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
		if (id.indexOf("vis-shelly") > -1) {
			// if (id.indexOf(".rooms.") > -1) {
			// 	this.updateRoomsList();
			// }
		} else {
			if (obj) {
				// this.log.info(JSON.stringify(obj));
				if (obj.type == "device" && typeof this.config["knownShellyIDs"][obj._id] === "undefined") {
					this.log.info("update new Device");
					this.log.info(JSON.stringify(this.config["knownShellyIDs"]));
					this.log.info(id);
					this.updateDeviceList();
				}
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

	createAndSetState(foreignID, selfID, name, role) {
		this.setObjectNotExists(
			selfID,
			{
				type: "state",
				common: {
					name: name,
					type: "string",
					role: role,
					read: true,
					write: true,
				},
				native: {},
			},
			() => {
				this.setState(selfID, { val: foreignID, ack: true });
			},
		);
	}

	/**
	 * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	 * Using this method requires "common.message" property to be set to true in io-package.json
	 * @param {ioBroker.Message} obj
	 */
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

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new visShelly(options);
} else {
	// otherwise start the instance directly
	new visShelly();
}
