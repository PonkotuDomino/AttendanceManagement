import React from "react";
import jaLocale from "date-fns/locale/ja";
import DateFnsUtils from "@date-io/date-fns";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";

class LocalizedDateUtils extends DateFnsUtils {
    getDatePickerHeaderText(date: number | Date) {
        return '';
    }

    getYearText(date: Date) {
        return '';
    }
}

export function CustomDatePicker(props: { value: string, onChange: any, mode?: string }) {
    let dateUtils = DateFnsUtils;
    const options = {
        value: props.value,
        onChange: (date: Date) => props.onChange(date)
    };

    if (props.mode === 'date') {
        dateUtils = LocalizedDateUtils;

        const thisMonth = new Date();
        options['disableFuture'] = 'disableFuture';
        options['minDate'] = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
        options['maxDate'] = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0);
        options['openTo'] = 'date';
        options['format'] = 'd';
        options['views'] = ['date'];
        options['value'] = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), (+props.value || thisMonth.getDate())).toDateString();
        options['onChange'] = (date: Date) => props.onChange(date.getDate());
    }

    return (
        <MuiPickersUtilsProvider locale={jaLocale} utils={dateUtils}>
            <DatePicker {...options} />
        </MuiPickersUtilsProvider>
    )
}