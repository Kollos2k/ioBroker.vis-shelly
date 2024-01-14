import React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import * as serviceWorker from "./serviceWorker.js";
import theme from "@iobroker/adapter-react-v5/Theme";
import Utils from "@iobroker/adapter-react-v5/Components/Utils";
import App from "./app";
import pkg from "../../package.json";

let themeName = Utils.getThemeName();
console.log(`${pkg.name}@${pkg.version} using theme "${themeName}"`);

function build() {
	ReactDOM.render(
		<StyledEngineProvider injectFirst>
			<ThemeProvider theme={theme(themeName)}>
				<App
					onThemeChange={(_theme) => {
						themeName = _theme;
						build();
					}}
				/>
			</ThemeProvider>
		</StyledEngineProvider>,
		document.getElementById("root"),
	);
}

build();

serviceWorker.unregister();
