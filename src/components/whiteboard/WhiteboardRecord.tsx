import * as React from "react";
import "./WhiteboardRecord.less";
import {message} from "antd";
import {isMobile} from "react-device-detect";
import {netlessWhiteboardApi, RecordOperator} from "../../apiMiddleware";
import {ossConfigObj} from "../../appToken";

export type WhiteboardRecordState = {
    isRecord: boolean,
};
export type WhiteboardRecordProps = {
    setStartTime: (time: number) => void;
    setStopTime: (time: number) => void;
    setMediaSource: (source: string) => void;
    channelName: string;
    isMediaRun?: boolean;
};

class WhiteboardRecord extends React.Component<WhiteboardRecordProps, WhiteboardRecordState> {

    private recrod: RecordOperator;

    public constructor(props: WhiteboardRecordProps) {
        super(props);
        this.state = {
            isRecord: false,
        };
    }

    public record = async (): Promise<void> => {
        const {isMediaRun, channelName} = this.props;
        if (this.recrod) {
            if (!this.recrod.resourceId) {
                await this.recrod.acquire();
            }
        } else {
            this.recrod = netlessWhiteboardApi.recordFactory(channelName,
                {
                    audioProfile: 1,
                    transcodingConfig: {
                        width: 240,
                        height: 180,
                        bitrate: 120,
                        fps: 15,
                        // "mixedVideoLayout": 1,
                        // "maxResolutionUid": "1",
                    },
                },
                {
                    vendor: 2,
                    region: 0,
                    bucket: "netless-media",
                    accessKey: ossConfigObj.accessKeyId,
                    secretKey: ossConfigObj.accessKeySecret,
                });
            await this.recrod.acquire();
        }
        if (this.state.isRecord) {
            try {
                if (isMediaRun) {
                    const resp = await this.recrod.query();
                    if (resp.serverResponse.fileList) {
                        const res = await this.recrod.stop();
                        this.props.setMediaSource(res.serverResponse.fileList);
                        message.info("结束录制");
                        const time =  new Date();
                        this.props.setStopTime(time.getTime());
                        this.setState({isRecord: false});
                    } else {
                        message.info("录制时间过短");
                    }
                } else {
                    message.info("结束录制");
                    const time =  new Date();
                    this.props.setStopTime(time.getTime());
                    this.setState({isRecord: false});
                }
            } catch (err) {
                console.log(err);
            }
        } else {
            if (isMediaRun) {
                try {
                    await this.recrod.start();
                    message.success("开始录制");
                    const time =  new Date();
                    this.props.setStartTime(time.getTime());
                    this.setState({isRecord: true });
                } catch (err) {
                    console.log(err);
                    message.error("录制错误");
                }
            } else {
                message.success("开始录制");
                const time =  new Date();
                this.props.setStartTime(time.getTime());
                this.setState({isRecord: true });
            }
        }
    }
    public render(): React.ReactNode {
        if (isMobile) {
            return (
                <div onClick={this.record} className="record-box-mb">
                    {this.state.isRecord ?
                        <div className="record-box-inner-rect-mb"/> :
                        <div className="record-box-inner-mb"/>
                    }
                </div>
            );
        } else {
            return (
                <div onClick={this.record} className="record-box">
                    {this.state.isRecord ?
                        <div className="record-box-inner-rect"/> :
                        <div className="record-box-inner"/>
                    }
                </div>
            );
        }
    }
}

export default WhiteboardRecord;

