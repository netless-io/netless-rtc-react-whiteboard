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
            this.recrod = netlessWhiteboardApi.recordFactory(channelName, {/* 可以不传?*/}, {
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
                    const res = await this.recrod.stop();
                    console.log(res);
                    // const source = res
                    this.props.setMediaSource("a8def7183c4286372a6c1c98b9752a05_ed7d10f3cb2b415ba94dd30eab38d187.m3u8");
                    message.info("结束录制");
                    const time =  new Date();
                    this.props.setStopTime(time.getTime());
                    this.setState({isRecord: false});
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
                    console.log("");
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

