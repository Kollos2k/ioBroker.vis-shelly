import React, { useEffect, useState, useRef } from "react";
import { withStyles } from "@mui/styles";
import { AdminConnection, Loader, I18n } from "@iobroker/adapter-react-v5";
import { SnackbarProvider } from "notistack";

import GenericApp from "@iobroker/adapter-react-v5/GenericApp";
import Settings from "./components/settings";
import { AppBar, Tabs, Tab } from "@mui/material";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import TabRooms from "./tabs/rooms";

const styles = (_theme) => ({
	root: {},
	tabContent: {
		padding: 10,
		paddingTop: 0,
		// height: "calc(100% - 64px - 48px - 20px)",
		height: "calc(100% - 64px - 48px)",
		overflow: "auto",
	},
	tabContentIFrame: {
		padding: 10,
		paddingTop: 0,
		// height: "calc(100% - 64px - 48px - 20px - 38px)",
		height: "calc(100% - 64px - 48px)",
		overflow: "auto",
	},
	tab: {
		width: "100%",
		minHeight: "100%",
	},
	selected: {
		color: _theme.palette.mode === "dark" ? undefined : "#FFF !important",
	},
	indicator: {
		backgroundColor: _theme.palette.mode === "dark" ? _theme.palette.secondary.main : "#FFF",
	},
});
const tabs = [
	{
		name: "rooms",
		title: I18n.t("tabRooms"),
		component: TabRooms,
		tooltip: "Rooms",
	},
];

class App extends GenericApp {
	constructor(props) {
		const extendedProps = {
			...props,
			encryptedFields: ["pass"],
			translations: {
				en: require("./i18n/en.json"),
				de: require("./i18n/de.json"),
				ru: require("./i18n/ru.json"),
				pt: require("./i18n/pt.json"),
				nl: require("./i18n/nl.json"),
				fr: require("./i18n/fr.json"),
				it: require("./i18n/it.json"),
				es: require("./i18n/es.json"),
				pl: require("./i18n/pl.json"),
				uk: require("./i18n/uk.json"),
				"zh-cn": require("./i18n/zh-cn.json"),
			},
		};
		// extendedProps.sentryDSN = window.sentryDSN;
		extendedProps.socket = { port: parseInt(window.location.port, 10) };
		// only for debug purposes
		if (extendedProps.socket.port === 3000) {
			extendedProps.socket.port = 8081;
		}
		extendedProps.Connection = AdminConnection;
		super(props, extendedProps);
		console.log("this");
		console.log(this);
	}
	onPrepareLoad(native) {
		/*
		//////// getObjectView EXAMPLE
		this.socket
			.getObjectViewCustom("system", "channel", `vis-shelly.${this.instance}.rooms.`, `vis-shelly.0.rooms.\u9999`)
			.then((objects) => {
				console.log("rdy");
				console.log(objects);
				Object.keys(objects).forEach((key) => {
					console.log(key);
					console.log(objects[key]._id);
				});
			});
			*/
		console.log("onPrepareLoad");
		// console.log(native);
		// if (typeof this.state.native["rooms"] == "undefined") {
		// 	console.log(native.rooms);
		// 	console.log("rooms undefined");
		// 	native.rooms = { test: "bla" };

		// 	console.log(typeof native.rooms);
		// 	// this.props.changeNative(native);
		// 	console.log(typeof native.rooms);
		// 	this.setState({ native: native });
		// } else {
		// 	console.log(native.rooms);
		// }
		// console.log(native.rooms);
		// settings.pass = this.decode(settings.pass);
	}

	onPrepareSave(native) {
		console.log("onPrepareSave");
		this.updateRoomsList(native);
		return native;
	}

