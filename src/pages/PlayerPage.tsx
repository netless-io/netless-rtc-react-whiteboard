import * as React from "react";
import {Badge, Icon, Popover} from "antd";
import {WhiteWebSdk, PlayerWhiteboard, PlayerPhase, Player, Room} from "white-react-sdk";
import * as loading from "../assets/image/loading.svg";
import * as chat from "../assets/image/chat.svg";
import "./PlayerPage.less";
import {RouteComponentProps} from "react-router";
import SeekSlider from "@netless/react-seek-slider";
import * as player_stop from "../assets/image/player_stop.svg";
import * as player_begin from "../assets/image/player_begin.svg";
import {displayWatch} from "../tools/WatchDisplayer";
import {push} from "@netless/i18n-react-router";
import * as home from "../assets/image/home.svg";
import * as board from "../assets/image/board.svg";
import Identicon from "react-identicons";
import TweenOne from "rc-tween-one";
import * as like from "../assets/image/like.svg";
import {message} from "antd";
import {UserCursor} from "../components/whiteboard/UserCursor";
import {netlessWhiteboardApi, UserInfType} from "../apiMiddleware";
import WhiteboardChat from "../components/whiteboard/WhiteboardChat";
import {MessageType} from "../components/whiteboard/WhiteboardBottomRight";
const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export type PlayerPageProps = RouteComponentProps<{
    uuid: string;
    userId: string;
}> & {room: Room};

export type PlayerPageStates = {
    player: Player | null;
    phase: PlayerPhase;
    currentTime: number;
    isFullScreen: boolean;
    isFirstScreenReady: boolean;
    isHandClap: boolean;
    isPlayerSeeking: boolean;
    isVisible: boolean;
    messages: MessageType[];
    seenMessagesLength: number;
};

export default class PlayerPage extends React.Component<PlayerPageProps, PlayerPageStates> {
    private scheduleTime: number = 0;
    private readonly cursor: any;
    public constructor(props: PlayerPageProps) {
        super(props);
        this.cursor = new UserCursor();
        this.state = {
            currentTime: 0,
            phase: PlayerPhase.Pause,
            isFullScreen: false,
            isFirstScreenReady: false,
            isHandClap: false,
            player: null,
            isPlayerSeeking: false,
            isVisible: false,
            messages: [],
            seenMessagesLength: 0,
        };
    }
    private getRoomToken = async (uuid: string): Promise<string | null> => {
        const res = await netlessWhiteboardApi.room.joinRoomApi(uuid);
        if (res.code === 200) {
            return res.msg.roomToken;
        } else {
            return null;
        }
    }

    public async componentDidMount(): Promise<void> {
        const uuid = this.props.match.params.uuid;
        const whiteWebSdk = new WhiteWebSdk();
        const roomToken = await this.getRoomToken(uuid);
        if (uuid && roomToken) {
            const player = await whiteWebSdk.replayRoom({room: uuid, roomToken: roomToken, cursorAdapter: this.cursor}, {
                onPhaseChanged: phase => {
                    this.setState({phase: phase});
                },
                onLoadFirstFrame: () => {
                    this.setState({isFirstScreenReady: true});
                    if (player.state.roomMembers) {
                        this.cursor.setColorAndAppliance(player.state.roomMembers);
                    }
                },
                onPlayerStateChanged: modifyState => {
                    if (modifyState.roomMembers) {
                        this.cursor.setColorAndAppliance(modifyState.roomMembers);
                    }
                },
                onStoppedWithError: error => {
                  message.error("Playback error");
                },
                onScheduleTimeChanged: scheduleTime => {
                    this.setState({currentTime: scheduleTime});
                },
            });
            this.setState({
                player: player,
            });
            player.addMagixEventListener("handclap", async () => {
                this.setState({isHandClap: true});
                await timeout(800);
                this.setState({isHandClap: false});
            });
            player.addMagixEventListener("message",  event => {
                this.setState({messages: [...this.state.messages, event.payload]});
            });
        }
    }
    private onWindowResize = (): void => {
        if (this.state.player) {
            this.state.player.refreshViewSize();
        }
    }
    public componentWillMount(): void {
        window.addEventListener("resize", this.onWindowResize);
    }


    public componentWillUnmount(): void {
        window.removeEventListener("resize", this.onWindowResize);
    }

