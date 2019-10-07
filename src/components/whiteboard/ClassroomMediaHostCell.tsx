import * as React from "react";
import {IdentityType, NetlessStream} from "./ClassroomMedia";
import "./ClassroomMediaCell.less";
import {RoomMember} from "white-react-sdk";
import {CSSProperties} from "react";

export type ClassroomMediaCellProps = {
    stream: NetlessStream;
    streamsLength: number;
};

export default class ClassroomMediaHostCell extends React.Component<ClassroomMediaCellProps, {}> {


    public constructor(props: ClassroomMediaCellProps) {
        super(props);
    }

    public componentDidMount(): void {
        const {stream} = this.props;
        const streamId =  stream.getId();
        stream.play(`netless-${streamId}`);
    }

    private handleLocalVideoBox = (): CSSProperties => {
        const {streamsLength} = this.props;
        if (streamsLength === 0) {
            return {width: "100%", height: 360};
        } else {
            return {width: "100%", height: 180};
        }
    }

    public render(): React.ReactNode {
        const {stream} = this.props;
        const streamId =  stream.getId();
        return (
            <div id={`netless-${streamId}`} style={this.handleLocalVideoBox()} className="media-box">
            </div>
        );
    }
}
