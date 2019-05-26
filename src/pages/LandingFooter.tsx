import * as React from "react";
import "./LandingFooter.less";
import netless_black from "../assets/image/netless_black.svg";
import SwitchLanguages from "./SwitchLanguages";
import {FormattedMessage} from "react-intl";

export default class LandingFooter extends React.Component<{}, {}> {

    public constructor(props: {}) {
        super(props);
        this.state = {};
    }


    public render(): React.ReactNode {
        return (
            <div className="footer-box">
                <div className="footer-mid-box-up">
                    <div className="footer-cell">
                        <div className="footer-logo">
                            <img style={{width: 80}} src={netless_black}/>
                        </div>
                        <div className="footer-copyright">
                            <FormattedMessage
                                id="global.slogan"
                            />
                        </div>
                    </div>
                    <div className="footer-cell">
                        <div className="footer-title">
                            <FormattedMessage
                                id="footer.product-title"
                            />
                        </div>
                        <div className="footer-inner">
                            <div className="footer-inner-link">
                                <a target="_blank" href="https://www.herewhite.com/">
                                    <FormattedMessage
                                        id="footer.loading-page"
                                    />
                                </a>
                            </div>
                            <div className="footer-inner-link">
                                <a target="_blank" href="https://www.herewhite.com/downloads/">
                                    <FormattedMessage
                                        id="footer.product-download"
                                    />
                                </a>
                            </div>
                            <div className="footer-inner-link">
                                <a target="_blank" href="https://console.herewhite.com/">
                                    <FormattedMessage
                                        id="footer.console"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-cell">
                        <div className="footer-title">
                            <FormattedMessage
                                id="footer.company-title"
                            />
                        </div>
                        <div className="footer-inner">
                            <div className="footer-inner-link">
                                <a target="view_window" href="https://www.herewhite.com/about/">
                                    <FormattedMessage
                                        id="footer.company-about"
                                    />
                                </a>
                            </div>
                            <div className="footer-inner-link">
                                <a href="mailto:hr@herewhite.com">
                                    <FormattedMessage
                                        id="footer.company-join"
                                    />
                                </a>
                            </div>
                            <div className="footer-inner-link">
                                <a target="view_window" href="https://www.herewhite.com/service/">
                                    <FormattedMessage
                                        id="footer.company-service"
                                    />
                                </a>
                            </div>
                            <div className="footer-inner-link">
                                <a target="view_window" href="https://www.herewhite.com/privacy/">
                                    <FormattedMessage
                                        id="footer.company-privacy"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-cell">
                        <div className="footer-title">
                            <FormattedMessage
                                id="footer.connect-us"
                            />
                        </div>
                        <div className="footer-inner">
                            <div className="footer-inner-link">
                                <a href="mailto:support@herewhite.com">
                                    <FormattedMessage
                                        id="footer.email"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-mid-box-down">
                    <div className="footer-cut-line"/>
                    <div className="footer-mid-box-inner">
                        <div className="footer-mid-box-inner-left">
                            <span>© 2018 White</span>
                            <span style={{marginLeft: 24, fontSize: 12}}>沪 ICP 备 17052259 号 - 1</span>
                        </div>
                        <div className="footer-mid-box-inner-right">
                            <div className="footer-mid-box-inner-right-Language">语言</div>
                            <SwitchLanguages/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

