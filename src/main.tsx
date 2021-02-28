import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import { HashRouter, Switch, Route } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core";
import { CircleLoading } from "./components/CircleLoading";
import { Header } from "./components/Header";
import { ErrorPage } from "./pages/ErrorPage";
import { Settings } from "./pages/Settings";
import { TimeSheets } from "./pages/TimeSheets";
import { Top } from "./pages/Top";
import { theme } from "./theme";
import { Auth } from "./auth";
import WindowExtention from "../types/WindowExtention";

/** Google Script Run呼び出し用変数を定義 */
export let google = WindowExtention.google;

export function App() {
	const [email, setEmail] = useState('');

	useEffect(() => {
		setEmail('s@mat-ltd.co.jp');

		// google.script.run
		// 	.withSuccessHandler(function (value: string) {
		// 		setEmail(value);
		// 	})
		// 	.getUserEmail();
	});

	return !!email
		? (
			<div>
				<ThemeProvider theme={theme}>
					<HashRouter>
						<Switch>
							<Route exact path="/error" component={ErrorPage} />
							<Auth email={email}>
								<Switch>
									{/* context対象を記載 */}
									<Route exact path="/">
										<Top email={email} />
									</Route>
									<Route path="/timeSheets">
										<TimeSheets email={email} />
									</Route>
									<Route path="/settings">
										<Settings email={email} />
									</Route>
									<Route >
										{/* デフォルトパス */}
										<Top email={email} />
									</Route>
								</Switch>
							</Auth>
						</Switch>
					</HashRouter>
				</ThemeProvider>
			</div >
		)
		: (
			<div>
				<CircleLoading {...{ watch: !!email }} />
			</div>
		);
}

render(
	<App />,
	document.getElementById("root")
);