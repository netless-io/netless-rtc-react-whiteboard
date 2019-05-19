import * as React from "react";
import "./MenuHotKey.less";
import close from "../../assets/image/close.svg";
import * as selector from "../../assets/image/hotkey/selector.svg";
import * as pencil from "../../assets/image/hotkey/pencil.svg";
import * as text from "../../assets/image/hotkey/text.svg";
import * as eraser from "../../assets/image/hotkey/eraser.svg";
import * as ellipse from "../../assets/image/hotkey/ellipse.svg";
import * as rectangle from "../../assets/image/hotkey/rectangle.svg";
import * as up_cursor from "../../assets/image/up_cursor.svg";
import * as down_cursor from "../../assets/image/down_cursor.svg";
import * as hand from "../../assets/image/hotkey/hand.svg";
import {InjectedIntlProps, injectIntl} from "react-intl";

type toolsInnerType = {
    icon: string,
    toolName: string,
    hotKey: string,
};

type toolsOtherHotKeyType = {
    type: string,
    inner: any,
};

type toolsOtherType = {
    actionName: string,
    needPlusIcon: boolean,
    hotKey: [toolsOtherHotKeyType],
};

export type MenuHotKeyProps = {
    handleHotKeyMenuState: () => void;
} & InjectedIntlProps;

class MenuHotKey extends React.Component<MenuHotKeyProps, {}> {

    public constructor(props: MenuHotKeyProps) {
        super(props);
        this.state = {};
        this.renderPlusIcon = this.renderPlusIcon.bind(this);
    }

    private renderPlusIcon(isLast: boolean, needPlusIcon: boolean): React.ReactNode {
        if (needPlusIcon && !isLast) {
            return <div className="menu-other-hot-box-plus">+</div>;
        } else {
            return null;
        }
    }

