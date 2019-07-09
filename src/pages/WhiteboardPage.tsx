import * as React from "react";
import TopLoadingBar from "@netless/react-loading-bar";
import {PPTProgressPhase, UploadManager} from "@netless/oss-upload-manager";
import * as OSS from "ali-oss";
import ToolBox from "@netless/react-tool-box";
import ToolBoxMobile from "@netless/react-mb-tool-box";
import {message} from "antd";
import * as uuidv4 from "uuid/v4";
import {RouteComponentProps} from "react-router";
import TweenOne from "rc-tween-one";
import Dropzone from "react-dropzone";
import Agora from "@netless/react-agora";
import {isMobile} from "react-device-detect";
import {
    WhiteWebSdk,
    RoomWhiteboard,
    Room,
    RoomState,
    RoomPhase,
    PptConverter,
    MemberState,
    ViewMode,
    DeviceType,
} from "white-react-sdk";
import "white-web-sdk/style/index.css";
import "./WhiteboardPage.less";
import PageError from "./PageError";
import WhiteboardTopLeft from "../components/whiteboard/WhiteboardTopLeft";
import WhiteboardTopRight from "../components/whiteboard/WhiteboardTopRight";
import WhiteboardBottomLeft from "../components/whiteboard/WhiteboardBottomLeft";
import WhiteboardBottomRight from "../components/whiteboard/WhiteboardBottomRight";
import * as like from "../assets/image/like.svg";
import * as loading from "../assets/image/loading.svg";
import * as arrow from "../assets/image/arrow.svg";
import MenuHotKey from "../components/menu/MenuHotKey";
import MenuBox from "../components/menu/MenuBox";
import MenuAnnexBox from "../components/menu/MenuAnnexBox";
import {netlessToken, ossConfigObj, rtcAppId} from "../appToken";
import {UserCursor} from "../components/whiteboard/UserCursor";
import MenuPPTDoc from "../components/menu/MenuPPTDoc";
import UploadBtn from "../tools/UploadBtn";
import {netlessWhiteboardApi, UserInfType} from "../apiMiddleware";
import WhiteboardRecord from "../components/whiteboard/WhiteboardRecord";

const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));
export enum MenuInnerType {
    HotKey = "HotKey",
    AnnexBox = "AnnexBox",
    PPTBox = "PPTBox",
    DocSet = "DocSet",
}

export type WhiteboardPageProps = RouteComponentProps<{
    uuid: string;
    userId: string;
}>;

export type WhiteboardPageState = {
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

class WhiteboardPage extends React.Component<WhiteboardPageProps, WhiteboardPageState> {
    private didLeavePage: boolean = false;
    private readonly cursor: UserCursor;
    public constructor(props: WhiteboardPageProps) {
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

    private setMediaState = (state: boolean): void => {
        this.setState({isMediaRun: state});
    }

    private startJoinRoom = async (): Promise<void> => {
        const uuid = this.props.match.params.uuid;
        const userId = this.props.match.params.userId;
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
            room.addMagixEventListener("handclap", async () => {
                this.setState({isHandClap: true});
                await timeout(800);
                this.setState({isHandClap: false});
            });
            const proportion = window.innerWidth / window.innerHeight;
            if (proportion > 1) {
                const zoomNumber = window.innerHeight / 675;
                room.moveCamera({scale: zoomNumber});
            } else {
                const zoomNumber = window.innerWidth / 1200;
                room.moveCamera({scale: zoomNumber});
            }
            this.setState({room: room, roomState: room.state, roomToken: roomToken});
        } else {
            message.error("join fail");
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
                    room={this.state.room!}/>;
            default:
                return null;
        }
    }


    private setWhiteboardLayerDownRef = (whiteboardLayerDownRef: HTMLDivElement): void => {
        this.setState({whiteboardLayerDownRef: whiteboardLayerDownRef});
    }
    private renderWhiteboard(): React.ReactNode {
        if (this.state.room) {
            return <RoomWhiteboard room={this.state.room}
                                   style={{width: "100%", height: "100vh", backgroundColor: "#F1F3F4"}}/>;
        } else {
            return null;
        }
    }

    private setMediaSource = (source: string): void => {
        this.setState({mediaSource: source});
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

    private resetMenu = () => {
        this.setState({
            isMenuVisible: false,
            isMenuLeft: false,
        });
    }

    private isImageType = (type: string): boolean => {
        return type === "image/jpeg" || type === "image/png";
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
    private setMemberState = (modifyState: Partial<MemberState>) => {
        this.state.room!.setMemberState(modifyState);
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

    private setStartTime = (time: number): void => {
        this.setState({startRecordTime: time});
    }
    private setStopTime = (time: number): void => {
        this.setState({stopRecordTime: time});
    }

    private setMenuState = (state: boolean) => {
        this.setState({isMenuOpen: state});
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
            return (
                <div id="outer-container">
                    <MenuBox
                        setMenuState={this.setMenuState}
                        resetMenu={this.resetMenu}
                        pageWrapId={"page-wrap" }
                        outerContainerId={ "outer-container" }
                        isLeft={this.state.isMenuLeft}
                        isVisible={this.state.isMenuVisible}
                        menuInnerState={this.state.menuInnerState}>
                        {this.renderMenuInner()}
                    </MenuBox>
                    {isMobile || <Agora
                        roomMembers={this.state.room.state.roomMembers}
                        agoraAppId={rtcAppId.agoraAppId}
                        setMediaState={this.setMediaState}
                        userId={parseInt(this.state.userId)}
                        channelId={this.props.match.params.uuid}/>}
                    <div style={{backgroundColor: "white"}} id="page-wrap">
                        <Dropzone
                            accept={"image/*"}
                            disableClick={true}
                            onDrop={this.onDropFiles}
                            className="whiteboard-drop-upload-box">
                            <TopLoadingBar loadingPercent={this.state.ossPercent}/>
                            <TopLoadingBar style={{backgroundColor: "red"}} loadingPercent={this.state.converterPercent}/>
                            <div className="whiteboard-out-box">
                                {this.renderClipView()}
                                <WhiteboardTopLeft room={this.state.room}/>
                                <WhiteboardTopRight
                                    oss={ossConfigObj}
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
                                    startTime={this.state.startRecordTime}/>
                                <WhiteboardRecord
                                    setMediaSource={this.setMediaSource}
                                    channelName={this.props.match.params.uuid}
                                    isMediaRun={this.state.isMediaRun}
                                    setStopTime={this.setStopTime}
                                    setStartTime={this.setStartTime}/>
                                <WhiteboardBottomRight
                                    userId={this.state.userId}
                                    roomState={this.state.roomState}
                                    handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}
                                    handleHotKeyMenuState={this.handleHotKeyMenuState}
                                    room={this.state.room}/>
                                    {isMobile ?
                                        <ToolBoxMobile
                                            style={{justifyContent: "left", marginLeft: 8, bottom: 40}}
                                            setMemberState={this.setMemberState}
                                            memberState={this.state.room.state.memberState}
                                        /> :
                                        <div className="whiteboard-tool-box">
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
                                <div onClick={this.handlePPtBoxMenuState}
                                     className={(this.state.menuInnerState === MenuInnerType.PPTBox && this.state.isMenuVisible) ? "slide-box-active" : "slide-box"}>
                                    <img src={arrow}/>
                                </div>
                                <div className="whiteboard-tool-layer-down" ref={this.setWhiteboardLayerDownRef}>
                                    {this.renderWhiteboard()}
                                </div>
                            </div>
                        </Dropzone>
                    </div>
                </div>
            );
        }
    }
}

export default WhiteboardPage;
