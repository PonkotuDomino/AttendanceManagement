import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core";
import { CircleLoading } from "./components/CircleLoading";
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

export function App() {
    // 各ページのpropsに割り当てる個人のデータ
    const [userData, setUserData] = useState({ commuting: false });

    useEffect(() => {
        // ローカルデバッグ用
        setUserData(userMasterJson[DEBUG_EMAIL]);

        // google.script.run
        //     .withSuccessHandler((data: any) => {
        //         setUserData(data);
        //     })
        //     .withFailureHandler((error: { message: any; }) => {
        //         alert(error.message);
        //     })
        //     .getInitData();
    }, []);

    // 更新処理
    function handleChange(conditions: any, value?: any) {
        // ローカルデバッグ用
        alert('追加/更新しました。');
        if (conditions.type === 'Commuting') {
            userData.commuting = !userData.commuting;
            setUserData(userData);
        }

        // google.script.run
        //     .withSuccessHandler(() => {
        //         if (conditions.type === 'Commuting') {
        //             userData.commuting = !userData.commuting;
        //             setUserData(userData);
        //         }
        //     })
        //     .withFailureHandler((error: { message: any; }) => {
        //         alert(error.message);
        //     })
        //     .setData(conditions, value);
    }

    return (
        <>
            {
                !!Object.keys(userData).length
                    ? (
                        <ThemeProvider theme={theme}>
                            <HashRouter>
                                <Switch>
                                    {/* ルーティング */}
                                    <Route exact path="/">
                                        <Commuting user={userData} onChange={handleChange} />
                                    </Route>
                                    <Route path="/workingHours">
                                        <WorkingHours user={userData} onChange={handleChange} />
                                    </Route>
                                    <Route path="/expenses">
                                        <Expenses user={userData} onChange={handleChange} />
                                    </Route>
                                    <Route path="/paidHoliday">
                                        <PaidHoliday user={userData} onChange={handleChange} />
                                    </Route>
                                    <Route path="/timeSettingsMaster">
                                        <TimeSettingsMaster user={userData} onChange={handleChange} />
                                    </Route>
                                    <Route path="/userMaster">
                                        <UserMaster user={userData} onChange={handleChange} />
                                    </Route>
                                    {/* デフォルトパス */}
                                    <Route>
                                        <Commuting user={userData} onChange={handleChange} />
                                    </Route>
                                    {/* エラーページ */}
                                    <Route path="/error">
                                        <ErrorPage />
                                    </Route>
                                </Switch>
                            </HashRouter>
                        </ThemeProvider>
                    )
                    : (
                        <CircleLoading {...{ watch: !!Object.keys(userData).length }} />
                    )
            }
        </>
    );
}

render(
    <App />,
    document.getElementById("root")
);