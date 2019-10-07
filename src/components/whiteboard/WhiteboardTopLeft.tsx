import * as React from "react";
import "./WhiteboardTopLeft.less";
import * as homeIcon from "../../assets/image/home.svg";
import {RouteComponentProps} from "react-router";
import {withRouter} from "react-router-dom";
import {Button, message, Modal} from "antd";
import {push} from "@netless/i18n-react-router";
import {Room} from "white-react-sdk";
import {netlessWhiteboardApi} from "../../apiMiddleware";
import {isMobile} from "react-device-detect";

export type WhiteboardTopLeftState = {
    isMouseOn: boolean;
    isVisible: boolean;
};


export type WhiteboardTopLeftProps = RouteComponentProps<{}> & {room: Room};


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
            <div>
                <div onClick={this.handleGoBackHome}
                     className={isMobile ? "whiteboard-box-top-left-mb" : "whiteboard-box-top-left"}>
                    <img src={homeIcon}/>
                </div>
                <Modal
                    title="回到首页"
                    visible={this.state.isVisible}
                    footer={null}
                    onCancel={() => this.setState({isVisible: false})}
                >
                    <div className="go-back-title">
                        你确定要离开房间么？
                    </div>
                    <div className="go-back-script">
                        如果你离开房间，房间的信息将会清除！
                    </div>
                    <div className="go-back-btn-box">
                        <Button
                            size="large"
                            style={{width: 108}}
                            type="primary" onClick={() => this.setState({isVisible: false})}>继续</Button>
                        <Button
                            size="large"
                            style={{width: 108}}
                            onClick={this.disconnect}>离开</Button>
                    </div>
                </Modal>
            </div>
        );
    }
}


export default withRouter(WhiteboardTopLeft);
