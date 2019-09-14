import * as React from "react";
import {IdentityType, NetlessStream} from "./ClassroomMedia";
import "./ClassroomMediaCell.less";
import {CSSProperties} from "react";

export type ClassroomMediaCellProps = {
    stream: NetlessStream;
    identity: IdentityType;
    streamsLength: number;
    hasHost: boolean;
};

export default class ClassroomMediaCell extends React.Component<ClassroomMediaCellProps, {}> {


    public constructor(props: ClassroomMediaCellProps) {
        super(props);
    }

    public componentDidMount(): void {
        const {stream} = this.props;
        const streamId =  stream.getId();
        stream.play(`netless-${streamId}`);
    }

    public render(): React.ReactNode {
        const {stream} = this.props;
        const streamId =  stream.getId();
        return (
            <div id={`netless-${streamId}`} style={this.handleVideoBox()} className="media-box">
            </div>
        );
    }

    private handleVideoBox = (): CSSProperties => {
        const {streamsLength, identity, hasHost} = this.props;
        if (identity === IdentityType.host) {
            if (streamsLength === 1) {
                return {width: "100%", height: 180};
            } else if (streamsLength === 2) {
                return {width: "50%", height: 180};
            } else {
                return {width: "33.33%", height: 90};
            }
        } else {
            let myLength;
            if (hasHost) {
                myLength = streamsLength + 1;
            } else {
                myLength = streamsLength;
            }
            if (myLength === 1) {
                return {width: "100%", height: 180};
            } else if (myLength === 2) {
                return {width: "50%", height: 180};
            } else {
                return {width: "33.33%", height: 90};
            }
        }
    }


}
