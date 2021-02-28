import React from "react";
import { MuiPickersUtilsProvider, TimePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

export function CustomTimePicker(props: { value: string, onChange: any }) {
    const time = props.value
        ? '2020-02-28T' + (props.value.substring(0, 2) + ':' + props.value.substring(2, 4)) + '+09:00'
        : null;
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <TimePicker
                ampm={false}
                onChange={(value) => props.onChange(('0' + value.getHours()).slice(-2) + ('0' + value.getMinutes()).slice(-2))}
                value={time}
                views={['hours', 'minutes']}
            />
        </MuiPickersUtilsProvider>
    )
}