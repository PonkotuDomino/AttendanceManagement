import React, { useEffect, useState } from "react";
import { Box, Button, createStyles, makeStyles } from "@material-ui/core";
import { CircleLoading } from "../components/CircleLoading";
import { CustomTimePicker } from "../components/CustomTimePicker";
import { EditableTable } from "../components/EditableTable";
import { Header } from "../components/Header";

const useStyle = makeStyles(theme => createStyles({
	changeMonthButton: {
		margin: "10px 0",
	},
}));

export function TimeSheets(props: { data: any, onChange: (data: any) => void }) {
	const classes = useStyle();
	const [dateObject, setDateObject] = useState(new Date);
	const [tableData, setTableData] = useState([]);
	const [loadFlag, setLoadFlag] = useState(false);

	useEffect(() => {
		const yearMonth = dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2);
		setTableData((props.data.workingTime[yearMonth] || []).slice());
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
	];

	function handleChangeMonth(isNext: boolean) {
		let month = dateObject.getMonth();
		if (isNext) {
			month++;
		} else {
			month--;
		}

		const newDate = new Date(dateObject.getFullYear(), month, 1);
		setDateObject(newDate);

		const yearMonth = newDate.getFullYear() + ('0' + (newDate.getMonth() + 1)).slice(-2);
		setTableData((props.data.workingTime[yearMonth] || []).slice());
	}

	function handleChangeRow(newData: any, oldData: any) {
		newData.isChange = 1;
		delete newData.tableData;
		tableData[oldData.tableData.id] = newData;
		setTableData([...tableData]);
		props.data.workingTime[dateObject.getFullYear() + ('0' + (dateObject.getMonth() + 1)).slice(-2)] = tableData;
		props.onChange(props.data);
	}

	return (
		<div>
			<CircleLoading {...{ watch: loadFlag }} />
			<Header />
			<Box m={2}>
				<Button className={classes.changeMonthButton} size="large" color="primary" variant="contained" onClick={() => handleChangeMonth(false)}>前月</Button>
				<Button className={classes.changeMonthButton} size="large" color="primary" variant="contained" style={{ marginLeft: '10px' }} onClick={() => handleChangeMonth(true)}>翌月</Button>
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