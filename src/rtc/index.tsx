import * as React from "react";
import {BlockPosition, SlidingBlockState} from "./slidingBlock";
const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));
import video from "./icons/video_white.svg";
import {ExtendingPosition, FloatingPosition, HidingPosition} from "./RtcSlidingBlockPosition";
import {SlidingBlockMask} from "./SlidingBlockMask";
import AgoraRTC, {Stream, Client} from "agora-rtc-sdk";
import {RtcBlockContextProvider} from "./RtcBlockContext";
import TweenOne from "rc-tween-one";
import "./index.less";
import {RoomMember} from "white-react-sdk";
import {isMobile} from "react-device-detect";
// tslint:disable-next-line
const AgoraRTS = require("./rtsLib/AgoraRTS.js");

export type StreamsStatesType = {state: {isVideoOpen: boolean, isAudioOpen: boolean}, uid: number};
export type RtcLayoutState = {
    isBlockHiding: boolean;
    blockState: SlidingBlockState;
    remoteMediaStreams: Stream[];
    remoteMediaStreamsStates: StreamsStatesType[];
    localStream: Stream | null;
    isStartBtnLoading: boolean;
    joinRoomTime: number;
};

export type RtcLayoutProps = {
    userId: number;
    channelId: string;
    roomMembers: ReadonlyArray<RoomMember>;
    agoraAppId: string;
    isRtcReadOnly: boolean;
    setMediaState?: (state: boolean) => void;
    startBtn?: React.ReactNode;
    defaultStart?: boolean;
    HidingPosition?: BlockPosition;
    FloatingPosition?: BlockPosition;
    ExtendingPosition?: BlockPosition;
};

export default class Index extends React.Component<RtcLayoutProps, RtcLayoutState> {
    private FloatingPosition: BlockPosition = FloatingPosition;
    private HidingPosition: BlockPosition = HidingPosition;
    private ExtendingPosition: BlockPosition = ExtendingPosition;
    private agoraClient: Client;
    private rtcClock: any;
    public constructor(props: RtcLayoutProps) {
        super(props);
        this.state = {
            isBlockHiding: true,
            blockState: SlidingBlockState.Hiding,
            remoteMediaStreams: [],
            isStartBtnLoading: false,
            localStream: null,
            remoteMediaStreamsStates: [],
            joinRoomTime: 0,
        };
    }

