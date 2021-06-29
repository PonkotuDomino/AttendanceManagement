import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box, Button, createStyles, Divider, Grid, InputAdornment, InputLabel, makeStyles, MenuItem, Select, TextField } from "@material-ui/core";
import { CircleLoading } from "../components/CircleLoading";
import { CustomDatePicker } from "../components/CustomDatePicker";
import { EditableTable } from "../components/EditableTable";
import { Header } from "../components/Header";
import { google } from "../main";

// ローカルデバッグ用
import { expensesJson } from "../debugData/expensesJson";
import { userMasterJson } from "../debugData/userMasterJson";

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

export function Expenses(props: { user: any, onChange: (conditions: any, data?: any) => void }) {
    const classes = useStyle();
    const pageName = 'Expenses';
    const { handleSubmit, control, errors } = useForm();
    const [meansDetails, displayMeansDetails] = useState(false);
    const date = new Date();
    date.setDate(1);
    const [state, setState] = useState({
        targetYearMonth: date,
        sheetId: props.user.expensesSheetId,
        expensesData: {},
        tableData: [],
        userList: [],
        loadFlag: false
    });

    // レンダリング完了後に実行する
    useEffect(() => {
        const yearMonth = state.targetYearMonth.getFullYear() + ('0' + (state.targetYearMonth.getMonth() + 1)).slice(-2);

        // ローカルデバッグ用
        const userList = Object.entries(userMasterJson).map(x => x[1]);
        setState(prevState => {
            return {
                ...prevState,
                expensesData: expensesJson,
                tableData: expensesJson[yearMonth],
                userList: userList,
                loadFlag: true
            };
        });

        // google.script.run
        //     .withSuccessHandler((result: any) => {
        //         setState(prevState => {
        //             return {
        //                 ...prevState,
        //                 expensesData: result.data || {},
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

    // 追加ボタン押下時
    function handleClickAdd(data: any) {
        const thisMonth = new Date();
        const yearMonth = thisMonth.getFullYear() + ('0' + (thisMonth.getMonth() + 1)).slice(-2);
        const thisYearMonthData = state.expensesData[yearMonth] || [];
        data["no"] = thisYearMonthData.length + 1;
        thisYearMonthData.push(data);
        props.onChange({ type: pageName, sheetId: state.sheetId, yearMonth }, thisYearMonthData);

        state.expensesData[yearMonth] = thisYearMonthData;
        setState(prevState => {
            return {
                ...prevState,
                expensesData: state.expensesData,
                tableData: ((thisMonth.getMonth() === state.targetYearMonth.getMonth()) ? [...thisYearMonthData] : [...state.tableData]) || []
            };
        });

        alert('追加しました。');
    }

    // 前月/今月ボタン押下時
    function handleChangeMonth(isNext: boolean) {
        const month = state.targetYearMonth.getMonth() + (isNext ? 1 : -1);
        const newDate = new Date(state.targetYearMonth.getFullYear(), month, 1);
        const yearMonth = newDate.getFullYear() + ('0' + (newDate.getMonth() + 1)).slice(-2);

        setState(prevState => {
            return {
                ...prevState,
                targetYearMonth: newDate,
                tableData: prevState.expensesData[yearMonth] || []
            };
        });
    }

    // 社員変更時
    function handleChangeUser(selectedSheetId: string) {
        const yearMonth = state.targetYearMonth.getFullYear() + ('0' + (state.targetYearMonth.getMonth() + 1)).slice(-2);
        // google.script.run
        //     .withSuccessHandler((result: any) => {
        //         setState(prevState => {
        //             return {
        //                 ...prevState,
        //                 sheetId: selectedSheetId,
        //                 expensesData: result.data || {},
        //                 tableData: result.data[yearMonth] || []
        //             };
        //         });
        //     })
        //     .withFailureHandler((error: { message: any; }) => {
        //         alert(error.message);
        //     })
        //     .getPageData(selectedSheetId);
    }

    function createExpensesSheet() {
        const wareki = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'narrow' }).format(state.targetYearMonth);
        // google.script.run
        //     .withSuccessHandler((url: string) => {
        //         if (url) {
        //             window.open(url);
        //             alert('作成しました。');
        //         } else {
        //             alert('エラーが発生しました。フォルダを確認してください。');
        //         }
        //     })
        //     .withFailureHandler((error: { message: any; }) => {
        //         alert(error.message);
        //     })
        //     .createExpensesSheet(state.tableData, state.targetYearMonth.getFullYear(), wareki, props.user.name);
    }

    // ヘッダ情報設定
    const headers = [
        {
            title: '番号',
            field: 'no',
            editable: 'never',
            initialEditValue: state.tableData.length
        },
        {
            title: '日付',
            field: 'day',
            editComponent: ({ value, onChange }) => (<CustomDatePicker value={value} onChange={onChange} mode={'date'} targetMonth={state.targetYearMonth} />)
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
        <>
            <CircleLoading {...{ watch: state.loadFlag }} />
            <Header user={props.user} />

            <Box m={2}>
                <form onSubmit={handleSubmit(handleClickAdd)} autoComplete="off">
                    <Grid container spacing={1}>
                        <Grid className={classes.gridItem} item xs={3}>
                            <Controller
                                name="day"
                                defaultValue={state.targetYearMonth.getDate()}
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
                                name="meansDetails"
                                as={TextField}
                                rules={{ required: meansDetails }}
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
                        <Grid className={classes.gridItem} style={{ display: meansDetails ? 'none' : '' }} item xs={6} sm={3}>
                            <Controller
                                name="distance"
                                as={TextField}
                                rules={{ required: !meansDetails }}
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
                                        defaultValue={props.user.expensesSheetId}
                                        labelId="select-users-label"
                                        onChange={e => {
                                            // name の設定
                                            handleChangeUser(e.target.value as string);
                                        }}
                                    >
                                        {
                                            state.userList.map((d: { expensesSheetId: string; name: string; }) =>
                                                <MenuItem key={d.name} value={d.expensesSheetId}>{d.name}</MenuItem>
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
                    title={`交通費精算(${state.targetYearMonth.getFullYear()}年${(state.targetYearMonth.getMonth() + 1)}月)`}
                    header={headers}
                    data={state.tableData}
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
                            const newTableData = state.tableData;
                            newTableData[oldData.tableData.id] = newData;

                            const yearMonth = state.targetYearMonth.getFullYear() + ('0' + (state.targetYearMonth.getMonth() + 1)).slice(-2);
                            const newExpensesData = state.expensesData;
                            newExpensesData[yearMonth] = newTableData;
                            props.onChange({ type: pageName, sheetId: state.sheetId, yearMonth }, newTableData);

                            setState(prevState => {
                                return {
                                    ...prevState,
                                    expensesData: newExpensesData,
                                    tableData: newTableData
                                };
                            });

                            alert('更新しました。');
                        }
                    }
                    handleDelete={
                        (oldData) => {
                            const newTableData = state.tableData;
                            newTableData.splice(oldData.tableData.id);

                            const yearMonth = state.targetYearMonth.getFullYear() + ('0' + (state.targetYearMonth.getMonth() + 1)).slice(-2);
                            const newExpensesData = state.expensesData;
                            newExpensesData[yearMonth] = newTableData;
                            props.onChange({ type: pageName, sheetId: state.sheetId, yearMonth }, newTableData);

                            setState(prevState => {
                                return {
                                    ...prevState,
                                    expensesData: newExpensesData,
                                    tableData: newTableData
                                };
                            });

                            alert('削除しました。');
                        }
                    }
                />
            </Box>
        </>
    );
}