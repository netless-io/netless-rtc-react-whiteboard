import * as React from "react";
import "./ClassroomMedia.less";
import {Button} from "antd";
import {rtcAppId} from "../../appToken";
import {NetlessRoomType} from "../../pages/ClassroomCreatorPage";
import {Room} from "white-react-sdk";
import * as camera from "../../assets/image/camera.svg";
import * as student from "../../assets/image/student.svg";
import * as teacher from "../../assets/image/teacher.svg";
import * as set_video from "../../assets/image/set_video.svg";
import * as close_white from "../../assets/image/close_white.svg";
const AgoraRTC = require("../../rtc/rtsLib/AgoraRTC-production.js");
export type ClassroomMediaStates = {
    isRtcStart: boolean;
    isMaskAppear: boolean;
    isFullScreen: boolean;
    array: number[];
};

export type ClassroomMediaProps = {
    netlessRoom: NetlessRoomType;
    userId: number;
    uuid: string;
    room: Room;
};

class ClassroomMedia extends React.Component<ClassroomMediaProps, ClassroomMediaStates> {

    private agoraClient: any;
    private localStream: any;

    public constructor(props: ClassroomMediaProps) {
        super(props);
        this.state = {
            isRtcStart: true,
            isMaskAppear: false,
            isFullScreen: false,
            array: [1, 2, 3, 4],
        };
    }

    public componentWillUnmount(): void {
        if (this.agoraClient) {
            this.agoraClient.leave(() => {
                console.log("Leave channel successfully");
                if (this.localStream) {
                    this.localStream.stop();
                    this.localStream.close();
                }
            });
        }
    }

    private renderStudent = (): React.ReactNode => {
        const {array} = this.state;
        if (array.length === 1) {
            return (
                <div style={{width: "100%", height: 180, backgroundColor: "#2B2B2B"}}className="classroom-box-student-cell">
                    <div id="netless-student-1" className="classroom-box-student-layer-1">
                    </div>
                    <div style={{backgroundColor: "#2B2B2B"}} className="classroom-box-student-layer-2">
                        <img src={student}/>
                    </div>
                </div>
            );
        } else if (array.length === 2) {
            const nodes = this.state.array.map((data: any, index: number) => {
                return (
                    <div style={{width: "50%", height: 180}} className="classroom-box-student-cell">
                        <div id="netless-student-1" className="classroom-box-student-layer-1">
                        </div>
                        <div style={{backgroundColor: (index % 2 === 0) ? "#3C3F41" : "#2B2B2B"}} className="classroom-box-student-layer-2">
                            <img src={student}/>
                        </div>
                    </div>
                );
            });
            return nodes;
        } else {
            const nodes = this.state.array.map((data: any, index: number) => {
                return (
                    <div style={{width: "33.33%", height: 90}} className="classroom-box-student-cell">
                        <div id="netless-student-1" className="classroom-box-student-layer-1">
                        </div>
                        <div style={{backgroundColor: (index % 2 === 0) ? "#3C3F41" : "#2B2B2B"}}  className="classroom-box-student-layer-2">
                            <img src={student}/>
                        </div>
                    </div>
                );
            });
            return nodes;
        }
    }

    private renderInner = (): React.ReactNode => {
        if (this.state.isRtcStart) {
            return (
                <div className="classroom-box-video-mid">
                    {this.state.isMaskAppear &&
                    <div className="classroom-box-video-mask">
                        <Button
                            onClick={() => this.stop()}
                            type="primary">结束</Button>
                    </div>}
                    <div onClick={() => {
                        this.setState({isMaskAppear: !this.state.isMaskAppear});
                    }} className="classroom-box-video-set">
                        {this.state.isMaskAppear ? <img style={{width: 14}} src={close_white}/> : <img src={set_video}/>}
                    </div>
                    <div>
                        <div className="classroom-box-teacher-video">
                            <div id="netless-teacher" className="classroom-box-teacher-layer-1">
                            </div>
                            <div className="classroom-box-teacher-layer-2">
                                <img src={teacher}/>
                            </div>
                        </div>
                        <div className="classroom-box-students-video">
                            {this.renderStudent()}
                            {/*<div className="classroom-box-student-cell">*/}
                                {/*<div id="netless-student-1" className="classroom-box-student-layer-1">*/}
                                {/*</div>*/}
                                {/*<div className="classroom-box-student-layer-2">*/}
                                    {/*<img src={student}/>*/}
                                {/*</div>*/}
                            {/*</div>*/}
                            {/*<div className="classroom-box-student-cell">*/}
                                {/*<div id="netless-student-2" className="classroom-box-student-layer-1">*/}
                                {/*</div>*/}
                                {/*<div style={{backgroundColor: "#2B2B2B"}} className="classroom-box-student-layer-2">*/}
                                    {/*<img src={student}/>*/}
                                {/*</div>*/}
                            {/*</div>*/}
                            {/*<div className="classroom-box-student-cell">*/}
                                {/*<div id="netless-student-3" className="classroom-box-student-layer-1">*/}
                                {/*</div>*/}
                                {/*<div className="classroom-box-student-layer-2">*/}
                                    {/*<img src={student}/>*/}
                                {/*</div>*/}
                            {/*</div>*/}
                            {/*<div className="classroom-box-student-cell">*/}
                                {/*<div id="netless-student-3" className="classroom-box-student-layer-1">*/}
                                {/*</div>*/}
                                {/*<div className="classroom-box-student-layer-2">*/}
                                    {/*<img src={student}/>*/}
                                {/*</div>*/}
                            {/*</div>*/}
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="classroom-box-video-mid-2">
                    <div className="classroom-box-video-mid-inner">
                        <img style={{width: 108, marginBottom: 24}} src={camera}/>
                        <Button
                            onClick={() => this.startRtc(this.props.userId, this.props.uuid, this.props.room)}
                            style={{width: 108}}
                            type="primary">开始视频通讯</Button>
                    </div>
                </div>
            );
        }
    }

