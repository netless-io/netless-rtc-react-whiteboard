import * as React from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

enum PreloadEnum {
    auto = "auto",
    none = "none",
    metadata = "metadata",
}

export type VideoPlaceholderProps = {
    poster?: string;
    controls?: boolean;
    autoplay?: boolean;
    preload?: PreloadEnum,
    width?: number;
    height?: number,
    hideControls?: string[],
    bigPlayButton?: boolean,
    bigPlayButtonCentered?: boolean,
    playbackRates?: number[],
    hidePlaybackRates?: boolean,
    className?: string,
};

const Controls = {
    "play": "playToggle",
    "volume": "volumePanel",
    "seekbar": "progressControl",
    "timer": "remainingTimeDisplay",
    "playbackrates": "playbackRateMenuButton",
    "fullscreen": "fullscreenToggle",
};

export default class VideoPlaceholder extends React.Component<VideoPlaceholderProps, {}> {
    private playerRef: any;
    public player: videojs.Player;

    public static defaultProps: Partial<VideoPlaceholderProps> = {
        controls: true,
        autoplay: false,
        preload: PreloadEnum.auto,
        playbackRates: [0.5, 1, 1.5, 2],
        hidePlaybackRates: false,
        className: "",
        hideControls: [] as string[],
    };

    public constructor(props: VideoPlaceholderProps) {
        super(props);
    }
    public componentDidMount(): void {
        this.initPlayer(this.props);
    }

    public componentWillReceiveProps(nextProps: VideoPlaceholderProps): void {
        this.setControlsVisibility(nextProps);
    }

    public componentWillUnmount(): void {
        if (this.player) {
            this.player.dispose();
        }
    }

    public initPlayer(props: VideoPlaceholderProps): void {
        const {poster} = props;
        const playerOptions = this.generatePlayerOptions(props);
        this.player = videojs(this.playerRef, playerOptions);

        if (poster) {
            this.player.poster(poster);
        }
        this.setControlsVisibility(props);
    }

    public generatePlayerOptions(props: VideoPlaceholderProps): videojs.PlayerOptions {
        const {
            controls,
            autoplay,
            preload,
            width,
            height,
            hidePlaybackRates,
            hideControls,
            playbackRates} = props;
        const playerOptions: videojs.PlayerOptions = {};
        playerOptions.controls = controls;
        playerOptions.autoplay = autoplay;
        playerOptions.preload = preload;
        playerOptions.width = width;
        playerOptions.height = height;
        const HidePlaybackRates = hidePlaybackRates || (hideControls && hideControls.includes("playbackrates"));
        if (!HidePlaybackRates) { playerOptions.playbackRates = playbackRates; }
        return playerOptions;
    }

    public setControlsVisibility(props: VideoPlaceholderProps): void {
        const {hideControls} = props;
        Object.keys(Controls).map(data => { this.player.controlBar[Controls[data]].show(); });
        if (hideControls) {
            hideControls.map(x => { this.player.controlBar[Controls[x]].hide(); });
        }
    }

    public render(): React.ReactNode {
        return (
            <video
            // sdk 初始化回放时，会先查询是否存在 white-sdk-video-js 的 videojs player。如果有，则更新 src；如果只存在 id 为 white-sdk-video-js 的 HTML div，则会在该div 上初始化 videojs 的 player；如果都不存在，会自己在新建一个不显示的 div 。
                id="white-sdk-video-js"
                ref={ref => this.playerRef = ref}
                className={`video-js ${this.props.bigPlayButtonCentered ? "vjs-big-play-centered" : ""} ${this.props.className}`}/>
        );
    }
}
