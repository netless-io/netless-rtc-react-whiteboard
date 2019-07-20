import * as React from "react";
import {Button, Input, message, Modal, Popover, Switch, Tooltip} from "antd";
import {Room, RoomState} from "white-react-sdk";
import {ViewMode} from "white-react-sdk";
import Identicon from "react-identicons";
import {InjectedIntlProps, injectIntl} from "react-intl";
import Clipboard from "react-clipboard.js";
import * as add from "../../assets/image/add.svg";
import * as board from "../../assets/image/board.svg";
import * as board_black from "../../assets/image/board_black.svg";
import WhiteboardPerspectiveSet from "./WhiteboardPerspectiveSet";
import "./WhiteboardTopRight.less";
import {withRouter} from "react-router-dom";
import {RouteComponentProps} from "react-router";
import {netlessWhiteboardApi} from "../../apiMiddleware";
import {UserInfType} from "../../apiMiddleware";
import QRCode from "qrcode.react";
import {isMobile} from "react-device-detect";
import {UploadBtnMobile} from "../../tools/UploadBtn";
import {PPTProgressListener} from "../../tools/UploadManager";
import {NetlessRoomType} from "../../pages/ClassroomCreatorPage";

export type WhiteboardTopRightState = {
    scaleAnimation: boolean;
    reverseState: boolean;
    isFirst: boolean;
    isInviteVisible: boolean;
    isSetVisible: boolean;
    url: string;
    netlessRoomType: NetlessRoomType;
};

export type WhiteboardTopRightProps = RouteComponentProps<{netlessRoomType: NetlessRoomType}> & InjectedIntlProps & {
    room: Room,
    number: string,
    uuid: string,
    roomState: RoomState,
    oss: {
        accessKeyId: string,
        accessKeySecret: string,
        region: string,
        bucket: string,
        folder: string,
        prefix: string,
    },
    readOnly?: boolean,
    whiteboardRef?: HTMLDivElement,
    onProgress?: PPTProgressListener,
};

class WhiteboardTopRight extends React.Component<WhiteboardTopRightProps, WhiteboardTopRightState> {

    public constructor(props: WhiteboardTopRightProps) {
        super(props);
        this.state = {
            scaleAnimation: true,
            reverseState: false,
            isFirst: true,
            isInviteVisible: false,
            isSetVisible: false,
            url: location.href,
            netlessRoomType: this.props.match.params.netlessRoomType,
        };
        this.renderBroadController = this.renderBroadController.bind(this);
    }

    public componentWillReceiveProps(nextProps: WhiteboardTopRightProps): void {
        if (this.props.roomState.broadcastState !== nextProps.roomState.broadcastState ) {
            const perspectiveState = nextProps.roomState.broadcastState;
            const isBeforeBroadcaster = this.props.roomState.broadcastState.mode === ViewMode.Broadcaster;
            const isBroadcaster = perspectiveState.mode === ViewMode.Broadcaster;
            const hasBroadcaster = perspectiveState.broadcasterId !== undefined;
            if (!isBroadcaster) {
                if (hasBroadcaster) {
                    if (perspectiveState.mode === ViewMode.Follower) {
                        message.info(this.props.intl.formatMessage({id: "current-speaker"}) + " " + perspectiveState.broadcasterInformation!.payload.nickName + "," + this.props.intl.formatMessage({id: "follow-perspective"}));
                    } else {
                        message.info(this.props.intl.formatMessage({id: "freedom-perspective"}));
                    }
                } else {
                    if (!isBeforeBroadcaster) {
                        message.info(this.props.intl.formatMessage({id: "freedom-perspective"}));
                    }
                }
            }
        }
    }


    private renderBroadController(): React.ReactNode {
        const {room, roomState} = this.props;
        const perspectiveState = roomState.broadcastState;
        const isBroadcaster = perspectiveState.mode === ViewMode.Broadcaster;
        const hasBroadcaster = perspectiveState.broadcasterId !== undefined;
        if (isBroadcaster) {
            return (
                <Tooltip placement="bottom" title={this.props.intl.formatMessage({id: "in-lecture"})}>
                    <div
                        onClick={ () => {
                            room.setViewMode(ViewMode.Freedom);
                            message.info(this.props.intl.formatMessage({id: "out-lecture"}));
                        }}
                        className="whiteboard-top-bar-btn-mb">
                        <img src={board_black}/>
                    </div>
                </Tooltip>
            );
        } else {
            if (hasBroadcaster) {
                return (
                    <Popover
                        overlayClassName="whiteboard-perspective"
                        content={<WhiteboardPerspectiveSet roomState={roomState} room={room}/>}
                        placement="bottom">
                        <div
                            className="whiteboard-top-bar-btn-mb">
                            <img src={board}/>
                        </div>
                    </Popover>
                );
            } else {
                return (
                    <Tooltip placement="bottom" title={this.props.intl.formatMessage({id: "to-be-broadcaster"})}>
                        <div
                            onClick={ () => {
                                room.setViewMode(ViewMode.Broadcaster);
                                message.info(this.props.intl.formatMessage({id: "go-to-lecture"}));
                            }}
                            className="whiteboard-top-bar-btn-mb">
                            <img src={board}/>
                        </div>
                    </Tooltip>
                );
            }
        }
    }

