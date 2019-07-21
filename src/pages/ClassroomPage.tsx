import * as React from "react";
import "./ClassroomPage.less";
import TweenOne from "rc-tween-one";
import {
    DeviceType,
    MemberState,
    PptConverter,
    Room,
    RoomPhase,
    RoomState,
    RoomWhiteboard,
    WhiteWebSdk,
} from "white-react-sdk";
import * as uuidv4 from "uuid/v4";
import PageError from "./PageError";
import * as loading from "../assets/image/loading.svg";
import {netlessWhiteboardApi, UserInfType} from "../apiMiddleware";
import * as OSS from "ali-oss";
import {netlessToken, ossConfigObj, rtcAppId} from "../appToken";
import {Button, message} from "antd";
import {isMobile} from "react-device-detect";
import {RouteComponentProps} from "react-router";
import {UserCursor} from "../components/whiteboard/UserCursor";
import {MenuInnerType} from "./WhiteboardPage";
import {NetlessRoomType} from "./ClassroomCreatorPage";
import Dropzone from "react-dropzone";
import {PPTProgressPhase, UploadManager} from "@netless/oss-upload-manager";
import ToolBox from "@netless/react-tool-box";
import UploadBtn from "../tools/UploadBtn";
import TopLoadingBar from "@netless/react-loading-bar";
import MenuBox from "../components/menu/MenuBox";
import MenuHotKey from "../components/menu/MenuHotKey";
import MenuAnnexBox from "../components/menu/MenuAnnexBox";
import MenuPPTDoc from "../components/menu/MenuPPTDoc";
import * as arrow from "../assets/image/arrow.svg";
import * as camera from "../assets/image/camera.svg";
import * as student from "../assets/image/student.svg";
import * as teacher from "../assets/image/teacher.svg";
import * as set_video from "../assets/image/set_video.svg";
import * as close_white from "../assets/image/close_white.svg";
import WhiteboardTopLeft from "../components/whiteboard/WhiteboardTopLeft";
import WhiteboardTopRight from "../components/whiteboard/WhiteboardTopRight";
import WhiteboardBottomLeft from "../components/whiteboard/WhiteboardBottomLeft";
import WhiteboardRecord from "../components/whiteboard/WhiteboardRecord";
import WhiteboardBottomRight, {MessageType} from "../components/whiteboard/WhiteboardBottomRight";
const AgoraRTC = require("../rtc/rtsLib/AgoraRTC-production.js");
const AgoraRTS = require("../rtc/rtsLib/AgoraRTS.js");
import WhiteboardChat from "../components/whiteboard/WhiteboardChat";
const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));
import ToolBoxMobile from "@netless/react-mb-tool-box";
import * as like from "../assets/image/like.svg";
export type ClassroomProps = RouteComponentProps<{
    uuid: string;
    userId: string;
    netlessRoomType: NetlessRoomType;
}>;
export type ClassroomState = {
    phase: RoomPhase;
    connectedFail: boolean;
    didSlaveConnected: boolean;
    isHandClap: boolean;
    menuInnerState: MenuInnerType;
    isMenuVisible: boolean;
    roomToken: string | null;
    ossPercent: number;
    converterPercent: number;
    userId: string;
    isMenuOpen: boolean;
    isReadyOnly: boolean;
    messages:  MessageType[],
    isRtcStart: boolean,
    isMaskAppear: boolean,
    mediaSource?: string;
    isMediaRun?: boolean;
    startRecordTime?: number;
    stopRecordTime?: number;
    room?: Room;
    roomState?: RoomState;
    pptConverter?: PptConverter;
    isMenuLeft?: boolean;
    progressDescription?: string,
    fileUrl?: string,
    whiteboardLayerDownRef?: HTMLDivElement;
};
class ClassroomPage extends React.Component<ClassroomProps, ClassroomState> {
    private readonly cursor: UserCursor;
    private didLeavePage: boolean = false;
    private agoraClient: any;
    private localStream: any;
    public constructor(props: ClassroomProps) {
        super(props);
        this.state = {
            phase: RoomPhase.Connecting,
            connectedFail: false,
            didSlaveConnected: false,
            isHandClap: false,
            menuInnerState: MenuInnerType.HotKey,
            isMenuVisible: false,
            roomToken: null,
            ossPercent: 0,
            converterPercent: 0,
            userId: "",
            isMenuOpen: false,
            isReadyOnly: props.match.params.netlessRoomType === NetlessRoomType.live,
            messages: [],
            isRtcStart: false,
            isMaskAppear: false,
        };
        this.cursor = new UserCursor();
    }
    private getRoomToken = async (uuid: string): Promise<string | null> => {
        const res = await netlessWhiteboardApi.room.joinRoomApi(uuid);
        if (res.code === 200) {
            return res.msg.roomToken;
        } else {
            return null;
        }
    }

