import * as React from "react";
import * as uuidv4 from "uuid/v4";
import {Input, Button} from "antd";
import "./PageNameInput.less";
import {withRouter} from "react-router-dom";
import {RouteComponentProps} from "react-router";
import netless_black from "../assets/image/netless_black.svg";
import {Link} from "@netless/i18n-react-router";
import {netlessWhiteboardApi} from "../apiMiddleware";


export type PageNameInputProps = RouteComponentProps<{}>;
export type PageNameInputStates = {
    name: string;
};

class PageNameInput extends React.Component<PageNameInputProps, PageNameInputStates> {
    public constructor(props: PageNameInputProps) {
        super(props);
        this.state = {
            name: "",
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

    public render(): React.ReactNode {
        return (
            <div className="page-input-box">
                <Link to="/">
                    <img src={netless_black}/>
                </Link>
                <div className="page-input-left-box">
                    <div className="page-input-left-mid-box">
                        <div className="name-title">输入临时用户名字<br/>可以方便您在互动的时候区别身份</div>
                        <Input onChange={e => this.setState({name: e.target.value})} size={"large"} placeholder={"输入用户名"}/>
                        <Button
                            size="large"
                            type="primary"
                            onClick={this.handleClickBtn}
                            className="name-button">
                            确认
                        </Button>
                    </div>
                </div>
                <div className="page-input-right-box"/>
            </div>);
    }
}

export default withRouter(PageNameInput);
