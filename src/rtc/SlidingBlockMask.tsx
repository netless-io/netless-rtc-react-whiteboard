import "./SlidingBlockMask.less";

import * as React from "react";
import * as ReactDom from "react-dom";

import isTouchDevice from "is-touch-device";
import "./SlidingBlockMask.less";

import RtcBlock, {RtcBlockProps} from "./RtcBlock";
import {HtmlElementRefContainer} from "./HtmlElementRefContainer";
import {
    BlockPosition, SlidingBlock,
    SlidingBlockDescription, SlidingBlockProps,
    SlidingBlockState,
    SlidingController,
    SlidingControllerParams,
} from "./slidingBlock";

export type SlidingBlockMaskProps = {
    state: SlidingBlockState;
    hiding: BlockPosition;
    floating: BlockPosition;
    extending: BlockPosition;
    onIsHidingChanged?: (isHiding: boolean) => void;
    onClick?: () => void;
};

export type SlidingBlockMaskState = {
    slidingBlockProps?: RtcBlockProps;
    slidingBlockRef?: HTMLDivElement;
};

export class SlidingBlockMask extends React.Component<SlidingBlockMaskProps, SlidingBlockMaskState> {

    // mask size 如果太小，可能不足以容纳一个最简单的 sliding block
    private static readonly minMaskSize: Readonly<{width: number, height: number}> = Object.freeze({
        width: 300,
        height: 200,
    });

    private readonly ignoreEventRefs: HtmlElementRefContainer;

    private didCaptureMouseEvent: boolean = false;
    private captureIdentifier?: number = undefined;

    private slidingBlockMaskRef: HTMLDivElement | null = null;
    private controller: SlidingController;

    public constructor(props: SlidingBlockMaskProps) {
        super(props);
        this.ignoreEventRefs = new HtmlElementRefContainer();
        this.state = {};
    }

    public componentWillMount(): void {
        window.addEventListener("resize", this.onWindowResize);
    }

    public componentDidMount(): void {
        const {clientWidth, clientHeight} = this.slidingBlockMaskRef!;

        const params: SlidingControllerParams = {
            state: this.props.state,
            hiding: this.props.hiding,
            floating: this.props.floating,
            extending: this.props.extending,
            sceneWidth: Math.max(clientWidth, SlidingBlockMask.minMaskSize.width),
            sceneHeight: Math.max(clientHeight, SlidingBlockMask.minMaskSize.height),
        };
        this.controller = new SlidingController(params, {
            onStaticStateChanged: this.onStaticStateChanged,
            onDescriptionChanged: this.onDescriptionChanged,
            onClick: this.onClick,
        });
        const {state, targetState, schedule, width, height} = this.controller.description;

        this.setState({
            slidingBlockProps: {
                ignoreEventRefs: this.ignoreEventRefs,
                state, targetState, schedule, width, height,
            },
        });
    }

    public componentWillUnmount(): void {
        window.removeEventListener("resize", this.onWindowResize);
    }

    private onStaticStateChanged = (staticState: SlidingBlockState | null): void => {
        if (this.props.onIsHidingChanged) {
            this.props.onIsHidingChanged(staticState === SlidingBlockState.Hiding);
        }
    }

    private onDescriptionChanged = (modifyDescription: Partial<SlidingBlockDescription>): void => {
        if (this.state.slidingBlockRef && modifyDescription.x !== undefined) {
            this.state.slidingBlockRef.style.left = `${modifyDescription.x}px`;
        }
        if (this.state.slidingBlockRef && modifyDescription.y !== undefined) {
            this.state.slidingBlockRef.style.top = `${modifyDescription.y}px`;
        }
        const blockProps: RtcBlockProps = {...this.state.slidingBlockProps!};

        if (modifyDescription.width !== undefined) {
            blockProps.width = modifyDescription.width;
        }
        if (modifyDescription.height !== undefined) {
            blockProps.height = modifyDescription.height;
        }
        if (modifyDescription.state !== undefined) {
            blockProps.state = modifyDescription.state;
        }
        if (modifyDescription.targetState !== undefined) {
            blockProps.targetState = modifyDescription.targetState;
        }
        if (modifyDescription.schedule !== undefined) {
            blockProps.schedule = modifyDescription.schedule;
        }
        this.setState({slidingBlockProps: blockProps});
    }

    private onClick = (): void => {
        if (this.props.onClick) {
            this.props.onClick();
        }
    }

    private setSlidingBlockRef = (slidingBlockRef: HTMLDivElement | null): void => {
        if (isTouchDevice()) {
            if (slidingBlockRef) {
                slidingBlockRef.addEventListener("touchstart", this.onTouchStart);
                document.addEventListener("touchmove", this.onTouchMove);
                document.addEventListener("touchend", this.onTouchEnd);
            } else {
                this.state.slidingBlockRef!.removeEventListener("touchstart", this.onTouchStart);
                document.addEventListener("touchmove", this.onTouchMove);
                document.addEventListener("touchend", this.onTouchEnd);
            }
        } else {
            if (slidingBlockRef) {
                slidingBlockRef.addEventListener("mousedown", this.onMouseDown);
                document.addEventListener("mousemove", this.onMouseMove);
                document.addEventListener("mouseup", this.onMouseUp);
            } else {
                this.state.slidingBlockRef!.removeEventListener("mousedown", this.onMouseDown);
                document.removeEventListener("mousemove", this.onMouseMove);
                document.removeEventListener("mouseup", this.onMouseUp);
            }
        }
        if (slidingBlockRef) {
            this.setState({slidingBlockRef}, () => {
                const {x, y} = this.controller.description;
                slidingBlockRef.style.left = `${x}px`;
                slidingBlockRef.style.top = `${y}px`;
            });
        }
    }

