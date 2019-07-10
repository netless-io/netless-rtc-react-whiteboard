import * as React from "react";
import mute_gray from "./icons/mute_gray.svg";
import mute_white from "./icons/mute_white.svg";
import video_active from "./icons/video_active.svg";
import video_white from "./icons/video_white.svg";
import video_gray from "./icons/video_gray.svg";
import {HtmlElementRefContainer} from "./HtmlElementRefContainer";
import {Stream} from "agora-rtc-sdk";
import "./FloatBoxController.less";

export type FloatBoxControllerProps = {
    localStream: Stream;
    ignoreEventRefs: HtmlElementRefContainer;
    isAudioOpen: boolean;
    isVideoOpen: boolean;
    stopRtc: () => void;
    setVideoState: (isVideoOpen: boolean) => void;
    setAudioState: (isAudioOpen: boolean) => void;
};

export default class FloatBoxController extends React.Component<FloatBoxControllerProps, {}> {
    public constructor(props: FloatBoxControllerProps) {
        super(props);
    }

    public componentDidMount(): void {
        const isAudioOpen = this.props.localStream.hasAudio();
        const isVideoOpen = this.props.localStream.hasVideo();
        this.setState({isAudioOpen: isAudioOpen, isVideoOpen: isVideoOpen});

    }

    public render(): React.ReactNode {
        return (
            <div className="rtc-float-icon-bar-right">
                <div className="rtc-float-manger-box-empty"/>
                <div
                    onClick={() => {
                        if (this.props.isAudioOpen) {
                            this.props.localStream.disableAudio();
                            this.props.setAudioState(false);
                        } else {
                            this.props.localStream.enableAudio();
                            this.props.setAudioState(true);
                        }
                    }}
                    style={{backgroundColor: !this.props.isAudioOpen ? "black" : "white"}}
                    className="rtc-float-manger-box">
                    <img onDragStart={event => event.preventDefault()}
                         src={this.props.isAudioOpen ? mute_gray : mute_white}/>
                </div>
                <div
                    onClick={() => {
                        if (this.props.isVideoOpen) {
                            this.props.localStream.disableVideo();
                            this.props.setVideoState(false);
                        } else {
                            this.props.localStream.enableVideo();
                            this.props.setVideoState(true);
                        }
                    }}
                    style={{backgroundColor: this.props.isVideoOpen ? "black" : "white"}}
                    className="rtc-float-manger-box">
                    <img onDragStart={event => event.preventDefault()}
                         src={this.props.isVideoOpen ? video_white : video_gray}/>
                </div>
                <div
                    onClick={() => this.props.stopRtc()}
                    ref={() => this.props.ignoreEventRefs.refCallback("stop-rtc")}
                    className="rtc-float-manger-box">
                    <img onDragStart={event => event.preventDefault()} src={video_active}/>
                </div>
            </div>
        );
    }
}
