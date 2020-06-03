import * as React from "react";
import {RouteComponentProps} from "react-router";
import AgoraRTC from "agora-rtc-sdk";
import "./WhiteboardPage.less";
import {netlessWhiteboardApi} from "../apiMiddleware";
import WhiteFastSDK from "@netless/white-fast-web-sdk";
import {IdentityType} from "./WhiteboardCreatorPage";
export type WhiteboardPageProps = RouteComponentProps<{
    uuid: string;
    userId: string;
    identityType: IdentityType;
}>;

export type WhiteboardPageState = {
    recordData: RecordDataType | null;
    room: any,
};
export type RecordDataType = {startTime?: number, endTime?: number, mediaUrl?: string};
export default class WhiteboardPage extends React.Component<WhiteboardPageProps, WhiteboardPageState> {
    private netlessRoom: any;
    public constructor(props: WhiteboardPageProps) {
        super(props);
        this.state = {
            recordData: null,
            room: null,
        };
    }

    private getRoomToken = async (uuid: string): Promise<string | null> => {
        const res = await netlessWhiteboardApi.room.joinRoomApi(uuid);
        if (res.code === 200) {
            return res.msg.roomToken;
        } else {
            return null;
        }
    }

    private handleReplayUrl = (): void => {
        const {userId, uuid} = this.props.match.params;
        const {recordData} = this.state;
        if (recordData) {
            if (recordData.startTime) {
                if (recordData.endTime) {
                    if (recordData.mediaUrl) {
                        this.props.history.push(`/replay/${uuid}/${userId}/${recordData.startTime}/${recordData.endTime}/${recordData.mediaUrl}/`);
                    } else {
                        this.props.history.push(`/replay/${uuid}/${userId}/${recordData.startTime}/${recordData.endTime}/`);
                    }
                } else {
                    this.props.history.push(`/replay/${uuid}/${userId}/${recordData.startTime}/`);
                }
            } else {
                this.props.history.push(`/replay/${uuid}/${userId}/`);
            }
        } else {
            this.props.history.push(`/replay/${uuid}/${userId}/`);
        }
    }

    private startJoinRoom = async (): Promise<void> => {
        const {userId, uuid, identityType} = this.props.match.params;
        const roomToken = await this.getRoomToken(uuid);
        if (roomToken) {
            this.netlessRoom = WhiteFastSDK.Room("whiteboard", {
                uuid: uuid,
                roomToken: roomToken,
                userId: userId,
                // userName: "伍双",
                // roomName: "伍双的房间",
                // userAvatarUrl: "https://ohuuyffq2.qnssl.com/netless_icon.png",
                logoUrl: "https://white-sdk.oss-cn-beijing.aliyuncs.com/video/netless_black2.svg",
                loadingSvgUrl: "",
                clickLogoCallback: () => {
                    // this.props.history.push("/");
                },
                recordDataCallback: (data: RecordDataType) => {
                    this.setState({recordData: data});
                },
                replayCallback: () => {
                    this.handleReplayUrl();
                },
                exitRoomCallback: () => {
                    this.props.history.push("/");
                },
                rtc: {
                    type: "agora",
                    rtcObj: AgoraRTC,
                    appId: "7276f931285b4f22a9a6f2961b4ec1e2",
                    recordConfig: {
                        customerId: "b4e2bc22a89549b2a84969b844258fe3",
                        customerCertificate: "594daac9c32b491795f8cbd27a7d5265",
                    },
                },
                identity: identityType,
                language: "Chinese",
                toolBarPosition: "left",
                isManagerOpen: true,
                pagePreviewPosition: "right",
                boardBackgroundColor: "#F2F2F2",
                isReadOnly: false,
                defaultColorArray: [
                    "#E77345",
                    "#005BF6",
                    "#F5AD46",
                    "#68AB5D",
                    "#9E51B6",
                    "#1E2023",
                ],
                documentArray: [
                    {
                        active: false,
                        pptType: "dynamic",
                        id: "1",
                        data: "[{\"name\":\"1\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/1.slide\",\"width\":1280}},{\"name\":\"2\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/2.slide\",\"width\":1280}},{\"name\":\"3\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/3.slide\",\"width\":1280}},{\"name\":\"4\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/4.slide\",\"width\":1280}},{\"name\":\"5\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/5.slide\",\"width\":1280}},{\"name\":\"6\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/6.slide\",\"width\":1280}},{\"name\":\"7\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/7.slide\",\"width\":1280}},{\"name\":\"8\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/8.slide\",\"width\":1280}},{\"name\":\"9\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/9.slide\",\"width\":1280}},{\"name\":\"10\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/10.slide\",\"width\":1280}},{\"name\":\"11\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/11.slide\",\"width\":1280}},{\"name\":\"12\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/12.slide\",\"width\":1280}},{\"name\":\"13\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/13.slide\",\"width\":1280}},{\"name\":\"14\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/14.slide\",\"width\":1280}},{\"name\":\"15\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/15.slide\",\"width\":1280}},{\"name\":\"16\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/16.slide\",\"width\":1280}}]",
                    }],
            });
        }
    }


    public async componentDidMount(): Promise<void> {
        await this.startJoinRoom();
    }

    public componentWillUnmount(): void {
        if (this.netlessRoom) {
            this.netlessRoom.release();
        }
    }

    public render(): React.ReactNode {
        return (
            <div id="whiteboard" className="whiteboard-box">
            </div>
        );
    }
}