    private startRtc = (uid: number, channelId: string): void => {
        this.setSliderExtending();
        this.setState({isStartBtnLoading: true});
        if (!this.agoraClient) {
            this.agoraClient = AgoraRTC.createClient({mode: "live", codec: "h264"});
            if (AgoraRTS.checkSystemRequirements()) {
                AgoraRTS.init(AgoraRTC);
                AgoraRTS.proxy(this.agoraClient);
            }
            this.agoraClient.init(this.props.agoraAppId, () => {
                console.log("AgoraRTC client initialized");
            }, err => {
                console.log("AgoraRTC client init failed", err);
            });
        }
        const localStream = AgoraRTC.createStream({
            streamID: uid,
            audio: true,
            video: true,
            screen: false,
        });
        localStream.init(()  => {
            console.log("getUserMedia successfully");
            this.setState({localStream: localStream});
            localStream.play("rtc_local_stream");
            this.rtcClock = setInterval( () => this.setState({joinRoomTime: this.state.joinRoomTime + 1}), 1000);
            this.setState({isStartBtnLoading: false});
            this.agoraClient.join(this.props.agoraAppId, channelId, uid, (uid: number) => {
                console.log("User " + uid + " join channel successfully");
                if (AgoraRTC.checkSystemRequirements() && !this.props.isRtcReadOnly) {
                    this.agoraClient.publish(localStream, err => {
                        console.log("Publish local stream error: " + err);
                    });
                }
            }, err => {
                console.log(err);
            });
            if (this.props.setMediaState) {
                this.props.setMediaState(true);
            }
        }, (err: any) => {
            console.log("getUserMedia failed", err);
        });
        this.agoraClient.on("stream-published", () => {
            console.log("Publish local stream successfully");
        });
        this.agoraClient.on("stream-added",  evt => {
            const stream = evt.stream;
            console.log("New stream added: " + stream.getId());
            const remoteMediaStreams = this.state.remoteMediaStreams;
            const remoteMediaStreamsStates = this.state.remoteMediaStreamsStates;
            remoteMediaStreams.push(stream);
            const index = remoteMediaStreamsStates.find(data => data.uid === stream.getId());
            if (index) {
                remoteMediaStreamsStates.map(data => {
                    data.state.isAudioOpen = true;
                    data.state.isVideoOpen = true;
                    return data;
                });
            } else {
                remoteMediaStreamsStates.push({uid: stream.getId(), state: {isAudioOpen: true, isVideoOpen: true}});
            }
            this.setState({
                remoteMediaStreams: remoteMediaStreams,
                remoteMediaStreamsStates: remoteMediaStreamsStates,
            });
            this.agoraClient.subscribe(stream);
        });
        this.agoraClient.on("peer-leave", evt => {
            this.stop(evt.uid);
            console.log("remote user left ", uid);
        });
        this.agoraClient.on("stream-subscribed", (evt: any) => {
            const remoteStream: Stream = evt.stream;
            console.log("Subscribe remote stream successfully: " + remoteStream.getId());
        });
        this.agoraClient.on("mute-video", evt => {
            const uid = evt.uid;
            const remoteMediaStreamsStates = this.state.remoteMediaStreamsStates.map(data => {
                if (data.uid === uid) {
                    data.state.isVideoOpen = false;
                }
                return data;
            });
            this.setState({remoteMediaStreamsStates: remoteMediaStreamsStates});
        });
        this.agoraClient.on("unmute-video", evt => {
            const uid = evt.uid;
            const remoteMediaStreamsStates = this.state.remoteMediaStreamsStates.map(data => {
                if (data.uid === uid) {
                    data.state.isVideoOpen = true;
                }
                return data;
            });
            this.setState({remoteMediaStreamsStates: remoteMediaStreamsStates});
        });
        this.agoraClient.on("mute-audio", evt => {
            const uid = evt.uid;
            const remoteMediaStreamsStates = this.state.remoteMediaStreamsStates.map(data => {
                if (data.uid === uid) {
                    data.state.isAudioOpen = false;
                }
                return data;
            });
            this.setState({remoteMediaStreamsStates: remoteMediaStreamsStates});
        });
        this.agoraClient.on("unmute-audio", evt => {
            const uid = evt.uid;
            const remoteMediaStreamsStates = this.state.remoteMediaStreamsStates.map(data => {
                if (data.uid === uid) {
                    data.state.isAudioOpen = true;
                }
                return data;
            });
            this.setState({remoteMediaStreamsStates: remoteMediaStreamsStates});
        });
    }

    private stop = (streamId: number): void => {
        const remoteMediaStreams = this.state.remoteMediaStreams;
        const stream = remoteMediaStreams.find((stream: Stream) => {
            return stream.getId() === streamId;
        });
        if (stream) {
            const remoteMediaStreamsStates = this.state.remoteMediaStreamsStates.map(data => {
                if (data.uid === stream.getId()) {
                    data.state.isVideoOpen = false;
                    data.state.isAudioOpen = false;
                }
                return data;
            });
            remoteMediaStreams.splice(remoteMediaStreams.indexOf(stream), 1);
            this.setState({
                remoteMediaStreams: remoteMediaStreams,
                remoteMediaStreamsStates: remoteMediaStreamsStates,
            });
        }
    }

