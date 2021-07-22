import React, { useEffect, useState } from "react";
import { Box, Button, createStyles, Grid, InputLabel, makeStyles, MenuItem, Select } from "@material-ui/core";
import { CircleLoading } from "../components/CircleLoading";
import { CustomTimePicker } from "../components/CustomTimePicker";
import { EditableTable } from "../components/EditableTable";
import { google } from "../main";

// ローカルデバッグ用
import { workingHoursJson } from "../debugData/workingHoursJson";
import { userMasterJson } from "../debugData/userMasterJson";
import { timeSettingsJson } from "../debugData/timeSettingsJson";

const useStyle = makeStyles(() => createStyles({
    changeMonthButton: {
        margin: "10px 0",
    },
    printButton: {
        margin: '10px 0 10px 20px',
    }
}));

export function WorkingHours(props: { user: any, onChange: (conditions: any, data?: any) => void, isDebug: boolean }) {
    const classes = useStyle();
    const pageName = 'WorkingHours';
    const date = new Date();
    date.setDate(1);
    const [state, setState] = useState({
        targetYearMonth: date,
        sheetId: props.user.workingHoursSheetId,
        workingHoursData: {},
        tableData: [],
        userList: [],
        timeSettings: {},
        loadFlag: false
    });

    useEffect(() => {
        const yearMonth = state.targetYearMonth.getFullYear() + ('0' + (state.targetYearMonth.getMonth() + 1)).slice(-2);
        if (props.isDebug) {
            const userList = Object.entries(userMasterJson).map(x => x[1]);
            let timeSettings = { 0: '' };
            timeSettingsJson[props.user.id].forEach((d: { no: number; name: string; }) => {
                timeSettings[d.no] = d.name;
            });

            setState(prevState => {
                return {
                    ...prevState,
                    workingHoursData: workingHoursJson || {},
                    tableData: workingHoursJson[yearMonth] || [],
                    userList: userList || [],
                    timeSettings,
                    loadFlag: true
                };
            });
        } else {
            google.script.run
                .withSuccessHandler((result: any) => {
                    let timeSettings = { 0: '' };
                    result.timeSettings[props.user.id].forEach((d: { no: number; name: string; }) => {
                        timeSettings[d.no] = d.name;
                    });

                    setState(prevState => {
                        return {
                            ...prevState,
                            workingHoursData: result.data || {},
                            tableData: result.data[yearMonth] || [],
                            userList: result.users || [],
                            timeSettings,
                            loadFlag: true
                        };
                    });
                })
                .withFailureHandler((error: { message: any; }) => {
                    alert(error.message);
                })
                .getPageData(state.sheetId, { role: props.user.role, type: pageName });
        }
    }, []);

    const headers = [
        {
            title: '日付',
            field: 'date',
            editable: 'never',
            render: ({ date }) => {
                const dayOfWeek = (new Date(state.targetYearMonth.getFullYear(), state.targetYearMonth.getMonth(), date)).getDay();
                if (dayOfWeek === 6) {
                    return <Box color="primary.main">{date}</Box>
                } else if (dayOfWeek === 0) {
                    return <Box color="error.main">{date}</Box>
                } else {
                    return <Box color="text.main">{date}</Box>
                }
            }
        },
        {
            title: '開始時刻',
            field: 'start',
            editable: 'never',
            render: ({ records }) => {
                if (!records.length) {
                    return '';
                }

                const value = ('0' + records[0].start).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            }
        },
        {
            title: '終了時刻',
            field: 'end',
            editable: 'never',
            render: ({ records }) => {
                if (!records.length || !records[records.length - 1].end) {
                    return '';
                }

                const value = ('0' + records[records.length - 1].end).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            }
        },
        {
            title: '休暇区分',
            field: 'leaveType',
            lookup: { 0: '', 1: '有給休暇', 2: '時間有給', 3: '欠勤', 4: '振替休日', 5: '特別休暇', 6: '休日出勤' }
        },
        {
            title: '業務内容・備考',
            field: 'notes'
        }
    ];

    const detailPanels = [{
        tooltip: "時間詳細",
        render: (rowData: { records: any[]; date: string; }) => {
            const date = rowData.date;
            return (
                <EditableTable
                    title={date + '日 時間詳細'}
                    header={[
                        {
                            title: '日付',
                            field: 'date',
                            editable: 'never',
                            hidden: true
                        },
                        {
                            title: '時間設定区分',
                            field: 'timeSetting',
                            lookup: state.timeSettings || {}
                        },
                        {
                            title: '開始時刻',
                            field: 'start',
                            render: ({ start }) => {
                                if (!start) {
                                    return '';
                                }

                                const value = ('0' + start).slice(-4);
                                return value.substring(0, 2) + ':' + value.substring(2, 4);
                            },
                            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
                        },
                        {
                            title: '終了時刻',
                            field: 'end',
                            render: ({ end }) => {
                                if (!end) {
                                    return '';
                                }

                                const value = ('0' + end).slice(-4);
                                return value.substring(0, 2) + ':' + value.substring(2, 4);
                            },
                            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
                        }
                    ]}
                    data={rowData.records}
                    options={{
                        pageSize: 2,
                        search: false,
                        headerStyle: { width: 'auto', whiteSpace: 'nowrap' },
                        cellStyle: { width: 'auto', whiteSpace: 'nowrap' },
                    }}
                    handleInsert={
                        state.sheetId == props.user.workingHoursSheetId
                            ? (newData) => {
                                delete newData.tableData;
                                const newRecords = rowData.records;
                                newRecords.push(newData);

                                const yearMonth = state.targetYearMonth.getFullYear() + ('0' + (state.targetYearMonth.getMonth() + 1)).slice(-2);
                                const newWorkingHoursData = state.workingHoursData;
                                const newTableData = newWorkingHoursData[yearMonth];
                                for (let index = 0; index < newTableData.length; index++) {
                                    if (date === newTableData[index].date) {
                                        newTableData[index].records = newRecords.sort((x, y) => x.start - y.start);
                                        newTableData[index].isChange = true;
                                        break;
                                    }
                                }

                                newWorkingHoursData[yearMonth] = newTableData;
                                props.onChange({ type: pageName, sheetId: state.sheetId, yearMonth }, JSON.stringify(newTableData));

                                setState(prevState => {
                                    return {
                                        ...prevState,
                                        workingHoursData: newWorkingHoursData,
                                        tableData: newTableData
                                    };
                                });
                            }
                            : undefined
                    }
                    handleUpdate={
                        state.sheetId == props.user.workingHoursSheetId
                            ? (newData, oldData) => {
                                delete newData.tableData;
                                const newRecords = rowData.records;
                                newRecords[oldData.tableData.id] = newData;

                                const yearMonth = state.targetYearMonth.getFullYear() + ('0' + (state.targetYearMonth.getMonth() + 1)).slice(-2);
                                const newWorkingHoursData = state.workingHoursData;
                                const newTableData = newWorkingHoursData[yearMonth];
                                for (let index = 0; index < newTableData.length; index++) {
                                    if (date === newTableData[index].date) {
                                        newTableData[index].records = newRecords;
                                        newTableData[index].isChange = true;
                                        break;
                                    }
                                }

                                newWorkingHoursData[yearMonth] = newTableData;
                                props.onChange({ type: pageName, sheetId: state.sheetId, yearMonth }, JSON.stringify(newTableData));

                                setState(prevState => {
                                    return {
                                        ...prevState,
                                        workingHoursData: newWorkingHoursData,
                                        tableData: newTableData
                                    };
                                });
                            }
                            : undefined
                    }
                    handleDelete={
                        state.sheetId == props.user.workingHoursSheetId
                            ? (oldData) => {
                                const newRecords = rowData.records;
                                newRecords.splice(oldData.tableData.id, 1);

                                const yearMonth = state.targetYearMonth.getFullYear() + ('0' + (state.targetYearMonth.getMonth() + 1)).slice(-2);
                                const newWorkingHoursData = state.workingHoursData;
                                const newTableData = newWorkingHoursData[yearMonth];
                                for (let index = 0; index < newTableData.length; index++) {
                                    if (date === newTableData[index].date) {
                                        newTableData[index].records = newRecords;
                                        newTableData[index].isChange = true;
                                        break;
                                    }
                                }

                                newWorkingHoursData[yearMonth] = newTableData;
                                props.onChange({ type: pageName, sheetId: state.sheetId, yearMonth }, JSON.stringify(newTableData));

                                setState(prevState => {
                                    return {
                                        ...prevState,
                                        workingHoursData: newWorkingHoursData,
                                        tableData: newTableData
                                    };
                                });
                            }
                            : undefined
                    }
                />
            )
        }
    }];

    // 前月/今月ボタン押下時
    function handleChangeMonth(isNext: boolean) {
        const month = state.targetYearMonth.getMonth() + (isNext ? 1 : -1);
        const newDate = new Date(state.targetYearMonth.getFullYear(), month, 1);
        const yearMonth = newDate.getFullYear() + ('0' + (newDate.getMonth() + 1)).slice(-2);

        setState(prevState => {
            return {
                ...prevState,
                targetYearMonth: newDate,
                tableData: prevState.workingHoursData[yearMonth] || []
            };
        });
    }

    // 社員変更時
    async function handleChangeUser(selectedSheetId: string) {
        const yearMonth = state.targetYearMonth.getFullYear() + ('0' + (state.targetYearMonth.getMonth() + 1)).slice(-2);
        if (props.isDebug) {
            alert('デバッグ時に変更できません。');
        } else {
            google.script.run
                .withSuccessHandler((result: any) => {
                    setState(prevState => {
                        return {
                            ...prevState,
                            sheetId: selectedSheetId,
                            workingHoursData: result.data || {},
                            tableData: result.data[yearMonth] || []
                        };
                    });
                })
                .withFailureHandler((error: { message: any; }) => {
                    alert(error.message);
                })
                .getPageData(selectedSheetId);
        }
    }

    // 勤務表作成
    function createWorkingHoursSheet() {
        if(props.isDebug){
            alert('デバッグ時に印刷できません。');
        }else{
            google.script.run
                .withSuccessHandler((url: string) => {
                    if (url) {
                        window.open(url);
                        alert('作成しました。');
                    } else {
                        alert('エラーが発生しました。フォルダを確認してください。');
                    }
                })
                .withFailureHandler((error: { message: any; }) => {
                    alert(error.message);
                })
                .createWorkingHoursSpreadSheet(JSON.stringify(state.tableData), state.targetYearMonth.toLocaleDateString(), props.user.id, props.user.name);
        }
    }

    return (
        <>
            <CircleLoading {...{ watch: state.loadFlag }} />

            <Box m={2}>
                <Grid container spacing={1} alignItems="flex-end">
                    <Grid item xs={12} sm={6}>
                        <Button className={classes.changeMonthButton} size="large" color="primary" variant="contained" onClick={() => handleChangeMonth(false)}>前月</Button>
                        <Button className={classes.changeMonthButton} size="large" color="primary" variant="contained" style={{ marginLeft: '10px' }} onClick={() => handleChangeMonth(true)}>翌月</Button>
                    </Grid>
                    {
                        props.user.role === 0
                            ? (
                                <Grid item xs={12} sm={6}>
                                    <InputLabel id="select-users-label">社員</InputLabel>
                                    <Select
                                        autoWidth
                                        defaultValue={props.user.workingHoursSheetId}
                                        labelId="select-users-label"
                                        onChange={e => {
                                            // name の設定
                                            handleChangeUser(e.target.value as string);
                                        }}
                                    >
                                        {
                                            state.userList.map((d: { workingHoursSheetId: string; name: string; }) =>
                                                <MenuItem key={d.name} value={d.workingHoursSheetId}>{d.name}</MenuItem>
                                            )
                                        }
                                    </Select>
                                    <Button className={classes.printButton} size="large" color="primary" variant="contained" onClick={() => createWorkingHoursSheet()}>印刷</Button>
                                </Grid>
                            )
                            : ''
                    }
                </Grid>
                <EditableTable
                    title={(state.targetYearMonth.getMonth() + 1) + '月'}
                    header={headers}
                    data={state.tableData}
                    detailPanel={detailPanels}
                    options={{
                        pageSize: 10,
                        search: false,
                        headerStyle: { width: 'auto', whiteSpace: 'nowrap' },
                        cellStyle: { width: 'auto', whiteSpace: 'nowrap' },
                    }}
                    handleUpdate={
                        state.sheetId == props.user.workingHoursSheetId
                            ? (newData, oldData) => {
                                delete newData.tableData;
                                const newTableData = state.tableData;
                                newData.isChange = true;
                                newTableData[oldData.tableData.id] = newData;

                                const yearMonth = state.targetYearMonth.getFullYear() + ('0' + (state.targetYearMonth.getMonth() + 1)).slice(-2);
                                const newWorkingHoursData = state.workingHoursData;
                                newWorkingHoursData[yearMonth] = newTableData;
                                props.onChange({ type: pageName, sheetId: state.sheetId, yearMonth }, JSON.stringify(newTableData));

                                setState(prevState => {
                                    return {
                                        ...prevState,
                                        workingHoursData: newWorkingHoursData,
                                        tableData: newTableData
                                    };
                                });
                            }
                            : undefined
                    }
                />
            </Box>
        </>
    );
}