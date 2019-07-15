import * as React from "react";
import {AppRouter, HistoryType} from "@netless/i18n-react-router";
import {language} from "../locale";
import {message} from "antd";
import WhiteboardCreatorPage from "./WhiteboardCreatorPage";
import WhiteboardPage from "./WhiteboardPage";
import PlayerPage from "./PlayerPage";
import PageNameInput from "./Homepage";
message.config({
    top: (window.innerHeight / 2 - 64),
    maxCount: 1,
});
export class AppRoutes extends React.Component<{}, {}> {

    public constructor(props: {}) {
        super(props);
    }

    public componentDidCatch(error: any, inf: any): void {
        message.error(`网页加载发生错误：${error}`);
    }

    public render(): React.ReactNode {
        return (
            <AppRouter historyType={HistoryType.HashRouter} language={language} routes={[
                {path: "/replay/:uuid/:userId/:time?/:duration?/:mediaSource?/", component: PlayerPage},
                {path: "/", component: PageNameInput},
                {path: "/whiteboard/:whiteboardRoomType/:uuid?/", component: WhiteboardCreatorPage},
                {path: "/whiteboard/:whiteboardRoomType/:uuid/:userId/", component: WhiteboardPage},
            ]}/>
        );
    }
}

