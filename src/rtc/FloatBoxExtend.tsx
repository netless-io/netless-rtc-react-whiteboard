import * as React from "react";
import TweenOne from "rc-tween-one";
import FloatBoxController from "./FloatBoxController";
import RtcMediaBoxCellSelf from "./RtcMediaBoxCellSelf";
import dropIcon from "./icons/drop_icon.svg";
import {HtmlElementRefContainer} from "./HtmlElementRefContainer";
import RtcStopWatch from "./RtcStopWatch";
import RtcMediaBoxCell from "./RtcMediaBoxCell";
import {StreamsStatesType} from "./index";
import {RoomMember} from "white-react-sdk";
import {Stream} from "agora-rtc-sdk";
import "./FloatBoxExtend.less";
import {SlidingBlockState} from "./slidingBlock";

export type FloatBoxExtendProps = {
    readonly remoteMediaStreams: Stream[];
    readonly userId: number;
    readonly roomMembers: ReadonlyArray<RoomMember>;
    readonly localStream: Stream;
    readonly remoteMediaStreamsStates: StreamsStatesType[];
    setSliderFloating: () => void;
    stopRtc: () => void;
    ignoreEventRefs: HtmlElementRefContainer;
    height: number;
    blockState:  SlidingBlockState;
    joinRoomTime: number;
};

export type FloatBoxExtendStates = {
    isAudioOpen: boolean,
    isVideoOpen: boolean,
    animationReverse: boolean;
    remoteMediaStreams: Stream[];
};

export default class FloatBoxExtend extends React.Component<FloatBoxExtendProps, FloatBoxExtendStates> {
    public constructor(props: FloatBoxExtendProps) {
        super(props);
        this.state = {
            isAudioOpen: false,
            isVideoOpen: false,
            animationReverse: false,
            remoteMediaStreams: this.props.remoteMediaStreams,
        };
    }

    public componentDidMount(): void {
        const isAudioOpen = this.props.localStream.hasAudio();
        const isVideoOpen = this.props.localStream.hasVideo();
        this.setState({isAudioOpen: isAudioOpen, isVideoOpen: isVideoOpen});
    }

    public componentWillReceiveProps(nextProps: FloatBoxExtendProps): void {
        if (this.props.blockState !== nextProps.blockState) {
            if (nextProps.blockState === SlidingBlockState.Floating) {
                const remoteMediaStreams = this.state.remoteMediaStreams;
                for (const stream of remoteMediaStreams) {
                    stream.disableVideo();
                }
                this.setState({remoteMediaStreams: remoteMediaStreams});
            } else if (nextProps.blockState === SlidingBlockState.Extending) {
                const remoteMediaStreams = this.state.remoteMediaStreams;
                for (const stream of remoteMediaStreams) {
                    stream.enableVideo();
                }
                this.setState({remoteMediaStreams: remoteMediaStreams});
            }
        }
    }

    private setVideoState = (isVideoOpen: boolean): void => {
        this.setState({isVideoOpen: isVideoOpen});
    }

    private setAudioState = (isAudioOpen: boolean): void => {
        this.setState({isAudioOpen: isAudioOpen});
    }
    public render(): React.ReactNode {
        const {
            localStream,
            roomMembers,
            userId,
            setSliderFloating,
            ignoreEventRefs,
            height,
            remoteMediaStreamsStates,
            stopRtc} = this.props;
        const remoteUserArray = roomMembers.filter(data => (data.payload && parseInt(`${data.payload.id}`)) !== userId);
        const localUser = roomMembers.find(data => (data.payload && parseInt(`${data.payload.id}`)) === userId);
        const remoteStreamsComponentCells: React.ReactNode[] = [];
        for (const remoteUser of remoteUserArray) {
            if (remoteUser.payload) {
                const remoteUserId = parseInt(`${remoteUser.payload.id}`);
                const remoteRtcStream = this.state.remoteMediaStreams.find(
                    remoteMediaStream => remoteMediaStream.getId() === remoteUserId,
                );
                const streamsState = remoteMediaStreamsStates.find(data => data.uid === remoteUserId);
                remoteStreamsComponentCells.push((
                    <RtcMediaBoxCell
                        blockState={this.props.blockState}
                        roomMember={remoteUser}
                        remoteIndex={remoteUserArray.length}
                        key={`${remoteUserId}`}
                        streamsState={streamsState}
                        streamBoxId={`${remoteUserId}`}
                        remoteStream={remoteRtcStream}
                    />
                ));
            }
        }
        return (
            <TweenOne
                animation={{
                    duration: 250,
                    opacity: 1,
                }}
                reverse={this.state.animationReverse}
                style={{
                    opacity: 0,
                }}
                className="rtc-float-box">
                <div
                    onClick={() => setSliderFloating()}
                    ref={ignoreEventRefs.refCallback("set-extending")}
                    className="rtc-float-back-btn">
                    <img src={dropIcon}/>
                </div>
                <div
                    style={{
                        height: height - 64,
                        overflow: "auto",
                    }}
                    className="rtc-float-cell-box">
                    <RtcMediaBoxCellSelf
                        blockState={this.props.blockState}
                        roomMember={localUser}
                        isAudioOpen={this.state.isAudioOpen}
                        isVideoOpen={this.state.isVideoOpen}
                        localStream={localStream}
                        streamBoxId={"rtc_local_stream"}/>
                    {remoteStreamsComponentCells}
                </div>
                <TweenOne
                    animation={{
                        duration: 150,
                        opacity: 1,
                    }}
                    style={{
                        opacity: 0,
                    }}
                    className="rtc-float-icon-bar">
                    <div className="rtc-float-icon-bar-left">
                        <RtcStopWatch joinRoomTime={this.props.joinRoomTime}/>
                    </div>
                    <FloatBoxController
                        localStream={localStream}
                        setAudioState={this.setAudioState}
                        setVideoState={this.setVideoState}
                        isVideoOpen={this.state.isVideoOpen}
                        isAudioOpen={this.state.isAudioOpen}
                        ignoreEventRefs={ignoreEventRefs}
                        stopRtc={stopRtc}/>
                </TweenOne>
            </TweenOne>
        );
    }
}
