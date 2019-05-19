import * as React from "react";
import * as annex_box from "../../assets/image/annex_box.svg";
import * as whiteboard_keyboard from "../../assets/image/whiteboard_keyboard.svg";
import * as left_arrow from "../../assets/image/left_arrow.svg";
import * as right_arrow from "../../assets/image/right_arrow.svg";
import * as chat from "../../assets/image/chat.svg";
import "./WhiteboardBottomRight.less";
import WhiteboardChat from "./WhiteboardChat";
import {Badge, Popover, Tooltip} from "antd";
import {InjectedIntlProps, injectIntl} from "react-intl";
import {Room, Scene, RoomState} from "white-web-sdk";

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
};

export type WhiteboardBottomRightProps = {
    room: Room;
    number: string;
    roomState: RoomState;
    handleHotKeyMenuState: () => void;
    handleAnnexBoxMenuState: () => void;
} & InjectedIntlProps;

class WhiteboardBottomRight extends React.Component<WhiteboardBottomRightProps, hotkeyTooltipState> {

    public constructor(props: WhiteboardBottomRightProps) {
        super(props);
        this.state = {
            hotkeyTooltipDisplay: false,
            annexBoxTooltipDisplay: false,
            messages: [],
            seenMessagesLength: 0,
            isVisible: false,
        };
        this.renderAnnexBox = this.renderAnnexBox.bind(this);
    }

    public async componentDidMount(): Promise<void> {
        const {room} = this.props;
        room.addMagixEventListener("message",  event => {
            this.setState({messages: [...this.state.messages, event.payload]});
        });
    }

    private setScenePath = (newActiveIndex: number) => {
        const {room} = this.props;
        room.setSceneIndex(newActiveIndex);
    }
    private renderAnnexBox(): React.ReactNode {
        const {roomState} = this.props;
        const activeIndex = roomState.sceneState.index;
        const scenes = roomState.sceneState.scenes;
        return (
            <div>
                {scenes.length > 1 ?
                    <div className="whiteboard-annex-box">
                        <div
                            onClick={() => {
                                if (activeIndex !== 0) {
                                    const newActiveIndex = activeIndex - 1;
                                    this.setScenePath(newActiveIndex);
                                }
                            }}
                            className="whiteboard-annex-arrow-left">
                            <img src={left_arrow}/>
                        </div>
                        <Tooltip placement="top" title={this.props.intl.formatMessage({id: "attachment"})} visible={this.state.annexBoxTooltipDisplay}>
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
                            onClick={() => {
                                if (activeIndex !== scenes.length - 1) {
                                    const newActiveIndex = activeIndex + 1;
                                    this.setScenePath(newActiveIndex);
                                }
                            }}
                            className="whiteboard-annex-arrow-right">
                            <img src={right_arrow}/>
                        </div>
                    </div> :
                    <Tooltip placement="topRight" title={this.props.intl.formatMessage({id: "attachment"})} visible={this.state.annexBoxTooltipDisplay}>
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

    public render(): React.ReactNode {
        return (
            <div className="whiteboard-box-bottom-right">
                <div className="whiteboard-box-bottom-right-mid">
                    <Tooltip placement="top" title={this.props.intl.formatMessage({id: "hot-key"})} visible={this.state.hotkeyTooltipDisplay}>
                        <div
                            style={{marginRight: 8}}
                            className="whiteboard-bottom-right-cell"
                             onClick={this.props.handleHotKeyMenuState}>
                            <img src={whiteboard_keyboard}/>
                        </div>
                    </Tooltip>
                    {this.renderAnnexBox()}
                    <Badge overflowCount={99} offset={[-3, 6]} count={this.state.isVisible ? 0 : (this.state.messages.length - this.state.seenMessagesLength)}>
                        <Popover
                            overlayClassName="whiteboard-chat"
                            content={<WhiteboardChat messages={this.state.messages} room={this.props.room} number={this.props.number}/>}
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

export default injectIntl(WhiteboardBottomRight);

