import * as React from "react";
import {Redirect} from "@netless/i18n-react-router";
import PageError from "./PageError";
import {netlessWhiteboardApi, RoomType} from "../apiMiddleware";
import {message} from "antd";
import {RouteComponentProps} from "react-router";

export type ClassroomCreatorPageState = {
    uuid?: string;
    userId?: string;
    foundError: boolean;
};

export enum NetlessRoomType {
    live = "live",
    interactive = "interactive",

}
export type ClassroomCreatorPageProps = RouteComponentProps<{
    classroomType: NetlessRoomType;
    uuid?: string;
}>;


class ClassroomCreatorPage extends React.Component<ClassroomCreatorPageProps, ClassroomCreatorPageState> {

    public constructor(props: ClassroomCreatorPageProps) {
        super(props);
        this.state = {
            foundError: false,
        };
    }

    private createRoomAndGetUuid = async (room: string, limit: number, mode: RoomType): Promise<string | null>  => {
        const res = await netlessWhiteboardApi.room.createRoomApi(room, limit, mode);
        if (res.code === 200) {
            return res.msg.room.uuid;
        } else {
            return null;
        }
    }
    public async componentWillMount(): Promise<void> {
        try {
            let uuid: string | null;
            if (this.props.match.params.uuid) {
                uuid = this.props.match.params.uuid;
            } else {
                uuid = await this.createRoomAndGetUuid("test1", 0, RoomType.historied);
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
        const classroomType = this.props.match.params.classroomType;
        if (this.state.foundError) {
            return <PageError/>;
        } else if (this.state.uuid && this.state.userId) {
            return <Redirect to={`/classroom/${classroomType}/${this.state.uuid}/${this.state.userId}/`}/>;
        }
        return null;
    }
}

export default ClassroomCreatorPage;
