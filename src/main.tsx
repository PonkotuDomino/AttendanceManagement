import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core";
import { CircleLoading } from "./components/CircleLoading";
import { ErrorPage } from "./pages/ErrorPage";
import { Settings } from "./pages/Settings";
import { Expenses } from "./pages/Expenses";
import { TimeSheets } from "./pages/TimeSheets";
import { Top } from "./pages/Top";
import { theme } from "./theme";
import WindowExtention from "../types/WindowExtention";

// ローカルデバッグ用
import { sampleProps } from "./sampleJson";
import { userProps } from "./userJson";

// Google Script Run呼び出し用変数を定義
export let google = WindowExtention.google;

export function App() {
    // 各ページのpropsに割り当てる個人のデータ
    const [data, setData] = useState({});
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // ローカルデバッグ用
        setData(sampleProps['soyat']);
        setUsers(userProps);

        google.script.run
            .withSuccessHandler(function (value: string) {
                const result = JSON.parse(value);
                if(Object.keys(result.data).length){
                    alert('ユーザの取得に失敗しました。');
                    return false;
                }
                setData(result.data);
                if(result.data.role === 0){
                    setUsers(result.users);
                }
            })
            .getData();
    }, []);

    function handleChange(data: any) {
        // ローカルデバッグ用
        alert('更新しました。');

        setData(data);
        // google.script.run
        //     .withSuccessHandler(function () { })
        //     .setData(JSON.stringify(data));
    }

    function createExpensesSheet(data: any, date: Date, name: string) {
        // ローカルデバッグ用
        alert('作成しました。');

        const wareki = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'narrow' }).format(date);
        google.script.run
            .withSuccessHandler(function (url: string) {
                if (url) {
                    window.open(url);
                } else {
                    alert('エラーが発生しました。フォルダを確認してください。');
                }
            })
            .createExpensesSheet(data, date.getFullYear(), wareki, name);
    }

    const hasData = !!Object.keys(data).length;
    return (
        <div>
            {
                !!Object.keys(data).length
                    ? (
                        <ThemeProvider theme={theme}>
                            <HashRouter>
                                <Switch>
                                    <Route exact path="/error" component={ErrorPage} />
                                    <Switch>
                                        {/* ルーティング */}
                                        <Route exact path="/">
                                            <Top data={data} onChange={handleChange} />
                                        </Route>
                                        <Route path="/timeSheets">
                                            <TimeSheets data={data} onChange={handleChange} />
                                        </Route>
                                        <Route path="/settings">
                                            <Settings data={data} onChange={handleChange} />
                                        </Route>
                                        <Route path="/expenses">
                                            <Expenses data={data} users={users} onChange={handleChange} createExpensesSheet={createExpensesSheet} />
                                        </Route>
                                        <Route>
                                            {/* デフォルトパス */}
                                            <Top data={data} onChange={handleChange} />
                                        </Route>
                                    </Switch>
                                </Switch>
                            </HashRouter>
                        </ThemeProvider>
                    )
                    : (
                        <CircleLoading {...{ watch: !!Object.keys(data).length }} />
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