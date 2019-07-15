import * as React from "react";
import "./RtcBlock.less";
import {SlidingBlockProps, SlidingBlockState} from "./slidingBlock";
import rtc_media from "./icons/rtc_media.svg";
import {HtmlElementRefContainer} from "./HtmlElementRefContainer";
import {RtcBlockContextConsumer} from "./RtcBlockContext";
import FloatBoxExtend from "./FloatBoxExtend";
import "./RtcBlock.less";


export type RtcBlockState = {
    isFloatingDragged: boolean;
    animationReverse: boolean;
};

export type RtcBlockProps = SlidingBlockProps & {
    ignoreEventRefs: HtmlElementRefContainer;
};


export default class RtcBlock extends React.Component<RtcBlockProps, RtcBlockState> {
    public constructor(props: RtcBlockProps) {
        super(props);
        this.state = {
            isFloatingDragged: false,
            animationReverse: false,
        };
        this.getBlockRadius = this.getBlockRadius.bind(this);
        this.getBlockBoxShadow = this.getBlockBoxShadow.bind(this);
    }
    private getBlockRadius(blockState: SlidingBlockState): number {
        switch (blockState) {
            case SlidingBlockState.Hiding:
                return 4;
            case SlidingBlockState.Floating:
                return 44;
            case SlidingBlockState.Extending:
                return 4;
        }
    }

    private getBlockBoxShadow(blockState: SlidingBlockState): number {
        switch (blockState) {
            case SlidingBlockState.Hiding:
                return 0.16;
            case SlidingBlockState.Floating:
                return 0.16;
            case SlidingBlockState.Extending:
                return 0.16;
        }
    }

    public render(): React.ReactNode {
        let style: React.CSSProperties | undefined = undefined;
        if (this.props.state !== SlidingBlockState.Extending) {
            style = {display: "none"};
        }
        return <RtcBlockContextConsumer children={context => (
            <div
                className="rtc-block-box"
                style={{
                    width: this.props.width,
                    height: this.props.height,
                    borderRadius: (1 - this.props.schedule) * this.getBlockRadius(this.props.state) + this.props.schedule * this.getBlockRadius(this.props.targetState),
                }}>
                {this.props.state === SlidingBlockState.Hiding && this.renderHiding()}
                {this.props.state === SlidingBlockState.Floating && this.renderFloating()}
                <div
                    className="rtc-extending-wrapper"
                    style={style}>
                    <FloatBoxExtend
                        joinRoomTime={context.joinRoomTime}
                        blockState={this.props.state}
                        remoteMediaStreams={context.remoteMediaStreams}
                        remoteMediaStreamsStates={context.remoteMediaStreamsStates}
                        userId={context.userId}
                        roomMembers={context.roomMembers}
                        localStream={context.localStream}
                        setSliderFloating={context.setSliderFloating}
                        stopRtc={context.stopRtc}
                        height={this.props.height}
                        ignoreEventRefs={this.props.ignoreEventRefs}/>
                </div>
            </div>
        )}/>;
    }

    private renderHiding(): React.ReactNode {
        return (
            <div className="rtc-float-btn">
                <img src={rtc_media}/>
            </div>
        );
    }

    private renderFloating(): React.ReactNode {
        return (
            <div className="rtc-float-box-preview">
                <div className="rtc-float-media-icon">
                    <img onDragStart={event => event.preventDefault()} src={rtc_media}/>
                </div>
                <div className="rtc-float-box-preview-inf">calling</div>
            </div>
        );
    }

}
