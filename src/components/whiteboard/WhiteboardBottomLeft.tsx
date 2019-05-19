import * as React from "react";
import {Room} from "white-react-sdk";
import "./WhiteboardBottomLeft.less";
import ScaleController from "@netless/react-scale-controller";
import * as player from "../../assets/image/player.svg";
import * as like_icon from "../../assets/image/like_icon.svg";
import {Tooltip} from "antd";
import {withRouter} from "react-router-dom";
import {RouteComponentProps} from "react-router";
import {InjectedIntlProps, injectIntl} from "react-intl";
import {push} from "@netless/i18n-react-router";
import {observer} from "mobx-react";
import {applianceStore} from "../../models/ApplianceStore";

export type WhiteboardBottomLeftInnerProps = {
    slice?: string;
    room: Room;
    uuid: string;
    number: string;
};

export type WhiteboardBottomLeftProps = RouteComponentProps<{}> & WhiteboardBottomLeftInnerProps & InjectedIntlProps;

@observer
class WhiteboardBottomLeft extends React.Component<WhiteboardBottomLeftProps, {}> {

    private zoomChange = (scale: number): void => {
        applianceStore.state!.zoomChange(scale);
    }

    public render(): React.ReactNode {
        return (
            <div className="whiteboard-box-bottom-left">
                <ScaleController zoomScale={applianceStore.state!.zoomScale} zoomChange={this.zoomChange}/>
                <Tooltip placement="top" title={this.props.intl.formatMessage({id: "playback"})}>
                    <div
                        onClick={async () => {
                            await this.props.room.disconnect();
                            push(this.props.history, `/replay/${this.props.uuid}/${this.props.number}/`);
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
                {/*<div className="whiteboard-box-bottom-left-cell">*/}
                    {/*<img style={{width: 16}} src={video}/>*/}
                {/*</div>*/}
            </div>
        );
    }
}

export default withRouter(injectIntl(WhiteboardBottomLeft));
