import * as React from "react";
import {AppRouter, Redirect, RouteInterceptor} from "@netless/i18n-react-router";
import {language} from "../locale";
import {message} from "antd";
import Homepage from "./Homepage";
import WhiteboardCreatorPage from "./WhiteboardCreatorPage";
import WhiteboardPage from "./WhiteboardPage";
import PlayerPage from "./PlayerPage";
import PageNameInput from "./PageNameInput";
export class AppRoutes extends React.Component<{}, {}> {

    public constructor(props: {}) {
        super(props);
    }

    public componentDidCatch(error: any, inf: any): void {
        message.error(`网页加载发生错误：${error}`);
    }

    public render(): React.ReactNode {
        return (
            <AppRouter language={language} routes={[
                {path: "/", component: Homepage},
                {path: "/replay/:uuid/:number/", component: PlayerPage},
                {path: "/name/", component: PageNameInput},
                {path: "/whiteboard/", component: WhiteboardCreatorPage},
                {path: "/whiteboard/:uuid/:number/", component: WhiteboardPage},
            ]}/>
        );
    }
}

