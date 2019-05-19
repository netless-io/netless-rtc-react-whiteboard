import * as React from "react";
import {slide as Menu, reveal as MenuLeft} from "react-burger-menu";
import {observer} from "mobx-react";
import {MenuInnerType} from "../../pages/WhiteboardPage";

const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export type MenuBoxStyleState = {
    menuStyles: any,
};

const styles: any = {
    bmMenu: {
        boxShadow: "0 8px 24px 0 rgba(0,0,0,0.15)",
    },
    bmBurgerButton: {
        display: "none",
    },
};

const styles2: any = {
    bmBurgerButton: {
        display: "none",
    },
};


const styles3: any = {
    bmOverlay: {
        background: "rgba(0, 0, 0, 0.0)",
   },
};


export type MenuBoxProps = {
    isVisible: boolean;
    menuInnerState: MenuInnerType;
    pageWrapId: string;
    outerContainerId: string;
    isLeft?: boolean;
    resetMenu: () => void;
};


@observer
export default class MenuBox extends React.Component<MenuBoxProps, MenuBoxStyleState> {

    public constructor(props: MenuBoxProps) {
        super(props);
        this.state = {
            menuStyles: this.props.isVisible ? styles : styles2,
        };
    }

    private async getMenuStyle(): Promise<void> {

        if (this.props.isVisible) {
            this.setState({
                menuStyles: styles,
            });
        } else {
            await timeout(500);
            this.setState({
                menuStyles: styles2,
            });
        }
    }


    public render(): React.ReactNode {
        if (this.props.isLeft) {
            return (
                <MenuLeft
                    pageWrapId="page-wrap"
                    outerContainerId="outer-container"
                    width={360}
                    styles={styles3}
                    isOpen={this.props.isVisible}
                    onStateChange={async menuState => {
                        if (!menuState.isOpen) {
                            await timeout(500);
                            this.props.resetMenu();
                        }
                    }}
                >
                    {this.props.children}
                </MenuLeft>
            );
        } else {
            return (
                <Menu
                    pageWrapId="page-wrap"
                    outerContainerId="outer-container"
                    noOverlay
                    styles={this.state.menuStyles}
                    width={280}
                    right={true}
                    isOpen={this.props.isVisible}
                    onStateChange={async () => {
                        await this.getMenuStyle();
                    }}>
                    {this.props.children}
                </Menu>
            );
        }
    }
}
