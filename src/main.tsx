import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core";
import { CircleLoading } from "./components/CircleLoading";
import { ErrorPage } from "./pages/ErrorPage";
import { Expenses } from "./pages/Expenses";
import { PaidHoliday } from "./pages/PaidHoliday";
import { Settings } from "./pages/Settings";
import { TimeSheets } from "./pages/TimeSheets";
import { Top } from "./pages/Top";
import { theme } from "./theme";
import WindowExtention from "../types/WindowExtention";

// ローカルデバッグ用
import { sampleProps } from "./sampleJson";
import { userProps } from "./userJson";
const DEBUG_USER = "soyat";

// Google Script Run呼び出し用変数を定義
export let google = WindowExtention.google;

export function App() {
    // 各ページのpropsに割り当てる個人のデータ
    const [data, setData] = useState({});
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // ローカルデバッグ用
        // const d = sampleProps[DEBUG_USER];
        // setData(d);
        // if(d.role === 0){
        //     setUsers(userProps);
        // }

        google.script.run
            .withSuccessHandler(function (d: string) {
                const result = JSON.parse(d);
                if(!Object.keys(result.data).length){
                    alert('ユーザの取得に失敗しました。');
                    return false;
                }
                setData(result.data);
                setUsers(result.users);
            })
            .withFailureHandler(()=>{ })
            .getData();
    }, []);

    // props更新時処理
    function handleChange(value: any, conditions?: any) {
        // ローカルデバッグ用
        // alert('更新しました。');
        // const result = {
        //     data: sampleProps,
        //     users: (sampleProps[DEBUG_USER].role === 0) ? userProps : {}
        // };
        // if (conditions.type === 'commuting') {
        //     result.data[conditions.id] = value;
        // } else if (conditions.type === 'settings') {
        //     result.data[conditions.id]['settings'] = value;
        // } else if (conditions.type === 'timeSheets' || conditions.type === 'expenses') {
        //     result.data[conditions.id][conditions.type][conditions.month] = value;
        // }
        // setData(result.data[conditions.id]);

        google.script.run
            .withSuccessHandler((d: string) => {
                const result = JSON.parse(d);
                if(!Object.keys(result.data).length){
                    alert('ユーザの取得に失敗しました。');
                    return false;
                }
                setData(result.data);
                setUsers(result.users);
            })
            .withFailureHandler(()=>{ })
            .setData(JSON.stringify(value), conditions);
    }

    // 勤務表印刷
    function createTimeSheet(){
        // ローカルデバッグ用
        // alert('作成しました。');

        // TODO
        alert('未実装');
    }

    // 交通費精算書
    function createExpensesSheet(value: any, date: Date, name: string) {
        // ローカルデバッグ用
        // alert('作成しました。');

        const wareki = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'narrow' }).format(date);
        google.script.run
            .withSuccessHandler((url: string) => {
                if (url) {
                    window.open(url);
                } else {
                    alert('エラーが発生しました。フォルダを確認してください。');
                }
            })
            .withFailureHandler(()=>{ })
            .createExpensesSheet(value, date.getFullYear(), wareki, name);
    }

    // 指定IDの社員情報を取得
    function getUserData(id: string){
        // ローカルデバッグ用
        // return sampleProps[id];

        return new Promise((resolve, reject) => {
            google.script.run
                .withSuccessHandler((value: string) => {
                    const result = JSON.parse(value);
                    resolve(result.data);
                })
                .withFailureHandler(()=>{
                    reject({});
                })
                .getData(id);
        });
    }

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
                                            <TimeSheets data={data} users={users} onChange={handleChange} getUserData={getUserData} createTimeSheet={createTimeSheet} />
                                        </Route>
                                        <Route path="/settings">
                                            <Settings data={data} onChange={handleChange} />
                                        </Route>
                                        <Route path="/expenses">
                                            <Expenses data={data} users={users} onChange={handleChange} getUserData={getUserData} createExpensesSheet={createExpensesSheet} />
                                        </Route>
                                        <Route path="/paidHoliday">
                                            <PaidHoliday data={data} onChange={handleChange} />
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