	updateRoomsList(native) {
		const roomEnum = {};
		console.log("native");
		console.log(native);
		for (const roomKey of Object.keys(native.rooms)) {
			const curRoom = native.rooms[roomKey];
			roomEnum[curRoom.id] = curRoom.name;
		}
		this.socket
			.getObjectViewCustom(
				"system",
				"device",
				`vis-shelly.${this.instance}.devices.`,
				`vis-shelly.0.devices.\u9999`,
			)
			.then((objects) => {
				console.log("rdy");
				console.log(objects);
				Object.keys(objects).forEach((key) => {
					const dev = objects[key];
					const devName = [...dev._id.matchAll(/[.]([^.]*[.][0-9]*)$/g)];
					if (devName.length == 0) return;
					this.socket
						.setObject(`vis-shelly.${this.instance}.devices.${devName[0][1]}.room`, {
							type: "state",
							common: {
								name: "room",
								// type: "multistate",
								type: "string",
								role: "name",
								read: true,
								write: true,
								states: roomEnum,
							},
							native: {},
						})
						.then(() => {
							// console.log("Save:" + `vis-shelly.${this.instance}.devices.${devName[0][1]}.room`);
						})
						.catch((err) => console.log(err));
				});
			});
		this.socket
			.setObject(`vis-shelly.${this.instance}.devices.roomIds`, {
				type: "state",
				common: {
					name: "room",
					type: "array",
					read: true,
					write: false,
				},
				native: {},
			})
			.then(() => {
				// console.log("Save:" + `vis-shelly.${this.instance}.devices.${devName[0][1]}.room`);
				this.socket.setState(`vis-shelly.${this.instance}.devices.roomIds`, {
					val: JSON.stringify(roomEnum),
					ack: true,
				});
			})
			.catch((err) => console.log(err));
		// this.setObjectAsync("devices.roomIds", {
		// 	type: "state",
		// 	common: {
		// 		name: "room",
		// 		type: "array",
		// 		role: "name",
		// 		read: true,
		// 		write: false,
		// 	},
		// 	native: {},
		// });
		// await this.setStateAsync("devices.roomIds", { val: JSON.stringify(roomEnum), ack: true });

		// const roomEnum = {};
		// for (const roomKey of Object.keys(roomList.rows)) {
		// 	const room = roomList.rows[roomKey];
		// 	this.log.info(JSON.stringify(room));
		// 	roomEnum[room.id] = room.value.common.name;
		// 	this.log.info(room.id);
		// 	this.setForeignObjectNotExists(
		// 		`${room.id}.icon`,
		// 		{
		// 			type: "state",
		// 			common: {
		// 				name: "Icon Path",
		// 				type: "string",
		// 				role: "icon",
		// 				read: true,
		// 				write: true,
		// 			},
		// 			native: {},
		// 		},
		// 		() => {},
		// 	);
		// }
		// for (const devKey of Object.keys(shellyDevices.rows)) {
		// 	const dev = shellyDevices.rows[devKey];

		// 	const devName = [...dev.id.matchAll(/[.]([^.]*[.][0-9]*)$/g)];
		// 	// this.log.info(JSON.stringify(devName))
		// 	if (devName.length == 0) continue;
		// 	// String(dev.id).substring(String(dev.id).lastIndexOf(".")+1);
		// 	// @ts-ignore
		// 	this.setObjectAsync("devices." + devName[0][1] + ".room", {
		// 		type: "state",
		// 		common: {
		// 			name: "room",
		// 			type: "multistate",
		// 			role: "name",
		// 			read: true,
		// 			write: true,
		// 			states: roomEnum,
		// 		},
		// 		native: {},
		// 	});
		// }
	}

	onConnectionReady() {
		super.onConnectionReady();
		console.log("connection Ready");
		this.updateTopPaddingOnLoad();
	}

	updateTopPaddingOnLoad = () => {
		const header = document.getElementById("myHeader");
		const content = document.getElementById("myContent");
		if (header && content) {
			const tHead = document.getElementsByTagName("th");
			content.style.paddingTop = header.clientHeight + 10 + "";
			// tHead[0].className={`${tHead[0].className},`}
			tHead[0].style.width = "30px";
		}
	};

	render() {
		if (!this.state.loaded) {
			return (
				<StyledEngineProvider injectFirst>
					<ThemeProvider theme={this.state.theme}>
						<Loader theme={this.state.themeType} />
					</ThemeProvider>
				</StyledEngineProvider>
			);
		}

		return (
			<StyledEngineProvider injectFirst>
				<ThemeProvider theme={this.state.theme}>
					<SnackbarProvider>
						<div className="App" onLoad={this.updateTopPaddingOnLoad}>
							<AppBar id="myHeader">
								<Tabs
									indicatorColor="secondary"
									value={this.state.selectedTab || tabs[0].name}
									onChange={(e, value) => this.setState({ selectedTab: value })}
									variant="scrollable"
									scrollButtons="auto"
									// @ts-ignore
									classes={{ indicator: this.props.classes.indicator }}
								>
									{tabs.map((tab) => (
										<Tab
											value={tab.name}
											// @ts-ignore
											classes={{ selected: this.props.classes.selected }}
											label={
												tab.icon ? (
													<>
														{tab.icon}
														{I18n.t(tab.title)}
													</>
												) : (
													I18n.t(tab.title)
												)
											}
											data-name={tab.name}
											key={tab.name}
											title={tab.tooltip ? I18n.t(tab.tooltip) : undefined}
										/>
									))}
								</Tabs>
							</AppBar>

							<div
								id="myContent"
								className={
									// @ts-ignore
									this.isIFrame ? this.props.classes.tabContentIFrame : this.props.classes.tabContent
								}
								// style={{ paddingTop: document.getElementById("myTabHolder")?.clientHeight }}
							>
								{tabs.map((tab, index) => {
									const TabComponent = tab.component;
									if (this.state.selectedTab) {
										if (this.state.selectedTab !== tab.name) {
											return null;
										}
									} else if (index !== 0) {
										return null;
									}

									return (
										<TabComponent
											key={tab.name}
											// formulaDisabled={
											// 	this.state.native.params.slave === "1" ||
											// 	this.state.native.params.slave === 1
											// }
											common={this.common}
											socket={this.socket}
											native={this.state.native}
											onError={(text) =>
												this.setState({
													errorText:
														(text || text === 0) && typeof text !== "string"
															? text.toString()
															: text,
												})
											}
											onLoad={(native) => this.onLoadConfig(native)}
											instance={this.instance}
											adapterName={this.adapterName}
											changed={this.state.changed}
											onChange={(attr, value, cb) => this.updateNativeValue(attr, value, cb)}
											changeNative={(value) =>
												this.setState({ native: value, changed: this.getIsChanged(value) })
											}
											// rooms={this.state.rooms}
										/>
									);
								})}
							</div>
							{this.renderError()}
							{this.renderToast()}
							{this.renderSaveCloseButtons()}
						</div>
					</SnackbarProvider>
				</ThemeProvider>
			</StyledEngineProvider>
		);
	}
}
export default withStyles(styles)(App);
