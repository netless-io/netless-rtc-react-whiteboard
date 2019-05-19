import * as React from "react";
import {Button, Icon, Input, message, Modal, Popover, Tooltip} from "antd";
import {Room} from "white-react-sdk";
import {ViewMode} from "white-react-sdk";
import {autorun} from "mobx";
import {IReactionDisposer} from "mobx/lib/core/reaction";
import Identicon from "react-identicons";
import {InjectedIntlProps, injectIntl} from "react-intl";
import Clipboard from "react-clipboard.js";
import * as add from "../../assets/image/add.svg";
import * as board from "../../assets/image/board.svg";
import * as board_black from "../../assets/image/board_black.svg";
import {observer} from "mobx-react";
import WhiteboardPerspectiveSet from "./WhiteboardPerspectiveSet";
import {applianceStore} from "../../models/ApplianceStore";
import "./WhiteboardTopRight.less";
import {userInfDataStore, UserInfType} from "../../models/UserInfDataStore";
import {withRouter} from "react-router-dom";
import {RouteComponentProps} from "react-router";

export type WhiteboardTopRightState = {
    scaleAnimation: boolean;
    reverseState: boolean;
    isFirst: boolean;
    isInviteVisible: boolean;
    isSetVisible: boolean;
};

export type WhiteboardTopRightProps = RouteComponentProps<{}> & InjectedIntlProps & {room: Room, number: string, uuid: string};

@observer
class WhiteboardTopRight extends React.Component<WhiteboardTopRightProps, WhiteboardTopRightState> {

    private autorun: IReactionDisposer;
    public constructor(props: WhiteboardTopRightProps) {
        super(props);
        this.state = {
            scaleAnimation: true,
            reverseState: false,
            isFirst: true,
            isInviteVisible: false,
            isSetVisible: false,
        };
        this.renderBroadController = this.renderBroadController.bind(this);
    }

    public componentWillMount(): void {
       this.autorun = autorun(() => {
           if (applianceStore.state) {
               const perspectiveState = applianceStore.state.broadcastState;
               const isBroadcaster = perspectiveState.mode === ViewMode.Broadcaster;
               const hasBroadcaster = perspectiveState.broadcasterId !== undefined;
               if (!isBroadcaster) {
                   if (hasBroadcaster) {
                       if (perspectiveState.mode === ViewMode.Follower) {
                           message.info(this.props.intl.formatMessage({id: "current-speaker"}) + " " + perspectiveState.broadcasterInformation!.nickName + "," + this.props.intl.formatMessage({id: "follow-perspective"}));
                       } else {
                           message.info(this.props.intl.formatMessage({id: "freedom-perspective"}));
                       }
                   }
               }
           }
       });
    }

    public componentWillUnmount(): void {
        if (this.autorun) {
            this.autorun();
        }
    }


    private renderBroadController(): React.ReactNode {
        const perspectiveState = applianceStore.state!.broadcastState;
        const isBroadcaster = perspectiveState.mode === ViewMode.Broadcaster;
        const hasBroadcaster = perspectiveState.broadcasterId !== undefined;
        if (isBroadcaster) {
            return (
                <Tooltip placement="bottom" title={this.props.intl.formatMessage({id: "in-lecture"})}>
                    <div
                        onClick={ () => {
                            applianceStore.state!.room.setViewMode(ViewMode.Freedom);
                            message.info(this.props.intl.formatMessage({id: "out-lecture"}));
                        }}
                        className="whiteboard-top-bar-btn">
                        <img src={board_black}/>
                    </div>
                </Tooltip>
            );
        } else {
            if (hasBroadcaster) {
                return (
                    <Popover
                        overlayClassName="whiteboard-perspective"
                        content={<WhiteboardPerspectiveSet/>}
                        placement="bottom">
                        <div
                            className="whiteboard-top-bar-btn">
                            <img src={board}/>
                        </div>
                    </Popover>
                );
            } else {
                return (
                    <Tooltip placement="bottom" title={this.props.intl.formatMessage({id: "to-be-broadcaster"})}>
                        <div
                            onClick={ () => {
                                applianceStore.state!.room.setViewMode(ViewMode.Broadcaster);
                                message.info(this.props.intl.formatMessage({id: "go-to-lecture"}));
                            }}
                            className="whiteboard-top-bar-btn">
                            <img src={board}/>
                        </div>
                    </Tooltip>
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

    public render(): React.ReactNode {
        return (
            <div className="whiteboard-box-top-right">
                <div
                    className="whiteboard-box-top-right-mid">
                    <div onClick={this.handleSetting} className="whiteboard-top-bar-box">
                        <Identicon
                            size={28}
                            string={userInfDataStore.getUserInf(UserInfType.uuid, `${parseInt(this.props.number)}`)}/>
                    </div>
                    {this.renderBroadController()}
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
                        <Input readOnly className="whiteboard-share-text" size="large" value={`${location.host}/whiteboard/${this.props.uuid}/${this.props.room.state.roomMembers.length + 1}/`}/>
                    </div>
                    <div className="whiteboard-share-footer">
                        <div style={{marginRight: 16}}>
                            <Button
                                size="large"
                                onClick={() => this.setState({isInviteVisible: false})}
                                className="white-btn-size">Cancel</Button>
                        </div>
                        <Clipboard
                            data-clipboard-text={`${location.host}/whiteboard/${this.props.uuid}/${this.props.room.state.roomMembers.length + 1}/`}
                            component="div"
                            onSuccess={() => {
                                message.success("Copy already copied address to clipboard");
                                this.setState({isInviteVisible: false});
                            }}
                        >
                            <Button size="large" className="white-btn-size" type="primary">Copy</Button>
                        </Clipboard>
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
                                string={userInfDataStore.getUserInf(UserInfType.uuid, `${parseInt(this.props.number)}`)}/>
                        </div>
                        <div className="whiteboard-set-box-inner"> <span>name: </span>{userInfDataStore.getUserInf(UserInfType.name, `${this.props.number}`)}</div>
                        <div className="whiteboard-set-box-inner"> <span>uuid: </span>{userInfDataStore.getUserInf(UserInfType.uuid, `${this.props.number}`)}</div>
                    </div>
                    <div className="whiteboard-set-footer">
                        <div style={{marginRight: 16}}>
                            <Button
                                size="large"
                                onClick={() => {
                                    userInfDataStore.logout();
                                    this.props.history.push("/");
                                }}
                                className="white-btn-size">Clean</Button>
                        </div>
                        <Button size="large" className="white-btn-size" type="primary">Edit</Button>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default withRouter(injectIntl(WhiteboardTopRight));
