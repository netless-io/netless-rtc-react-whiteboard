import * as React from "react";
import TweenOne from "rc-tween-one";
import "./RtcMediaBoxCell.less";
import {StreamsStatesType} from "./index";

export type RtcMediaBoxCellInnerState = {
    animationReverse: boolean,
};

export type RtcMediaBoxCellInnerProps = {
    streamBoxId: string,
    remoteStream: any,
    streamsState?: StreamsStatesType,
    remoteStreamIndex?: number,
};

export default class RtcMediaBoxCellPlayerBox extends React.Component<RtcMediaBoxCellInnerProps, RtcMediaBoxCellInnerState> {

    public constructor(props: RtcMediaBoxCellInnerProps) {
        super(props);
        this.state = {
            animationReverse: false,
        };
    }

    public componentDidMount(): void {
        const {remoteStream} = this.props;
        remoteStream.play(this.props.streamBoxId);
    }

    public componentWillUnmount(): void {
        this.setState({
            animationReverse: true,
        });
    }


    public render(): React.ReactNode {
        return (
            <TweenOne
                animation={{scale: 1, duration: 200}}
                reverse={this.state.animationReverse}
                style={{
                    transform: "scale(0)",
                    display: (this.props.streamsState && this.props.streamsState.state.isVideoOpen) ? "flex" : "none",
                }}
                className="rtc-video-box-cell"
                id={this.props.streamBoxId}
            />
        );
    }
}
