import * as React from "react";
import "./PageError.less";
import * as page404 from "../assets/image/page404.svg";
import * as room_not_find from "../assets/image/room_not_find.svg";
import {WhiteUIButton} from "../whiteUIKit/WhiteUIButton";
import {withRouter} from "react-router-dom";
import {RouteComponentProps} from "react-router";
import {FormattedMessage} from "react-intl";

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
                        <FormattedMessage
                            id="error-page.title-room-not-exist"
                        />
                    </div>
                    <WhiteUIButton
                        type="primary"
                        size="large"
                        className="page404-btn"
                        onClick={() => this.props.history.goBack()}
                    >
                        <FormattedMessage
                            id="error-page.btn"
                        />
                    </WhiteUIButton>
                </div>
            </div>
        );
    }
}

export default withRouter(PageError);
