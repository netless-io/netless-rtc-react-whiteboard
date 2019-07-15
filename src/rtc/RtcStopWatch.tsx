import * as React from "react";
import {displayWatch} from "./WatchDisplayer";

export type RtcStopWatchProps = {joinRoomTime: number};

export default class RtcStopWatch extends React.Component<RtcStopWatchProps, {}> {
    public render(): React.ReactNode {
        return (
            <div>
                {displayWatch(this.props.joinRoomTime)}
            </div>
        );
    }
}
