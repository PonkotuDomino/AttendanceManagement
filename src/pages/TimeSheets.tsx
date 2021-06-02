import React, { useEffect, useRef, useState } from "react";
import { Box, Button, createStyles, Grid, InputLabel, makeStyles, MenuItem, Select } from "@material-ui/core";
import { CircleLoading } from "../components/CircleLoading";
import { CustomTimePicker } from "../components/CustomTimePicker";
import { EditableTable } from "../components/EditableTable";
import { Header } from "../components/Header";

const useStyle = makeStyles(() => createStyles({
    changeMonthButton: {
        margin: "10px 0",
    },
    printButton: {
        margin: '10px 0 10px 20px',
    }
}));

export function TimeSheets(props: { data: any, users?: any, onChange: (data: any, conditions?: any) => void, getUserData: (id: string) => any, createTimeSheet: (data: any, date: Date, name: string) => void }) {
    const classes = useStyle();
    const [user, setUser] = useState({ id: props.data.id, name: props.data.name });
    const refUser = useRef(props.data.id);
    const [dateObject, setDateObject] = useState(new Date);
    const [tableData, setTableData] = useState([]);
    const [loadFlag, setLoadFlag] = useState(false);

    useEffect(() => {
        const yearMonth = dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2);
        setTableData((props.data.timeSheets[yearMonth] || []).slice());
        setLoadFlag(true);
    }, []);

    const headers = [
        {
            title: '日付',
            field: 'date',
            render: ({ date }) => {
                dateObject.setDate(date);

                const dayOfWeek = dateObject.getDay();
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
        const month = dateObject.getMonth() + (isNext ? 1 : -1);
        const newDate = new Date(dateObject.getFullYear(), month, 1);
        setDateObject(newDate);

        const yearMonth = newDate.getFullYear() + ('0' + (newDate.getMonth() + 1)).slice(-2);
        setTableData((props.data.timeSheets[yearMonth] || []).slice());
    }

    // 社員変更時
    async function handleChangeUser(id: any, name: string) {
        setUser({ id, name: refUser.current });
        const data = await props.getUserData(id);
        const yearMonth = dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2);
        setTableData(data.expenses[yearMonth] || []);
    }

    // レコード更新
    function handleChangeRow(newData: any, oldData: any) {
        newData.isChange = 1;
        delete newData.tableData;
        tableData[oldData.tableData.id] = newData;
        setTableData([...tableData]);
        const month = dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2);
        props.data.timeSheets[month] = tableData;
        props.onChange(tableData, { type: 'timeSheets', id: props.data.id, month });
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
                        props.data.role === 0
                            ? (
                                <Grid item xs={6}>
                                    <InputLabel id="select-users-label">社員</InputLabel>
                                    <Select
                                        autoWidth
                                        defaultValue={user.id}
                                        labelId="select-users-label"
                                        ref={refUser}
                                        onChange={e => {
                                            // name の設定
                                            const id = e.target.value;
                                            handleChangeUser(id, props.users.filter((x: { id: unknown; }) => x.id === id).name);
                                        }}
                                    >
                                        {
                                            props.users.map((d: { id: string; name: string; }) =>
                                                <MenuItem key={d.name} value={d.id}>{d.name}</MenuItem>
                                            )
                                        }
                                    </Select>
                                    <Button className={classes.printButton} size="large" color="primary" variant="contained" onClick={() => props.createTimeSheet(tableData, dateObject, user.name)}>印刷</Button>
                                </Grid>
                            )
                            : ''
                    }
                </Grid>
                <EditableTable
                    title={(dateObject.getMonth() + 1) + '月'}
                    header={headers}
                    data={tableData}
                    options={{
                        pageSize: 10,
                        search: false,
                        headerStyle: { width: 'auto', whiteSpace: 'nowrap' },
                        cellStyle: { width: 'auto', whiteSpace: 'nowrap' },
                    }}
                    handleUpdate={handleChangeRow}
                />
            </Box>
        </div>
    );
}