    private renderClipView = (): React.ReactNode => {
        if (this.state.isHandClap) {
            return <div className="whiteboard-box-gift-box">
                <TweenOne
                    animation={[
                        {
                            scale: 1,
                            duration: 360,
                            ease: "easeInOutQuart",
                        },
                        {
                            opacity: 0,
                            scale: 2,
                            ease: "easeInOutQuart",
                            duration: 400,
                        },
                    ]}
                    style={{
                        transform: "scale(0)",
                        borderTopLeftRadius: 4,
                    }}className="whiteboard-box-gift-inner-box"
                >
                    <img src={like}/>
                </TweenOne>
            </div>;
        } else {
            return null;
        }
    }
    private renderWhiteboard(): React.ReactNode {
        if (this.state.room) {
            return <RoomWhiteboard room={this.state.room}
                                   style={{width: "100%", height: isMobile ? "100%" : "100vh", backgroundColor: "#F1F3F4"}}/>;
        } else {
            return null;
        }
    }

    private isImageType = (type: string): boolean => {
        return type === "image/jpeg" || type === "image/png";
    }
    private setWhiteboardLayerDownRef = (whiteboardLayerDownRef: HTMLDivElement): void => {
        this.setState({whiteboardLayerDownRef: whiteboardLayerDownRef});
    }
    private progress = (phase: PPTProgressPhase, percent: number): void => {
        message.config({
            maxCount: 1,
        });
        switch (phase) {
            case PPTProgressPhase.Uploading: {
                this.setState({ossPercent: percent * 100});
                break;
            }
            case PPTProgressPhase.Converting: {
                this.setState({converterPercent: percent * 100});
                break;
            }
        }
    }
    private onDropFiles = async (
        acceptedFiles: File[],
        rejectedFiles: File[],
        event: React.DragEvent<HTMLDivElement>): Promise<void> => {
        event.persist();
        try {
            const imageFiles = acceptedFiles.filter(file => this.isImageType(file.type));
            const client = new OSS({
                accessKeyId: ossConfigObj.accessKeyId,
                accessKeySecret: ossConfigObj.accessKeySecret,
                region: ossConfigObj.region,
                bucket: ossConfigObj.bucket,
            });
            const uploadManager = new UploadManager(client, this.state.room!);
            await Promise.all([
                uploadManager.uploadImageFiles(imageFiles, event.clientX, event.clientY),
            ]);
        } catch (error) {
            this.state.room!.setMemberState({
                currentApplianceName: "selector",
            });
        }
    }
    private onWindowResize = (): void => {
        if (this.state.room) {
            this.state.room.refreshViewSize();
        }
    }
    public componentWillMount(): void {
        document.body.style.overflow = "hidden";
        window.addEventListener("resize", this.onWindowResize);
    }
    public async componentDidMount(): Promise<void> {
        await this.startJoinRoom();
        if (this.state.room && this.state.room.state.roomMembers) {
            this.cursor.setColorAndAppliance(this.state.room.state.roomMembers);
        }
    }

