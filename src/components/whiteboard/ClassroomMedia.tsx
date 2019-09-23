import * as React from "react";
import "./ClassroomMedia.less";
import {Room, RoomMember} from "white-react-sdk";
import AgoraRTC, {Client, Stream} from "agora-rtc-sdk";
import {Button, message} from "antd";
import ClassroomMediaCell from "./ClassroomMediaCell";
import ClassroomMediaHostCell from "./ClassroomMediaHostCell";
import {CSSProperties} from "react";
import * as camera from "../../assets/image/camera.svg";
import * as set_video from "../../assets/image/set_video.svg";
import * as close_white from "../../assets/image/close_white.svg";
export type NetlessStream = {
    state: {isVideoOpen: boolean, isAudioOpen: boolean},
} & Stream;

export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export type ClassroomMediaStates = {
    isRtcStart: boolean;
    isMaskAppear: boolean;
    isFullScreen: boolean;
    remoteMediaStreams: NetlessStream[];
    localStream: NetlessStream | null;
};

export type ClassroomMediaProps = {
    userId: number;
    channelId: string;
    room: Room;
    agoraAppId: string;
    identity: IdentityType;
    isRTCReady?: (state: boolean) => void;
};

export default class ClassroomMedia extends React.Component<ClassroomMediaProps, ClassroomMediaStates> {

    private agoraClient: Client;

    public constructor(props: ClassroomMediaProps) {
        super(props);
        this.state = {
            isRtcStart: false,
            isMaskAppear: false,
            isFullScreen: false,
            remoteMediaStreams: [],
            localStream: null,
        };
    }

    private renderMediaBoxArray = (): React.ReactNode => {
        const {remoteMediaStreams} = this.state;
        const {room, identity} = this.props;
        const hostRoomMember = room.state.roomMembers.find((roomMember: RoomMember) => roomMember.payload.identity === IdentityType.host);
        if (hostRoomMember) {
            const mediaStreams = remoteMediaStreams.filter(data => data.getId() !== hostRoomMember.payload.userId);
            const hasHost = !!remoteMediaStreams.find(data => data.getId() === hostRoomMember.payload.userId);
            const nodes = mediaStreams.map((data: NetlessStream, index: number) => {
                return (
                    <ClassroomMediaCell
                        hasHost={hasHost}
                        streamsLength={mediaStreams.length}
                        identity={identity}
                        key={`${data.getId()}`}
                        stream={data}/>
                );
            });
            return nodes;
        } else {
            const nodes = remoteMediaStreams.map((data: NetlessStream, index: number) => {
                return (
                    <ClassroomMediaCell
                        hasHost={false}
                        streamsLength={remoteMediaStreams.length}
                        identity={identity}
                        key={`${data.getId()}`}
                        stream={data}/>
                );
            });
            return nodes;
        }
    }

