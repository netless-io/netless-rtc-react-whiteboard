import * as React from "react";
import "./Iframe.less";

export type IframeStates = {
    modelId: any;
};

class Iframe extends React.Component<{}, IframeStates> {

    public constructor(props: {}) {
        super(props);
        this.state = {
            modelId: "",
        };
    }
    public componentWillMount(): void {
        window.addEventListener("message", this.receiveMessageFromIndex, false);
    }

    private receiveMessageFromIndex = (event: any): void => {
        if (event !== undefined && (typeof event.data === "string") ) {
            console.log( "我是react,我接受到了来自iframe的模型ID：", event.data );
            this.setState({
                modelId: event.data,  // 2.给变量赋值
            });
        }
    }

    private handlePushToIframe = (): void => {
        const childFrameObj = document.getElementById("calculation")! as HTMLIFrameElement;
        childFrameObj.contentWindow!.postMessage(1233, "*");
    }
    public render(): React.ReactNode {
       return (
           <div className="iframe-box">
               {this.state.modelId}
               <iframe id="calculation" src={"http://192.168.2.21:5000"} width={600} height={600}>
               </iframe>
               <div onClick={this.handlePushToIframe}>
                   点我穿数据到 iframe
               </div>
           </div>
       );
    }
}

export default Iframe;
