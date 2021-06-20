import React, { useEffect, useState } from "react";
import { Box, Button, createStyles, Grid, InputLabel, makeStyles, MenuItem, Select } from "@material-ui/core";
import { CircleLoading } from "../components/CircleLoading";
import { CustomTimePicker } from "../components/CustomTimePicker";
import { EditableTable } from "../components/EditableTable";
import { Header } from "../components/Header";
import { google } from "../main";

// ローカルデバッグ用
// import workingHoursJson from "../debugData/workingHoursJson";

const useStyle = makeStyles(() => createStyles({
    changeMonthButton: {
        margin: "10px 0",
    },
    printButton: {
        margin: '10px 0 10px 20px',
    }
}));

export function WorkingHours(props: { user: any, onChange: (data: any, conditions?: any) => void }) {
    const classes = useStyle();
    const pageName = 'WorkingHours';
    const [sheetId, setSheetId] = useState(props.user.WorkingHoursSheetId);
    const date = new Date();
    date.setDate(1);
    const [targetYearMonth, setTargetYearMonth] = useState(date);
    const [userList, setUserList] = useState([]);
    const [workingHoursData, setWorkingHoursData] = useState({});
    const [tableData, setTableData] = useState([]);
    const [loadFlag, setLoadFlag] = useState(false);

    useEffect(() => {
        const yearMonth = targetYearMonth.getFullYear() + ('0' + (targetYearMonth.getMonth() + 1)).slice(-2);

        google.script.run
            .withSuccessHandler((result: any) => {
                setWorkingHoursData(result.data); // 全データ保持
                setTableData(result.data[yearMonth] || []); // 対象年月の情報を一覧に設定
                setUserList(result.users); // 社員一覧を設定
                setLoadFlag(true);
            })
            .withFailureHandler((error: { message: any; }) => {
                alert(error.message);
            })
            .getPageData(sheetId, { role: props.user.role, type: pageName });
    }, []);

    const headers = [
        {
            title: '日付',
            field: 'date',
            render: ({ date }) => {
                const dayOfWeek = (new Date(targetYearMonth.getFullYear(), targetYearMonth.getMonth(), date)).getDay();
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
        const month = targetYearMonth.getMonth() + (isNext ? 1 : -1);
        const newDate = new Date(targetYearMonth.getFullYear(), month, 1);
        setTargetYearMonth(newDate);

        const yearMonth = newDate.getFullYear() + ('0' + (newDate.getMonth() + 1)).slice(-2);
        setTableData(workingHoursData[yearMonth] || []);
    }

    // 社員変更時
    async function handleChangeUser(selectedSheetId: string) {
        setSheetId(selectedSheetId);

        const yearMonth = targetYearMonth.getFullYear() + ('0' + (targetYearMonth.getMonth() + 1)).slice(-2);
        google.script.run
            .withSuccessHandler((result: any) => {
                setWorkingHoursData(result.data); // 全データ保持
                setTableData(result.data[yearMonth]); // 対象年月の情報を一覧に設定
            })
            .withFailureHandler((error: { message: any; }) => {
                alert(error.message);
            })
            .getPageData(selectedSheetId);
    }

    function createWorkingHoursSheet() {
        // ローカルデバッグ用
        // alert('作成しました。');

        // TODO
        alert('未実装');
    }

    return (
        <div>
            <CircleLoading {...{ watch: loadFlag }} />
            <Header />

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
                                        defaultValue={props.user.WorkingHoursSheetId}
                                        labelId="select-users-label"
                                        onChange={e => {
                                            // name の設定
                                            handleChangeUser(e.target.value as string);
                                        }}
                                    >
                                        {
                                            userList.map((d: { sheetId: string; name: string; }) =>
                                                <MenuItem key={d.name} value={d.sheetId}>{d.name}</MenuItem>
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
                    title={(targetYearMonth.getMonth() + 1) + '月'}
                    header={headers}
                    data={tableData}
                    options={{
                        pageSize: 10,
                        search: false,
                        headerStyle: { width: 'auto', whiteSpace: 'nowrap' },
                        cellStyle: { width: 'auto', whiteSpace: 'nowrap' },
                    }}
                    handleUpdate={
                        (newData, oldData) => {
                            delete newData.tableData;
                            newData.isChange = true;
                            tableData[oldData.tableData.id] = newData;
                            setTableData([...tableData]);
                    
                            const yearMonth = targetYearMonth.getFullYear() + ('0' + (targetYearMonth.getMonth() + 1)).slice(-2);
                            workingHoursData[yearMonth] = tableData;
                            setWorkingHoursData(workingHoursData);
                            props.onChange({ type: pageName, sheetId: sheetId, yearMonth }, tableData);
                        }
                    }
                />
            </Box>
        </div>
    );
}