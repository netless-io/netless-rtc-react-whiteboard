import * as React from "react";
import "./PageError.less";
import * as room_not_find from "../assets/image/room_not_find.svg";
import {withRouter} from "react-router-dom";
import {RouteComponentProps} from "react-router";

class PageError extends React.Component<RouteComponentProps<{}>, {}> {
    public constructor(props: RouteComponentProps<{}>) {
        super(props);
    }
    public render(): React.ReactNode {
        return (
            <div className="page404-box">
                <div className="page404-image-box">
                    <img className="page404-image-inner" src={room_not_find}/>
                    <div className="page404-inner">
                        您访问的页面不存在
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(PageError);
