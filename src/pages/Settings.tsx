import React, { useEffect, useState } from "react";
import { Box } from "@material-ui/core";
import { CircleLoading } from "../components/CircleLoading";
import { CustomTimePicker } from "../components/CustomTimePicker";
import { EditableTable } from "../components/EditableTable";
import { Header } from "../components/Header";

export function Settings(props: { data: any, onChange: (data: any) => void }) {
    const [loadFlag, setLoadFlag] = useState(false);
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        setTableData(props.data.settings);
        setLoadFlag(true);
    }, []);

    function validation({ interval, workStartTime, workEndTime, restTimeFrom1, restTimeTo1, restTimeFrom2, restTimeTo2, restTimeFrom3, restTimeTo3 }) {
        if (interval <= 0 || interval >= 60) {
            alert('単位(分)は0~59の間で指定してください。');
            return false;
        }

        if (!workStartTime) {
            alert('開始時刻を指定してください。');
            return false;
        }

        if (!workEndTime) {
            alert('終了時刻を指定してください。');
            return false;
        }

        if (workStartTime === workEndTime) {
            alert('開始時刻と終了時刻を同じにすることはできません。');
            return false;
        }

        if (workStartTime > workEndTime) {
            alert('開始時刻を終了時刻より後に指定するはできません。');
            return false;
        }

        if (!restTimeFrom1) {
            alert('休憩時間From1を指定してください。');
            return false;
        }

        if (!restTimeTo1) {
            alert('休憩時間To1を指定してください。');
            return false;
        }

        if (restTimeFrom1 === restTimeTo1) {
            alert('休憩時間From1と休憩時間To1を同じにすることはできません。');
            return false;
        }

        if (restTimeTo1 > restTimeTo1) {
            alert('休憩時間From1を休憩時間To1より後に指定するはできません。');
            return false;
        }

        if (restTimeFrom2 && !restTimeTo2) {
            alert('休憩時間To2を指定してください。');
            return false;
        }

        if (!restTimeFrom2 && restTimeTo2) {
            alert('休憩時間From2を指定してください。');
            return false;
        }

        if (restTimeFrom2 && restTimeTo2) {
            if (restTimeFrom2 === restTimeTo2) {
                alert('休憩時間From2と休憩時間To2を同じにすることはできません。');
                return false;
            }

            if (restTimeFrom2 > restTimeTo2) {
                alert('休憩時間From2を休憩時間To2より後に指定するはできません。');
                return false;
            }
        }

        if (restTimeFrom3 && !restTimeTo3) {
            alert('休憩時間To3を指定してください。');
            return false;
        }

        if (!restTimeFrom3 && restTimeTo3) {
            alert('休憩時間From3を指定してください。');
            return false;
        }

        if (restTimeFrom3 && restTimeTo3) {
            if (restTimeFrom3 === restTimeTo3) {
                alert('休憩時間From3と休憩時間To3を同じにすることはできません。');
                return false;
            }

            if (restTimeFrom3 > restTimeTo3) {
                alert('休憩時間From3を休憩時間To3より後に指定するはできません。');
                return false;
            }
        }

        return true;
    }

    const headers = [
        {
            title: '番号',
            field: 'no',
            editable: 'never',
            initialEditValue: tableData ? (tableData.length + 1) : 1
        },
        {
            title: '名称',
            field: 'name',
            validate: (rowData: any) => {
                if (!rowData.name) {
                    return '必須入力';
                }

                return true;
            }
        },
        {
            title: '単位(分)',
            field: 'interval',
            type: 'numeric',
            validate: (rowData: any) => {
                if (!rowData.interval) {
                    return '必須入力';
                }

                return true;
            }
        },
        {
            title: '開始時刻',
            field: 'workStartTime',
            render: ({ workStartTime }) => {
                if (!workStartTime) {
                    return '';
                }

                const value = ('0' + workStartTime).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '終了時刻',
            field: 'workEndTime',
            render: ({ workEndTime }) => {
                if (!workEndTime) {
                    return '';
                }

                const value = ('0' + workEndTime).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '休憩時間From1',
            field: 'restTimeFrom1',
            render: ({ restTimeFrom1 }) => {
                if (!restTimeFrom1) {
                    return '';
                }

                const value = ('0' + restTimeFrom1).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '休憩時間To1',
            field: 'restTimeTo1',
            render: ({ restTimeTo1 }) => {
                if (!restTimeTo1) {
                    return '';
                }

                const value = ('0' + restTimeTo1).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '休憩時間From2',
            field: 'restTimeFrom2',
            render: ({ restTimeFrom2 }) => {
                if (!restTimeFrom2) {
                    return '';
                }

                const value = ('0' + restTimeFrom2).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '休憩時間To2',
            field: 'restTimeTo2',
            render: ({ restTimeTo2 }) => {
                if (!restTimeTo2) {
                    return '';
                }

                const value = ('0' + restTimeTo2).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '休憩時間From3',
            field: 'restTimeFrom3',
            render: ({ restTimeFrom3 }) => {
                if (!restTimeFrom3) {
                    return '';
                }

                const value = ('0' + restTimeFrom3).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '休憩時間To3',
            field: 'restTimeTo3',
            render: ({ restTimeTo3 }) => {
                if (!restTimeTo3) {
                    return '';
                }

                const value = ('0' + restTimeTo3).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
    ];

    return (
        <div>
            <CircleLoading {...{ watch: loadFlag }} />
            <Header />
            <Box m={2}>
                <EditableTable
                    title={'時間設定'}
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
                        }
                    }
                    validationInsert={validation}
                    handleUpdate={
                        (newData, oldData) => {
                            tableData[oldData.tableData.id] = newData;
                            setTableData([...tableData]);
                        }
                    }
                    validationUpdate={validation}
                    handleDelete={
                        (oldData) => {
                            const id = oldData.tableData.id;
                            if (id === 0) {
                                alert('1件目は削除できません。');
                                return false;
                            }
                            tableData.splice(id);
                            setTableData([...tableData]);
                        }
                    }
                />
            </Box>
        </div>
    );
}