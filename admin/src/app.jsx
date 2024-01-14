import React from "react";
import { withStyles } from "@mui/styles";
import { AdminConnection, Loader, I18n } from "@iobroker/adapter-react-v5";
import { SnackbarProvider } from "notistack";

import GenericApp from "@iobroker/adapter-react-v5/GenericApp";
import Settings from "./components/settings";
import { AppBar, Tabs, Tab } from "@mui/material";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import TabGeneral from "./tabs/general";
import TabRooms from "./tabs/rooms";

const styles = (_theme) => ({
	root: {},
	tabContent: {
		padding: 10,
		paddingTop: 55,
		height: "calc(100% - 64px - 48px - 20px)",
		overflow: "auto",
	},
	tabContentIFrame: {
		padding: 10,
		height: "calc(100% - 64px - 48px - 20px - 38px)",
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
		name: "general",
		title: "General",
		component: TabGeneral,
		tooltip: "General",
	},
	{
		name: "rooms",
		title: "Rooms",
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
		extendedProps.Connection = AdminConnection;
		super(props, extendedProps);
	}
	onPrepareLoad(settings) {
		console.log("onPrepareLoad");
		console.log(settings);
		// settings.pass = this.decode(settings.pass);
	}

	onPrepareSave(native) {
		console.log("onPrepareSave");
		return native;
	}

	onConnectionReady() {
		super.onConnectionReady();
		console.log("connection Ready");
	}

	render() {
		if (!this.state.loaded) {
			return <div className="App">Warten auf Daten</div>;
		}

		return (
			<StyledEngineProvider injectFirst>
				<ThemeProvider theme={this.state.theme}>
					<SnackbarProvider>
						<div className="App">
							<AppBar>
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
								className={
									// @ts-ignore
									this.isIFrame ? this.props.classes.tabContentIFrame : this.props.classes.tabContent
								}
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
