import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import { HashRouter, Switch, Route } from "react-router-dom";
import { Login } from "./pages/LoginPage";
import { TopPage } from "./pages/TopPage";
import { AboutPage } from "./pages/AboutPage";
import WindowExtention from "../types/WindowExtention";
import { ThemeProvider } from "@material-ui/core";
import { theme } from "./theme";
import { Auth } from "./auth";
import { CircleLoading } from "./components/CircleLoading";

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
							<Route exact path="/login" component={Login} />
							{/* <Route exact path="/logout" component={Logout} /> */}
							<Auth email={email}>
								<Switch>
									{/* context対象を記載 */}
									<Route exact path="/">
										<TopPage email={email} />
									</Route>
									<Switch>
										<Route path="/about">
											<AboutPage />
										</Route>
										{/* Default pathはSwitch最後に記載を */}
										<Route >
											<TopPage email={email} />
										</Route>
									</Switch>
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