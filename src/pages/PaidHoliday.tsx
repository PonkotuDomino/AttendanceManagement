import React, { useEffect, useState } from "react";
import { createStyles, makeStyles } from "@material-ui/core";
import { CircleLoading } from "../components/CircleLoading";
import { Header } from "../components/Header";

const useStyle = makeStyles(() => createStyles({
    aaa: {
        marginBottom: '10px'
    }
}));

export function PaidHoliday(props: { data: any, onChange: (data: any, conditions?: any) => void }) {
    const classes = useStyle();
    const [loadFlag, setLoadFlag] = useState(false);

    // レンダリング完了後に実行する
    useEffect(() => {
        setLoadFlag(true);
    }, []);

    return (
        <div className={classes.aaa}>
            <CircleLoading {...{ watch: loadFlag }} />
            <Header />

            有給休暇管理
        </div>
    );
};