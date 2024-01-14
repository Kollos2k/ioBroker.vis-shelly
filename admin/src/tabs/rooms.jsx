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
import { TreeTable, I18n } from "@iobroker/adapter-react-v5";
import { Edit as EditIcon, Info as IconInfo } from "@mui/icons-material";

const styles = (theme) => ({});

class Rooms extends Component {
	constructor(props) {
		super(props);
		console.log("native");
		console.log(props.native);
		console.log(props);

		this.state = {
			data: [
				{
					id: "UniqueID1", // required
					roomName: "Name1",
					roomIcon: "",
					myType: "number",
				},
				{
					id: "UniqueID2", // required
					roomName: "Name12",
					roomIcon: "",
					myType: "string",
				},
			],
		};
		this.columns = [
			{
				title: "RoomName", // required, else it will be "field"
				field: "roomName", // required
				editable: true, // or true [default - true]
				cellStyle: {
					// CSS style - // optional
					maxWidth: "12rem",
					overflow: "hidden",
					wordBreak: "break-word",
				},
				lookup: {
					// optional => edit will be automatically "SELECT"
					value1: "text1",
					value2: "text2",
				},
			},
			{
				title: "RoomIcon",
				field: "roomIcon",
				editable: true,
			},
			{
				title: "Type", // required, else it will be "field"
				field: "myType", // required
				editable: true, // or true [default - true]
				lookup: {
					// optional => edit will be automatically "SELECT"
					number: "Number",
					string: "String",
					boolean: "Boolean",
				},
				type: "number/string/color/oid/icon/boolean", // oid=ObjectID,icon=base64-icon
				editComponent: (props) => (
					<div>
						Prefix&#123; <br />
						<textarea
							rows={4}
							style={{ width: "100%", resize: "vertical" }}
							value={props.value}
							onChange={(e) => props.onChange(e.target.value)}
						/>
						Suffix
					</div>
				),
			},
		];
	}

	render() {
		return (
			<div className={this.props.classes.tableDiv}>
				<TreeTable
					columns={this.columns}
					data={this.state.data}
					onUpdate={(newData, oldData) => {
						const data = JSON.parse(JSON.stringify(this.state.data));

						// Added new line
						if (newData === true) {
							// find unique ID
							let i = 1;
							let id = "line_" + i;

							// eslint-disable-next-line
							while (this.state.data.find((item) => item.id === id)) {
								i++;
								id = "line_" + i;
							}

							data.push({
								id,
								name: I18n.t("New resource") + "_" + i,
								color: "",
								icon: "",
								unit: "",
								price: 0,
							});
						} else {
							// existing line was modifed
							const pos = this.state.data.indexOf(oldData);
							if (pos !== -1) {
								Object.keys(newData).forEach((attr) => (data[pos][attr] = newData[attr]));
							}
						}

						this.setState({ data });
					}}
					onDelete={(oldData) => {
						console.log("Delete: " + JSON.stringify(oldData));
						const pos = this.state.data.indexOf(oldData);
						if (pos !== -1) {
							const data = JSON.parse(JSON.stringify(this.state.data));
							data.splice(pos, 1);
							this.setState({ data });
						}
					}}
				/>
			</div>
		);
	}
}

export default withStyles(styles)(Rooms);
