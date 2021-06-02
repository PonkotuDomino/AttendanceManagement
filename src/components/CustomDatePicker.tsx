import React from "react";
import format from "date-fns/format";
import jaLocale from "date-fns/locale/ja";
import DateFnsUtils from "@date-io/date-fns";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";

class LocalizedDateUtils extends DateFnsUtils {
    getCalendarHeaderText(date: any) {
        return format(date, "yyyy年 M月", { locale: this.locale });
    }
}

export function CustomDatePicker(props: { label?: string, value: string, onChange: any, mode?: string, required?: boolean, targetMonth?: Date }) {
    let dateUtils = DateFnsUtils;
    const options = {
        value: props.value,
        onChange: (date: Date) => props.onChange(date)
    };

    // 年月日選択を追加した際に共通化できるところは共通化
    if (props.mode === 'date') {
        dateUtils = LocalizedDateUtils;

        const thisMonth = props.targetMonth || new Date();
        options['label'] = props.label;
        options['disableFuture'] = 'disableFuture';
        options['minDate'] = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
        options['maxDate'] = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0);
        options['openTo'] = 'date';
        options['format'] = 'd';
        options['views'] = ['date'];
        options['value'] = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), (+props.value || thisMonth.getDate())).toDateString();
        options['onChange'] = (date: Date) => props.onChange(date.getDate());
        options['autoOk'] = true;
        options['disableFuture'] = true;
        options['disableToolbar'] = true;
        options['orientation'] = "portrait";
        options['variant'] = "inline";
    }

    return (
        <MuiPickersUtilsProvider locale={jaLocale} utils={dateUtils}>
            <DatePicker {...options} />
        </MuiPickersUtilsProvider>
    )
}