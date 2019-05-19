import * as React from "react";
import {Input} from "antd";
import "./WhiteUIInput.less";
import {InputProps} from "antd/lib/input/Input";

export class WhiteUIInput extends React.Component<InputProps, {}> {

    public constructor(props: InputProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const {size, ...restProps} = this.props;
        return (
            <div className="white-input">
                <Input
                    style={{height: this.props.size === "small" ? 32 : 48}}
                    {...restProps}
                />
            </div>
        );
    }
}

export class WhiteUIInputGray extends React.Component<InputProps, {}> {

    public constructor(props: InputProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <div className="white-input-gray">
                <Input
                    {...this.props}
                />
            </div>
        );
    }
}