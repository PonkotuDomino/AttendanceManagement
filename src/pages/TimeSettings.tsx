import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box, Button, Divider, Grid, createStyles, makeStyles, TextField, InputAdornment, InputLabel, Select, MenuItem } from "@material-ui/core";
import { CircleLoading } from "../components/CircleLoading";
import { CustomTimePicker } from "../components/CustomTimePicker";
import { EditableTable } from "../components/EditableTable";
import { Header } from "../components/Header";
import { google } from "../main";

const useStyle = makeStyles(() => createStyles({
    gridItem: {
        marginBottom: '10px'
    },
    errorMessage: {
        color: 'red'
    }
}));

export function TimeSettings(props: { user: any, onChange: (data: any, conditions?: any) => void }) {
    const classes = useStyle();
    const pageName = 'TimeSettings';
    const { handleSubmit, control, errors } = useForm();
    const [userId, setUserId] = useState(props.user.id);
    const [userList, setUserList] = useState([]);
    const [timeSettingsData, setTimeSettingsData] = useState({});
    const [tableData, setTableData] = useState([]);
    const [loadFlag, setLoadFlag] = useState(false);

    // レンダリング完了後に実行する
    useEffect(() => {
        google.script.run
            .withSuccessHandler((result: any) => {
                setTimeSettingsData(result.data || {}); // 全データ保持
                setTableData(result.data[userId] || []); // 全データ保持
                setUserList(result.users); // 社員一覧を設定
                setLoadFlag(true);
            })
            .withFailureHandler((error: { message: any; }) => {
                alert(error.message);
            })
            .getPageData('', { type: pageName });
    }, []);

    // 追加ボタン押下時
    function handleClickAdd(data: any) {
        if (!validation(data)) {
            return;
        }

        data["no"] = tableData.length + 1;
        tableData.push(data);
        setTableData([...tableData]);
        props.onChange({ type: pageName, id: props.user.id }, tableData);

        alert('追加しました。');
    }

    // 入力検証
    function validation({ interval, workStartTime, workEndTime, restTimeFrom1, restTimeTo1, restTimeFrom2, restTimeTo2, restTimeFrom3, restTimeTo3 }) {
        if (interval <= 0 || interval >= 60) {
            alert('単位(分)は0~59の間で指定してください。');
            return false;
        }

        if (!workStartTime) {
            alert('開始時刻を指定してください。');
            return false;
        }

        if (!workEndTime) {
            alert('終了時刻を指定してください。');
            return false;
        }

        if (workStartTime === workEndTime) {
            alert('開始時刻と終了時刻を同じにすることはできません。');
            return false;
        }

        if (workStartTime > workEndTime) {
            alert('開始時刻を終了時刻より後に指定するはできません。');
            return false;
        }

        if (!restTimeFrom1) {
            alert('休憩時間From1を指定してください。');
            return false;
        }

        if (!restTimeTo1) {
            alert('休憩時間To1を指定してください。');
            return false;
        }

        if (restTimeFrom1 === restTimeTo1) {
            alert('休憩時間From1と休憩時間To1を同じにすることはできません。');
            return false;
        }

        if (restTimeTo1 > restTimeTo1) {
            alert('休憩時間From1を休憩時間To1より後に指定するはできません。');
            return false;
        }

        if (restTimeFrom2 && !restTimeTo2) {
            alert('休憩時間To2を指定してください。');
            return false;
        }

        if (!restTimeFrom2 && restTimeTo2) {
            alert('休憩時間From2を指定してください。');
            return false;
        }

        if (restTimeFrom2 && restTimeTo2) {
            if (restTimeFrom2 === restTimeTo2) {
                alert('休憩時間From2と休憩時間To2を同じにすることはできません。');
                return false;
            }

            if (restTimeFrom2 > restTimeTo2) {
                alert('休憩時間From2を休憩時間To2より後に指定するはできません。');
                return false;
            }
        }

        if (restTimeFrom3 && !restTimeTo3) {
            alert('休憩時間To3を指定してください。');
            return false;
        }

        if (!restTimeFrom3 && restTimeTo3) {
            alert('休憩時間From3を指定してください。');
            return false;
        }

        if (restTimeFrom3 && restTimeTo3) {
            if (restTimeFrom3 === restTimeTo3) {
                alert('休憩時間From3と休憩時間To3を同じにすることはできません。');
                return false;
            }

            if (restTimeFrom3 > restTimeTo3) {
                alert('休憩時間From3を休憩時間To3より後に指定するはできません。');
                return false;
            }
        }

        return true;
    }

    // 社員変更時
    function handleChangeUser(id: string) {
        setUserId(id);
        setTableData(timeSettingsData[id]);
    }

    const headers = [
        {
            title: '番号',
            field: 'no',
            editable: 'never',
            initialEditValue: tableData ? (tableData.length + 1) : 1
        },
        {
            title: '名称',
            field: 'name',
            validate: (rowData: any) => {
                if (!rowData.name) {
                    return '必須入力';
                }

                return true;
            }
        },
        {
            title: '単位(分)',
            field: 'interval',
            type: 'numeric',
            validate: (rowData: any) => {
                if (!rowData.interval) {
                    return '必須入力';
                }

                return true;
            }
        },
        {
            title: '開始時刻',
            field: 'workStartTime',
            render: ({ workStartTime }) => {
                if (!workStartTime) {
                    return '';
                }

                const value = ('0' + workStartTime).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '終了時刻',
            field: 'workEndTime',
            render: ({ workEndTime }) => {
                if (!workEndTime) {
                    return '';
                }

                const value = ('0' + workEndTime).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '休憩時間From1',
            field: 'restTimeFrom1',
            render: ({ restTimeFrom1 }) => {
                if (!restTimeFrom1) {
                    return '';
                }

                const value = ('0' + restTimeFrom1).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '休憩時間To1',
            field: 'restTimeTo1',
            render: ({ restTimeTo1 }) => {
                if (!restTimeTo1) {
                    return '';
                }

                const value = ('0' + restTimeTo1).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '休憩時間From2',
            field: 'restTimeFrom2',
            render: ({ restTimeFrom2 }) => {
                if (!restTimeFrom2) {
                    return '';
                }

                const value = ('0' + restTimeFrom2).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '休憩時間To2',
            field: 'restTimeTo2',
            render: ({ restTimeTo2 }) => {
                if (!restTimeTo2) {
                    return '';
                }

                const value = ('0' + restTimeTo2).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '休憩時間From3',
            field: 'restTimeFrom3',
            render: ({ restTimeFrom3 }) => {
                if (!restTimeFrom3) {
                    return '';
                }

                const value = ('0' + restTimeFrom3).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '休憩時間To3',
            field: 'restTimeTo3',
            render: ({ restTimeTo3 }) => {
                if (!restTimeTo3) {
                    return '';
                }

                const value = ('0' + restTimeTo3).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
    ];

    return (
        <div>
            <CircleLoading {...{ watch: loadFlag }} />
            <Header />

            <Box m={2}>
                <form onSubmit={handleSubmit(handleClickAdd)} autoComplete="off">
                    <Grid container spacing={1}>
                        <Grid className={classes.gridItem} item xs={8} sm={3}>
                            <Controller
                                name="name"
                                as={TextField}
                                rules={{ required: true }}
                                defaultValue=""
                                control={control}
                                label="名称"
                            />
                            {errors.name && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid className={classes.gridItem} item xs={6} sm={3}>
                            <Controller
                                name="interval"
                                as={TextField}
                                rules={{ required: true }}
                                control={control}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">分</InputAdornment>,
                                }}
                                label="単位(分)"
                                type="number"
                            />
                            {errors.interval && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid className={classes.gridItem} item xs={3}>
                            <Controller
                                name="workStartTime"
                                rules={{ required: true }}
                                control={control}
                                render={props =>
                                    <CustomTimePicker value={props.value} onChange={props.onChange} label="開始時刻" />
                                }
                            />
                            {errors.workStartTime && errors.name.type === "required" && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid className={classes.gridItem} item xs={3}>
                            <Controller
                                name="workEndTime"
                                rules={{ required: true }}
                                control={control}
                                render={props =>
                                    <CustomTimePicker value={props.value} onChange={props.onChange} label="終了時刻" />
                                }
                            />
                            {errors.workEndTime && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid className={classes.gridItem} item xs={3}>
                            <Controller
                                name="restTimeFrom1"
                                rules={{ required: true }}
                                control={control}
                                render={props =>
                                    <CustomTimePicker value={props.value} onChange={props.onChange} label="休憩時間From1" />
                                }
                            />
                            {errors.restTimeFrom1 && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid className={classes.gridItem} item xs={3}>
                            <Controller
                                name="restTimeTo1"
                                rules={{ required: true }}
                                control={control}
                                render={props =>
                                    <CustomTimePicker value={props.value} onChange={props.onChange} label="休憩時間To1" />
                                }
                            />
                            {errors.restTimeTo1 && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid className={classes.gridItem} item xs={3}>
                            <Controller
                                name="restTimeFrom2"
                                control={control}
                                render={props =>
                                    <CustomTimePicker value={props.value} onChange={props.onChange} label="休憩時間From2" />
                                }
                            />
                        </Grid>
                        <Grid className={classes.gridItem} item xs={3}>
                            <Controller
                                name="restTimeTo2"
                                control={control}
                                render={props =>
                                    <CustomTimePicker value={props.value} onChange={props.onChange} label="休憩時間To2" />
                                }
                            />
                        </Grid>
                        <Grid className={classes.gridItem} item xs={3}>
                            <Controller
                                name="restTimeFrom3"
                                control={control}
                                render={props =>
                                    <CustomTimePicker value={props.value} onChange={props.onChange} label="休憩時間From3" />
                                }
                            />
                        </Grid>
                        <Grid className={classes.gridItem} item xs={3}>
                            <Controller
                                name="restTimeTo3"
                                control={control}
                                render={props =>
                                    <CustomTimePicker value={props.value} onChange={props.onChange} label="休憩時間To3" />
                                }
                            />
                        </Grid>
                    </Grid>
                    <Grid container direction="column" alignItems="flex-end">
                        <Grid item xs>
                            <Button type="submit" variant="contained" color="primary">追加</Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>

            <Divider variant="middle" />

            {/* 追加部の追加 */}
            <Box m={2}>
                <Grid container spacing={1} alignItems="flex-end">
                    <Grid item xs={6}>
                        <InputLabel id="select-users-label">社員</InputLabel>
                        <Select
                            autoWidth
                            defaultValue={props.user.id}
                            labelId="select-users-label"
                            onChange={e => {
                                // name の設定
                                handleChangeUser(e.target.value as string);
                            }}
                        >
                            {
                                userList.map((d: { id: string; name: string; }) =>
                                    <MenuItem key={d.name} value={d.id}>{d.name}</MenuItem>
                                )
                            }
                        </Select>
                    </Grid>
                </Grid>
                <EditableTable
                    title={'時間設定'}
                    header={headers}
                    data={tableData}
                    options={{
                        pageSize: 5,
                        search: false,
                        headerStyle: { width: 'auto', whiteSpace: 'nowrap' },
                        cellStyle: { width: 'auto', whiteSpace: 'nowrap' },
                    }}
                    handleUpdate={
                        (newData, oldData) => {
                            delete newData.tableData;
                            tableData[oldData.tableData.id] = newData;
                            setTableData([...tableData]);
                            props.onChange({ type: pageName, id: userId }, tableData);
                        }
                    }
                    validationUpdate={validation}
                    handleDelete={
                        (oldData) => {
                            const id = oldData.tableData.id;
                            if (id === 0) {
                                alert('1件目は削除できません。');
                                return false;
                            }
                            tableData.splice(id);
                            setTableData([...tableData]);
                            props.onChange({ type: pageName, id }, tableData);
                        }
                    }
                />
            </Box>
        </div>
    );
}