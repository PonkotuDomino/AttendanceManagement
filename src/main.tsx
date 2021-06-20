import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core";
import { CircleLoading } from "./components/CircleLoading";
import { ErrorPage } from "./pages/ErrorPage";
import { Expenses } from "./pages/Expenses";
import { PaidHoliday } from "./pages/PaidHoliday";
import { TimeSettings } from "./pages/TimeSettings";
import { WorkingHours } from "./pages/WorkingHours";
import { Commuting } from "./pages/Commuting";
import { theme } from "./theme";
import WindowExtention from "../types/WindowExtention";

// ローカルデバッグ用
// import { userMasterJson } from "./debugData/userMasterJson";
// const DEBUG_EMAIL = "soya.t@mat-ltd.co.jp";

// Google Script Run呼び出し用変数を定義
export let google = WindowExtention.google;

export function App() {
    // 各ページのpropsに割り当てる個人のデータ
    const [userData, setUserData] = useState({ commuting: false });

    useEffect(() => {
        // ローカルデバッグ用
        // setUserData(userMasterJson[DEBUG_EMAIL]);

        google.script.run
            .withSuccessHandler((data: any) => {
                setUserData(data);
            })
            .withFailureHandler((error: { message: any; }) => {
                alert(error.message);
            })
            .getInitData();
    }, []);

    // 更新処理
    function handleChange(conditions: any, value?: any) {
        google.script.run
            .withSuccessHandler(() => {
                if(conditions.type === 'Commuting'){
                    userData.commuting = !userData.commuting;
                    setUserData(userData);
                }
            })
            .withFailureHandler((error: { message: any; }) => {
                alert(error.message);
            })
            .setData(conditions, value);
    }

    return (
        <div>
            {
                !!Object.keys(userData).length
                    ? (
                        <ThemeProvider theme={theme}>
                            <HashRouter>
                                <Switch>
                                    <Route exact path="/error" component={ErrorPage} />
                                    <Switch>
                                        {/* ルーティング */}
                                        <Route exact path="/">
                                            <Commuting user={userData} onChange={handleChange} />
                                        </Route>
                                        <Route path="/workingHours">
                                            <WorkingHours user={userData} onChange={handleChange} />
                                        </Route>
                                        <Route path="/timeSettings">
                                            <TimeSettings user={userData} onChange={handleChange} />
                                        </Route>
                                        <Route path="/expenses">
                                            <Expenses user={userData} onChange={handleChange} />
                                        </Route>
                                        <Route path="/paidHoliday">
                                            <PaidHoliday user={userData} onChange={handleChange} />
                                        </Route>
                                        <Route>
                                            {/* デフォルトパス */}
                                            <Commuting user={userData} onChange={handleChange} />
                                        </Route>
                                    </Switch>
                                </Switch>
                            </HashRouter>
                        </ThemeProvider>
                    )
                    : (
                        <CircleLoading {...{ watch: !!Object.keys(userData).length }} />
                    )
            }
        </div>
    );

    return
}

render(
    <App />,
    document.getElementById("root")
);