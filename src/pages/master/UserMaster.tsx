import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box, Button, createStyles, Grid, InputLabel, makeStyles, MenuItem, Select, TextField } from "@material-ui/core";
import { CircleLoading } from "../../components/CircleLoading";
import { Header } from "../../components/Header";
import { google } from "../../main";

// ローカルデバッグ用
import { userMasterJson } from "../../debugData/userMasterJson";
import { timeSettingsJson } from "../../debugData/timeSettingsJson";

const useStyle = makeStyles(() => createStyles({
    gridItem: {
        marginBottom: '10px'
    },
    errorMessage: {
        color: 'red'
    }
}));

export function UserMaster(props: { user: any, onChange: (conditions: any, data?: any) => void }) {
    const classes = useStyle();
    const pageName = 'UserMaster';
    const { handleSubmit, control, errors, setValue } = useForm();
    const [state, setState] = useState({
        id: '',
        email: '',
        userMasterData: {},
        userList: [],
        timeSettings: {},
        loadFlag: false
    });

    // レンダリング完了後に実行する
    useEffect(() => {
        // ローカルデバッグ用
        setState(prevState => {
            return {
                ...prevState,
                id: '',
                userMasterData: userMasterJson || {},
                userList: Object.entries(userMasterJson).map(x => { return { ...x[1], email: x[0] } }) || [],
                timeSettings: timeSettingsJson || {},
                loadFlag: true
            };
        });

        // google.script.run
        //     .withSuccessHandler((result: any) => {
        //         setState(prevState => {
        //             return {
        //                 ...prevState,
        //                 userMasterData: result.data || {},
        //                 userList: result.users || [],
        //                 timeSettings: result.timeSettings || {},
        //                 loadFlag: true
        //             };
        //         });
        //     })
        //     .withFailureHandler((error: { message: any; }) => {
        //         alert(error.message);
        //     })
        //     .getPageData('', { role: props.user.role, type: pageName });
    }, []);

    // 追加/更新ボタン押下時
    function handleClickAdd(data: any) {
        setValue('inputId', data.inputId || '');
        setValue('inputEmail', data.inputEmail || '');

        let userData = state.userMasterData[data.email];
        if (state.id) {
            userData.name = data.name;
            userData.role = data.role;
            userData.defaultTimeSetings = data.defaultTimeSetings;
            userData.paidHolidayTotalTime = data.paidHolidayTotalTime;
        } else {
            userData = {
                id: data.inputId,
                email: data.inputEmail,
                name: data.name,
                role: data.role,
                defaultTimeSetings: data.defaultTimeSetings,
                paidHolidayTotalTime: data.paidHolidayTotalTime
            };
        }
        state.userMasterData[data.email] = userData;
        setState(prevState => {
            return {
                ...prevState,
                userMasterData: state.userMasterData
            };
        });

        props.onChange({ type: pageName, email: data.inputEmail }, userData);
    }

    // 社員変更時
    function handleChangeUser(email: string) {
        const user = state.userMasterData[email] || {};
        setState(prevState => {
            return {
                ...prevState,
                id: user.id,
                email: email
            };
        });

        // form内の値を更新
        setValue('inputId', user.id || '');
        setValue('inputEmail', email || '');
        setValue('name', user.name || '');
        setValue('role', (user.role || 0) + '');
        setValue('defaultTimeSetings', (user.defaultTimeSetings || 1) + '');
        setValue('paidHolidayTotalTime', user.paidHolidayTotalTime || '');
        setValue('isAdd', !!user.id);
    }

    return (
        <>
            <CircleLoading {...{ watch: state.loadFlag }} />
            <Header user={props.user} />

            <Box m={2}>
                <form onSubmit={handleSubmit(handleClickAdd)} autoComplete="off">
                    <Grid container spacing={1}>
                        <Grid className={classes.gridItem} item sm={3}>
                            <InputLabel id="select-email-label">社員ID</InputLabel>
                            <Controller
                                name="email"
                                defaultValue=""
                                control={control}
                                render={props =>
                                    <Select
                                        autoWidth
                                        value={props.value}
                                        displayEmpty
                                        labelId="select-email-label"
                                        onChange={e => {
                                            handleChangeUser(e.target.value as string);
                                            props.onChange(e);
                                        }}
                                    >
                                        <MenuItem value="">
                                            <span>新規追加</span>
                                        </MenuItem>
                                        {
                                            state.userList.map((d: { email: string; id: string; }) =>
                                                <MenuItem key={d.id} value={d.email}>{d.id}</MenuItem>
                                            )
                                        }
                                    </Select>
                                }
                            />
                        </Grid>
                        <Grid className={classes.gridItem} style={{ display: state.id ? 'none' : '' }} item sm={3}>
                            <Controller
                                name="inputId"
                                as={TextField}
                                rules={{ required: !state.id }}
                                defaultValue=""
                                control={control}
                                label="社員ID入力"
                            />
                            {errors.inputId && !state.id && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid className={classes.gridItem} style={{ display: state.id ? 'none' : '' }} item sm={3}>
                            <Controller
                                name="inputEmail"
                                as={TextField}
                                rules={{ required: !state.id }}
                                defaultValue=""
                                control={control}
                                label="メールアドレス入力"
                            />
                            {errors.inputEmail && !state.id && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                    </Grid>
                    <Grid container spacing={1}>
                        <Grid className={classes.gridItem} item sm={3}>
                            <Controller
                                name="name"
                                as={TextField}
                                rules={{ required: true }}
                                defaultValue=""
                                control={control}
                                label="社員名"
                            />
                            {errors.name && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                    </Grid>
                    <Grid container spacing={1}>
                        <Grid className={classes.gridItem} item sm={3}>
                            <InputLabel id="select-role-label">権限</InputLabel>
                            <Controller
                                name="role"
                                defaultValue="0"
                                control={control}
                                render={props =>
                                    <Select
                                        value={props.value}
                                        labelId="select-role-label"
                                        onChange={e => props.onChange(e)}
                                    >
                                        <MenuItem value="0">システム管理者</MenuItem>
                                        <MenuItem value="1">一般社員</MenuItem>
                                        <MenuItem value="2">管理職</MenuItem>
                                    </Select>
                                }
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={1}>
                        <Grid className={classes.gridItem} item sm={3}>
                            <InputLabel id="select-defaultTimeSetings-label">時間設定</InputLabel>
                            <Controller
                                name="defaultTimeSetings"
                                defaultValue="1"
                                control={control}
                                render={props =>
                                    <Select
                                        value={props.value}
                                        labelId="select-defaultTimeSetings-label"
                                        onChange={e => props.onChange(e)}
                                    >
                                        {
                                            (Object.keys(state.timeSettings).length && state.id)
                                                ? state.timeSettings[state.id].map((d: { no: string; name: string; }) =>
                                                    <MenuItem key={d.name} value={d.no}>{d.name}</MenuItem>
                                                )
                                                : <MenuItem key="社内" value="1">社内</MenuItem>
                                        }
                                    </Select>
                                }
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={1}>
                        <Grid className={classes.gridItem} item sm={3}>
                            <Controller
                                name="paidHolidayTotalTime"
                                as={TextField}
                                rules={{ required: true }}
                                defaultValue=""
                                control={control}
                                label="有給残時間"
                                type="number"
                            />
                            {errors.paidHolidayTotalTime && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                    </Grid>
                    <Grid container spacing={1}>
                        <Grid className={classes.gridItem} item sm={3}>
                            <Button type="submit" variant="contained" color="primary">{state.id ? '更新' : '追加'}</Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </>
    );
}