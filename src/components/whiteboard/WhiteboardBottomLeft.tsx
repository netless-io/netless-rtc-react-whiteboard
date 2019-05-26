import * as React from "react";
import {Room, RoomState} from "white-react-sdk";
import "./WhiteboardBottomLeft.less";
import ScaleController from "@netless/react-scale-controller";
import * as player from "../../assets/image/player.svg";
import * as like_icon from "../../assets/image/like_icon.svg";
import {Tooltip} from "antd";
import {withRouter} from "react-router-dom";
import {RouteComponentProps} from "react-router";
import {InjectedIntlProps, injectIntl} from "react-intl";
import {push} from "@netless/i18n-react-router";

export type WhiteboardBottomLeftInnerProps = {
    room: Room;
    roomState: RoomState;
    uuid: string;
    userId: string;
};

export type WhiteboardBottomLeftProps = RouteComponentProps<{}> & WhiteboardBottomLeftInnerProps & InjectedIntlProps;

class WhiteboardBottomLeft extends React.Component<WhiteboardBottomLeftProps, {}> {

    private zoomChange = (scale: number): void => {
        const {room} = this.props;
        room.zoomChange(scale);
    }

    public render(): React.ReactNode {
        const {roomState} = this.props;
        return (
            <div className="whiteboard-box-bottom-left">
                <ScaleController zoomScale={roomState.zoomScale} zoomChange={this.zoomChange}/>
                <Tooltip placement="top" title={this.props.intl.formatMessage({id: "playback"})}>
                    <div
                        onClick={async () => {
                            await this.props.room.disconnect();
                            push(this.props.history, `/replay/${this.props.uuid}/${this.props.userId}/`);
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

export default withRouter(injectIntl(WhiteboardBottomLeft));
