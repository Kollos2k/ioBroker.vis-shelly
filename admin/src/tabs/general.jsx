import React from "react";
import { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
import {
	Typography,
	TextField,
	Checkbox,
	Select,
	MenuItem,
	FormControlLabel,
	FormControl,
	InputLabel,
	InputAdornment,
	Grid,
	Paper,
	Box,
	FormHelperText,
	IconButton,
	Tooltip,
} from "@mui/material";
import { Edit as EditIcon, Info as IconInfo } from "@mui/icons-material";

const styles = (theme) => ({});

class General extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div>
				<br />
				<br />
				<br />
				<br />
				general
			</div>
		);
	}
}

export default withStyles(styles)(General);