    private renderRemoteHostBox = (): React.ReactNode => {
        const {remoteMediaStreams} = this.state;
        const {room} = this.props;
        const hostRoomMember = room.state.roomMembers.find((roomMember: RoomMember) => roomMember.payload.identity === IdentityType.host);
        if (hostRoomMember) {
            const hostStream = remoteMediaStreams.find((stream: NetlessStream) => stream.getId() === hostRoomMember.payload.userId);
            if (hostStream) {
                return <ClassroomMediaHostCell streamsLength={remoteMediaStreams.length} key={`${hostStream.getId()}`} stream={hostStream}/>;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    private renderSelfBox = (): React.ReactNode => {
        const {localStream} = this.state;
        if (localStream) {
            return (
                <div style={this.handleLocalVideoBox()} id="rtc_local_stream">
                </div>
            );

        } else {
            return null;
        }
    }
    public render(): React.ReactNode {
        const {userId, channelId} = this.props;
        return (
            <div className="netless-video-out-box">
               {!this.state.localStream &&
               <div className="netless-video-mask">
                   <img src={camera}/>
                   <Button onClick={() => this.startRtc(userId, channelId)} type="primary">
                       开始视频
                   </Button>
               </div>}
               <div className="netless-video-box">
                   <div onClick={() => {
                       this.setState({isMaskAppear: !this.state.isMaskAppear});
                   }} className="classroom-box-video-set">
                       {this.state.isMaskAppear ? <img style={{width: 14}} src={close_white}/> : <img src={set_video}/>}
                   </div>
                   {this.state.isMaskAppear &&
                   <div className="classroom-box-video-mask">
                       <Button
                           onClick={() => this.stopLocal()}
                           type="primary">结束</Button>
                   </div>}
                   {this.renderRemoteHostBox()}
                   {this.renderSelfBox()}
                   {this.renderMediaBoxArray()}
               </div>
            </div>
        );
    }

    private handleLocalVideoBox = (): CSSProperties => {
        const {remoteMediaStreams} = this.state;
        const {identity, room} = this.props;
        if (identity === IdentityType.host) {
            if (remoteMediaStreams.length === 0) {
                return {width: "100%", height: 360};
            } else if (remoteMediaStreams.length === 3) {
                return {width: "100%", height: 270};
            } else {
                return {width: "100%", height: 180};
            }
        } else {
            const hostRoomMember = room.state.roomMembers.find((roomMember: RoomMember) => roomMember.payload.identity === IdentityType.host);
            if (hostRoomMember) {
                const hostStream = remoteMediaStreams.find((stream: NetlessStream) => stream.getId() === hostRoomMember.payload.userId);
                if (hostStream) {
                    if (remoteMediaStreams.length === 0) {
                        return {width: "100%", height: 360};
                    } else if (remoteMediaStreams.length === 1) {
                        return {width: "100%", height: 180};
                    } else if (remoteMediaStreams.length === 2) {
                        return {width: "50%", height: 180};
                    } else {
                        return {width: "33.33%", height: 90};
                    }
                } else {
                    if (remoteMediaStreams.length === 0) {
                        return {width: "100%", height: 360};
                    } else if (remoteMediaStreams.length === 3) {
                        return {width: "100%", height: 270};
                    } else {
                        return {width: "100%", height: 180};
                    }
                }
            } else {
                if (remoteMediaStreams.length === 0) {
                    return {width: "100%", height: 360};
                } else if (remoteMediaStreams.length === 3) {
                    return {width: "100%", height: 270};
                } else {
                    return {width: "100%", height: 180};
                }
            }
        }
    }

    private startRtc = (userId: number, channelId: string): void => {
        this.agoraClient = AgoraRTC.createClient({mode: "rtc", codec: "h264"});
        this.agoraClient.init(this.props.agoraAppId, () => {
            console.log("AgoraRTC client initialized");
        }, (err: any) => {
            console.log("AgoraRTC client init failed", err);
        });
        const localStream = AgoraRTC.createStream({
            streamID: userId,
            audio: true,
            video: true,
        });
        localStream.init(()  => {
            console.log("getUserMedia successfully");
            const netlessLocalStream = {
                ...localStream,
                state: {isVideoOpen: true, isAudioOpen: true},
            };
            this.setState({localStream: netlessLocalStream});
            netlessLocalStream.play("rtc_local_stream");
            this.agoraClient.join(this.props.agoraAppId, channelId, userId, (uid: string) => {
                console.log("User " + uid + " join channel successfully");
                this.agoraClient.publish(localStream, (err: any) => {
                    console.log("Publish local stream error: " + err);
                });
            }, (err: any) => {
                console.log(err);
            });
        }, (err: any) => {
            console.log("getUserMedia failed", err);
        });

        // 监听
        this.agoraClient.on("stream-published", () => {
            console.log("Publish local stream successfully");
        });
        this.agoraClient.on("stream-added",  (evt: any) => {
            const stream = evt.stream;
            console.log("New stream added: " + stream.getId());
            this.agoraClient.subscribe(stream);
        });
        this.agoraClient.on("stream-subscribed", (evt: any) => {
            const remoteStream = evt.stream;
            remoteStream.state = {isVideoOpen: true, isAudioOpen: true};
            const remoteMediaStreams = this.state.remoteMediaStreams;
            remoteMediaStreams.push(remoteStream);
            this.setState({
                remoteMediaStreams: remoteMediaStreams,
            });
            console.log("Subscribe remote stream successfully: " + remoteStream.getId());
        });
        this.agoraClient.on("peer-leave", (evt: any) => {
            const uid = evt.uid;
            this.stop(uid);
            console.log("remote user left ", uid);
        });
        this.agoraClient.on("mute-video", (evt: any) => {
            const uid = evt.uid;
            const streams = this.state.remoteMediaStreams.map((data: any) => {
                if (data.getId() === uid) {
                    data.state.isVideoOpen = false;
                }
                return data;
            });
            this.setState({remoteMediaStreams: streams});
        });
        this.agoraClient.on("unmute-video", (evt: any) => {
            const uid = evt.uid;
            const streams = this.state.remoteMediaStreams.map((data: any) => {
                if (data.getId() === uid) {
                    data.state.isVideoOpen = true;
                }
                return data;
            });
            this.setState({remoteMediaStreams: streams});
        });
        this.agoraClient.on("mute-audio", (evt: any) => {
            const uid = evt.uid;
            const streams = this.state.remoteMediaStreams.map((data: any) => {
                if (data.getId() === uid) {
                    data.state.isAudioOpen = false;
                }
                return data;
            });
            this.setState({remoteMediaStreams: streams});
        });
        this.agoraClient.on("unmute-audio", (evt: any) => {
            const uid = evt.uid;
            const streams = this.state.remoteMediaStreams.map(data => {
                if (data.getId() === uid) {
                    data.state.isAudioOpen = true;
                }
                return data;
            });
            this.setState({remoteMediaStreams: streams});
        });
    }

    private stop = (streamId: number): void => {
        const mediaStreams = this.state.remoteMediaStreams;
        const stream = mediaStreams.find((stream: NetlessStream) => {
            return stream.getId() === streamId;
        });
        if (stream) {
            const newMediaStreams = this.state.remoteMediaStreams.map(data => {
                if (stream.getId() === stream.getId()) {
                    data.state.isVideoOpen = false;
                    data.state.isAudioOpen = false;
                }
                return data;
            });
            newMediaStreams.splice(newMediaStreams.indexOf(stream), 1);
            this.setState({
                remoteMediaStreams: newMediaStreams,
            });
        }
    }

    private stopLocal = (): void => {
        const localStream = this.state.localStream;
        if (localStream) {
            this.agoraClient.leave(() => {
                localStream.stop();
                localStream.close();
                this.setState({remoteMediaStreams: [], localStream: null});
                console.log("client leaves channel success");
                this.setState({isMaskAppear: false});
            }, (err: any) => {
                console.log("channel leave failed");
                console.error(err);
                this.setState({isMaskAppear: false});
            });
        }
    }

}