    private onMouseDown = (event: MouseEvent): void => {
        if (this.isLeftMouseButton(event) && !this.controller.isChangingState &&
            this.willNotIgnoreElementEvent(event.target as HTMLElement)) {
            this.controller.pressPoint(event.clientX, event.clientY);
            this.didCaptureMouseEvent = true;
        }
    }

    private onMouseMove = (event: MouseEvent): void => {
        if (this.didCaptureMouseEvent) {
            this.controller.movePoint(event.clientX, event.clientY);
        }
    }

    private onMouseUp = (event: MouseEvent): void => {
        if (this.didCaptureMouseEvent) {
            this.controller.releasePoint(event.clientX, event.clientY);
            this.didCaptureMouseEvent = false;
        }
    }

    private onTouchStart = (event: TouchEvent): void => {
        if (!this.controller.isChangingState && this.willNotIgnoreElementEvent(event.target as HTMLElement)) {
            const touch = event.changedTouches.item(0);
            if (touch) {
                this.captureIdentifier = touch.identifier;
                this.controller.pressPoint(touch.clientX, touch.clientY);
            }
        }
    }

    private onTouchMove = (event: TouchEvent): void => {
        const touch = this.findCaptureTouch(event);
        if (touch) {
            this.controller.movePoint(touch.clientX, touch.clientY);
        }
    }

    private onTouchEnd = (event: TouchEvent): void => {
        const touch = this.findCaptureTouch(event);
        if (touch) {
            this.controller.releasePoint(touch.clientX, touch.clientY);
            this.captureIdentifier = undefined;
        }
    }

    private isLeftMouseButton(evt: MouseEvent): boolean {
        return evt.button === 0;
    }

    private findCaptureTouch(event: TouchEvent): Touch | undefined {
        for (let i = 0; i < event.changedTouches.length; ++i) {
            const touch = event.changedTouches.item(i);
            if (touch && touch.identifier === this.captureIdentifier) {
                return touch;
            }
        }
        return undefined;
    }

    public componentWillReceiveProps(nextProps: Readonly<SlidingBlockMaskProps>): void {
        if (this.props.state !== nextProps.state) {
            this.controller.setState(nextProps.state);
        }
        if (this.props.extending.width !== nextProps.extending.width ||
            this.props.extending.height !== nextProps.extending.height) {

            this.controller.setExtendingSize(nextProps.extending.width, nextProps.extending.height);
        }
    }

    private onWindowResize = (): void => {
        const {clientWidth, clientHeight} = this.slidingBlockMaskRef!;
        this.controller.setSceneSize(
            Math.max(clientWidth, SlidingBlockMask.minMaskSize.width),
            Math.max(clientHeight, SlidingBlockMask.minMaskSize.height),
        );
    }

    private willNotIgnoreElementEvent(element: HTMLElement): boolean {
        if (this.props.state !== SlidingBlockState.Extending) {
            return true;
        }
        while (element.parentElement) {
            if (this.ignoreEventRefs.hasRef(element)) {
                return false;
            }
            element = element.parentElement;
        }
        return true;
    }

    public render(): React.ReactNode {
        const displayBlock = this.state.slidingBlockRef && this.state.slidingBlockProps && (
            this.state.slidingBlockProps.state !== SlidingBlockState.Hiding ||
            this.state.slidingBlockProps.targetState !== SlidingBlockState.Hiding
        );
        return (
            <div className="sliding-block-wrapper">
                <div className="sliding-block-mask"
                     ref={dom => this.slidingBlockMaskRef = dom}>
                    <div className="sliding-block"
                         style={{display: displayBlock ? "initial" : "none"}}
                         ref={this.setSlidingBlockRef}>
                        <SlidingBlockWrapper blockRef={this.state.slidingBlockRef}
                                             props={this.state.slidingBlockProps}
                                             clazz={RtcBlock}/>
                    </div>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

type SlidingBlockWrapperProps = {
    blockRef?: HTMLElement,
    clazz: SlidingBlock;
    props?: SlidingBlockProps;
};

class SlidingBlockWrapper extends React.Component<SlidingBlockWrapperProps, {}> {

    public render(): React.ReactNode {
        if (!this.props.blockRef || !this.props.props) {
            return null;
        }
        if (this.props.props.state === SlidingBlockState.Hiding &&
            this.props.props.targetState === SlidingBlockState.Hiding) {
            return null;
        }
        return ReactDom.createPortal(
            React.createElement(this.props.clazz, this.props.props),
            this.props.blockRef,
        );
    }
}
