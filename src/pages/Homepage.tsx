import * as React from "react";
import * as uuidv4 from "uuid/v4";
import {Input, Button, Tabs} from "antd";
import "./Homepage.less";
import {withRouter} from "react-router-dom";
import {RouteComponentProps} from "react-router";
import netless_black from "../assets/image/netless_black.svg";
import {Link} from "@netless/i18n-react-router";
import {netlessWhiteboardApi} from "../apiMiddleware";
import {FormComponentProps} from "antd/lib/form";

const { TabPane } = Tabs;

export type HomepageProps = RouteComponentProps<{}> & FormComponentProps;
export type HomepageStates = {
    name: string;
    url: string;
};

class Homepage extends React.Component<HomepageProps, HomepageStates> {
    public constructor(props: HomepageProps) {
        super(props);
        this.state = {
            name: "",
            url: "",
        };
    }
    private handleClickBtn = (): void => {
        if (this.state.name) {
            netlessWhiteboardApi.user.updateUserInf(this.state.name, uuidv4(), "1");
        } else {
            netlessWhiteboardApi.user.updateUserInf("Netless user", uuidv4(), "1");
        }
        this.props.history.push("/whiteboard/");
    }

    private getActiveSelectedKey = (url: string): string => {
        let str = url;
        const regex = /([^\/]+)/gm;
        regex.exec(str);
        regex.exec(str);
        regex.exec(str);
        regex.exec(str);
        regex.exec(str);
        const arr2 = regex.exec(str);
        if (arr2 === null) {
            str = "";
        } else {
            str = arr2[0];
        }
        return str;
    }
    private handleClickBtnUrl = (): void => {
        const isUrl = this.state.url.substring(0, 4) === "http";
        if (this.state.url) {
            if (isUrl) {
                const uuid = this.getActiveSelectedKey(this.state.url);
                this.props.history.push(`/whiteboard/${uuid}/`);
            } else {
                if (this.state.url.length === 32) {
                    this.props.history.push(`/whiteboard/${this.state.url}/`);
                }
            }
        }
    }

    public render(): React.ReactNode {
        return (
            <div className="page-input-box">
                <Link to="/">
                    <img src={netless_black}/>
                </Link>
                <div className="page-input-left-box">
                    <div className="page-input-left-mid-box">
                        <Tabs className="page-input-left-mid-box-tab" defaultActiveKey="1">
                            <TabPane tab="创建房间" key="1">
                                <div className="page-input-left-inner-box">
                                    <Input className="page-input" onChange={e => this.setState({name: e.target.value})} size={"large"} placeholder={"输入用户名"}/>
                                    <Button
                                        size="large"
                                        type="primary"
                                        onClick={this.handleClickBtn}
                                        className="name-button">
                                        创建房间
                                    </Button>
                                </div>
                            </TabPane>
                            <TabPane tab="加入房间" key="2">
                                <div className="page-input-left-inner-box">
                                    <Input className="page-input"
                                           onChange={e => this.setState({url: e.target.value})}
                                           size={"large"} placeholder={"输入房间地址或者 UUID"}/>
                                    <Button
                                        size="large"
                                        type="primary"
                                        disabled={!this.state.url}
                                        onClick={this.handleClickBtnUrl}
                                        className="name-button">
                                        加入房间
                                    </Button>
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
                <div className="page-input-right-box"/>
            </div>);
    }
}

export default withRouter(Homepage);
