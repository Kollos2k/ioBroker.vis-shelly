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
		super({
			...options,
			name: "vis-shelly",
		});
		this.on("ready", this.onReady.bind(this));
		//this.on("objectChange", this.onObjectChange.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		this.setState("info.connection", false, true);
		// Initialize your adapter here

//      this.log.info("config Stripes: " + this.config.Stripes);
    //   this.log.info("config Background: " + this.config.Background);
//      this.log.info("config Radius: " + this.config.Radius);
//      this.log.info("config Info: " + this.config.Info);
		this.log.info("config option1: " + this.config.option1);
		this.log.info("config option2: " + this.config.option2);

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
		
        await this.setObjectNotExistsAsync("CSS.Button2", {
			type: "state",
			common: {
				name: "Button-Color",
				type: "string",
				role: "shelly.color",
				read: true,
				write: true,
			},
			native: {},
        });
        await this.setObjectNotExistsAsync("CSS.Active", {
			type: "state",
			common: {
				name: "Button-Active-Color",
				type: "string",
				role: "shelly.color",
				read: true,
				write: true,
			},
            native: {},
        });
        await this.setObjectNotExistsAsync("CSS.Text", {
			type: "state",
			common: {
				name: "Text-Color",
				type: "string",
				role: "shelly.color",
				read: true,
				write: true,
			},
			native: {},
       });
	   await this.setObjectNotExistsAsync("shellyObjects.count", {
		   type: "state",
		   common: {
			   name: "Count Shelly Objects",
			   type: "string",
			   role: "shelly.count",
			   read: true,
			   write: true,
		   },
		   native: {},
	   });
        
		// in this template all states changes inside the adapters namespace are subscribed
        // this.subscribeStates("CSS.Button");
        // this.subscribeStates("CSS.Active");
        // this.subscribeStates("CSS.Text");
        // this.subscribeStates("shellyObjects.count");


		/*
		setState examples
		you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		//await this.setStateAsync("testVariable", true);

		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		// if(await this.getStateAsync("CSS.Button") == null)
        // 	await this.setStateAsync("CSS.Button", { val: "#333333", ack: true });
		// if(await this.getStateAsync("CSS.Active") == null)
        // 	await this.setStateAsync("CSS.Active", { val: "#455618", ack: true });
		// if(await this.getStateAsync("CSS.Text") == null)
        // 	await this.setStateAsync("CSS.Text", { val: "#C7C7C7", ack: true });

		//var shellyClass = await this.getForeignObjectsAsync("shelly.0.*");
		var shellyDevices = await this.getForeignObjectsAsync("shelly.*","device");
		var keysDevices=Object.keys(shellyDevices);	
	   	var devJSON=[]
		await this.setObjectAsync("devices.ids", {
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
					name: "Device "+deviceName
				},
				native: {},
			});				
			this.setObjectNotExists("devices."+deviceName+".overrideName", {
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

			let typeState=await this.getForeignStateAsync(deviceID+".type");
			this.setState("devices."+deviceName+".type", { val: typeState.val, ack: true });
			devJSON.push({"stateId":deviceID,"id":deviceName,"type":typeState.val});
			// this.createAndSetState(deviceID,"devices."+deviceName+".deviceID",deviceName+".deviceID","device.id");
			// this.createAndSetState(deviceID+".name","devices."+deviceName+".nameID",deviceName+".nameID","name.id");
			// this.createAndSetStateIfExists(deviceID+".Relay0.Switch","devices."+deviceName+".switchID",deviceName+".switchID","switch.id");
			// this.createAndSetStateIfExists(deviceID+".lights.Switch","devices."+deviceName+".switchID",deviceName+".switchID","switch.id");
			// this.createAndSetStateIfExists(deviceID+".Relay0.Power","devices."+deviceName+".powerID",deviceName+".powerID","power.id");
			// this.createAndSetStateIfExists(deviceID+".lights.Power","devices."+deviceName+".powerID",deviceName+".powerID","power.id");
			// this.createAndSetStateIfExists(deviceID+".lights.brightness","devices."+deviceName+".brightnessID",deviceName+".brightnessID","brightness.id");


			// for(let key of keysObject){
			// 	//let subKey=key.substring(key.lastIndexOf("."),key.length);
			// 	//if(key!="info" && key!="ble"){
			// 	//if(key=="info"){
			// 	//	await this.setStateAsync("shellyObjects.count", { val: key.length, ack: true });
			// 	//	break;
			// 	//} else {
			// 	//	await this.setStateAsync("shellyObjects.count", { val: "", ack: true });
			// 	//}
			// 	//if(subKey!="enums"&&subKey!="acl")
			// 	//await this.setStateAsync("shellyObjects.count", { val: subKey, ack: true });
			// }
		}	
        await this.setStateAsync("devices.ids", { val: JSON.stringify(devJSON), ack: true });
		//var shellyClass = await this.getForeignStateAsync("shelly").val;

        //await this.setStateAsync("shellyObjects.count", { val: shellyClass, ack: true });
		//await this.setStateAsync("shellyObjects.count", { val: keysInstance.length, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		//await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });

		// examples for the checkPassword/checkGroup functions
		//let result = await this.checkPasswordAsync("admin", "ioBroker");
		//this.log.info("check user admin pw ioBroker: " + result);

		//result = await this.checkGroupAsync("admin", "admin");
		//this.log.info("check group user admin group admin: " + result);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
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
		if (obj) {
			// The object was changed
			this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
		} else {
			// The object was deleted
			this.log.info(`object ${id} deleted`);
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