    public componentWillUnmount(): void {
        this.didLeavePage = true;
        window.removeEventListener("resize", this.onWindowResize);
    }
    private setMemberState = (modifyState: Partial<MemberState>) => {
        this.state.room!.setMemberState(modifyState);
    }
    private renderMenuInner = (): React.ReactNode => {
        switch (this.state.menuInnerState) {
            case MenuInnerType.HotKey:
                return <MenuHotKey handleHotKeyMenuState={this.handleHotKeyMenuState}/>;
            case MenuInnerType.AnnexBox:
                return <MenuAnnexBox
                    isMenuOpen={this.state.isMenuOpen}
                    room={this.state.room!}
                    roomState={this.state.roomState!}
                    handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}/>;
            case MenuInnerType.PPTBox:
                return <MenuPPTDoc
                    handleAnnexBoxMenuState={this.handlePptMenuState}
                    room={this.state.room!}/>;
            default:
                return null;
        }
    }
    private handleHotKeyMenuState = (): void => {
        this.setState({
            isMenuVisible: !this.state.isMenuVisible,
            menuInnerState: MenuInnerType.HotKey,
            isMenuLeft: false,
        });
    }
    private handleAnnexBoxMenuState = (): void => {
        this.setState({
            isMenuVisible: !this.state.isMenuVisible,
            menuInnerState: MenuInnerType.AnnexBox,
            isMenuLeft: false,
        });
    }

    private handlePptMenuState = (): void => {
        this.setState({
            isMenuVisible: !this.state.isMenuVisible,
            menuInnerState: MenuInnerType.PPTBox,
            isMenuLeft: false,
        });
    }
    private setMenuState = (state: boolean) => {
        this.setState({isMenuOpen: state});
    }
    private resetMenu = () => {
        this.setState({
            isMenuVisible: false,
            isMenuLeft: false,
        });
    }
    private handlePPtBoxMenuState = (): void => {
        if (this.state.isMenuVisible) {
            this.setState({
                isMenuVisible: !this.state.isMenuVisible,
            });
        } else {
            this.setState({
                isMenuVisible: !this.state.isMenuVisible,
                menuInnerState: MenuInnerType.PPTBox,
                isMenuLeft: true,
            });
        }
    }
    private setMediaSource = (source: string): void => {
        this.setState({mediaSource: source});
    }

    private setStartTime = (time: number): void => {
        this.setState({startRecordTime: time});
    }
    private setStopTime = (time: number): void => {
        this.setState({stopRecordTime: time});
    }
    private stop = (): void => {
        this.agoraClient.leave(() => {
            console.log("Leave channel successfully");
            this.setState({isRtcStart: false});
            if (this.localStream) {
                this.localStream.stop();
                this.localStream.close();
            }
            this.setState({isMaskAppear: false});
        }, (err: any) => {
            console.log("Leave channel failed");
        });
    }
    public render(): React.ReactNode {
        if (this.state.connectedFail) {
            return <PageError/>;

        } else if (this.state.phase === RoomPhase.Connecting ||
            this.state.phase === RoomPhase.Disconnecting) {
            return <div className="white-board-loading">
                <img src={loading}/>
            </div>;
        } else if (!this.state.room) {
            return <div className="white-board-loading">
                <img src={loading}/>
            </div>;
        } else if (!this.state.roomState) {
            return <div className="white-board-loading">
                <img src={loading}/>
            </div>;
        } else {
            const isReadOnly = this.props.match.params.netlessRoomType === NetlessRoomType.live;
            return (
                <div id="outer-container-2">
                    <MenuBox
                        setMenuState={this.setMenuState}
                        isPpt={this.state.menuInnerState === MenuInnerType.PPTBox}
                        resetMenu={this.resetMenu}
                        pageWrapId={"page-wrap-2"}
                        outerContainerId={"outer-container-2"}
                        isVisible={this.state.isMenuVisible}
                        menuInnerState={this.state.menuInnerState}>
                        {this.renderMenuInner()}
                    </MenuBox>
                    <div style={{display: isReadOnly ? "none" : "flex"}} onClick={this.handlePPtBoxMenuState}
                         className="slide-box">
                        <img src={arrow}/>
                    </div>
                    <div className={isMobile ? "classroom-box-mb" : "classroom-box"} id="page-wrap-2">
                        {isMobile &&
                        <div className="classroom-box-chart-mb">
                            <WhiteboardChat
                                room={this.state.room}
                                messages={this.state.messages}
                                isClassroom={true}
                                isReadonly={isReadOnly}
                                userId={this.state.userId}/>
                        </div>
                        }
                        <Dropzone
                            accept={"image/*"}
                            disableClick={true}
                            className={isMobile ? "classroom-box-left-mb" : "classroom-box-left"}
                            onDrop={this.onDropFiles}>
                            <TopLoadingBar loadingPercent={this.state.ossPercent}/>
                            <TopLoadingBar style={{backgroundColor: "red"}} loadingPercent={this.state.converterPercent}/>
                            {this.renderClipView()}
                            <WhiteboardTopLeft room={this.state.room}/>
                            <WhiteboardTopRight
                                oss={ossConfigObj}
                                readOnly={isReadOnly}
                                onProgress={this.progress}
                                whiteboardRef={this.state.whiteboardLayerDownRef}
                                roomState={this.state.roomState}
                                uuid={this.props.match.params.uuid}
                                room={this.state.room}
                                number={this.state.userId}/>
                            <WhiteboardBottomLeft
                                uuid={this.props.match.params.uuid}
                                roomState={this.state.roomState}
                                room={this.state.room}
                                userId={this.state.userId}
                                mediaSource={this.state.mediaSource}
                                stopTime={this.state.stopRecordTime}
                                isReadOnly={isReadOnly}
                                startTime={this.state.startRecordTime}/>
                            <WhiteboardRecord
                                setMediaSource={this.setMediaSource}
                                isReadOnly={isReadOnly}
                                channelName={this.props.match.params.uuid}
                                isMediaRun={this.state.isMediaRun}
                                setStopTime={this.setStopTime}
                                setStartTime={this.setStartTime}/>
                            <WhiteboardBottomRight
                                userId={this.state.userId}
                                roomState={this.state.roomState}
                                handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}
                                handleHotKeyMenuState={this.handleHotKeyMenuState}
                                isClassroom={true}
                                isReadOnly={isReadOnly}
                                room={this.state.room}/>
                            {isMobile ?
                                <ToolBoxMobile
                                    style={{justifyContent: "left", marginLeft: 8, bottom: 40, display: isReadOnly ? "none" : "flex"}}
                                    setMemberState={this.setMemberState}
                                    memberState={this.state.room.state.memberState}
                                /> :
                                <div style={{display: isReadOnly ? "none" : "flex"}} className="whiteboard-tool-box">
                                    <ToolBox
                                        setMemberState={this.setMemberState}
                                        customerComponent={[
                                            <UploadBtn
                                                oss={ossConfigObj}
                                                room={this.state.room}
                                                roomToken={this.state.roomToken}
                                                onProgress={this.progress}
                                                whiteboardRef={this.state.whiteboardLayerDownRef}
                                            />,
                                        ]}
                                        memberState={this.state.room.state.memberState}/>
                                </div>}
                            <div className="classroom-box-left" ref={this.setWhiteboardLayerDownRef}>
                                {this.renderWhiteboard()}
                            </div>
                        </Dropzone>
                        <div className={isMobile ? "classroom-box-right-mb" : "classroom-box-right"}>
                            <div className={isMobile ? "classroom-box-video-mb" : "classroom-box-video"}>
                                {this.state.isRtcStart ?
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
                                        <div className="classroom-box-teacher-video">
                                            <div id="netless-teacher" className="classroom-box-teacher-layer-1">
                                            </div>
                                            <div className="classroom-box-teacher-layer-2">
                                                <img src={teacher}/>
                                            </div>
                                        </div>
                                        <div className={isMobile ? "classroom-box-students-video-mb" : "classroom-box-students-video"}>
                                            <div className="classroom-box-student-cell">
                                                <div id="netless-student-1" className="classroom-box-student-layer-1">
                                                </div>
                                                <div className="classroom-box-student-layer-2">
                                                    <img src={student}/>
                                                </div>
                                            </div>
                                            <div className="classroom-box-student-cell">
                                                <div id="netless-student-2" className="classroom-box-student-layer-1">
                                                </div>
                                                <div style={{backgroundColor: "#2B2B2B"}} className="classroom-box-student-layer-2">
                                                    <img src={student}/>
                                                </div>
                                            </div>
                                            <div className="classroom-box-student-cell">
                                                <div id="netless-student-3" className="classroom-box-student-layer-1">
                                                </div>
                                                <div className="classroom-box-student-layer-2">
                                                    <img src={student}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div> :
                                    <div className="classroom-box-video-mid-2">
                                        <div className="classroom-box-video-mid-inner">
                                            <img style={{width: 108, marginBottom: 24}} src={camera}/>
                                            <Button
                                                style={{width: 108}}
                                                onClick={() => this.startRtc(parseInt(this.state.userId), this.props.match.params.uuid, this.state.room!)}
                                                type="primary">开始视频通讯</Button>
                                        </div>
                                    </div>
                                }
                            </div>
                            {!isMobile && <div className="classroom-box-chart">
                                <WhiteboardChat
                                    room={this.state.room}
                                    messages={this.state.messages}
                                    isClassroom={true}
                                    isReadonly={isReadOnly}
                                    userId={this.state.userId}/>
                            </div>}
                        </div>
                    </div>
                </div>
            );
        }
    }
    private startJoinRoom = async (): Promise<void> => {
        const {userId, uuid, netlessRoomType} = this.props.match.params;
        this.setState({userId: userId});
        const roomToken = await this.getRoomToken(uuid);
        if (netlessWhiteboardApi.user.getUserInf(UserInfType.uuid, `${userId}`) === `Netless uuid ${userId}`) {
            const userUuid = uuidv4();
            netlessWhiteboardApi.user.updateUserInf(userUuid, userUuid, userId);
        }
        const userUuid = netlessWhiteboardApi.user.getUserInf(UserInfType.uuid, `${userId}`);
        const name = netlessWhiteboardApi.user.getUserInf(UserInfType.name, `${userId}`);
        if (roomToken && uuid) {
            let whiteWebSdk;
            if (isMobile) {
                whiteWebSdk = new WhiteWebSdk({deviceType: DeviceType.Touch});
            } else {
                whiteWebSdk = new WhiteWebSdk({deviceType: DeviceType.Desktop});
            }

            const pptConverter = whiteWebSdk.pptConverter(netlessToken.sdkToken);
            this.setState({pptConverter: pptConverter});
            const room = await whiteWebSdk.joinRoom({
                    uuid: uuid,
                    roomToken: roomToken,
                    cursorAdapter: this.cursor,
                    userPayload: {id: userId, userId: userUuid, nickName: name, avatar: userUuid}},
                {
                    onPhaseChanged: phase => {
                        if (!this.didLeavePage) {
                            this.setState({phase});
                        }
                        console.log(`room ${this.props.match.params.uuid} changed: ${phase}`);
                    },
                    onDisconnectWithError: error => {
                        console.error(error);
                    },
                    onKickedWithReason: reason => {
                        console.error("kicked with reason: " + reason);
                    },
                    onRoomStateChanged: modifyState => {
                        if (modifyState.roomMembers) {
                            this.cursor.setColorAndAppliance(modifyState.roomMembers);
                        }
                        this.setState({
                            roomState: {...this.state.roomState, ...modifyState} as RoomState,
                        });
                    },
                });
            room.moveCameraToContain({
                originX: - 600,
                originY: - 337.5,
                width: 1200,
                height: 675,
                animationMode: "immediately",
            });
            room.addMagixEventListener("handclap", async () => {
                this.setState({isHandClap: true});
                await timeout(800);
                this.setState({isHandClap: false});
            });
            room.addMagixEventListener("message",  event => {
                this.setState({messages: [...this.state.messages, event.payload]});
            });
            if (netlessRoomType === NetlessRoomType.live) {
                await room.setWritable(false);
                this.startRtc(parseInt(this.state.userId), this.props.match.params.uuid, room);
                message.info("您是观众用户，只能观看直播不能互动");
            } else {
                message.info("开始互动课程");
            }
            this.setState({room: room, roomState: room.state, roomToken: roomToken});
        } else {
            message.error("join fail");
        }
    }
    private startRtc = (uid: number, channelId: string, room: Room): void => {
        const {netlessRoomType} = this.props.match.params;
        if (!this.agoraClient) {
            const agoraClient = AgoraRTC.createClient({mode: "live", codec: "h264"});
            AgoraRTS.init(AgoraRTC);
            AgoraRTS.proxy(agoraClient);
            this.agoraClient = agoraClient;
            this.agoraClient.init(rtcAppId.agoraAppId, () => {
                console.log("AgoraRTC client initialized");
            }, (err: any) => {
                console.log("AgoraRTC client init failed", err);
            });
        }

        if (netlessRoomType === NetlessRoomType.live) {
            this.agoraClient.join(rtcAppId.agoraAppId, channelId, uid, (userRtcId: number) => {
                this.setState({isRtcStart: true});
            }, (err: any) => {
                console.log(err);
            });
        } else {
            let localStream: any;
            let userRtcId: number;
            if (netlessRoomType === NetlessRoomType.teacher_interactive) {
                userRtcId = 52;
                localStream = AgoraRTC.createStream({
                        streamID: 52,
                        audio: true,
                        video: true,
                        screen: false,
                    },
                );
            } else if (netlessRoomType === NetlessRoomType.interactive) {
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
            localStream.setVideoProfile("240p");
            this.localStream = localStream;
            this.localStream.init(()  => {
                console.log("getUserMedia successfully");
                this.setState({isRtcStart: true});
                if (netlessRoomType === NetlessRoomType.teacher_interactive) {
                    this.localStream.play("netless-teacher");
                } else if (netlessRoomType === NetlessRoomType.interactive) {
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

export default ClassroomPage;
