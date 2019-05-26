import * as React from "react";
import "./WhiteboardPerspectiveSet.less";
import {message, Switch} from "antd";
import {RoomState, ViewMode, Room} from "white-react-sdk";
import {FormattedMessage, InjectedIntlProps, injectIntl} from "react-intl";
import Identicon from "react-identicons";

export type WhiteboardPerspectiveSetProps = {
    roomState: RoomState;
    room: Room;
} & InjectedIntlProps;

class WhiteboardPerspectiveSet extends React.Component<WhiteboardPerspectiveSetProps, {}> {
    public render(): React.ReactNode {
        const {roomState, room} = this.props;
        const perspectiveState = roomState.broadcastState;
        return (
            <div className="whiteboard-perspective-box">
                <div>
                    <div className="whiteboard-perspective-title">
                        <FormattedMessage
                            id="current-perspective"
                        />
                    </div>
                    <div className="whiteboard-perspective-user-box">
                        <div className="whiteboard-perspective-user-head">
                            <Identicon
                                size={24}
                                string={perspectiveState.broadcasterInformation && perspectiveState.broadcasterInformation.avatar}/>
                        </div>
                        <div className="whiteboard-perspective-user-name">
                            {perspectiveState.broadcasterInformation && perspectiveState.broadcasterInformation.nickName.substring(0, 6)}
                        </div>
                    </div>
                </div>
                <div className="whiteboard-perspective-set-box">
                    <div className="whiteboard-perspective-set-title">
                        <FormattedMessage
                            id="follow-perspective-title"
                        />
                    </div>
                    <Switch
                        checked={perspectiveState.mode === ViewMode.Follower}
                        size="small"
                        onChange={checked => {
                            if (checked) {
                                room.setViewMode(ViewMode.Follower);
                            } else {
                                room.setViewMode(ViewMode.Freedom);
                            }
                        }}/>
                </div>
                <div className="whiteboard-perspective-set-box">
                    <div className="whiteboard-perspective-set-title">
                        <FormattedMessage
                            id="to-be-broadcaster"
                        />
                    </div>
                    <Switch size="small"
                            checked={perspectiveState.mode === ViewMode.Broadcaster}
                            onChange={checked => {
                                if (checked) {
                                    room.setViewMode(ViewMode.Broadcaster);
                                    message.info(this.props.intl.formatMessage({id: "go-to-lecture"}));
                                } else {
                                    room.setViewMode(ViewMode.Freedom);
                                }
                            }}/>
                </div>
            </div>
        );
    }
}

export default injectIntl(WhiteboardPerspectiveSet);
