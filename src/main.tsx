import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";
import { createStyles, makeStyles, Box, ThemeProvider } from "@material-ui/core";
import { CircleLoading } from "./components/CircleLoading";
import { Header } from "./components/Header";
import { Commuting } from "./pages/Commuting";
import { ErrorPage } from "./pages/ErrorPage";
import { Expenses } from "./pages/Expenses";
import { PaidHoliday } from "./pages/PaidHoliday";
import { WorkingHours } from "./pages/WorkingHours";
import { TimeSettingsMaster } from "./pages/master/TimeSettingsMaster";
import { UserMaster } from "./pages/master/UserMaster";
import { theme } from "./theme";
import WindowExtention from "../types/WindowExtention";

// ローカルデバッグ用
import { userMasterJson } from "./debugData/userMasterJson";
const DEBUG_EMAIL = "soya.t@mat-ltd.co.jp";

// Google Script Run呼び出し用変数を定義
export let google = WindowExtention.google;

// スタイルの指定
const useStyle = makeStyles(() => createStyles({
    container: {
        paddingTop: '64px'
    },
    debugLabel:{
        padding: '5px',
        color: 'white',
        backgroundColor: 'black',
        margin: 0
    }
}));

export function App() {
    const classes = useStyle();
    // 各ページのpropsに割り当てる個人のデータ
    const [userData, setUserData] = useState({
        commuting: false,
        currentContent: ''
    });
    const isDebug = !!DEBUG_EMAIL;

    useEffect(() => {
        if (isDebug) {
            setUserData(prevState => {
                return {
                    ...prevState,
                    ...userMasterJson[DEBUG_EMAIL]
                }
            });
        } else {
            google.script.run
                .withSuccessHandler((data: any) => {
                    setUserData(data);
                })
                .withFailureHandler((error: { message: any; }) => {
                    alert(error.message);
                })
                .getInitData();
        }
    }, []);

    // 更新処理
    function handleChange(conditions: any, value?: any) {
        if (isDebug) {
            alert('追加/更新しました。');
            if (conditions.type === 'Commuting') {
                userData.commuting = !userData.commuting;
                userData.currentContent = value;
                setUserData(prevState => {
                    return {
                        ...prevState,
                        commuting: !userData.commuting,
                        currentContent: value
                    }
                });
            }
        } else {
            google.script.run
                .withSuccessHandler(() => {
                    if (conditions.type === 'Commuting') {
                        const commuting = userData.commuting;
                        setUserData(prevState => {
                            return {
                                ...prevState,
                                commuting: !prevState.commuting
                            };
                        });
                        alert(!commuting ? '出勤しました。' : '退勤しました。');
                    } else {
                        alert('更新しました。');
                    }
                })
                .withFailureHandler((error: { message: any; }) => {
                    alert(error.message);
                })
                .setData(conditions, value);
        }
    }

    return (
        <>
            {
                // 要検討 userDataのプロパティ数が初期値以上の場合を判定
                (Object.keys(userData).length > 2)
                    ? (
                        <ThemeProvider theme={theme}>
                            <Box className={classes.container}>
                                {isDebug ? <h5 className={classes.debugLabel}>デバッグモード</h5> : null}
                                <HashRouter>
                                    <Header user={userData} />
                                    <Switch>
                                        {/* ルーティング */}
                                        <Route exact path="/">
                                            <Commuting user={userData} onChange={handleChange} isDebug={isDebug} />
                                        </Route>
                                        <Route path="/workingHours">
                                            <WorkingHours user={userData} onChange={handleChange} isDebug={isDebug} />
                                        </Route>
                                        <Route path="/expenses">
                                            <Expenses user={userData} onChange={handleChange} isDebug={isDebug} />
                                        </Route>
                                        <Route path="/paidHoliday">
                                            <PaidHoliday user={userData} onChange={handleChange} isDebug={isDebug} />
                                        </Route>
                                        <Route path="/timeSettingsMaster">
                                            <TimeSettingsMaster user={userData} onChange={handleChange} isDebug={isDebug} />
                                        </Route>
                                        <Route path="/userMaster">
                                            <UserMaster user={userData} onChange={handleChange} isDebug={isDebug} />
                                        </Route>
                                        {/* デフォルトパス */}
                                        <Route>
                                            <Commuting user={userData} onChange={handleChange} isDebug={isDebug} />
                                        </Route>
                                        {/* エラーページ */}
                                        <Route path="/error">
                                            <ErrorPage />
                                        </Route>
                                    </Switch>
                                </HashRouter>
                            </Box>
                        </ThemeProvider>
                    )
                    : (
                        <CircleLoading {...{ watch: (Object.keys(userData).length > 2) }} />
                    )
            }
        </>
    );
}

render(
    <App />,
    document.getElementById("root")
);