import * as React from "react";
import {Redirect} from "@netless/i18n-react-router";
import {InjectedIntlProps, injectIntl} from "react-intl";
import {whiteboardPageStore} from "../models/WhiteboardPageStore";
import PageError from "./PageError";
import {RoomType} from "../apiMiddleware";
import {message} from "antd";
import {RouteComponentProps} from "react-router";

export type WhiteboardCreatorPageState = {
    uuid?: string;
    userId?: string;
    foundError: boolean;
};
export type WhiteboardCreatorPageProps = InjectedIntlProps & RouteComponentProps<{
    uuid?: string;
}>;


class WhiteboardCreatorPage extends React.Component<WhiteboardCreatorPageProps, WhiteboardCreatorPageState> {

    public constructor(props: WhiteboardCreatorPageProps) {
        super(props);
        this.state = {
            foundError: false,
        };
    }

    public async componentWillMount(): Promise<void> {
        try {
            let uuid: string | null;
            if (this.props.match.params.uuid) {
                uuid = this.props.match.params.uuid;
            } else {
                uuid = await whiteboardPageStore.createRoomAndGetUuid("test1", 0, RoomType.historied);
            }
            const userId = `${Math.floor(Math.random() * 100000)}`;
            this.setState({userId: userId});
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
        } else if (this.state.uuid && this.state.userId) {
            return <Redirect to={`/whiteboard/${this.state.uuid}/${this.state.userId}/`}/>;
        }
        return null;
    }
}

export default injectIntl(WhiteboardCreatorPage);