    private stopLocal = (): void => {
        this.agoraClient.leave(async () => {
            if (this.rtcClock) {
                clearInterval(this.rtcClock);
            }
            await timeout(300);
            if (this.state.localStream) {
                this.state.localStream.stop();
                this.state.localStream.close();
                if (this.props.setMediaState) {
                    this.props.setMediaState(false);
                }
                this.setState({localStream: null,
                    remoteMediaStreams: [],
                    remoteMediaStreamsStates: [],
                    joinRoomTime: 0});
                this.setSliderHiding();
            }
        }, err => {
            console.log("Leave channel failed" + err);
        });
    }

    public componentDidMount(): void {
        if (this.props.defaultStart) {
            this.startRtc(this.props.userId, this.props.channelId);
        }
        if (this.props.HidingPosition) {
            this.HidingPosition = this.props.HidingPosition;
        }
        if (this.props.FloatingPosition) {
            this.FloatingPosition = this.props.FloatingPosition;
        }
        if (this.props.ExtendingPosition) {
            this.ExtendingPosition = this.props.ExtendingPosition;
        }
    }

    private setSliderFloating = (): void => {
        this.setState({blockState: SlidingBlockState.Floating});
    }


    private setSliderExtending = (): void => {
        this.setState({blockState: SlidingBlockState.Extending});
    }

    private setSliderHiding = (): void => {
        this.setState({blockState: SlidingBlockState.Hiding});
    }

    private renderRtcBtn = (): React.ReactNode => {
        if (this.state.blockState === SlidingBlockState.Hiding || this.state.isStartBtnLoading) {
            if (this.props.startBtn) {
                return (
                    <div onClick={() => this.startRtc(this.props.userId, this.props.channelId)}>
                        {this.props.startBtn}
                    </div>
                );
            } else {
                return (
                    <TweenOne
                        animation={{
                            duration: 240,
                            scale: 1,
                        }}
                        style={{
                            transform: "scale(0)",
                        }} onClick={() => this.startRtc(this.props.userId, this.props.channelId)}
                        className={isMobile ? "rtc-block-btn-mb" : "rtc-block-btn"}>
                        {this.state.isStartBtnLoading ? <img src={video}/> : <img src={video}/>}
                    </TweenOne>
                );
            }

        } else {
            return null;
        }
    }

    private extendingSize = (roomMembers: number): {width: number, height: number} => {
        const elementsInLine = 2;
        const linesCount = Math.ceil((roomMembers - 1) / elementsInLine);
        const blockHeight: number = 180 + 128 * linesCount + 64;
        const blockHeightMax: number = window.innerHeight - 32;
        const isBlockHeightMax: boolean = blockHeight >= blockHeightMax;
        if (isBlockHeightMax) {
            return {
                width: 256,
                height: blockHeightMax,
            };
        } else {
            return {
                width: 256,
                height: blockHeight,
            };
        }
    }

    private onClickSlidingBlock = (): void => {
        if (this.state.blockState === SlidingBlockState.Floating) {
            this.setSliderExtending();
        }
    }

    public render(): React.ReactNode {
        if (!this.state.localStream) {
            return this.renderRtcBtn();
        }
        return (
            <RtcBlockContextProvider
                value={{
                    remoteMediaStreams: this.state.remoteMediaStreams,
                    userId: this.props.userId,
                    roomMembers: this.props.roomMembers,
                    localStream: this.state.localStream,
                    setSliderExtending: this.setSliderExtending,
                    setSliderFloating: this.setSliderFloating,
                    setSliderHiding: this.setSliderHiding,
                    stopRtc: this.stopLocal,
                    remoteMediaStreamsStates: this.state.remoteMediaStreamsStates,
                    joinRoomTime: this.state.joinRoomTime,
            }}>
                <SlidingBlockMask state={this.state.blockState}
                                  hiding={this.HidingPosition}
                                  floating={this.FloatingPosition}
                                  extending={{...this.ExtendingPosition, ...this.extendingSize(this.props.roomMembers.length)}}
                                  onIsHidingChanged={isBlockHiding => this.setState({isBlockHiding})}
                                  onClick={this.onClickSlidingBlock}/>
            </RtcBlockContextProvider>
        );
    }
}
