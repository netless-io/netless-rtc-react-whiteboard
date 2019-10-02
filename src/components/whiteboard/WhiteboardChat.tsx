import * as React from "react";
import "./WhiteboardChat.less";
import {
    ThemeProvider,
    MessageGroup,
    Message,
    MessageText,
    MessageList,
    TextComposer,
    Row,
    TextInput,
    SendButton,
} from "@livechat/ui-kit";
import {Room} from "@netless/white-web-sdk";
import {MessageType} from "./WhiteboardBottomRight";
import {netlessWhiteboardApi, UserInfType} from "../../apiMiddleware";
import {isMobile} from "react-device-detect";

const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export type WhiteboardChatProps = {
    room: Room;
    messages: MessageType[];
    userId: string;
    isClassroom?: boolean;
    isReadonly?: boolean;
};

export type WhiteboardChatStates = {
    messages: MessageType[];
    url: string;
};

class WhiteboardChat extends React.Component<WhiteboardChatProps, WhiteboardChatStates> {

    private messagesEnd: HTMLDivElement | null = null;
    private _isMounted: boolean = false;

    public constructor(props: WhiteboardChatProps) {
        super(props);
        this.state = {
            messages: [],
            url: "",
        };
        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    private scrollToBottom(): void {
        if (this.messagesEnd) {
            this.messagesEnd.scrollIntoView({behavior: "smooth"});
        }
    }

    public async componentDidMount(): Promise<void> {
        this._isMounted = true;
        await timeout(0);
        this.scrollToBottom();
        const canvasArray: any = document.getElementsByClassName("identicon").item(0);
        if (canvasArray) {
            const url = canvasArray.toDataURL();
            this.setState({url: url});
        }
    }

    public async componentWillReceiveProps(): Promise<void> {
        if (this._isMounted) {
            await timeout(0);
            this.scrollToBottom();
        }
    }

    public componentWillUnmount(): void {
        this._isMounted = true;
    }

    public render(): React.ReactNode {
        const isClassMobile = this.props.isClassroom && isMobile;
        const messages: MessageType[] = this.props.messages; // 有很多内容
        if (messages.length > 0) {
            let previousName = messages[0].name;
            let previousId = messages[0].id;

            for (let i = 1; i < messages.length; ++ i) {
                const message = messages[i];
                if (previousName === message.name && previousId === message.id) {
                    console.log(messages);
                    messages[i - 1].messageInner.push(...message.messageInner);
                    messages.splice(i, 1);
                    i --;
                }
                previousName = message.name;
                previousId = message.id;
            }
        }
        let messageNodes: React.ReactNode = null;
        if (messages.length > 0) {
            messageNodes = messages.map((data: MessageType, index: number) => {
                const messageTextNode = data.messageInner.map((inner: string, index: number) => {
                    return (
                        <Message key={`${index}`} isOwn={netlessWhiteboardApi.user.getUserInf(UserInfType.uuid, this.props.userId) === data.id} authorName={data.name}>
                            <MessageText>{inner}</MessageText>
                        </Message>
                    );
                });
                return (
                    <MessageGroup
                        key={`${index}`}
                        avatar={data.avatar}
                        isOwn={netlessWhiteboardApi.user.getUserInf(UserInfType.uuid, this.props.userId) === data.id}
                        onlyFirstWithMeta
                    >
                        {messageTextNode}
                    </MessageGroup>
                );
            });
        }
        return (
            <div className={isClassMobile ? "chat-box-mb" : "chat-box"}>
                <ThemeProvider
                    theme={{
                        vars: {
                            "avatar-border-color": "#005BF6",
                        },
                        FixedWrapperMaximized: {
                            css: {
                                boxShadow: "0 0 1em rgba(0, 0, 0, 0.1)",
                            },
                        },
                        Message: {},
                        MessageText: {
                            css: {
                                backgroundColor: "#F8F8F8",
                                borderRadius: 8,
                            },
                        },
                        Avatar: {
                            size: "32px", // special Avatar's property, supported by this component
                            css: { // css object with any CSS properties
                                borderColor: "blue",
                            },
                        },
                        TextComposer: {
                            css: {
                                "color": "#000",
                            },
                        },
                    }}
                >
                    <div>
                        <div className="chat-box-message" style={{height: isClassMobile ? (window.innerHeight - window.innerWidth * 1.2) : "calc(~'100vh - 370px')"}}>
                            {messageNodes !== null ? <MessageList>
                                {messageNodes}
                            </MessageList> : <div className="chat-box-message-empty">暂无聊天记录~</div>}
                            {!isClassMobile &&
                            <div className="under-cell" ref={ref => this.messagesEnd = ref}/>
                            }
                        </div>
                        {!isClassMobile &&
                        <div style={{width: isClassMobile ? "100%" : "360px"}} className={this.props.isReadonly ? "chat-box-input-disable" : "chat-box-input"}>
                            <TextComposer
                                onSend={(event: any) => {
                                    this.props.room.dispatchMagixEvent("message", {
                                        name: netlessWhiteboardApi.user.getUserInf(UserInfType.name, this.props.userId).substring(0, 6),
                                        avatar: this.state.url,
                                        id: netlessWhiteboardApi.user.getUserInf(UserInfType.uuid, this.props.userId),
                                        messageInner: [event],
                                    });
                                }}
                            >
                                <Row align="center">
                                    <TextInput placeholder={this.props.isReadonly ? "禁止输入" : "输入聊天内容~"} fill="true"/>
                                    <SendButton fit />
                                </Row>
                            </TextComposer>
                        </div>
                        }
                    </div>
                </ThemeProvider>
            </div>
        );
    }
}


export default WhiteboardChat;
