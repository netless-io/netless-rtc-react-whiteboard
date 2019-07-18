import * as React from "react";
import "./RtcMobile.less";
import Promise = JQuery.Promise;
const AgoraRTC = require("./rtsLib/AgoraRTC-production.js");
const AgoraRTS = require("./rtsLib/AgoraRTS.js");
export type RtcMobileProps = {
    userId: number;
    channelId: string;
    agoraAppId: string;
    isRtcReadOnly: boolean;
};
class RtcMobile extends React.Component<RtcMobileProps, {}> {

    private agoraClient: any;
    public constructor(props: RtcMobileProps) {
        super(props);
    }
    private startRtc = (uid: number, channelId: string): void => {
        if (!this.agoraClient) {
            this.agoraClient = AgoraRTC.createClient({mode: "live", codec: "h264"});
            this.agoraClient.init(this.props.agoraAppId, () => {
                console.log("AgoraRTC client initialized");
            }, (err: any) => {
                console.log("AgoraRTC client init failed", err);
            });
        }
        const localStream = AgoraRTC.createStream({
            streamID: uid,
            audio: true,
            video: true,
            screen: false,
        });
        localStream.init(()  => {
            console.log("getUserMedia successfully");
            this.agoraClient.join(this.props.agoraAppId, channelId, uid, (uid: number) => {
                console.log("User " + uid + " join channel successfully");
            }, (err: any) => {
                console.log(err);
            });
        }, (err: any) => {
            console.log("getUserMedia failed", err);
        });
        this.agoraClient.on("stream-published", () => {
            console.log("Publish local stream successfully");
        });
        this.agoraClient.on("stream-added",  (evt: any) => {
            const stream = evt.stream;
            console.log("New stream added: " + stream.getId());
            this.agoraClient.subscribe(stream);
        });
        this.agoraClient.on("peer-leave", (evt: any) => {
            console.log("remote user left ", uid);
        });
        this.agoraClient.on("stream-subscribed", (evt: any) => {
            const remoteStream = evt.stream;
            remoteStream.player(``);
            console.log("Subscribe remote stream successfully: " + remoteStream.getId());
        });
        this.agoraClient.on("mute-video", (evt: any) => {
            const uid = evt.uid;
        });
        this.agoraClient.on("unmute-video", (evt: any) => {
            const uid = evt.uid;
        });
        this.agoraClient.on("mute-audio", (evt: any) => {
            const uid = evt.uid;
        });
        this.agoraClient.on("unmute-audio", (evt: any) => {
            const uid = evt.uid;
        });
    }

    public componentDidMount(): void {
        this.startRtc(this.props.userId, this.props.channelId);
    }
    public render(): React.ReactNode {
        return (
            <div>
                <div className="rtc-video-box-mb" id="rtc_mobile_local_stream">
                </div>
            </div>
        );
    }
}

export default RtcMobile;
