import * as React from "react";
import {Button} from "antd";
import "./WhiteUIButton.less";
import {ButtonProps, ButtonSize, ButtonType} from "antd/lib/button/button";


export class WhiteUIButton extends React.Component<ButtonProps, {}> {

    public constructor(props: ButtonProps) {
        super(props);
        this.getBoxClassName = this.getBoxClassName.bind(this);
        this.getButtonHeight = this.getButtonHeight.bind(this);
    }

    private getBoxClassName(whiteUIButtonType: ButtonType | undefined): string {
        switch (whiteUIButtonType) {
            case "primary":
                return "white-button-primary";
            case "danger":
                return "white-button-danger";
            default:
                return "white-button";
        }
    }

    private getButtonHeight(buttonSize: ButtonSize | undefined): number {
        switch (buttonSize) {
            case "small":
                return 24;
            case "large":
                return 48;
            default:
                return 32;
        }
    }

    public render(): React.ReactNode {
        const {size, ...restProps} = this.props;
        if (this.props.type !== "danger") {
            return (
                <div className={this.getBoxClassName(this.props.type)}>
                    <Button
                        style={{
                            height: this.getButtonHeight(this.props.size),
                        }}
                        {...restProps}
                    />
                </div>
            );
        } else {
            return (
                <div className={this.getBoxClassName(this.props.type)}>
                    <Button
                        style={{
                            height: this.getButtonHeight(this.props.size),
                        }}
                        {...restProps}
                    />
                </div>
            );
        }
    }
}
