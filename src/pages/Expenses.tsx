import React, { useEffect, useState } from "react";
import { Box, Button, createStyles, Divider, Grid, InputLabel, makeStyles, MenuItem, Select, TextField } from "@material-ui/core";
import { CircleLoading } from "../components/CircleLoading";
import { EditableTable } from "../components/EditableTable";
import { Header } from "../components/Header";
import { CustomDatePicker } from "../components/CustomDatePicker";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

const useStyle = makeStyles(() => createStyles({
    changeMonthButton: {
        margin: '10px 0',
    },
    errorMessage: {
        color: 'red'
    }
}));

export function Expenses(props: { data: any, onChange: (data: any) => void }) {
    const classes = useStyle();
    const { handleSubmit, control, errors } = useForm();
    const [dateObject, setDateObject] = useState(new Date);
    const [loadFlag, setLoadFlag] = useState(false);
    const [isEditable, setIsEditable] = useState(false);
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        if (props.data.settings && props.data.settings.length) {
            const yearMonth = dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2);
            const monthData = (props.data.expenses[yearMonth] || []);
            setLoadFlag(true);
            setIsEditable(monthData && !monthData.isConfirmed);
            setTableData(monthData.slice());
        }
    }, []);

    function handleChangeMonth(isNext: boolean) {
        const month = dateObject.getMonth() + (isNext ? 1 : -1);
        const newDate = new Date(dateObject.getFullYear(), month, 1);
        setDateObject(newDate);

        const yearMonth = newDate.getFullYear() + ('0' + (newDate.getMonth() + 1)).slice(-2);
        setTableData((props.data.expenses[yearMonth] || []).slice());
    }

    function handleClickAdd(data: any) {
        data["no"] = tableData.length;
        tableData.push(data);
        setTableData([...tableData]);
        props.data.expenses[dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2)] = tableData;
        props.onChange(props.data);
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
            editComponent: ({ value, onChange }) => (<CustomDatePicker value={value} onChange={onChange} mode={'date'} />)
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
            lookup: { 0: '往復路', 1: '往路', 2: '復路' },
            initialEditValue: 0
        },
        {
            title: '距離(Km)',
            field: 'distance'
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
    ];

    return (
        <div>
            <CircleLoading {...{ watch: loadFlag }} />
            <Header />

            <Box m={2}>
                <form onSubmit={handleSubmit(handleClickAdd)}>
                    <Grid container spacing={1}>
                        <Grid item xs={3}>
                            <Controller
                                name="day"
                                control={control}
                                defaultValue={dateObject.getDate()}
                                render={props =>
                                    <CustomDatePicker value={props.value} onChange={(e: number) => { props.onChange(e); }} mode={'date'} label="日付" />
                                }
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Controller rules={{ required: true }} as={TextField} name="destination" control={control} defaultValue="" label="訪問先" />
                            {errors.destination && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid item xs={3}>
                            <Controller rules={{ required: true }} as={TextField} name="details" control={control} defaultValue="" label="目的・備考" />
                            {errors.details && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid item xs={3}>
                            <InputLabel id="select-means-label">手段</InputLabel>
                            <Controller
                                name="means"
                                control={control}
                                defaultValue={'0'}
                                render={props =>
                                    <Select
                                        labelId="select-means-label"
                                        defaultValue={'0'}
                                        onChange={e => props.onChange(e)}
                                    >
                                        <MenuItem value={'0'}>自家用車</MenuItem>
                                        <MenuItem value={'1'}>公共機関</MenuItem>
                                    </Select>
                                }
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Controller rules={{ required: true }} as={TextField} name="from" control={control} defaultValue="" label="交通ルート(From)" />
                            {errors.from && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid item xs={3}>
                            <Controller rules={{ required: true }} as={TextField} name="to" control={control} defaultValue="" label="交通ルート(To)" />
                            {errors.to && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid item xs={3}>
                            <InputLabel id="select-trip-label">往復</InputLabel>
                            <Controller
                                name="trip"
                                control={control}
                                defaultValue={"0"}
                                render={props =>
                                    <Select
                                        labelId="select-trip-label"
                                        defaultValue={"0"}
                                        onChange={e => props.onChange(e)}
                                    >
                                        <MenuItem value={"0"}>往復路</MenuItem>
                                        <MenuItem value={"1"}>往路</MenuItem>
                                        <MenuItem value={"2"}>復路</MenuItem>
                                    </Select>
                                }
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Controller rules={{ required: true }} as={TextField} name="distance" control={control} defaultValue="" label="距離" />
                            {errors.distance && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid item xs={3}>
                            <Controller rules={{ required: true }} as={TextField} name="amount" control={control} defaultValue="" label="金額" />
                            {errors.amount && <div className={classes.errorMessage}>必須入力</div>}
                        </Grid>
                        <Grid item xs={6}>
                        </Grid>
                        <Grid container item xs={3} alignItems="flex-end">
                            <Button type="submit" variant="contained" color="primary">追加</Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>

            <Divider variant="middle" />
            
            <Box m={2}>
                <Button className={classes.changeMonthButton} size="large" color="primary" variant="contained" onClick={() => handleChangeMonth(false)}>前月</Button>
                <Button className={classes.changeMonthButton} size="large" color="primary" variant="contained" style={{ marginLeft: '10px' }} onClick={() => handleChangeMonth(true)}>翌月</Button>
                <EditableTable
                    title={'交通費精算'}
                    header={headers}
                    data={tableData}
                    options={{
                        pageSize: 5,
                        search: false,
                        headerStyle: { width: 'auto', whiteSpace: 'nowrap' },
                        cellStyle: { width: 'auto', whiteSpace: 'nowrap' },
                    }}
                    handleUpdate={
                        isEditable
                            ? (newData, oldData) => {
                                tableData[oldData.tableData.id] = newData;
                                setTableData([...tableData]);
                                props.data.expenses[dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2)] = tableData;
                                props.onChange(props.data);
                            }
                            : null
                    }
                    handleDelete={
                        isEditable
                            ? (oldData) => {
                                tableData.splice(oldData.tableData.id);
                                setTableData([...tableData]);
                                props.data.expenses[dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2)] = tableData;
                                props.onChange(props.data);
                            }
                            : null
                    }
                />
            </Box>
        </div>
    );
}