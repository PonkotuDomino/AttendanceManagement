import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box, Button, createStyles, Divider, Grid, InputAdornment, InputLabel, makeStyles, MenuItem, Select, TextField } from "@material-ui/core";
import { CircleLoading } from "../components/CircleLoading";
import { CustomDatePicker } from "../components/CustomDatePicker";
import { EditableTable } from "../components/EditableTable";
import { Header } from "../components/Header";
import { google } from "../main";

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

export function Expenses(props: { user: any, onChange: (data: any, conditions?: any) => void }) {
    const classes = useStyle();
    const pageName = 'Expenses';
    const { handleSubmit, control, errors } = useForm();
    const [meansDetails, displayMeansDetails] = useState(false);
    const [sheetId, setSheetId] = useState(props.user.ExpensesSheetId);
    const date = new Date();
    date.setDate(1);
    const [targetYearMonth, setTargetYearMonth] = useState(date);
    const [userList, setUserList] = useState([]);
    const [expensesData, setExpensesData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [loadFlag, setLoadFlag] = useState(false);

    // レンダリング完了後に実行する
    useEffect(() => {
        const yearMonth = targetYearMonth.getFullYear() + ('0' + (targetYearMonth.getMonth() + 1)).slice(-2);

        google.script.run
            .withSuccessHandler((result: any) => {
                setExpensesData(result.data); // 全データ保持
                setTableData(result.data[yearMonth] || []); // 対象年月の情報を一覧に設定
                setUserList(result.users); // 社員一覧を設定
                setLoadFlag(true);
            })
            .withFailureHandler((error: { message: any; }) => {
                alert(error.message);
            })
            .getPageData(sheetId, { role: props.user.role, type: pageName });
    }, []);

    // 追加ボタン押下時
    function handleClickAdd(data: any) {
        const thisMonth = new Date();
        const yearMonth = thisMonth.getFullYear() + ('0' + (thisMonth.getMonth() + 1)).slice(-2);
        const thisYearMonthData = expensesData[yearMonth] || [];
        data["no"] = thisYearMonthData.length + 1;
        thisYearMonthData.push(data);
        setTableData((thisMonth.getMonth() === targetYearMonth.getMonth()) ? [...thisYearMonthData] : [...tableData]);
        props.onChange({ type: pageName, sheetId: sheetId, yearMonth }, thisYearMonthData);

        alert('追加しました。');
    }

    // 前月/今月ボタン押下時
    function handleChangeMonth(isNext: boolean) {
        const month = targetYearMonth.getMonth() + (isNext ? 1 : -1);
        const newDate = new Date(targetYearMonth.getFullYear(), month, 1);
        setTargetYearMonth(newDate);

        const yearMonth = newDate.getFullYear() + ('0' + (newDate.getMonth() + 1)).slice(-2);
        setTableData(expensesData[yearMonth] || []);
    }

    // 社員変更時
    function handleChangeUser(selectedSheetId: string) {
        setSheetId(selectedSheetId);

        const yearMonth = targetYearMonth.getFullYear() + ('0' + (targetYearMonth.getMonth() + 1)).slice(-2);
        google.script.run
            .withSuccessHandler((result: any) => {
                setExpensesData(result.data); // 全データ保持
                setTableData(result.data[yearMonth]); // 対象年月の情報を一覧に設定
            })
            .withFailureHandler((error: { message: any; }) => {
                alert(error.message);
            })
            .getPageData(selectedSheetId);
    }

    function createExpensesSheet() {
        // ローカルデバッグ用
        // alert('作成しました。');

        // TODO
        alert('未実装');
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
            editComponent: ({ value, onChange }) => (<CustomDatePicker value={value} onChange={onChange} mode={'date'} targetMonth={targetYearMonth} />)
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
                                defaultValue={targetYearMonth.getDate()}
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
                        props.user.role === 0
                            ? (
                                <Grid item xs={6}>
                                    <InputLabel id="select-users-label">社員</InputLabel>
                                    <Select
                                        autoWidth
                                        defaultValue={props.user.ExpensesSheetId}
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
                                    <Button className={classes.printButton} size="large" color="primary" variant="contained" onClick={() => createExpensesSheet()}>印刷</Button>
                                </Grid>
                            )
                            : ''
                    }
                </Grid>
                <EditableTable
                    title={`交通費精算(${targetYearMonth.getFullYear()}年${(targetYearMonth.getMonth() + 1)}月)`}
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
                            delete newData.tableData;
                            tableData[oldData.tableData.id] = newData;
                            setTableData([...tableData]);

                            const yearMonth = targetYearMonth.getFullYear() + ('0' + (targetYearMonth.getMonth() + 1)).slice(-2);
                            expensesData[yearMonth] = tableData;
                            setExpensesData(expensesData);
                            props.onChange({ type: pageName, sheetId: sheetId, yearMonth }, tableData);
                        }
                    }
                    handleDelete={
                        (oldData) => {
                            tableData.splice(oldData.tableData.id);
                            setTableData([...tableData]);

                            const yearMonth = targetYearMonth.getFullYear() + ('0' + (targetYearMonth.getMonth() + 1)).slice(-2);
                            expensesData[yearMonth] = tableData;
                            setExpensesData(expensesData);
                            props.onChange({ type: pageName, sheetId: sheetId, yearMonth }, tableData);
                        }
                    }
                />
            </Box>
        </div>
    );
}