import * as React from "react";
import {Popover, Upload} from "antd";
import * as OSS from "ali-oss";
import {ToolBoxUpload} from "./ToolBoxUpload";
import {PPTProgressListener, UploadManager} from "./UploadManager";
import "./UploadBtn.less";
import {PptKind, Room, WhiteWebSdk} from "white-react-sdk";
import * as image from "../assets/image/image.svg";
import * as doc_to_image from "../assets/image/doc_to_image.svg";
import * as doc_to_web from "../assets/image/doc_to_web.svg";

export type ToolBoxUploadBoxState = {
    toolBoxColor: string,
};

export const FileUploadStatic: string = "application/pdf, " +
    "application/vnd.openxmlformats-officedocument.presentationml.presentation, " +
    "application/vnd.ms-powerpoint, " +
    "application/msword, " +
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type UploadBtnProps = {
    oss: {
        accessKeyId: string,
        accessKeySecret: string,
        region: string,
        bucket: string,
        folder: string,
        prefix: string,
    },
    room: Room,
    roomToken: string | null,
    whiteboardRef?: HTMLDivElement,
    onProgress?: PPTProgressListener,
};

export default class UploadBtn extends React.Component<UploadBtnProps, ToolBoxUploadBoxState> {
    private readonly client: any;
    public constructor(props: UploadBtnProps) {
        super(props);
        this.state = {
            toolBoxColor: "#A2A7AD",
        };
        this.client = new OSS({
            accessKeyId: this.props.oss.accessKeyId,
            accessKeySecret: this.props.oss.accessKeySecret,
            region: this.props.oss.region,
            bucket: this.props.oss.bucket,
        });
    }

    private uploadStatic = (event: any) => {
        const uploadManager = new UploadManager(this.client, this.props.room);
        const whiteWebSdk = new WhiteWebSdk();
        const pptConverter = whiteWebSdk.pptConverter(this.props.roomToken!);
        uploadManager.convertFile(
            event.file,
            pptConverter,
            PptKind.Static,
            {
                bucket: this.props.oss.bucket,
                folder: this.props.oss.folder,
                prefix: this.props.oss.prefix,
            },
            this.props.onProgress).catch(error => alert("upload file error" + error));
    }

    private uploadDynamic = (event: any) => {
        const uploadManager = new UploadManager(this.client, this.props.room);
        const whiteWebSdk = new WhiteWebSdk();
        const pptConverter = whiteWebSdk.pptConverter(this.props.roomToken!);
        uploadManager.convertFile(
            event.file,
            pptConverter,
            PptKind.Dynamic,
            {
                bucket: this.props.oss.bucket,
                folder: this.props.oss.folder,
                prefix: this.props.oss.prefix,
            },
            this.props.onProgress).catch(error => alert("upload file error" + error));
    }

    private uploadImage = (event: any) => {
        const uploadFileArray: File[] = [];
        uploadFileArray.push(event.file);
        const uploadManager = new UploadManager(this.client, this.props.room);
        if (this.props.whiteboardRef) {
            const {clientWidth, clientHeight} = this.props.whiteboardRef;
            uploadManager.uploadImageFiles(uploadFileArray, clientWidth / 2, clientHeight / 2, this.props.onProgress)
                .catch(error => alert("upload file error" + error));
        } else {
            const clientWidth = window.innerWidth;
            const clientHeight = window.innerHeight;
            uploadManager.uploadImageFiles(uploadFileArray, clientWidth / 2, clientHeight / 2, this.props.onProgress)
                .catch(error => alert("upload file error" + error));
        }
    }

    public render(): React.ReactNode {
        return (
            <Popover content={<div className="popover-box">
                <Upload
                    disabled={!this.props.roomToken}
                    accept={FileUploadStatic}
                    showUploadList={false}
                    customRequest={this.uploadStatic}>
                    <div className="popover-box-cell">
                        <div className="popover-box-cell-img-box">
                            <img src={doc_to_image} style={{height: 28}}/>
                        </div>
                        <div className="popover-box-cell-title">
                            资料转图片
                        </div>
                        <div className="popover-box-cell-script">支持 pdf、ppt、pptx、word</div>
                    </div>
                </Upload>
                <Upload
                    disabled={!this.props.roomToken}
                    accept={"application/vnd.openxmlformats-officedocument.presentationml.presentation"}
                    showUploadList={false}
                    customRequest={this.uploadDynamic}>
                    <div className="popover-box-cell">
                        <div className="popover-box-cell-img-box">
                            <img src={doc_to_web} style={{height: 28}}/>
                        </div>
                        <div className="popover-box-cell-title">
                            资料转网页
                        </div>
                        <div className="popover-box-cell-script">支持 pptx</div>
                    </div>
                </Upload>
                <Upload
                    disabled={!this.props.roomToken}
                    accept={"image/*"}
                    showUploadList={false}
                    customRequest={this.uploadImage}>
                    <div className="popover-box-cell">
                        <div className="popover-box-cell-img-box">
                            <img src={image} style={{height: 28}}/>
                        </div>
                        <div className="popover-box-cell-title">
                            上传图片
                        </div>
                        <div className="popover-box-cell-script">支持常见图片格式</div>
                    </div>
                </Upload>
            </div>}>
                <div
                    onMouseEnter={() => this.setState({toolBoxColor: "#141414"})}
                    onMouseLeave={() => this.setState({toolBoxColor: "#A2A7AD"})}
                    className="tool-box-cell-box">
                    <div className="tool-box-cell">
                        <ToolBoxUpload color={this.state.toolBoxColor}/>
                    </div>
                </div>
            </Popover>
        );
    }
}
