import React, { useEffect, useState } from "react";
import { Box } from "@material-ui/core";
import { CircleLoading } from "../components/CircleLoading";
import { CustomTimePicker } from "../components/CustomTimePicker";
import { EditableTable } from "../components/EditableTable";
import { Header } from "../components/Header";

export function Settings(props: { data: any, onChange: (data: any) => void }) {
    const [loadFlag, setLoadFlag] = useState(false);
    const [tableData, setTableData] = useState([]);

    const headers = [
        {
            title: '名称',
            field: 'name'
        },
        {
            title: '単位',
            field: 'interval'
        },
        {
            title: '開始時刻',
            field: 'workStartTime',
            render: ({ workStartTime }) => {
                const value = ('0' + workStartTime).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '終了時刻',
            field: 'workEndTime',
            render: ({ workEndTime }) => {
                const value = ('0' + workEndTime).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '休憩時間From1',
            field: 'restTimeFrom1',
            render: ({ restTimeFrom1 }) => {
                const value = ('0' + restTimeFrom1).slice(-4);
                return value.substring(0, 2) + ':' + value.substring(2, 4);
            },
            editComponent: ({ value, onChange }) => (<CustomTimePicker value={value} onChange={onChange} />)
        },
        {
            title: '休憩時間To1',
            field: 'restTimeTo1',
            render: ({ restTimeTo1 }) => {
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

    useEffect(() => {
        if (props.data.settings && props.data.settings.length !== []) {
            setTableData(props.data.settings);
            setLoadFlag(true);
        }
    }, []);

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
                    handleUpdate={
                        (newData, oldData) => {
                            tableData[oldData.tableData.id] = newData;
                            setTableData([...tableData]);
                        }
                    }
                />
            </Box>
        </div>
    );
}