    private renderBroadControllerMbile = (): React.ReactNode => {
        const {room, roomState} = this.props;
        const perspectiveState = roomState.broadcastState;
        const isBroadcaster = perspectiveState.mode === ViewMode.Broadcaster;
        const hasBroadcaster = perspectiveState.broadcasterId !== undefined;
        if (isBroadcaster) {
            return (
                <div
                    onClick={ () => {
                        room.setViewMode(ViewMode.Freedom);
                        message.info(this.props.intl.formatMessage({id: "out-lecture"}));
                    }}
                    className="whiteboard-top-bar-btn-mb">
                    <img src={board_black}/>
                </div>
            );
        } else {
            if (hasBroadcaster) {
                return (
                    <Popover
                        overlayClassName="whiteboard-perspective"
                        content={<WhiteboardPerspectiveSet roomState={roomState} room={room}/>}
                        placement="bottom">
                        <div
                            className="whiteboard-top-bar-btn-mb">
                            <img src={board}/>
                        </div>
                    </Popover>
                );
            } else {
                return (
                    <div
                        onClick={ () => {
                            room.setViewMode(ViewMode.Broadcaster);
                            message.info(this.props.intl.formatMessage({id: "go-to-lecture"}));
                        }}
                        className="whiteboard-top-bar-btn-mb">
                        <img src={board}/>
                    </div>
                );
            }
        }
    }

    private handleInvite = (): void => {
        this.setState({isInviteVisible: true});
    }

    private handleSetting = (): void => {
        this.setState({isSetVisible: true});
    }

    private handleUrl = (url: string): string => {
        let classUrl;
        if (this.state.netlessRoomType === NetlessRoomType.teacher_interactive) {
            classUrl = url.replace(`${NetlessRoomType.teacher_interactive}`, `${NetlessRoomType.interactive}`);
        } else {
            classUrl = url;
        }
        if (this.props.readOnly) {
            classUrl = classUrl.replace(`${NetlessRoomType.interactive}`, `${NetlessRoomType.live}`);
        }
        const regex = /[\w]+\/$/gm;
        const match = regex.exec(classUrl);
        if (match) {
            return classUrl.substring(0, match.index);
        } else {
            return classUrl;
        }
    }
    private switchWhiteboardRoomType = (): void => {
        if (this.state.netlessRoomType === NetlessRoomType.interactive) {
            const shareUrl = this.state.url.replace(`${NetlessRoomType.interactive}`, `${NetlessRoomType.live}`);
            this.setState({url: shareUrl, netlessRoomType: NetlessRoomType.live});
        } else if (this.state.netlessRoomType === NetlessRoomType.teacher_interactive) {
            const shareUrl = this.state.url.replace(`${NetlessRoomType.teacher_interactive}`, `${NetlessRoomType.live}`);
            this.setState({url: shareUrl, netlessRoomType: NetlessRoomType.live});
        } else {
            const shareUrl = this.state.url.replace(`${NetlessRoomType.live}`, `${NetlessRoomType.interactive}`);
            this.setState({url: shareUrl, netlessRoomType: NetlessRoomType.interactive});
        }
    }

    private renderShareTitle = (): React.ReactNode => {
        if (this.props.readOnly) {
            return "分享只读房间";
        } else {
            if (this.state.netlessRoomType !== NetlessRoomType.live) {
                return  "未开启只读模式";
            } else {
                return  "已开启只读模式";
            }
        }
    }

