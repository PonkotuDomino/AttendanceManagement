import React, { useState, useEffect } from "react";
import { makeStyles, createStyles, Button, Box } from "@material-ui/core";
import { Header } from "../components/Header";

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

export function Top(props: { data: any, onChange: (data: any) => void }) {
	const classes = useStyle();
	const [isCommuting, setCommutingStatus] = useState(0);

	let date = new Date;
	const yearMonth = date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2);
	useEffect(() => {
		setCommutingStatus(props.data.workingTime[yearMonth][date.getDate() - 1].isCommuting ? 1 : 0);
	}, []);

	// 出勤/退勤ボタン押下時処理
	function handleCommutingButtonClick() {
		if (!props.data) {
			return;
		}

		date = new Date;
		const todayData = props.data.workingTime[yearMonth][date.getDate() - 1];
		todayData[isCommuting ? 'end' : 'start'] = ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2);
		todayData.isCommuting = isCommuting ? 0 : 1;
		props.onChange(props.data);
	}

	return (
		<div className={classes.root}>
			<Header />
			<Box m={1}>
				<Button className={classes.commutingBtn} size="large" color="primary" variant="contained" onClick={handleCommutingButtonClick}>{isCommuting ? '退勤' : '出勤'}</Button>
			</Box>
		</div>
	);
}