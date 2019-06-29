import * as React from "react";
import "./WhiteboardRecord.less";
import {message} from "antd";
import {isMobile} from "react-device-detect";
import {netlessWhiteboardApi} from "../../apiMiddleware";

export type WhiteboardRecordState = {
    isRecord: boolean,
};
export type WhiteboardRecordProps = {
    setStartTime: (time: number) => void;
    setStopTime: (time: number) => void;
};

class WhiteboardRecord extends React.Component<WhiteboardRecordProps, WhiteboardRecordState> {

    public constructor(props: WhiteboardRecordProps) {
        super(props);
        this.state = {
            isRecord: false,
        };
    }

    public startRec = (): void => {
        if (this.state.isRecord) {
            message.info("结束录制");
            const time =  new Date();
            this.props.setStopTime(time.getTime());
            this.setState({isRecord: false});
        } else {
            message.success("开始录制");
            const time =  new Date();
            this.props.setStartTime(time.getTime());
            this.setState({isRecord: true });
        }
    }
    public render(): React.ReactNode {
        if (isMobile) {
            return (
                <div onClick={this.startRec} className="record-box-mb">
                    {this.state.isRecord ?
                        <div className="record-box-inner-rect-mb"/> :
                        <div className="record-box-inner-mb"/>
                    }
                </div>
            );
        } else {
            return (
                <div onClick={this.startRec} className="record-box">
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

