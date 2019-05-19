import * as React from "react";
import close from "../../assets/image/close.svg";
import add_icon from "../../assets/image/add_icon.svg";
import TweenOne from "rc-tween-one";
import {Room, RoomState, Scene} from "white-react-sdk";
import "./MenuAnnexBox.less";

export type MenuAnnexBoxState = {
    isFocus: boolean,
    hoverCellIndex: number | null;
};

export type MenuAnnexBoxProps = {
    room: Room;
    roomState: RoomState;
    handleAnnexBoxMenuState: () => void;
};

class MenuAnnexBox extends React.Component<MenuAnnexBoxProps, MenuAnnexBoxState> {

    private ref: HTMLDivElement | null = null;

    public constructor(props: MenuAnnexBoxProps) {
        super(props);
        this.state = {
            isFocus: false,
            hoverCellIndex: null,
        };
        this.arrowControllerHotKey = this.arrowControllerHotKey.bind(this);
    }

    private arrowControllerHotKey(evt: KeyboardEvent): void {
    }

    private removeScene(index: number): void {
        const {room} = this.props;
        const scenes = room.state.sceneState.scenes;
        const scenePath = room.state.sceneState.scenePath;
        const pathName = this.pathName(scenePath);
        room.removeScenes(`/${pathName}/${scenes[index].name}`);
    }
    private setScenePath = (newActiveIndex: number) => {
        const {room} = this.props;
        room.setSceneIndex(newActiveIndex);
    }
    private pathName = (path: string): string => {
        const reg = /\/([^\/]*)\//g;
        reg.exec(path);
        return RegExp.$1;
    }

    public componentDidMount(): void {
        document.body.addEventListener("keydown", this.arrowControllerHotKey);
    }

    public componentWillUnmount(): void {
        document.body.removeEventListener("keydown", this.arrowControllerHotKey);
    }

    public render(): React.ReactNode {
        const {roomState} = this.props;
        const scenes = roomState.sceneState.scenes;
        const activeIndex = roomState.sceneState.index;
        const renderPages = scenes.map((scene: Scene, index: number): React.ReactNode => {
            const isActive = index === activeIndex;
            return (
                    <div
                        key={`${scene.name}${index}`}
                        className={isActive ? "page-out-box-active" : "page-out-box"}
                        onMouseEnter={() => this.setState({hoverCellIndex: index})}
                        onMouseLeave={() => this.setState({hoverCellIndex: null})}
                        >
                        <div className="page-box-inner-index-left">{index + 1}</div>
                        <div
                            onFocus={() => this.setState({isFocus: true})}
                            onBlur={() => this.setState({isFocus: false})}
                            onClick={() => {
                            this.setScenePath(index);
                        }} className="page-mid-box">
                            <div className="page-box">
                                <PageImage scene={scene}/>
                            </div>
                        </div>
                        <div className="page-box-inner-index-delete-box">
                            {this.state.hoverCellIndex === index &&
                            <TweenOne
                                animation={[
                                    {
                                        scale: 1,
                                        duration: 200,
                                        ease: "easeInOutQuart",
                                    },
                                ]}
                                style={{
                                    transform: "scale(0)",
                                }}
                                className="page-box-inner-index-delete" onClick={() => this.removeScene(index)}>
                                <img className="menu-title-close-icon" src={close}/>
                            </TweenOne>}
                        </div>
                    </div>

            );
        });

        return (
            <div
                ref={ref => this.ref = ref} className="menu-annex-box">
                <div className="menu-title-line">
                    <div className="menu-title-text-box">
                        PPT
                    </div>
                    <div className="menu-close-btn" onClick={this.props.handleAnnexBoxMenuState}>
                        <img className="menu-title-close-icon" src={close}/>
                    </div>
                </div>
                <div style={{height: 42}}/>
                {renderPages}
                <div style={{height: 42}}/>
                <div className="menu-under-btn">
                    <div
                        className="menu-under-btn-inner"
                        onClick={() => {
                            const {room, roomState} = this.props;
                            const newSceneIndex = activeIndex + 1;
                            const scenePath = roomState.sceneState.scenePath;
                            const pathName = this.pathName(scenePath);
                            room.putScenes(`/${pathName}`, [{}], newSceneIndex);
                            room.setSceneIndex(newSceneIndex);
                        }}
                    >
                        <img src={add_icon}/>
                        <div>
                            add page
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class PageImage extends React.Component<{ scene: Scene }> {

    public render(): React.ReactNode {
        const {preview, ppt, didPreviewLoadFailed} = this.props.scene;
        if (didPreviewLoadFailed && ppt) {
            return this.renderPPT(ppt.src);
        } else if (preview && !ppt) {
            return <img src={preview}/>;

        } else if (preview && ppt) {
            return [
                this.renderPPT(ppt.src),
                <img key="preview" src={preview}/>,
            ];
        } else if (ppt && !preview) {
            return this.renderPPT(ppt.src);
        } else {
            return null;
        }
    }

    private renderPPT(pptSrc: string): React.ReactNode {
        return (
            <svg key="" width={192} height={112.5}>
                <image
                    width="100%"
                    height="100%"
                    xlinkHref={pptSrc + "?x-oss-process=style/ppt_preview"}
                />
            </svg>
        );
    }
}

export default MenuAnnexBox;
