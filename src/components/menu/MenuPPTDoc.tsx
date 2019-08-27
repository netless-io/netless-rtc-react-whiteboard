import * as React from "react";
import "./MenuPPTDoc.less";
import PPTDatas, {PPTDataType, PPTType} from "./PPTDatas";
import {Room} from "white-react-sdk";
import close from "../../assets/image/close_white.svg";

export type MenuPPTDocProps = {
    room: Room;
    handleAnnexBoxMenuState?: () => void;
};
export type MenuPPTDocStates = {
    docs: PPTDataType[];
    activeDocData?: PPTDataType;
};

class MenuPPTDoc extends React.Component<MenuPPTDocProps, MenuPPTDocStates> {

    public constructor(props: MenuPPTDocProps) {
        super(props);
        this.state = {
            docs: [],
        };
    }
    public componentDidMount(): void {
        const docs: PPTDataType[] = PPTDatas.map((PPTData: PPTDataType) => {
            const dataObj = JSON.parse(PPTData.data);
            console.log(dataObj);
            if (PPTData.pptType === PPTType.static) {
                const newDataObj = dataObj.map((data: any) => {
                    data.ppt.width = 1200;
                    data.ppt.height = 675;
                    return data;
                });
                return {
                    active: PPTData.active,
                    static_cover: dataObj[0].ppt.src,
                    id: PPTData.id,
                    data: newDataObj,
                    pptType: PPTData.pptType,
                };
            } else {
                const newDataObj = dataObj.map((data: any) => {
                    data.ppt.width = 1200;
                    data.ppt.height = 675;
                    return data;
                });
                return {
                    active: PPTData.active,
                    dynamic_cover: PPTData.dynamic_cover,
                    id: PPTData.id,
                    data: newDataObj,
                    pptType: PPTData.pptType,
                };
            }
        });
        this.setState({docs: docs});
    }

    private selectDoc = (id: number) => {
        const {room} = this.props;
        const activeData = this.state.docs!.find(data => data.id === id)!;
        this.setState({activeDocData: activeData});
        room.putScenes(`/defaultPPT${activeData.id}`, activeData.data);
        room.setScenePath(`/defaultPPT${activeData.id}/${activeData.data[0].name}`);
        const docsArray = this.state.docs.map(data => {
            if (data.id === id) {
                data.active = true;
                return data;
            } else {
                data.active = false;
                return data;
            }
        });
        this.setState({docs: docsArray});
        room.moveCameraToContain({
            originX: - 600,
            originY: - 337.5,
            width: 1200,
            height: 675,
            animationMode: "immediately",
        });
    }

    public render(): React.ReactNode {
        let docCells: React.ReactNode;
        if (this.state.docs.length > 0) {
            docCells = this.state.docs.map(data => {
                if (data.pptType === PPTType.static) {
                    return <div
                        key={`${data.id}`}
                        onClick={() => this.selectDoc(data.id)}
                        className="menu-ppt-inner-cell">
                        <div
                            style={{backgroundColor: data.active ? "#A2A7AD" : "#525252"}}
                            className="menu-ppt-image-box">
                            <svg key="" width={144} height={104}>
                                <image
                                    width="100%"
                                    height="100%"
                                    xlinkHref={data.static_cover + "?x-oss-process=style/ppt_preview"}
                                />
                            </svg>
                        </div>
                    </div>;
                } else {
                    return <div
                        key={`${data.id}`}
                        onClick={() => this.selectDoc(data.id)}
                        className="menu-ppt-inner-cell">
                        <div
                            style={{backgroundColor: data.active ? "#A2A7AD" : "#525252"}}
                            className="menu-ppt-image-box">
                            <div className="menu-ppt-image-box-inner">
                                <img src={data.dynamic_cover}/>
                                <div>
                                    动态 PPT
                                </div>
                            </div>
                        </div>
                    </div>;
                }
            });
        }

        return (
            <div className="menu-ppt-box">
                <div className="menu-ppt-line">
                    <div className="menu-ppt-text-box">
                        Documents
                    </div>
                    {this.props.handleAnnexBoxMenuState &&
                    <div className="menu-close-btn" onClick={this.props.handleAnnexBoxMenuState}>
                        <img className="menu-title-close-icon" src={close}/>
                    </div>}
                </div>
                <div style={{height: 42}}/>
                <div style={{width: "100%", height: 24}}/>
                <div className="menu-ppt-inner-box">
                    {docCells}
                </div>
            </div>
        );
    }
}

export default MenuPPTDoc;