    public render(): React.ReactNode {
        if (isMobile) {
            return (
                <div className="whiteboard-box-top-right-mb">
                    <div
                        className="whiteboard-box-top-right-mid-mb">
                        <UploadBtnMobile
                            room={this.props.room}
                            oss={this.props.oss}
                            onProgress={this.props.onProgress}
                            whiteboardRef={this.props.whiteboardRef} />
                        {isMobile ? this.renderBroadControllerMbile() : this.renderBroadController()}
                        <div
                            className="whiteboard-top-bar-btn-mb" onClick={this.handleInvite}>
                            <img src={add}/>
                        </div>
                    </div>
                    <Modal
                        visible={this.state.isInviteVisible}
                        footer={null}
                        title="Invite"
                        onCancel={() => this.setState({isInviteVisible: false})}
                    >
                        <div className="whiteboard-share-box">
                            <QRCode value={`${this.handleUrl(this.state.url)}`} />
                            <div className="whiteboard-share-text-box">
                                <Input readOnly className="whiteboard-share-text" size="large" value={`${this.handleUrl(this.state.url)}`}/>
                                <Clipboard
                                    data-clipboard-text={`${this.handleUrl(this.state.url)}`}
                                    component="div"
                                    onSuccess={() => {
                                        message.success("Copy already copied address to clipboard");
                                        this.setState({isInviteVisible: false});
                                    }}
                                >
                                    <Button size="large" className="white-btn-size" type="primary">复制链接</Button>
                                </Clipboard>
                            </div>
                        </div>
                    </Modal>
                </div>
            );
        } else {
            return (
                <div className="whiteboard-box-top-right">
                    <div
                        className="whiteboard-box-top-right-mid">
                        <div onClick={this.handleSetting} className="whiteboard-top-bar-box">
                            <Identicon
                                size={28}
                                string={netlessWhiteboardApi.user.getUserInf(UserInfType.uuid, `${parseInt(this.props.number)}`)}/>
                        </div>
                        {!this.props.readOnly && this.renderBroadController()}
                        <Tooltip placement="bottomLeft" title={"invite your friend"}>
                            <div
                                style={{marginRight: 12}}
                                className="whiteboard-top-bar-btn" onClick={this.handleInvite}>
                                <img src={add}/>
                            </div>
                        </Tooltip>
                    </div>
                    <Modal
                        visible={this.state.isInviteVisible}
                        footer={null}
                        title="Invite"
                        onCancel={() => this.setState({isInviteVisible: false})}
                    >
                        <div className="whiteboard-share-box">
                            <div className="whiteboard-share-box-image">
                                <div className="whiteboard-share-box-btn">
                                    <div className="whiteboard-share-box-title">{
                                       this.renderShareTitle()
                                    }</div>
                                    {   this.props.readOnly ?
                                        <Switch checked={true} disabled={true} onChange={() => this.switchWhiteboardRoomType()}/> :
                                        <Switch onChange={() => this.switchWhiteboardRoomType()}/>
                                    }
                                </div>
                                <div className="whiteboard-share-box-btn">
                                    <QRCode value={`${this.handleUrl(this.state.url)}`} />
                                </div>
                            </div>
                            <div className="whiteboard-share-text-box">
                                <Input readOnly className="whiteboard-share-text" size="large" value={`${this.handleUrl(this.state.url)}`}/>
                                <Clipboard
                                    data-clipboard-text={`${this.handleUrl(this.state.url)}`}
                                    component="div"
                                    onSuccess={() => {
                                        message.success("Copy already copied address to clipboard");
                                        this.setState({isInviteVisible: false});
                                    }}
                                >
                                    <Button size="large" className="white-btn-size" type="primary">复制链接</Button>
                                </Clipboard>
                            </div>
                        </div>
                    </Modal>
                    <Modal
                        visible={this.state.isSetVisible}
                        footer={null}
                        title="Setting"
                        onCancel={() => this.setState({isSetVisible: false})}
                    >
                        <div className="whiteboard-set-box">
                            <div className="whiteboard-set-box-img">
                                <Identicon
                                    size={36}
                                    string={netlessWhiteboardApi.user.getUserInf(UserInfType.uuid, `${parseInt(this.props.number)}`)}/>
                            </div>
                            <div className="whiteboard-set-box-inner"> <span>name: </span>{netlessWhiteboardApi.user.getUserInf(UserInfType.name, `${this.props.number}`)}</div>
                            <div className="whiteboard-set-box-inner"> <span>uuid: </span>{netlessWhiteboardApi.user.getUserInf(UserInfType.uuid, `${this.props.number}`)}</div>
                        </div>
                        <div className="whiteboard-set-footer">
                            <div style={{marginRight: 16}}>
                                <Button
                                    size="large"
                                    onClick={() => {
                                        netlessWhiteboardApi.user.logout();
                                        this.props.history.push("/");
                                    }}
                                    className="white-btn-size-goback">退出</Button>
                            </div>
                        </div>
                    </Modal>
                </div>
            );
        }
    }
}

export default withRouter(injectIntl(WhiteboardTopRight));
