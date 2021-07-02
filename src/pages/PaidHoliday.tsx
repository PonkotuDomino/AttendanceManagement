import React, { useEffect, useState } from "react";
import { createStyles, makeStyles } from "@material-ui/core";
import { CircleLoading } from "../components/CircleLoading";
import { Header } from "../components/Header";

const useStyle = makeStyles(() => createStyles({
    aaa: {
        marginBottom: '10px'
    }
}));

export function PaidHoliday(props: { user: any, onChange: (data: any, conditions?: any) => void, isDebug: boolean }) {
    const classes = useStyle();
    const [loadFlag, setLoadFlag] = useState(false);

    // レンダリング完了後に実行する
    useEffect(() => {
        setLoadFlag(true);
    }, []);

    return (
        <>
            <CircleLoading {...{ watch: loadFlag }} />
            <Header user={props.user} />

            <div className={classes.aaa}>
                有給休暇管理
            </div>
        </>
    );
};