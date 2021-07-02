import React, { useState } from "react";
import { makeStyles, createStyles, Button, Box, TextField } from "@material-ui/core";
import { Header } from "../components/Header";

// スタイルの指定
const useStyle = makeStyles(theme => createStyles({
    commutingBtn: {
        margin: "10px 0",
    },
}));

export function Commuting(props: { user: any, onChange: (conditions: any, data?: any) => void }) {
    const classes = useStyle();
    const pageName = 'Commuting';
    const [content, setContent] = useState(props.user.currentContent);

    // 出勤/退勤ボタン押下時処理
    function handleCommutingButtonClick() {
        props.onChange({ type: pageName }, content);
    }

    return (
        <>
            <Header user={props.user} />

            <Box m={1}>
                <Button className={classes.commutingBtn} size="large" color="primary" variant="contained" onClick={handleCommutingButtonClick}>{props.user.commuting ? '退勤' : '出勤'}</Button>
            </Box>

            <Box m={1}>
                <TextField
                    id="Content"
                    label="業務内容・備考"
                    multiline
                    rows={4}
                    defaultValue={props.user.currentContent}
                    variant="outlined"
                    InputProps={{
                        readOnly: !props.user.commuting,
                    }}
                    onChange={event => setContent(event.target.value)}
                />
            </Box>
        </>
    );
}