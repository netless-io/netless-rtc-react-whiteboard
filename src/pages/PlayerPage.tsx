import * as React from "react";
import {observer} from "mobx-react";
import {Icon} from "antd";
import {WhiteWebSdk, PlayerWhiteboard, PlayerPhase, Player} from "white-react-sdk";
import "./PlayerPage.less";
import {RouteComponentProps} from "react-router";
import SeekSlider from "@netless/react-seek-slider";
import * as player_full_screen from "../assets/image/player_full_screen.svg";
import * as exit_full_screen from "../assets/image/exit_full_screen.svg";
import * as player_stop from "../assets/image/player_stop.svg";
import * as player_begin from "../assets/image/player_begin.svg";
import {displayWatch} from "../tools/WatchDisplayer";
import {whiteboardPageStore} from "../models/WhiteboardPageStore";
import {push} from "@netless/i18n-react-router";
import * as home from "../assets/image/home.svg";
import * as board from "../assets/image/board.svg";
import Identicon from "react-identicons";
import TweenOne from "rc-tween-one";
import * as like from "../assets/image/like.svg";
import {message} from "antd";
import {userInfDataStore, UserInfType} from "../models/UserInfDataStore";
const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export type PlayerPageProps = RouteComponentProps<{
    uuid: string;
    userId: string;
}>;

export type PlayerPageStates = {
    player: Player | null;
    phase: PlayerPhase;
    currentTime: number;
    isFullScreen: boolean;
    isFirstScreenReady: boolean;
    isHandClap: boolean;
};

@observer
class PlayerPage extends React.Component<PlayerPageProps, PlayerPageStates> {
    private scheduleTime: number = 0;
    public constructor(props: PlayerPageProps) {
        super(props);
        this.state = {
            currentTime: 0,
            phase: PlayerPhase.Pause,
            isFullScreen: false,
            isFirstScreenReady: false,
            isHandClap: false,
            player: null,
        };
    }


    public async componentDidMount(): Promise<void> {
        const uuid = this.props.match.params.uuid;
        const whiteWebSdk = new WhiteWebSdk();
        const roomToken = await whiteboardPageStore.joinRoom(uuid);
        if (uuid && roomToken) {
            const player = await whiteWebSdk.replayRoom({room: uuid, roomToken: roomToken}, {
                onPhaseChanged: phase => {
                    this.setState({phase: phase});
                },
                onLoadFirstFrame: () => {
                    this.setState({isFirstScreenReady: true});
                },
                onPlayerStateChanged: modifyState => {
                  console.log(modifyState);
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
        }
    }

    private enterFullScreen = (): void => {
        this.setState({isFullScreen: true});
        const docElm = document.documentElement;
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }
    }

    private exitFullScreen = (): void => {
        this.setState({isFullScreen: false});
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
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
        if (whiteboardPageStore.isPlayerSeeking) {
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
                    <div className="player-right-box">
                        <div
                            onClick={() => {
                                if (this.state.isFullScreen) {
                                    this.exitFullScreen();
                                } else {
                                    this.enterFullScreen();
                                }
                            }}
                            className="player-right-box-inner">
                            {this.state.isFullScreen ? <img src={exit_full_screen}/> :
                                <img src={player_full_screen}/>}
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }

    public render(): React.ReactNode {
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
                            string={userInfDataStore.getUserInf(UserInfType.uuid, `${parseInt(this.props.match.params.userId)}`)}/>
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
                {this.state.player && <PlayerWhiteboard className="player-box" player={this.state.player}/>}
            </div>
        );
    }
}

export default PlayerPage;
