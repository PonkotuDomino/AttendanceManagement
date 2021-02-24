import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { makeStyles, createStyles, Container, Button, Box } from "@material-ui/core";

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

export function TopPage(props: { email: string }) {
	const classes = useStyle();

	const [commutingStatus, setCommutingStatus] = useState(false);

	useEffect(() => {
		const id=(props.email || '').split('@')[0];
		const status = {
			"soya.t":1
		};

		setCommutingStatus(!!(status[id] || 0));

		// google.script.run
		// 	.withSuccessHandler(function (value: string) {
		// 		スプレッドシート参照
		// 	})
		// 	.getUserEmail();
	});

	return (
		<div className={classes.root}>
			<Header />
			<Container maxWidth="md">
				<Button className={classes.commutingBtn} size="large" color="primary" variant="contained">{!!commutingStatus ? '出勤' : '退勤'}</Button>
			</Container>
		</div>
	);
}