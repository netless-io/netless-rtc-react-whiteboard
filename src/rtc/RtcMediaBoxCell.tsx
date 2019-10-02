import "./RtcMediaBoxCell.less";
import * as React from "react";
import TweenOne from "rc-tween-one";
import Identicon from "react-identicons";
import userHead from "./icons/user_head.svg";
import mute_gray from "./icons/mute_gray.svg";
import voice from "./icons/voice.svg";
import RtcMediaBoxCellPlayerBox from "./RtcMediaBoxCellPlayerBox";
import {StreamsStatesType} from "./RtcDesktop";
import {RoomMember} from "@netless/white-react-sdk";
import "./RtcMediaBoxCell.less";
import {SlidingBlockState} from "./slidingBlock";

export type rtcVideoCellProps = {
    streamBoxId: string;
    roomMember: RoomMember,
    remoteStream?: any;
    remoteIndex?: number;
    blockState:  SlidingBlockState;
    streamsState?: StreamsStatesType;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export type RtcMediaBoxCellStates = {
    isFirst: boolean;
};

export default class RtcMediaBoxCell extends React.Component<rtcVideoCellProps, RtcMediaBoxCellStates> {

    public constructor(props: rtcVideoCellProps) {
        super(props);
        this.state = {
            isFirst: true,
        };
    }

    public componentWillReceiveProps(): void {
    }
    private renderRemoteVoiceIcon(): React.ReactNode {
        const { streamsState }  = this.props;
        if (streamsState && streamsState.state.isAudioOpen) {
            return (
                <div className="rtc-float-sound">
                    <img className="rtc-float-sound-img" src={voice}/>
                </div>
            );
        } else {
            return (
                <div className="rtc-float-sound">
                    <img className="rtc-float-sound-img" src={mute_gray}/>
                </div>
            );
        }
    }
    public render(): React.ReactNode {
        const { remoteStream, roomMember, streamsState}  = this.props;
        return (
            <div className="rtc-video-box-cell-out">
                <div
                    style={{
                        zIndex: 2,
                        display: (streamsState && streamsState.state.isVideoOpen) ?  "none" : "flex",
                    }}
                    className="rtc-float-cell">
                    <TweenOne
                        animation={{
                            blur: remoteStream ? "0px" : "4px",
                        }}
                        resetStyle={true}
                        className="rtc-float-cell-mid">
                        {(roomMember.payload && roomMember.payload.avatar) ?
                            <Identicon
                                size={128}
                                string={roomMember.payload.avatar}/> :
                            <img
                                onDragStart={event => event.preventDefault()}
                                className="rtc-float-cell-inner-box"
                                src={userHead}/>
                        }
                    </TweenOne>
                </div>
                {remoteStream &&
                <RtcMediaBoxCellPlayerBox
                    streamsState={streamsState}
                    remoteStreamIndex={this.props.remoteIndex}
                    remoteStream={remoteStream}
                    streamBoxId={this.props.streamBoxId}/>}
                {this.renderRemoteVoiceIcon()}
            </div>
        );
    }
}
