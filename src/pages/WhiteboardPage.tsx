import * as React from "react";
import TopLoadingBar from "@netless/react-loading-bar";
import Agora from "@netless/react-agora";
import {PPTProgressPhase, UploadManager} from "@netless/oss-upload-manager";
import * as OSS from "ali-oss";
import ToolBox from "@netless/react-tool-box";
import {message} from "antd";
import {observer} from "mobx-react";
import * as uuidv4 from "uuid/v4";
import {RouteComponentProps} from "react-router";
import TweenOne from "rc-tween-one";
import Dropzone from "react-dropzone";
import {WhiteWebSdk, RoomWhiteboard, Room, RoomState, RoomPhase, PptConverter, MemberState} from "white-react-sdk";
import "white-web-sdk/style/index.css";
import "./WhiteboardPage.less";
import {whiteboardPageStore} from "../models/WhiteboardPageStore";
import {errorPageStore, PageErrorType} from "../models/ErrorPageStore";
import PageError from "./PageError";
import {applianceStore} from "../models/ApplianceStore";
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
import {userInfDataStore, UserInfType} from "../models/UserInfDataStore";
import {rtcAppId, netlessToken, ossConfigObj} from "../appTokenConfig";
import {UserCursor} from "../components/whiteboard/UserCursor";
import MenuPPTDoc from "../components/menu/MenuPPTDoc";
import UploadBtn from "../tools/UploadBtn";

const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));
export enum MenuInnerType {
    HotKey = "HotKey",
    AnnexBox = "AnnexBox",
    PPTBox = "PPTBox",
    DocSet = "DocSet",
}

export type WhiteboardPageProps = RouteComponentProps<{
    uuid: string;
    number: string;
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
    room?: Room;
    roomState?: RoomState;
    pptConverter?: PptConverter;
    isMenuLeft?: boolean;
    progressDescription?: string,
    fileUrl?: string,
    whiteboardLayerDownRef?: HTMLDivElement;
};

@observer
class WhiteboardPage extends React.Component<WhiteboardPageProps, WhiteboardPageState> {
    private didLeavePage: boolean = false;
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
        };
    }

    private startJoinRoom = async (): Promise<void> => {
        const uuid = this.props.match.params.uuid;
        const number = this.props.match.params.number;
        const roomToken = await whiteboardPageStore.joinRoom(uuid);
        if (userInfDataStore.getUserInf(UserInfType.uuid, `${number}`) === `Netless uuid ${number}`) {
            const userUuid = uuidv4();
            userInfDataStore.updateUserInf(userUuid, userUuid, number);
        }
        const userUuid = userInfDataStore.getUserInf(UserInfType.uuid, `${number}`);
        const name = userInfDataStore.getUserInf(UserInfType.name, `${number}`);
        const cursor = new UserCursor();
        if (roomToken && uuid) {
            const whiteWebSdk = new WhiteWebSdk();
            const pptConverter = whiteWebSdk.pptConverter(netlessToken);
            this.setState({pptConverter: pptConverter});
            const room = await whiteWebSdk.joinRoom({
                    uuid: uuid,
                    roomToken: roomToken,
                    cursorAdapter: cursor,
                    userPayload: {id: number, userId: userUuid, nickName: name, avatar: userUuid}},
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
                        if (applianceStore.state) {
                            applianceStore.state.updateRoomState(modifyState);
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
            applianceStore.registerRoom(room);
            this.setState({room: room, roomState: room.state, roomToken: roomToken});
        } else {
            message.error("join fail");
        }
    }

    public componentWillMount(): void {
        document.body.style.overflow = "hidden";
    }

    public async componentDidMount(): Promise<void> {
        await this.startJoinRoom();
    }

    public componentWillUnmount(): void {
        this.didLeavePage = true;
    }
    private renderMenuInner = (): React.ReactNode => {
        switch (this.state.menuInnerState) {
            case MenuInnerType.HotKey:
                return <MenuHotKey handleHotKeyMenuState={this.handleHotKeyMenuState}/>;
            case MenuInnerType.AnnexBox:
                return <MenuAnnexBox
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
                                   style={{width: "100%", height: "100vh"}}/>;
        } else {
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
            const uploadManager = new UploadManager(client, this.state.room!, this.progress);
            await Promise.all([
                uploadManager.uploadImageFiles(imageFiles, event.clientX, event.clientY),
            ]);
        } catch (error) {
            applianceStore.state!.setMemberState({
                currentApplianceName: "selector",
            });
            alert("upload file error" + error);
        }
    }
    private setMemberState = (modifyState: Partial<MemberState>) => {
        applianceStore.state!.setMemberState(modifyState);
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
    public render(): React.ReactNode {
        const number = this.props.match.params.number;

        if (this.state.connectedFail) {
            errorPageStore.pageErrorState = PageErrorType.PageRoomNotConnected;
            return <PageError/>;

        } else if (!applianceStore.state) {
            return <div className="white-board-loading">
                <img src={loading}/>
            </div>;
        } else if (this.state.phase === RoomPhase.Connecting ||
            this.state.phase === RoomPhase.Disconnecting) {
            return <div className="white-board-loading">
                <img src={loading}/>
            </div>;
        } else if (!this.state.room) {
            return <div className="white-board-loading">
                <img src={loading}/>
            </div>;
        } else {
            return (
                <div id="outer-container">
                    <MenuBox
                        resetMenu={this.resetMenu}
                        pageWrapId={"page-wrap" }
                        outerContainerId={ "outer-container" }
                        isLeft={this.state.isMenuLeft}
                        isVisible={this.state.isMenuVisible}
                        menuInnerState={this.state.menuInnerState}>
                        {this.renderMenuInner()}
                    </MenuBox>
                    <Agora
                        roomMembers={applianceStore.state.roomMembers}
                        agoraAppId={rtcAppId}
                        userId={parseInt(number)}
                        channelId={this.props.match.params.uuid}/>
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
                                <WhiteboardTopRight uuid={this.props.match.params.uuid} room={this.state.room} number={number}/>
                                <WhiteboardBottomLeft uuid={this.props.match.params.uuid} room={this.state.room} number={number}/>
                                <WhiteboardBottomRight
                                    number={number}
                                    roomState={this.state.roomState!}
                                    handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}
                                    handleHotKeyMenuState={this.handleHotKeyMenuState}
                                    room={this.state.room}/>
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
                                        memberState={applianceStore.state.memberState as any}/>
                                </div>
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
