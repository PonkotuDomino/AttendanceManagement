import React from "react";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, TimePicker } from "@material-ui/pickers";

export function CustomTimePicker(props: { label?: string, value: string, onChange: any }) {
    const time = props.value
        ? '2020-02-28T' + (props.value.substring(0, 2) + ':' + props.value.substring(2, 4)) + '+09:00'
        : null;
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <TimePicker
                autoOk
                disableToolbar
                ampm={false}
                emptyLabel={'00:00'} // 要件等
                label={props.label || ''}
                value={time}
                variant="inline"
                views={['hours', 'minutes']}
                onChange={(value) => props.onChange(value ? ('0' + value.getHours()).slice(-2) + ('0' + value.getMinutes()).slice(-2) : null)}
            />
        </MuiPickersUtilsProvider>
    )
}