import React, { useEffect, useState } from "react";
import { Box, Button, createStyles, makeStyles, TextField } from "@material-ui/core";
import { CircleLoading } from "../components/CircleLoading";
import { EditableTable } from "../components/EditableTable";
import { Header } from "../components/Header";
import { CustomDatePicker } from "../components/CustomDatePicker";

const useStyle = makeStyles(() => createStyles({
    changeMonthButton: {
        margin: "10px 0",
    },
}));

export function Expenses(props: { data: any, onChange: (data: any) => void }) {
    const classes = useStyle();
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
            field: 'means',
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
                    handleInsert={
                        (newData) => {
                            tableData.push(newData);
                            setTableData([...tableData]);
                            props.data.expenses[dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2)] = tableData;
                            props.onChange(props.data);
                        }
                    }
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