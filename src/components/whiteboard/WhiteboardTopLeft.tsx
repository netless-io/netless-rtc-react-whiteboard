import * as React from "react";
import "./WhiteboardTopLeft.less";
import * as homeIcon from "../../assets/image/home.svg";
import {RouteComponentProps} from "react-router";
import {withRouter} from "react-router-dom";
import {Button, message, Modal, Tooltip} from "antd";
import {InjectedIntlProps, injectIntl} from "react-intl";
import {push} from "@netless/i18n-react-router";
import {Room} from "white-react-sdk";
import {netlessWhiteboardApi} from "../../apiMiddleware";

export type WhiteboardTopLeftState = {
    isMouseOn: boolean;
    isVisible: boolean;
};


export type WhiteboardTopLeftProps = RouteComponentProps<{}> & InjectedIntlProps & {room: Room};


class WhiteboardTopLeft extends React.Component<WhiteboardTopLeftProps, WhiteboardTopLeftState> {

    public constructor(props: WhiteboardTopLeftProps) {
        super(props);
        this.state = {
            isMouseOn: false,
            isVisible: false,
        };
    }
    private handleGoBackHome = (): void =>  {
        this.setState({isVisible: !this.state.isVisible});
    }

    private disconnect = async (): Promise<void> => {
        try {
            await this.props.room.disconnect();
            netlessWhiteboardApi.user.logout();
            push(this.props.history, "/");
        } catch (err) {
            message.error("disconnect fail");
            this.handleGoBackHome();
        }
    }

    public render(): React.ReactNode {

        return (
            <Tooltip placement="bottomRight" title={this.props.intl.formatMessage({id: "goback"})}>
                <div onClick={this.handleGoBackHome} className="whiteboard-box-top-left">
                    <img src={homeIcon}/>
                </div>
                <Modal
                    title="Go Back"
                    visible={this.state.isVisible}
                    footer={null}
                    onCancel={() => this.setState({isVisible: false})}
                >
                    <div className="go-back-title">
                        Are you leaving the room?
                    </div>
                    <div className="go-back-script">
                        If you leave, we will delete all temporary user information.
                    </div>
                    <div className="go-back-btn-box">
                        <Button
                            size="large"
                            style={{width: 108}}
                            type="primary" onClick={() => this.setState({isVisible: false})}>Continue</Button>
                        <Button
                            size="large"
                            style={{width: 108}}
                            onClick={this.disconnect}>Exit</Button>
                    </div>
                </Modal>
            </Tooltip>
        );
    }
}


export default withRouter(injectIntl(WhiteboardTopLeft));
