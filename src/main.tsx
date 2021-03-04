import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import { HashRouter, Switch, Route } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core";
import { CircleLoading } from "./components/CircleLoading";
import { ErrorPage } from "./pages/ErrorPage";
import { Settings } from "./pages/Settings";
import { TimeSheets } from "./pages/TimeSheets";
import { Top } from "./pages/Top";
import { theme } from "./theme";
import WindowExtention from "../types/WindowExtention";

/** Google Script Run呼び出し用変数を定義 */
export let google = WindowExtention.google;

export function App() {
	const [data, setData] = useState({});

	useEffect(() => {
		// ローカルデバッグ用
		// setData(sampleProps['soyat']);

		google.script.run
			.withSuccessHandler(function (value: string) {
				setData(JSON.parse(value));
			})
			.getData();
	}, []);

	function handleChange(data: any) {
		setData(data);

		google.script.run
			.withSuccessHandler(function () { })
			.setData(JSON.stringify(data));
	}

	return !!Object.keys(data).length
		? (
			<div>
				<ThemeProvider theme={theme}>
					<HashRouter>
						<Switch>
							<Route exact path="/error" component={ErrorPage} />
							<Switch>
								{/* context対象を記載 */}
								<Route exact path="/">
									<Top data={data} onChange={handleChange} />
								</Route>
								<Route path="/timeSheets">
									<TimeSheets data={data} onChange={handleChange} />
								</Route>
								<Route path="/settings">
									<Settings data={data} onChange={handleChange} />
								</Route>
								<Route>
									{/* デフォルトパス */}
									<Top data={data} onChange={handleChange} />
								</Route>
							</Switch>
						</Switch>
					</HashRouter>
				</ThemeProvider>
			</div >
		)
		: (
			<div>
				<CircleLoading {...{ watch: !!Object.keys(data).length }} />
			</div>
		);
}

render(
	<App />,
	document.getElementById("root")
);