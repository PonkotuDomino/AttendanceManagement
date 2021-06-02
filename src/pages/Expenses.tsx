import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box, Button, createStyles, Divider, Grid, InputAdornment, InputLabel, makeStyles, MenuItem, Select, TextField } from "@material-ui/core";
import { CircleLoading } from "../components/CircleLoading";
import { CustomDatePicker } from "../components/CustomDatePicker";
import { EditableTable } from "../components/EditableTable";
import { Header } from "../components/Header";

const useStyle = makeStyles(() => createStyles({
    changeMonthButton: {
        margin: '10px 0',
    },
    printButton: {
        margin: '10px 0 10px 20px',
    },
    gridItem: {
        marginBottom: '10px'
    },
    errorMessage: {
        color: 'red'
    }
}));

export function Expenses(props: { data: any, users?: any, onChange: (data: any, conditions?: any) => void, getUserData: (id: string) => any, createExpensesSheet: (data: any, date: Date, name: string) => void }) {
    const classes = useStyle();
    const { handleSubmit, control, errors } = useForm();
    const [meansDetails, displayMeansDetails] = useState(false);
    const [user, setUser] = useState({ id: props.data.id, name: props.data.name });
    const refUser = useRef(props.data.id);
    const [dateObject, setDateObject] = useState(new Date);
    const [loadFlag, setLoadFlag] = useState(false);
    const [tableData, setTableData] = useState([]);

    // レンダリング完了後に実行する
    useEffect(() => {
        const yearMonth = dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2);
        if (props.data.expenses) {
            setTableData(props.data.expenses[yearMonth] || []);
        }
        setLoadFlag(true);
    }, []);

    // 追加ボタン押下時
    function handleClickAdd(data: any) {
        const thisMonth = new Date();
        const month = thisMonth.getFullYear() + ('0' + (thisMonth.getMonth() + 1)).slice(-2);
        const thisMonthData = props.data.expenses[month] || [];
        data["no"] = thisMonthData.length + 1;
        thisMonthData.push(data);
        setTableData((thisMonth.getMonth() === dateObject.getMonth()) ? [...thisMonthData] : [...tableData]);
        props.onChange(tableData, { type: 'expenses', id: user.id, month });

        alert('追加しました。');
    }

    // 前月/今月ボタン押下時
    function handleChangeMonth(isNext: boolean) {
        const month = dateObject.getMonth() + (isNext ? 1 : -1);
        const newDate = new Date(dateObject.getFullYear(), month, 1);
        setDateObject(newDate);

        const yearMonth = newDate.getFullYear() + ('0' + (newDate.getMonth() + 1)).slice(-2);
        setTableData(props.data.expenses[yearMonth] || []);
    }

    // 社員変更時
    async function handleChangeUser(id: any, name: string) {
        setUser({ id, name });
        const data = await props.getUserData(id);
        const yearMonth = dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2);
        setTableData(data.expenses[yearMonth] || []);
    }

    // ヘッダ情報設定
    const headers = [
        {
            title: '番号',
            field: 'no',
            editable: 'never',
            initialEditValue: tableData.length
        },
        {
            title: '日付',
            field: 'day',
            editComponent: ({ value, onChange }) => (<CustomDatePicker value={value} onChange={onChange} mode={'date'} targetMonth={dateObject} />)
        },
        {
            title: '訪問先',
            field: 'destination',
            validate: ({ destination }) => {
                if (!destination) {
                    return '必須入力';
                }

                return true;
            }
        },
        {
            title: '目的・備考',
            field: 'details',
            validate: ({ details }) => {
                if (!details) {
                    return '必須入力';
                }

                return true;
            }
        },
        {
            title: '手段',
            field: 'means',
            lookup: { 0: '自家用車', 1: '公共機関' },
            initialEditValue: 0
        },
        {
            title: '交通機関',
            field: 'meansDetails',
            validate: ({ means, meansDetails }) => {
                if ((means === 1) && !meansDetails) {
                    return '必須入力';
                }

                return true;
            }
        },
        {
            title: '交通ルート(From)',
            field: 'from',
            validate: ({ from }) => {
                if (!from) {
                    return '必須入力';
                }

                return true;
            }
        },
        {
            title: '交通ルート(To)',
            field: 'to',
            validate: ({ to }) => {
                if (!to) {
                    return '必須入力';
                }

                return true;
            }
        },
        {
            title: '往復',
            field: 'trip',
            lookup: { 0: '往復', 1: '片道' },
            initialEditValue: 0
        },
        {
            title: '距離(Km)',
            field: 'distance',
            type: 'numeric'
        },
        {
            title: '金額',
            field: 'amount',
            type: 'numeric',
            validate: ({ amount }) => {
                if (!amount) {
                    return '必須入力';
                }

                return true;
            }
        },
        {
            title: '上長確認',
            field: 'isConfirmed',
            type: 'boolean',
            editable: 'always' /* 権限によって変える */
        },
    ];

    return (
        <div>
            <CircleLoading {...{ watch: loadFlag }} />
            <Header />

            <Box m={2}>
                <form onSubmit={handleSubmit(handleClickAdd)} autoComplete="off">
                    <Grid container spacing={1}>
                        <Grid className={classes.gridItem} item xs={3}>
                            <Controller
                                name="day"
                                defaultValue={dateObject.getDate()}
                                control={control}
                                render={props =>
                                    <CustomDatePicker value={props.value} onChange={props.onChange} mode={'date'} label="日付" />
                                }
                            />
                        </Grid>
                        <Grid className={classes.gridItem} item xs={8} sm={3}>
                            <Controller
                                name="destination"
                                as={TextField}
                                rules={{ required: true }}
                                defaultValue=""
                                control={control}
                                label="訪問先"
                            />
                            {errors.destination && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid className={classes.gridItem} item xs={12} sm={6}>
                            <Controller
                                name="details"
                                as={TextField}
                                rules={{ required: true }}
                                defaultValue=""
                                control={control}
                                fullWidth
                                label="目的・備考"
                            />
                            {errors.details && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid className={classes.gridItem} item xs={6} sm={3}>
                            <Controller
                                name="from"
                                as={TextField}
                                rules={{ required: true }}
                                defaultValue=""
                                control={control}
                                label="交通ルート(From)"
                            />
                            {errors.from && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid className={classes.gridItem} item xs={6} sm={3}>
                            <Controller
                                name="to"
                                as={TextField}
                                rules={{ required: true }}
                                defaultValue=""
                                control={control}
                                label="交通ルート(To)"
                            />
                            {errors.to && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid className={classes.gridItem} item xs={6} sm={3}>
                            <InputLabel id="select-means-label">手段</InputLabel>
                            <Controller
                                name="means"
                                defaultValue="0"
                                control={control}
                                render={props =>
                                    <Select
                                        defaultValue="0"
                                        labelId="select-means-label"
                                        onChange={e => {
                                            props.onChange(e);
                                            displayMeansDetails(e.target.value === '1');
                                        }}
                                    >
                                        <MenuItem value={'0'}>自家用車</MenuItem>
                                        <MenuItem value={'1'}>公共機関</MenuItem>
                                    </Select>
                                }
                            />
                        </Grid>
                        <Grid className={classes.gridItem} style={{ display: meansDetails ? '' : 'none' }} item xs={6} sm={3}>
                            <Controller
                                name="from"
                                as={TextField}
                                rules={{ required: true }}
                                defaultValue=""
                                control={control}
                                label="交通機関"
                            />
                            {errors.from && (control.getValues().means === '1') && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid className={classes.gridItem} item xs={6} sm={3}>
                            <InputLabel id="select-trip-label">往復</InputLabel>
                            <Controller
                                name="trip"
                                defaultValue="0"
                                control={control}
                                render={props =>
                                    <Select
                                        defaultValue="0"
                                        labelId="select-trip-label"
                                        onChange={e => props.onChange(e)}
                                    >
                                        <MenuItem value={"0"}>往復</MenuItem>
                                        <MenuItem value={"1"}>片道</MenuItem>
                                    </Select>
                                }
                            />
                        </Grid>
                        <Grid className={classes.gridItem} item xs={6} sm={3}>
                            <Controller
                                name="distance"
                                as={TextField}
                                rules={{ required: true }}
                                defaultValue=""
                                control={control}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">km</InputAdornment>,
                                }}
                                label="距離"
                                type="number"
                            />
                            {errors.distance && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid className={classes.gridItem} item xs={6} sm={3}>
                            <Controller
                                name="amount"
                                as={TextField}
                                rules={{ required: true }}
                                defaultValue=""
                                control={control}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">円</InputAdornment>,
                                }}
                                label="金額"
                                type="number"
                            />
                            {errors.amount && <div className={classes.errorMessage}>必須入力</div>}
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
                                    <Button className={classes.printButton} size="large" color="primary" variant="contained" onClick={() => props.createExpensesSheet(tableData, dateObject, user.name)}>印刷</Button>
                                </Grid>
                            )
                            : ''
                    }
                </Grid>
                <EditableTable
                    title={`交通費精算(${dateObject.getFullYear()}年${(dateObject.getMonth() + 1)}月)`}
                    header={headers}
                    data={tableData}
                    options={{
                        pageSize: 5,
                        search: false,
                        headerStyle: { width: 'auto', whiteSpace: 'nowrap' },
                        cellStyle: { width: 'auto', whiteSpace: 'nowrap' },
                    }}
                    isEditable={
                        rowData => !rowData.isConfirmed
                    }
                    isDeletable={
                        rowData => !rowData.isConfirmed
                    }
                    handleUpdate={
                        (newData, oldData) => {
                            tableData[oldData.tableData.id] = newData;
                            setTableData([...tableData]);
                            const month = dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2);
                            props.data.expenses[month] = tableData;
                            props.onChange(tableData, { type: 'expenses', id: user.id, month });
                        }
                    }
                    handleDelete={
                        (oldData) => {
                            tableData.splice(oldData.tableData.id);
                            setTableData([...tableData]);
                            const month = dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2);
                            props.data.expenses[month] = tableData;
                            props.onChange(tableData, { type: 'expenses', id: user.id, month });
                        }
                    }
                />
            </Box>
        </div>
    );
}