    public render(): React.ReactNode {
       return (
           <div className="classroom-box-media-box">
               {this.renderInner()}
           </div>
       );
    }

    private stop = (): void => {
        this.agoraClient.leave(() => {
            console.log("Leave channel successfully");
            this.setState({isRtcStart: false});
            // this.setMediaState(false);
            if (this.localStream) {
                this.localStream.stop();
                this.localStream.close();
            }
            this.setState({isMaskAppear: false});
        }, (err: any) => {
            console.log("Leave channel failed");
        });
    }
    private startRtc = (uid: number, channelId: string, room: Room): void => {
        const {netlessRoom} = this.props;
        if (!this.agoraClient) {
            this.agoraClient = AgoraRTC.createClient({mode: "live", codec: "h264"});
            this.agoraClient.init(rtcAppId.agoraAppId, () => {
                console.log("AgoraRTC client initialized");
            }, (err: any) => {
                console.log("AgoraRTC client init failed", err);
            });
        }

        if (netlessRoom === NetlessRoomType.live) {
            this.agoraClient.join(rtcAppId.agoraAppId, channelId, uid, (userRtcId: number) => {
                this.setState({isRtcStart: true});
            }, (err: any) => {
                console.log(err);
            });
        } else {
            let localStream: any;
            let userRtcId: number;
            if (netlessRoom === NetlessRoomType.teacher_interactive) {
                userRtcId = 52;
                localStream = AgoraRTC.createStream({
                        streamID: 52,
                        audio: true,
                        video: true,
                        screen: false,
                    },
                );
            } else if (netlessRoom === NetlessRoomType.interactive) {
                if (room.state.roomMembers.length === 2) {
                    userRtcId = 1;
                    localStream = AgoraRTC.createStream({
                            streamID: 1,
                            audio: true,
                            video: true,
                            screen: false,
                        },
                    );
                } else if (room.state.roomMembers.length === 3) {
                    userRtcId = 2;
                    localStream = AgoraRTC.createStream({
                            streamID: 2,
                            audio: true,
                            video: true,
                            screen: false,
                        },
                    );
                } else if (room.state.roomMembers.length === 4) {
                    userRtcId = 3;
                    localStream = AgoraRTC.createStream({
                            streamID: 3,
                            audio: true,
                            video: true,
                            screen: false,
                        },
                    );
                } else {
                    userRtcId = uid;
                    localStream = AgoraRTC.createStream({
                            streamID: uid,
                            audio: true,
                            video: true,
                            screen: false,
                        },
                    );
                }
            }
            localStream.setVideoProfile("480p_2");
            this.localStream = localStream;
            this.localStream.init(()  => {
                console.log("getUserMedia successfully");
                this.setState({isRtcStart: true});
                // this.setMediaState(true);
                if (netlessRoom === NetlessRoomType.teacher_interactive) {
                    this.localStream.play("netless-teacher");
                } else if (netlessRoom === NetlessRoomType.interactive) {
                    if (room.state.roomMembers.length === 2) {
                        this.localStream.play("netless-student-1");
                    } else if (room.state.roomMembers.length === 3) {
                        this.localStream.play("netless-student-2");
                    } else if (room.state.roomMembers.length === 4) {
                        this.localStream.play("netless-student-3");
                    }
                }
                this.agoraClient.join(rtcAppId.agoraAppId, channelId, userRtcId, (userRtcId: number) => {
                    this.agoraClient.publish(localStream, (err: any) => {
                        console.log("Publish local stream error: " + err);
                    });
                }, (err: any) => {
                    console.log(err);
                });
            }, (err: any) => {
                console.log("getUserMedia failed", err);
            });
        }
        this.agoraClient.on("stream-published", () => {
            console.log("Publish local stream successfully");
        });
        this.agoraClient.on("stream-added",  (evt: any) => {
            const stream = evt.stream;
            console.log("New stream added: " + stream.getId());
            this.agoraClient.subscribe(stream, { video: true, audio: true });
        });
        this.agoraClient.on("peer-leave", (evt: any) => {
            const stream = evt.stream;
            if (stream.getId() === 52) {
                const videoNode = document.getElementById("netless-teacher");
                if (videoNode && videoNode.children[0]) {
                    videoNode.removeChild(videoNode.children[0]);
                }
            } else if (stream.getId() <= 3) {
                const videoNode = document.getElementById(`netless-student-${stream.getId()}`);
                if (videoNode && videoNode.children[0]) {
                    videoNode.removeChild(videoNode.children[0]);
                }
            }
            console.log("remote user left ", stream.getId());
        });
        this.agoraClient.on("stream-subscribed", (evt: any) => {
            const remoteStream = evt.stream;
            if (remoteStream.getId() === 52) {
                remoteStream.play("netless-teacher");
            } else {
                remoteStream.play(`netless-student-${remoteStream.getId()}`);
            }
            console.log("Subscribe remote stream successfully: " + remoteStream.getId());
        });
        this.agoraClient.on("mute-video", (evt: any) => {
            const uid = evt.uid;
        });
        this.agoraClient.on("unmute-video", (evt: any) => {
            const uid = evt.uid;
        });
        this.agoraClient.on("mute-audio", (evt: any) => {
            const uid = evt.uid;
        });
        this.agoraClient.on("unmute-audio", (evt: any) => {
            const uid = evt.uid;
        });
    }
}


export default ClassroomMedia;
