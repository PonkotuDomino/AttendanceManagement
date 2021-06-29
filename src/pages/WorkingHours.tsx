import React, { useEffect, useState } from "react";
import { Box, Button, createStyles, Grid, InputLabel, makeStyles, MenuItem, Select } from "@material-ui/core";
import { CircleLoading } from "../components/CircleLoading";
import { CustomTimePicker } from "../components/CustomTimePicker";
import { EditableTable } from "../components/EditableTable";
import { Header } from "../components/Header";
import { google } from "../main";

// ローカルデバッグ用
import { workingHoursJson } from "../debugData/workingHoursJson";
import { userMasterJson } from "../debugData/userMasterJson";

const useStyle = makeStyles(() => createStyles({
    changeMonthButton: {
        margin: "10px 0",
    },
    printButton: {
        margin: '10px 0 10px 20px',
    }
}));

export function WorkingHours(props: { user: any, onChange: (conditions: any, data?: any) => void }) {
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
        loadFlag: false
    });

    useEffect(() => {
        const yearMonth = state.targetYearMonth.getFullYear() + ('0' + (state.targetYearMonth.getMonth() + 1)).slice(-2);

        // ローカルデバッグ用
        const userList = Object.entries(userMasterJson).map(x => x[1]);
        setState(prevState => {
            return {
                ...prevState,
                workingHoursData: workingHoursJson,
                tableData: workingHoursJson[yearMonth],
                userList: userList,
                loadFlag: true
            };
        });

        // google.script.run
        //     .withSuccessHandler((result: any) => {
        //         setState(prevState => {
        //             return {
        //                 ...prevState,
        //                 workingHoursData: result.data || {},
        //                 tableData: result.data[yearMonth] || [],
        //                 userList: result.users || [],
        //                 loadFlag: true
        //             };
        //         });
        //     })
        //     .withFailureHandler((error: { message: any; }) => {
        //         alert(error.message);
        //     })
        //     .getPageData(state.sheetId, { role: props.user.role, type: pageName });
    }, []);

    const headers = [
        {
            title: '日付',
            field: 'date',
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
        },
        {
            title: '休暇区分',
            field: 'leaveType',
            lookup: { 0: '', 1: '有給休暇', 2: '午前有給', 3: '午後有給' }
        },
        {
            title: '備考',
            field: 'notes',
        },
        {
            title: '時間設定区分',
            field: 'workTimeDivision',
        },
    ];

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
        // google.script.run
        //     .withSuccessHandler((result: any) => {
        //         setState(prevState => {
        //             return {
        //                 ...prevState,
        //                 sheetId: selectedSheetId,
        //                 workingHoursData: result.data || {},
        //                 tableData: result.data[yearMonth] || []
        //             };
        //         });
        //     })
        //     .withFailureHandler((error: { message: any; }) => {
        //         alert(error.message);
        //     })
        //     .getPageData(selectedSheetId);
    }

    function createWorkingHoursSheet() {
        // ローカルデバッグ用
        // alert('作成しました。');

        // TODO
        alert('未実装');
    }

    return (
        <>
            <CircleLoading {...{ watch: state.loadFlag }} />
            <Header user={props.user} />

            <Box m={2}>
                <Grid container spacing={1} alignItems="flex-end">
                    <Grid item xs={6}>
                        <Button className={classes.changeMonthButton} size="large" color="primary" variant="contained" onClick={() => handleChangeMonth(false)}>前月</Button>
                        <Button className={classes.changeMonthButton} size="large" color="primary" variant="contained" style={{ marginLeft: '10px' }} onClick={() => handleChangeMonth(true)}>翌月</Button>
                    </Grid>
                    {
                        props.user.role === 0
                            ? (
                                <Grid item xs={6}>
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
                    options={{
                        pageSize: 10,
                        search: false,
                        headerStyle: { width: 'auto', whiteSpace: 'nowrap' },
                        cellStyle: { width: 'auto', whiteSpace: 'nowrap' },
                    }}
                    handleUpdate={
                        (newData, oldData) => {
                            delete newData.tableData;
                            const newTableData = state.tableData;
                            newData.isChange = true;
                            newTableData[oldData.tableData.id] = newData;

                            const yearMonth = state.targetYearMonth.getFullYear() + ('0' + (state.targetYearMonth.getMonth() + 1)).slice(-2);
                            const newWorkingHoursData = state.workingHoursData;
                            newWorkingHoursData[yearMonth] = newTableData;
                            props.onChange({ type: pageName, sheetId: state.sheetId, yearMonth }, newTableData);

                            setState(prevState => {
                                return {
                                    ...prevState,
                                    expensesData: newWorkingHoursData,
                                    tableData: newTableData
                                };
                            });
                        }
                    }
                />
            </Box>
        </>
    );
}