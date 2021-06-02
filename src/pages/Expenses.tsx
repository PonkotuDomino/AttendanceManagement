import React, { useEffect, useState } from "react";
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
        margin: '10px 10px 10px 0',
    },
    gridItem: {
        marginBottom: '10px'
    },
    errorMessage: {
        color: 'red'
    }
}));

export function Expenses(props: { data: any, users?: any, onChange: (data: any) => void, createExpensesSheet: (data: any, date: Date, name: string) => void }) {
    const classes = useStyle();
    const { handleSubmit, control, errors } = useForm();
    const [meansDetails, displayMeansDetails] = useState(false);
    const [dateObject, setDateObject] = useState(new Date);
    const [loadFlag, setLoadFlag] = useState(false);
    const [tableData, setTableData] = useState([]);

    // レンダリング完了後に実行する
    useEffect(() => {
        if (props.data.settings && props.data.settings.length) {
            const yearMonth = dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2);
            const monthData = (props.data.expenses[yearMonth] || []);
            setLoadFlag(true);
            setTableData(monthData);
        }
    }, []);

    // 追加ボタン押下時
    function handleClickAdd(data: any) {
        const thisMonth = new Date();
        const thisMonthData = props.data.expenses[thisMonth.getFullYear() + ('0' + (thisMonth.getMonth() + 1)).slice(-2)] || [];
        data["no"] = thisMonthData.length + 1;
        thisMonthData.push(data);
        setTableData((thisMonth.getMonth() === dateObject.getMonth()) ? [...thisMonthData] : [...tableData]);
        props.data.expenses[thisMonth.getFullYear() + ('0' + (thisMonth.getMonth() + 1)).slice(-2)] = thisMonthData;
        props.onChange(props.data);

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
                                    <CustomDatePicker value={props.value} onChange={(e: number) => { props.onChange(e); }} mode={'date'} label="日付" />
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
                <Button className={classes.changeMonthButton} size="large" color="primary" variant="contained" onClick={() => handleChangeMonth(false)}>前月</Button>
                <Button className={classes.changeMonthButton} size="large" color="primary" variant="contained" style={{ marginLeft: '10px' }} onClick={() => handleChangeMonth(true)}>翌月</Button>
                {props.data.role === 0 ? <Button className={classes.printButton} size="large" color="primary" variant="contained" onClick={() => props.createExpensesSheet(tableData, dateObject, '')}>印刷</Button> : ''}
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
                            props.data.expenses[dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2)] = tableData;
                            props.onChange(props.data);
                        }
                    }
                    handleDelete={
                        (oldData) => {
                            tableData.splice(oldData.tableData.id);
                            setTableData([...tableData]);
                            props.data.expenses[dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2)] = tableData;
                            props.onChange(props.data);
                        }
                    }
                />
            </Box>
        </div>
    );
}