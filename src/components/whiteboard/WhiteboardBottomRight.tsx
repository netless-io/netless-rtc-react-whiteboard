import * as React from "react";
import * as annex_box from "../../assets/image/annex_box.svg";
import * as whiteboard_keyboard from "../../assets/image/whiteboard_keyboard.svg";
import * as left_arrow from "../../assets/image/left_arrow.svg";
import * as right_arrow from "../../assets/image/right_arrow.svg";
import * as chat from "../../assets/image/chat.svg";
import "./WhiteboardBottomRight.less";
import WhiteboardChat from "./WhiteboardChat";
import {Badge, message, Popover, Tooltip} from "antd";
import {Room, Scene, RoomState} from "white-web-sdk";
import {netlessWhiteboardApi} from "../../apiMiddleware";
import {isMobile} from "react-device-detect";

export type MessageType = {
    name: string,
    avatar: string,
    id: string,
    messageInner: string[],
};



export type hotkeyTooltipState = {
    hotkeyTooltipDisplay: boolean,
    annexBoxTooltipDisplay: boolean,
    messages:  MessageType[],
    seenMessagesLength: number,
    isVisible: boolean,
    isRecord: boolean,
};

export type WhiteboardBottomRightProps = {
    room: Room;
    userId: string;
    roomState: RoomState;
    handleHotKeyMenuState: () => void;
    handleAnnexBoxMenuState: () => void;
};

class WhiteboardBottomRight extends React.Component<WhiteboardBottomRightProps, hotkeyTooltipState> {

    public constructor(props: WhiteboardBottomRightProps) {
        super(props);
        this.state = {
            hotkeyTooltipDisplay: false,
            annexBoxTooltipDisplay: false,
            messages: [],
            seenMessagesLength: 0,
            isVisible: false,
            isRecord: false,
        };
        this.renderAnnexBox = this.renderAnnexBox.bind(this);
    }

    public componentDidMount(): void {
        const {room} = this.props;
        room.addMagixEventListener("message",  event => {
            this.setState({messages: [...this.state.messages, event.payload]});
        });
    }
    private renderAnnexBox(): React.ReactNode {
        const {roomState, room} = this.props;
        const activeIndex = roomState.sceneState.index;
        const scenes = roomState.sceneState.scenes;
        return (
            <div>
                {scenes.length > 1 ?
                    <div className="whiteboard-annex-box">
                        <div
                            onClick={() => room.pptPreviousStep()}
                            className="whiteboard-annex-arrow-left">
                            <img src={left_arrow}/>
                        </div>
                        <Tooltip placement="top" title={"附件资料"} visible={this.state.annexBoxTooltipDisplay}>
                            <div
                                onMouseEnter={() => {
                                    this.setState({
                                        annexBoxTooltipDisplay: true,
                                    });
                                }}
                                onMouseLeave={() => {
                                    this.setState({
                                        annexBoxTooltipDisplay: false,
                                    });
                                }}
                                onClick={this.props.handleAnnexBoxMenuState}
                                className="whiteboard-annex-arrow-mid">
                                <div className="whiteboard-annex-img-box">
                                    <img src={annex_box}/>
                                </div>
                                <div className="whiteboard-annex-arrow-page">
                                    {activeIndex + 1} / {scenes.length}
                                </div>
                            </div>
                        </Tooltip>
                        <div
                            onClick={() => room.pptNextStep()}
                            className="whiteboard-annex-arrow-right">
                            <img src={right_arrow}/>
                        </div>
                    </div> :
                    <Tooltip placement="topRight" title={"附件资料"} visible={this.state.annexBoxTooltipDisplay}>
                        <div
                            onMouseEnter={() => {
                                this.setState({
                                    annexBoxTooltipDisplay: true,
                                });
                            }}
                            onMouseLeave={() => {
                                this.setState({
                                    annexBoxTooltipDisplay: false,
                                });
                            }}
                            onClick={this.props.handleAnnexBoxMenuState}
                            className="whiteboard-bottom-right-cell">
                            <img src={annex_box}/>
                        </div>
                    </Tooltip>}
            </div>
        );
    }

    private renderAnnexBoxMobile(): React.ReactNode {
        const {roomState, room} = this.props;
        const activeIndex = roomState.sceneState.index;
        const scenes = roomState.sceneState.scenes;
        return (
            <div>
                {scenes.length > 1 ?
                    <div className="whiteboard-annex-box">
                        <div
                            onClick={() => room.pptPreviousStep()}
                            className="whiteboard-annex-arrow-left-mb">
                            <img src={left_arrow}/>
                        </div>
                        <div
                            onClick={() => room.pptNextStep()}
                            className="whiteboard-annex-arrow-right-mb">
                            <img src={right_arrow}/>
                        </div>
                    </div> :
                    <div
                        onMouseEnter={() => {
                            this.setState({
                                annexBoxTooltipDisplay: true,
                            });
                        }}
                        onMouseLeave={() => {
                            this.setState({
                                annexBoxTooltipDisplay: false,
                            });
                        }}
                        onClick={this.props.handleAnnexBoxMenuState}
                        className="whiteboard-bottom-right-cell">
                        <img src={annex_box}/>
                    </div>}
            </div>
        );
    }
    public render(): React.ReactNode {
        if (isMobile) {
            return (
                <div className="whiteboard-box-bottom-right">
                    <div className="whiteboard-box-bottom-right-mid-mb">
                        {this.renderAnnexBoxMobile()}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="whiteboard-box-bottom-right">
                    <div className="whiteboard-box-bottom-right-mid">
                        {/*<Tooltip placement="top" title={"快捷键"} visible={this.state.hotkeyTooltipDisplay}>*/}
                        {/*<div*/}
                        {/*style={{marginRight: 8}}*/}
                        {/*className="whiteboard-bottom-right-cell"*/}
                        {/*onClick={this.startRec}>*/}
                        {/*<img src={whiteboard_keyboard}/>*/}
                        {/*</div>*/}
                        {/*</Tooltip>*/}
                        {this.renderAnnexBox()}
                        <Badge overflowCount={99} offset={[-3, 6]} count={this.state.isVisible ? 0 : (this.state.messages.length - this.state.seenMessagesLength)}>
                            <Popover
                                overlayClassName="whiteboard-chat"
                                content={<WhiteboardChat messages={this.state.messages} room={this.props.room} userId={this.props.userId}/>}
                                trigger="click"
                                onVisibleChange={(visible: boolean) => {
                                    if (visible) {
                                        this.setState({isVisible: true});
                                    } else {
                                        this.setState({isVisible: false, seenMessagesLength: this.state.messages.length});
                                    }
                                }}
                                placement="topLeft">
                                <div style={{marginLeft: 8}} className="whiteboard-bottom-right-cell">
                                    <img style={{width: 17}} src={chat}/>
                                </div>
                            </Popover>
                        </Badge>
                    </div>
                </div>
            );
        }
    }
}

export default WhiteboardBottomRight;