    public render(): React.ReactNode {
        const MenuHotKeyDoc = {
            tools: {
                name: this.props.intl.formatMessage({id: "tool"}),
                inner: [
                    {
                        icon: selector,
                        toolName: this.props.intl.formatMessage({id: "selector"}),
                        hotKey: "V",
                    },
                    {
                        icon: pencil,
                        toolName: this.props.intl.formatMessage({id: "pencil"}),
                        hotKey: "P",
                    },
                    {
                        icon: text,
                        toolName: this.props.intl.formatMessage({id: "text"}),
                        hotKey: "T",
                    },
                    {
                        icon: eraser,
                        toolName: this.props.intl.formatMessage({id: "eraser"}),
                        hotKey: "E",
                    },
                    {
                        icon: ellipse,
                        toolName: this.props.intl.formatMessage({id: "ellipse"}),
                        hotKey: "O",
                    },
                    {
                        icon: rectangle,
                        toolName: this.props.intl.formatMessage({id: "rectangle"}),
                        hotKey: "R",
                    },
                ],
            },
            others: {
                name: this.props.intl.formatMessage({id: "other"}),
                inner: [
                    // {
                    //     actionName: "撤销",
                    //     needPlusIcon: true,
                    //     hotKey: [
                    //         {
                    //             type: "img",
                    //             inner: command,
                    //         },
                    //         {
                    //             type: "font",
                    //             inner: "Z",
                    //         },
                    //     ],
                    // },
                    // {
                    //     actionName: "重做",
                    //     needPlusIcon: true,
                    //     hotKey: [
                    //         {
                    //             type: "img",
                    //             inner: command,
                    //         },
                    //         {
                    //             type: "font",
                    //             inner: "Shift",
                    //         },
                    //         {
                    //             type: "font",
                    //             inner: "Z",
                    //         },
                    //     ],
                    // },
                    {
                        actionName: this.props.intl.formatMessage({id: "switch-page"}),
                        needPlusIcon: false,
                        hotKey: [
                            {
                                type: "img",
                                inner: up_cursor,
                            },
                            {
                                type: "img",
                                inner: down_cursor,
                            },
                            // {
                            //     type: "img",
                            //     inner: left_cursor,
                            // },
                            // {
                            //     type: "img",
                            //     inner: right_cursor,
                            // },
                        ],
                    },
                    {
                        actionName: this.props.intl.formatMessage({id: "move-canvas"}),
                        needPlusIcon: true,
                        hotKey: [
                            {
                                type: "font",
                                inner: this.props.intl.formatMessage({id: "space-key"}),
                            },
                            {
                                type: "mixing",
                                inner: {
                                    img: hand,
                                    text: this.props.intl.formatMessage({id: "drag"}),
                                },
                            },
                        ],
                    },
                    {
                        actionName: this.props.intl.formatMessage({id: "scale-big"}),
                        needPlusIcon: true,
                        hotKey: [
                            {
                                type: "font",
                                inner: "Ctrl",
                            },
                            {
                                type: "font",
                                inner: "+",
                            },
                        ],
                    },
                    {
                        actionName: this.props.intl.formatMessage({id: "scale-small"}),
                        needPlusIcon: true,
                        hotKey: [
                            {
                                type: "font",
                                inner: "Ctrl",
                            },
                            {
                                type: "font",
                                inner: "-",
                            },
                        ],
                    },
                ],
            },
        };


        const WindowsMenuHotKeyDoc = {
            tools: {
                name: this.props.intl.formatMessage({id: "tool"}),
                inner: [
                    {
                        icon: selector,
                        toolName: this.props.intl.formatMessage({id: "selector"}),
                        hotKey: "V",
                    },
                    {
                        icon: pencil,
                        toolName: this.props.intl.formatMessage({id: "pencil"}),
                        hotKey: "P",
                    },
                    {
                        icon: text,
                        toolName: this.props.intl.formatMessage({id: "text"}),
                        hotKey: "T",
                    },
                    {
                        icon: eraser,
                        toolName: this.props.intl.formatMessage({id: "eraser"}),
                        hotKey: "E",
                    },
                    {
                        icon: ellipse,
                        toolName: this.props.intl.formatMessage({id: "ellipse"}),
                        hotKey: "O",
                    },
                    {
                        icon: rectangle,
                        toolName: this.props.intl.formatMessage({id: "rectangle"}),
                        hotKey: "R",
                    },
                ],
            },
            others: {
                name: this.props.intl.formatMessage({id: "other"}),
                inner: [
                    // {
                    //     actionName: "撤销",
                    //     needPlusIcon: true,
                    //     hotKey: [
                    //         {
                    //             type: "img",
                    //             inner: command,
                    //         },
                    //         {
                    //             type: "font",
                    //             inner: "Z",
                    //         },
                    //     ],
                    // },
                    // {
                    //     actionName: "重做",
                    //     needPlusIcon: true,
                    //     hotKey: [
                    //         {
                    //             type: "img",
                    //             inner: command,
                    //         },
                    //         {
                    //             type: "font",
                    //             inner: "Shift",
                    //         },
                    //         {
                    //             type: "font",
                    //             inner: "Z",
                    //         },
                    //     ],
                    // },
                    {
                        actionName: this.props.intl.formatMessage({id: "switch-page"}),
                        needPlusIcon: false,
                        hotKey: [
                            {
                                type: "img",
                                inner: up_cursor,
                            },
                            {
                                type: "img",
                                inner: down_cursor,
                            },
                            // {
                            //     type: "img",
                            //     inner: left_cursor,
                            // },
                            // {
                            //     type: "img",
                            //     inner: right_cursor,
                            // },
                        ],
                    },
                    {
                        actionName: this.props.intl.formatMessage({id: "move-canvas"}),
                        needPlusIcon: true,
                        hotKey: [
                            {
                                type: "font",
                                inner: this.props.intl.formatMessage({id: "space-key"}),
                            },
                            {
                                type: "mixing",
                                inner: {
                                    img: hand,
                                    text: this.props.intl.formatMessage({id: "drag"}),
                                },
                            },
                        ],
                    },
                    {
                        actionName: this.props.intl.formatMessage({id: "scale-big"}),
                        needPlusIcon: true,
                        hotKey: [
                            {
                                type: "font",
                                inner: "Ctrl",
                            },
                            {
                                type: "font",
                                inner: "+",
                            },
                        ],
                    },
                    {
                        actionName: this.props.intl.formatMessage({id: "scale-small"}),
                        needPlusIcon: true,
                        hotKey: [
                            {
                                type: "font",
                                inner: "Ctrl",
                            },
                            {
                                type: "font",
                                inner: "-",
                            },
                        ],
                    },
                ],
            },
        };

        let menuHotKeyDocToolArray;
        let menuHotKeyDocOtherArray;

        menuHotKeyDocToolArray = MenuHotKeyDoc.tools.inner.map((data: toolsInnerType, index: number) => {
            return (
                <div className="menu-tool-box" key={`${index}`}>
                    <div className="menu-tool-box-left">
                        <div className="menu-tool-box-icon-box">
                            <img className="menu-tool-box-icon" src={data.icon}/>
                        </div>
                        <div className="menu-tool-box-name">{data.toolName}</div>
                    </div>
                    <div className="menu-tool-box-right">{data.hotKey}</div>
                </div>
            );
        });
        menuHotKeyDocOtherArray = MenuHotKeyDoc.others.inner.map((data: toolsOtherType, index: number) => {
            const hotKeyArray = data.hotKey.map((subData: toolsOtherHotKeyType, index: number) => {
                const isLast: boolean = (index + 1) === data.hotKey.length;
                const isAlphabet: boolean = subData.inner.length === 1;
                if (subData.type === "img") {
                    return (
                        <div className="menu-other-hot-out-box" key={`${index}`}>
                            <div className="menu-other-hot-box" style={{marginRight: isLast ? 0 : 5}}>
                                <img src={subData.inner}/>
                            </div>
                            {this.renderPlusIcon(isLast, data.needPlusIcon)}
                        </div>
                    );
                } else if (subData.type === "font") {
                    return (
                        <div className="menu-other-hot-out-box" key={`${index}`}>
                            <div className={isAlphabet ? "menu-other-hot-box" : "menu-other-hot-box-word"}
                                 style={{marginRight: isLast ? 0 : 5}}>
                                {subData.inner}
                            </div>
                            {this.renderPlusIcon(isLast, data.needPlusIcon)}
                        </div>
                    );
                } else {
                    return (
                        <div className="menu-other-hot-out-box" key={`${index}`}>
                            <div className={isAlphabet ? "menu-other-hot-box" : "menu-other-hot-box-word"}
                                 style={{marginRight: isLast ? 0 : 5}}>
                                <img className="menu-other-hot-out-box-mix" src={subData.inner.img}/>
                                {subData.inner.text}
                            </div>
                            {this.renderPlusIcon(isLast, data.needPlusIcon)}
                        </div>
                    );
                }
            });
            return (
                <div className="menu-other-box" key={`${index}`}>
                    <div className="menu-other-box-left">{data.actionName}</div>
                    <div className="menu-other-array-box">{hotKeyArray}</div>
                </div>
            );
        });

        return (
            <div className="menu-hot-key-box">
                <div className="menu-title-line">
                    <div className="menu-title-text-box">
                        Hot Key
                    </div>
                    <div className="menu-close-btn" onClick={this.props.handleHotKeyMenuState}>
                        <img className="menu-title-close-icon" src={close}/>
                    </div>
                </div>
                <div style={{height: 42}}/>
                <div className="menu-hot-key-title">{MenuHotKeyDoc.tools.name}</div>
                {menuHotKeyDocToolArray}
                <div className="menu-hot-key-title">{MenuHotKeyDoc.others.name}</div>
                {menuHotKeyDocOtherArray}
                <div style={{width: "100%", height: 24, backgroundColor: "white"}}/>
            </div>
        );
    }
}

export default injectIntl(MenuHotKey);
