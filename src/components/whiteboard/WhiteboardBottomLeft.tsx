import * as React from "react";
import {Room, RoomState} from "white-react-sdk";
import "./WhiteboardBottomLeft.less";
import ScaleController from "@netless/react-scale-controller";
import * as player from "../../assets/image/player.svg";
import * as like_icon from "../../assets/image/like_icon.svg";
import {Tooltip} from "antd";
import {withRouter} from "react-router-dom";
import {RouteComponentProps} from "react-router";
import {push} from "@netless/i18n-react-router";
import {netlessWhiteboardApi} from "../../apiMiddleware";
import {isMobile} from "react-device-detect";
import {InputProps} from "antd/lib/input/Input";

export type WhiteboardBottomLeftInnerProps = {
    room: Room;
    roomState: RoomState;
    uuid: string;
    userId: string;
    startTime?: number;
    stopTime?: number;
    mediaSource?: string;
    isReadOnly?: boolean;
};

export type WhiteboardBottomLeftProps = RouteComponentProps<{}> & WhiteboardBottomLeftInnerProps;

class WhiteboardBottomLeft extends React.Component<WhiteboardBottomLeftProps, {}> {

    public constructor(props: WhiteboardBottomLeftProps) {
        super(props);
    }


    private zoomChange = (scale: number): void => {
        const {room} = this.props;
        room.zoomChange(scale);
    }

    public render(): React.ReactNode {
        const {roomState, startTime, stopTime, mediaSource} = this.props;
        if (isMobile) {
            return (
                <div
                    onClick={async () => {
                        await this.props.room.disconnect();
                        if (startTime && stopTime) {
                            const duration = (stopTime - startTime);
                            if (mediaSource) {
                                push(this.props.history, `/replay/${this.props.uuid}/${this.props.userId}/${startTime}/${duration}/${mediaSource}`);
                            } else {
                                push(this.props.history, `/replay/${this.props.uuid}/${this.props.userId}/${startTime}/${duration}`);
                            }
                        } else if (startTime) {
                            push(this.props.history, `/replay/${this.props.uuid}/${this.props.userId}/${startTime}/`);
                        } else {
                            push(this.props.history, `/replay/${this.props.uuid}/${this.props.userId}/`);
                        }
                    }}
                    className="whiteboard-box-bottom-left-player-mb">
                    <img src={player}/>
                </div>
            );
        } else {
            return (
                <div style={{display: this.props.isReadOnly ? "none" : "flex"}} className="whiteboard-box-bottom-left">
                    <ScaleController zoomScale={roomState.zoomScale} zoomChange={this.zoomChange}/>
                    <Tooltip placement="top" title={"回放"}>
                        <div
                            onClick={async () => {
                                await this.props.room.disconnect();
                                if (startTime && stopTime) {
                                    const duration = (stopTime - startTime);
                                    if (mediaSource) {
                                        push(this.props.history, `/replay/${this.props.uuid}/${this.props.userId}/${startTime}/${duration}/${mediaSource}`);
                                    } else {
                                        push(this.props.history, `/replay/${this.props.uuid}/${this.props.userId}/${startTime}/${duration}`);
                                    }
                                } else if (startTime) {
                                    push(this.props.history, `/replay/${this.props.uuid}/${this.props.userId}/${startTime}/`);
                                } else {
                                    push(this.props.history, `/replay/${this.props.uuid}/${this.props.userId}/`);
                                }
                            }}
                            className="whiteboard-box-bottom-left-player">
                            <img src={player}/>
                        </div>
                    </Tooltip>
                    <div
                        onClick={async () => {
                            this.props.room.dispatchMagixEvent("handclap", "handclap");
                        }}
                        className="whiteboard-box-bottom-left-cell">
                        <img style={{width: 15}} src={like_icon}/>
                    </div>
                </div>
            );
        }
    }
}

export default withRouter(WhiteboardBottomLeft);
