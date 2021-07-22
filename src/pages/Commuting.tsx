import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { makeStyles, createStyles, Button, Box, TextField, Select, MenuItem, InputLabel, Grid } from "@material-ui/core";
import { google } from "../main";

// ローカルデバッグ用
import { timeSettingsJson } from "../debugData/timeSettingsJson";
import { CircleLoading } from "../components/CircleLoading";

// スタイルの指定
const useStyle = makeStyles(() => createStyles({
    inputLabel: {
        fontSize: '0.75em'
    },
    gridItem: {
        marginBottom: '25px'
    },
    errorMessage: {
        color: 'red'
    }
}));

export function Commuting(props: { user: any, onChange: (conditions: any, data?: any) => void, isDebug: boolean }) {
    const classes = useStyle();
    const pageName = 'Commuting';
    const { handleSubmit, control, errors } = useForm();
    const [timeSettings, setTimeSettings] = useState([]);

    useEffect(() => {
        if (props.isDebug) {
            setTimeSettings(timeSettingsJson[props.user.id]);
        } else {
            google.script.run
                .withSuccessHandler((result: any) => {
                    setTimeSettings(result[props.user.id]);
                })
                .withFailureHandler((error: { message: any; }) => {
                    alert(error.message);
                })
                .getTimeSettings()
        }
    }, []);

    // 出勤/退勤ボタン押下時処理
    function handleCommutingButtonClick(data: any) {
        props.onChange({ type: pageName }, JSON.stringify({ content: data.content, timeSetting: data.timeSetting }));
    }

    return (
        <>
            <CircleLoading {...{ watch: Object.keys(timeSettings).length > 0 }} />

            <Box m={2}>
                <form onSubmit={handleSubmit(handleCommutingButtonClick)} autoComplete="off">
                    <Grid container>
                        <Grid className={classes.gridItem} item xs={12}>
                            <InputLabel id="select-timeSetting-label" className={classes.inputLabel}>時間設定区分</InputLabel>
                            <Controller
                                name="timeSetting"
                                defaultValue={props.user.currentTimeSetting}
                                control={control}
                                render={p =>
                                    <Select
                                        value={p.value}
                                        labelId="select-timeSetting-label"
                                        onChange={e => {
                                            p.onChange(e);
                                        }}
                                    >
                                        {
                                            timeSettings.map((d: { no: string, name: string }) =>
                                                <MenuItem key={d.name} value={d.no}>{d.name}</MenuItem>
                                            )
                                        }
                                    </Select>
                                }
                            />
                        </Grid>
                        <Grid className={classes.gridItem} item xs={12}>
                            <Controller
                                name="content"
                                rules={{ required: props.user.commuting }}
                                defaultValue={props.user.currentContent}
                                control={control}
                                render={p =>
                                    <TextField
                                        id="Content"
                                        label="業務内容・備考"
                                        multiline
                                        rows={4}
                                        value={p.value}
                                        variant="outlined"
                                        onChange={e => {
                                            p.onChange(e);
                                        }}
                                    />
                                }
                            />
                            {errors.content && <div className={classes.errorMessage}>退勤時は必須入力</div>}
                        </Grid>
                    </Grid>
                    <Grid container direction="column">
                        <Grid item xs>
                            <Button type="submit" size="large" color="primary" variant="contained">{props.user.commuting ? '退勤' : '出勤'}</Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </>
    );
}