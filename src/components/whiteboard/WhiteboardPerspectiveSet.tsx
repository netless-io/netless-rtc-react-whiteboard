import * as React from "react";
import "./WhiteboardPerspectiveSet.less";
import {observer} from "mobx-react";
import {message, Switch} from "antd";
import {applianceStore} from "../../models/ApplianceStore";
import {ViewMode} from "white-react-sdk";
import {FormattedMessage, InjectedIntlProps, injectIntl} from "react-intl";
import Identicon from "react-identicons";
import {userInfDataStore, UserInfType} from "../../models/UserInfDataStore";

@observer
class WhiteboardPerspectiveSet extends React.Component<InjectedIntlProps, {}> {

    public constructor(props: InjectedIntlProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const perspectiveState = applianceStore.state!.broadcastState;
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
                                applianceStore.state!.room.setViewMode(ViewMode.Follower);
                            } else {
                                applianceStore.state!.room.setViewMode(ViewMode.Freedom);
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
                                    applianceStore.state!.room.setViewMode(ViewMode.Broadcaster);
                                    message.info(this.props.intl.formatMessage({id: "go-to-lecture"}));
                                } else {
                                    applianceStore.state!.room.setViewMode(ViewMode.Freedom);
                                }
                            }}/>
                </div>
            </div>
        );
    }
}

export default injectIntl(WhiteboardPerspectiveSet);