    private operationButton = (phase: PlayerPhase): React.ReactNode => {
        switch (phase) {
            case PlayerPhase.Playing: {
                return <img src={player_begin}/>;
            }
            case PlayerPhase.Buffering: {
                return <Icon style={{fontSize: 18}} type="loading" />;
            }
            case PlayerPhase.Ended: {
                return <img style={{marginLeft: 2}} src={player_stop}/>;
            }
            default: {
                return <img style={{marginLeft: 2}} src={player_stop}/>;
            }
        }
    }

    private getCurrentTime = (scheduleTime: number): number => {
        if (this.state.isPlayerSeeking) {
            this.scheduleTime = scheduleTime;
            return this.state.currentTime;
        } else {
            const isChange = this.scheduleTime !== scheduleTime;
            if (isChange) {
                return scheduleTime;
            } else {
                return this.state.currentTime;
            }
        }
    }

    private onClickOperationButton = (player: Player): void => {
        switch (player.phase) {
            case PlayerPhase.WaitingFirstFrame:
            case PlayerPhase.Pause: {
                player.play();
                break;
            }
            case PlayerPhase.Playing: {
                player.pause();
                break;
            }
            case PlayerPhase.Ended: {
                player.seekToScheduleTime(0);
                break;
            }
        }
    }
    private renderScheduleView(): React.ReactNode {
        if (this.state.player) {
            return (
                <div
                    style={{display: "flex"}}
                    className="player-schedule">
                    <div className="player-left-box">
                        <div
                            onClick={() => this.onClickOperationButton(this.state.player!)}
                            className="player-controller">
                            {this.operationButton(this.state.phase)}
                        </div>
                    </div>
                    <div className="player-mid-box">
                        <SeekSlider
                            fullTime={this.state.player.timeDuration}
                            currentTime={this.getCurrentTime(this.state.currentTime)}
                            onChange={(time: number, offsetTime: number) => {
                                if (this.state.player) {
                                    this.setState({currentTime: time});
                                   this.state.player.seekToScheduleTime(time);
                                }
                            }}
                            hideHoverTime={true}
                            limitTimeTooltipBySides={true}/>
                    </div>
                    <div className="player-mid-box-time">
                        {displayWatch(Math.floor(this.state.player.scheduleTime / 1000))} / {displayWatch(Math.floor(this.state.player.timeDuration / 1000))}
                    </div>
                    <Badge overflowCount={99} offset={[-3, 6]} count={this.state.isVisible ? 0 : (this.state.messages.length - this.state.seenMessagesLength)}>
                        <Popover
                            overlayClassName="whiteboard-chat"
                            content={<WhiteboardChat messages={this.state.messages} room={this.props.room} userId={this.props.match.params.userId}/>}
                            trigger="click"
                            onVisibleChange={(visible: boolean) => {
                                if (visible) {
                                    this.setState({isVisible: true});
                                } else {
                                    this.setState({isVisible: false, seenMessagesLength: this.state.messages.length});
                                }
                            }}
                            placement="topLeft">
                            <div className="player-right-box">
                                <div className="player-right-box-inner">
                                    <img style={{width: 17}} src={chat}/>
                                </div>
                            </div>
                        </Popover>
                    </Badge>
                </div>
            );
        } else {
            return null;
        }
    }

    public render(): React.ReactNode {
        if (!this.state.player) {
            return <div className="white-board-loading">
                <img src={loading}/>
            </div>;
        } else if (this.state.phase === PlayerPhase.WaitingFirstFrame) {
            return <div className="white-board-loading">
                <img src={loading}/>
            </div>;
        } else {
            return (
                <div className="player-out-box">
                    <div
                        style={{display: "flex"}}
                        className="player-nav-box">
                        <div className="player-nav-left-box">
                            <div className="player-nav-left">
                                <div
                                    onClick={() => push(this.props.history, `/`)}
                                    className="player-nav-icon-box-left">
                                    <img src={home}/>
                                </div>
                                <div
                                    onClick={() => push(this.props.history, `/whiteboard/${this.props.match.params.uuid}/${this.props.match.params.userId}/`)}
                                    className="player-nav-icon-box-right">
                                    <img src={board}/>
                                </div>
                            </div>
                        </div>
                        <div className="player-nav-right">
                            <Identicon
                                size={36}
                                string={netlessWhiteboardApi.user.getUserInf(UserInfType.uuid, `${parseInt(this.props.match.params.userId)}`)}/>
                        </div>
                    </div>
                    {this.renderScheduleView()}
                    {this.state.isHandClap && <div className="whiteboard-box-gift-box">
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
                    </div>}
                    <PlayerWhiteboard className="player-box" player={this.state.player}/>
                </div>
            );
        }
    }
}
