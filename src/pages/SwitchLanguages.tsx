import * as React from "react";

import {Select} from "antd";
import {Route, RouteComponentProps, Switch} from "react-router";
import {BrowserRouter, HashRouter} from "react-router-dom";
import {pathReplaceLan} from "@netless/i18n-react-router";

const Router = process.env.ELECTRON === "electron" ? HashRouter : BrowserRouter;

type LanguageOption = {
    readonly lan: string;
    readonly title: string;
};

export default class SwitchLanguages extends React.Component<{}, {}> {

    private static readonly languageOptions: ReadonlyArray<LanguageOption> = Object.freeze([
        Object.freeze({lan: "zh-CN", title: "中文"}),
        Object.freeze({lan: "en", title: "English"}),
    ]);

    public render(): React.ReactNode {
        return (
            <Router>
                <Switch>
                    <Route path="/:lan" render={this.renderSelectOptions}/>
                </Switch>
            </Router>
        );
    }

    private renderSelectOptions = (routeProps: RouteComponentProps<{lan: string}>): React.ReactNode => {
        return (
            <Select
                defaultValue={routeProps.match.params.lan}
                size={"small"}
                dropdownMatchSelectWidth={false}
                onChange={(lan: string) => {
                    const path = routeProps.location.pathname;
                    window.location.pathname = pathReplaceLan(path, lan);
                }}>
                {SwitchLanguages.languageOptions.map(({lan, title}) => (
                    <Select.Option key={lan} value={lan}>{title}</Select.Option>
                ))}
            </Select>
        );
    }
}
