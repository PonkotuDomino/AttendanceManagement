import React from "react";
import { makeStyles, createStyles, Button, Box } from "@material-ui/core";
import { Header } from "../components/Header";

// スタイルの指定
const useStyle = makeStyles(theme => createStyles({
    headerSpacer: theme.mixins.toolbar,
    root: {
        flexGrow: 1,
        overflow: "hidden",
        backgroundColor: theme.palette.background.paper,
    },
    commutingBtn: {
        margin: "10px 0",
    },
}));

export function Commuting(props: { user: any, onChange: (conditions: any, data?: any) => void }) {
    const classes = useStyle();
    const pageName = 'Commuting';

    // 出勤/退勤ボタン押下時処理
    function handleCommutingButtonClick() {
        props.onChange({ type: pageName });
    }

    return (
        <div className={classes.root}>
            <Header />

            <Box m={1}>
                <Button className={classes.commutingBtn} size="large" color="primary" variant="contained" onClick={handleCommutingButtonClick}>{props.user.commuting ? '退勤' : '出勤'}</Button>
            </Box>
        </div>
    );
}