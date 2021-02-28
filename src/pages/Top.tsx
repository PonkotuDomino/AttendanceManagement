import React, { useState, useEffect } from "react";
import { makeStyles, createStyles, Button, Box } from "@material-ui/core";
import { Header } from "../components/Header";
import { sampleProps } from "../sampleJson";

const useStyle = makeStyles(theme => createStyles({
	headerSpacer: theme.mixins.toolbar,
	root: {
		flexGrow: 1,
		// はみ出た要素を非表示にする
		overflow: "hidden",
		backgroundColor: theme.palette.background.paper,
	},
	commutingBtn: {
		margin: "10px 0",
	},
}));

export function Top(props: { email: string }) {
	const classes = useStyle();
	const [commutingStatus, setCommutingStatus] = useState(false);
	useEffect(() => {
		const id = (props.email || '').split('@')[0].replace('.', '');
		const date = new Date;
		const yearMonth = date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2);
		setCommutingStatus(!!sampleProps[id].workingTime[yearMonth].start);

		// google.script.run
		// 	.withSuccessHandler(function (value: any) {
		// 		const [data, setData] = useState(value[id].workingTime[targetMonth]);
		//      setLoadFlag(true);
		// 	})
		// 	.recieveSpreadsheet();
	});

	return (
		<div className={classes.root}>
			<Header />
			<Box m={1}>
				<Button className={classes.commutingBtn} size="large" color="primary" variant="contained">{!!commutingStatus ? '出勤' : '退勤'}</Button>
			</Box>
		</div>
	);
}