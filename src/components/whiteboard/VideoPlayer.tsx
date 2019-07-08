import * as React from "react";
import videojs from "video.js";
// @ts-ignore: Unreachable code error
// window.videojs = videojs;
import "video.js/dist/video-js.css";

enum PreloadEnum {
    auto = "auto",
    none = "none",
    metadata = "metadata",
}

export type VideoPlayerProps = {
    src: string;
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
    onReady?: (player: videojs.Player) => void,
    onPlay?: (currentTime: number) => void,
    onPause?: (currentTime: number) => void,
    onTimeUpdate?: (currentTime: number) => void,
    onSeeking?: (currentTime: number) => void,
    onSeeked?: (position: number, completeTime: number) => void,
    onEnd?: () => void,
};

const Controls = {
    "play": "playToggle",
    "volume": "volumePanel",
    "seekbar": "progressControl",
    "timer": "remainingTimeDisplay",
    "playbackrates": "playbackRateMenuButton",
    "fullscreen": "fullscreenToggle",
};

export default class VideoPlayer extends React.Component<VideoPlayerProps, {}> {
    private playerRef: any;
    public player: videojs.Player;

    public static defaultProps: Partial<VideoPlayerProps> = {
        controls: true,
        autoplay: false,
        preload: PreloadEnum.auto,
        playbackRates: [0.5, 1, 1.5, 2],
        hidePlaybackRates: false,
        className: "",
        hideControls: [],
        bigPlayButton: true,
        bigPlayButtonCentered: true,
    };

    public constructor(props: VideoPlayerProps) {
        super(props);
    }
    public componentDidMount(): void {
        this.initPlayer(this.props);
        this.initPlayerEvents();
    }

    public componentWillReceiveProps(nextProps: VideoPlayerProps): void {
        this.setControlsVisibility(nextProps);
        if (this.props.src !== nextProps.src) {
            this.initPlayer(nextProps);
        }
    }

    public componentWillUnmount(): void {
        if (this.player) {
            this.player.dispose();
        }
    }

    public initPlayer(props: VideoPlayerProps): void {
        const {src, poster} = props;
        const playerOptions = this.generatePlayerOptions(props);
        this.player = videojs(this.playerRef, playerOptions);
        this.player.src(src);
        if (poster) {
            this.player.poster(poster);
        }
        this.setControlsVisibility(props);
    }

    public generatePlayerOptions(props: VideoPlayerProps): any {
        const {
            controls,
            autoplay,
            preload,
            width,
            height,
            bigPlayButton,
            hidePlaybackRates,
            hideControls,
            playbackRates} = props;
        const playerOptions: any = {};
        playerOptions.controls = controls;
        playerOptions.autoplay = autoplay;
        playerOptions.preload = preload;
        playerOptions.width = width;
        playerOptions.height = height;
        playerOptions.bigPlayButton = bigPlayButton;
        const HidePlaybackRates = hidePlaybackRates || (hideControls && hideControls.includes("playbackrates"));
        if (!HidePlaybackRates) { playerOptions.playbackRates = playbackRates; }
        return playerOptions;
    }

    public setControlsVisibility(props: VideoPlayerProps): void {
        const {hideControls} = props;
        Object.keys(Controls).map(data => { this.player.controlBar[Controls[data]].show(); });
        if (hideControls) {
            hideControls.map(x => { this.player.controlBar[Controls[x]].hide(); });
        }
    }

    public initPlayerEvents(): void {
        const {onReady, onPlay, onPause, onTimeUpdate, onEnd, onSeeked, onSeeking} = this.props;
        let currentTime = 0;
        let previousTime = 0;
        let position = 0;

        this.player.ready(() => {
            if (onReady) {
                onReady(this.player);
                // @ts-ignore: Unreachable code error
                window.videojs = videojs;
            }
        });
        this.player.on("play", () => {
            if (onPlay) {
                onPlay(this.player.currentTime());
            }
        });
        this.player.on("pause", () => {
            if (onPause) {
                onPause(this.player.currentTime());
            }
        });
        this.player.on("timeupdate", e => {
            if (onTimeUpdate) {
                onTimeUpdate(this.player.currentTime());
            }
            previousTime = currentTime;
            currentTime = this.player.currentTime();
            if (previousTime < currentTime) {
                position = previousTime;
                previousTime = currentTime;
            }
        });
        this.player.on("seeking", () => {
            this.player.off("timeupdate", () => { });
            this.player.one("seeked", () => { });
            if (onSeeking) {
                onSeeking(this.player.currentTime());
            }
        });

        this.player.on("seeked", () => {
            const completeTime = Math.floor(this.player.currentTime());
            if (onSeeked) {
                onSeeked(position, completeTime);
            }
        });
        this.player.on("ended", () => {
            if (onEnd) {
                onEnd();
            }
        });
    }

    public render(): React.ReactNode {
        return (
            <video
                ref={ref => this.playerRef = ref}
                className={`video-js ${this.props.bigPlayButtonCentered ? "vjs-big-play-centered" : ""} ${this.props.className}`}/>
        );
    }
}
