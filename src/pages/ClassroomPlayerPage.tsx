import * as React from "react";
import {Badge, Icon, Popover} from "antd";
import {WhiteWebSdk, PlayerWhiteboard, PlayerPhase, Player, Room} from "white-react-sdk";
import * as chat from "../assets/image/chat.svg";
import "./ClassroomPlayerPage.less";
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
import Draggable from "react-draggable";
import VideoPlaceholder from "../components/whiteboard/VideoPlaceholder";
import * as teacher from "../assets/image/teacher.svg";
import {isMobile, isSafari} from "react-device-detect";

const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export type PlayerPageProps = RouteComponentProps<{
    uuid: string;
    userId: string;
    time: string;
    duration: string;
    mediaSource?: string;
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
    isPortrait: boolean;
};

export default class PlayerPage extends React.Component<PlayerPageProps, PlayerPageStates> {
    private scheduleTime: number = 0;
    private readonly cursor: any;

    public constructor(props: PlayerPageProps) {
        super(props);
        this.cursor = new UserCursor();
        const isPortrait: boolean = (window.innerHeight / window.innerWidth) > 1;
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
            isPortrait: isPortrait,
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
            const {time, duration} = this.props.match.params;

            let {mediaSource} = this.props.match.params;

            mediaSource = mediaSource === undefined ? undefined : `https://netless-media.oss-cn-hangzhou.aliyuncs.com/${mediaSource}`;

            const player = await whiteWebSdk.replayRoom(
                {
                    beginTimestamp: time ? parseInt(time) : undefined,
                    duration: duration ? parseInt(duration) : undefined,
                    room: uuid,
                    audioUrl: mediaSource,
                    roomToken: roomToken,
                    cursorAdapter: this.cursor,
                }, {
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
            player.moveCameraToContain({
                originX: - 600,
                originY: - 337.5,
                width: 1200,
                height: 675,
                animationMode: "immediately",
            });
        }
    }
    private onWindowResize = (): void => {
        const isPortrait: boolean = (window.innerHeight / window.innerWidth) > 1;
        this.setState({isPortrait: isPortrait});
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
                    className="classroom-player-schedule">
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
                </div>
            );
        } else {
            return null;
        }
    }

    private renderVideoPlaceHold = (mediaSource: string | undefined): React.ReactNode => {
        if (mediaSource) {
            if (isSafari) {
                // alert(1);
                return <video
                    className="classroom-player-video-box-safari"
                    id="white-sdk-video-js"/>;
            } else {
                return <VideoPlaceholder
                    controls={false}
                    className="classroom-player-video-box"
                />;
                // return null;
            }
        } else {
            return null;
        }
    }
    public render(): React.ReactNode {
        const {mediaSource} = this.props.match.params;
        const {isPortrait} = this.state;
        return (
            <div className={isPortrait ? "classroom-player-box-portrait" : "classroom-player-box"}>
                {isPortrait && <div className="classroom-player-box-chat-portrait">
                    <WhiteboardChat isClassroom={true} isReadonly={true} messages={this.state.messages} room={this.props.room} userId={this.props.match.params.userId}/>
                </div>}
                <div className={isPortrait ? "classroom-player-left-portrait" : "classroom-player-left"}>
                    <div
                        className="player-nav-box">
                        <div className="player-nav-left-box">
                            <div className="player-nav-left">
                                <div
                                    onClick={() => push(this.props.history, `/`)}
                                    className="player-nav-icon-box-left">
                                    <img src={home}/>
                                </div>
                                <div
                                    onClick={() => this.props.history.goBack()}
                                    className="player-nav-icon-box-right">
                                    <img src={board}/>
                                </div>
                            </div>
                        </div>
                        <div className="player-nav-right">
                            <Identicon
                                size={18}
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
                    {this.state.player && <PlayerWhiteboard className="classroom-player" player={this.state.player}/>}
                </div>
                <div className={isPortrait ? "classroom-player-right-portrait" : "classroom-player-right"}>
                    <div className={isPortrait ? "classroom-player-video-portrait" : "classroom-player-video"}>
                        {this.renderVideoPlaceHold(mediaSource)}
                        <div className="classroom-player-video-box-layer2">
                            <img src={teacher}/>
                        </div>
                    </div>
                    {!isPortrait &&
                    <div className="classroom-player-chat">
                        <WhiteboardChat
                            messages={this.state.messages}
                            isReadonly={true}
                            room={this.props.room}
                            userId={this.props.match.params.userId}/>
                    </div>
                    }
                </div>
            </div>
        );
    }
}
