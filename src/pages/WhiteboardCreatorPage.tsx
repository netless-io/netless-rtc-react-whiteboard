import * as React from "react";
import {Redirect} from "@netless/i18n-react-router";
import {InjectedIntlProps, injectIntl} from "react-intl";
import {whiteboardPageStore} from "../models/WhiteboardPageStore";
import PageError from "./PageError";
import {RoomType} from "../apiMiddleware";
import {message} from "antd";

export type WhiteboardCreatorPageState = {
    uuid?: string;
    foundError: boolean;
};

class WhiteboardCreatorPage extends React.Component<InjectedIntlProps, WhiteboardCreatorPageState> {

    public constructor(props: InjectedIntlProps) {
        super(props);
        this.state = {
            foundError: false,
        };
    }

    public async componentWillMount(): Promise<void> {
        try {
            const uuid = await whiteboardPageStore.createRoomAndGetUuid("test1", 0, RoomType.historied);
            if (uuid) {
                this.setState({uuid: uuid});
            } else {
                message.error("create room fail");
            }
        } catch (error) {
            this.setState({foundError: true});
            throw error;
        }
    }

    public render(): React.ReactNode {
        if (this.state.foundError) {
            return <PageError/>;
        } else if (this.state.uuid) {
            return <Redirect to={`/whiteboard/${this.state.uuid}/1/`}/>;
        }
        return null;
    }
}

export default injectIntl(WhiteboardCreatorPage);
