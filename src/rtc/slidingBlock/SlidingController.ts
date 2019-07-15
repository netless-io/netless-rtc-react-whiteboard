import {SlidingBlockAnimation, SlidingBlockAnimationParams} from "./SlidingBlockAnimation";

const ClickMaxDistance = 6;

export type BlockPosition = {
    readonly width: number;
    readonly height: number;
    readonly top?: number;
    readonly bottom?: number;
    readonly left?: number;
    readonly right?: number;
};

type ChangingStateDescription = {
    readonly beginX: number;
    readonly beginY: number;
    readonly beginState: SlidingBlockState;
    readonly targetState: SlidingBlockState;
};

export enum SlidingBlockState {
    Hiding = "hiding",
    Floating = "floating",
    Extending = "extending",
}

export type SlidingBlockDescription = Rectangle & {
    state: SlidingBlockState;
    targetState: SlidingBlockState;
    schedule: number;
};

export type Rectangle = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type SlidingControllerParams = {
    readonly state: SlidingBlockState;
    readonly hiding: BlockPosition;
    readonly floating: BlockPosition;
    readonly extending: BlockPosition;
    readonly sceneWidth: number;
    readonly sceneHeight: number;
};

export type SlidingControllerCallbacks = {
    readonly onClick: () => void;
    readonly onStaticStateChanged: (staticState: SlidingBlockState | null) => void;
    readonly onDescriptionChanged: (modifyDescription: Partial<SlidingBlockDescription>) => void;
};

export class SlidingController {

    private readonly hiding: BlockPosition;
    private readonly floating: BlockPosition;

    private readonly callbacks: SlidingControllerCallbacks;

    private readonly animation: SlidingBlockAnimation;
    private readonly _description: SlidingBlockDescription;

    private staticState: SlidingBlockState | null;
    private extending: BlockPosition;

    private sceneWidth: number;
    private sceneHeight: number;

    private pressBeginX: number = 0;
    private pressBeginY: number = 0;
    private isDragOverClickMaxDistance: boolean = false;

    private changingStateDescription?: ChangingStateDescription;
    private draggingPressDelta?: {dx: number, dy: number};

    public constructor(params: SlidingControllerParams, callbacks: SlidingControllerCallbacks) {
        this.hiding = params.hiding;
        this.floating = params.floating;
        this.extending = params.extending;
        this.staticState = params.state;
        this.sceneWidth = params.sceneWidth;
        this.sceneHeight = params.sceneHeight;
        this.callbacks = Object.freeze({...callbacks});

        const currentBlockPosition = this.currentBlockPosition(params.state);
        const animationParams: SlidingBlockAnimationParams = {
            slidingBlock: this.createRectangleWithBlockPosition(currentBlockPosition),
            sceneWidth: this.sceneWidth,
            sceneHeight: this.sceneHeight,
        };
        this.animation = new SlidingBlockAnimation(animationParams, {
            onPhysicalSlidingBlockChanged: this.onPhysicalSlidingBlockChanged,
            onAnimationComplete: this.onAnimationComplete,
        });
        this._description = {
            ...this.animation.physicalSlidingBlock,
            state: params.state,
            targetState: params.state,
            schedule: 0,
        };
    }

    public get isChangingState(): boolean {
        return !!this.changingStateDescription;
    }

    public get description(): Readonly<SlidingBlockDescription> {
        return this._description;
    }

    public setState(state: SlidingBlockState): void {
        if (this._description.state !== state) {
            this.changingStateDescription = {
                beginState: this._description.state,
                targetState: state,
                beginX: this._description.x,
                beginY: this._description.y,
            };
            this.playAnimationAfterModifyProperties();
        }
    }

    public setExtendingSize(width: number, height: number): void {
        if (this.extending.width !== width ||
            this.extending.height !== height) {
            this.extending = {...this.extending, width, height};
            this.playAnimationAfterModifyProperties();
        }
    }

    private playAnimationAfterModifyProperties(): void {

        const beginState = this.changingStateDescription ? this.changingStateDescription.beginState : this._description.state;
        const targetState = this.changingStateDescription ? this.changingStateDescription.targetState : this._description.state;

        switch (targetState) {
            case SlidingBlockState.Hiding: {
                this.animation.idealSlidingBlock = this.createRectangleWithBlockPosition(this.hiding);
                break;
            }
            case SlidingBlockState.Floating: {
                if (beginState === SlidingBlockState.Hiding) {
                    this.animation.idealSlidingBlock = this.createRectangleWithBlockPosition(this.floating);

                } else {
                    this.animation.idealSlidingBlock = {
                        x: this.sideXOfIdealSlidingBlock(this.floating.width),
                        width: this.floating.width,
                        height: this.floating.height,
                    };
                }
                break;
            }
            case SlidingBlockState.Extending: {
                if (beginState === SlidingBlockState.Hiding) {
                    this.animation.idealSlidingBlock = this.createRectangleWithBlockPosition(this.extending);

                } else {
                    this.animation.idealSlidingBlock = {
                        width: this.extending.width,
                        height: this.extending.height,
                        x: this.sideXOfIdealSlidingBlock(this.extending.width),
                    };
                }
                break;
            }
        }
    }

    public setSceneSize(width: number, height: number): void {
        if (this.sceneWidth !== width || this.sceneHeight !== height) {
            this.sceneWidth = width;
            this.sceneHeight = height;

            this.animation.updateSceneSize(width, height);
            this.animation.idealSlidingBlock = {x: this.sideXOfIdealSlidingBlock()};
            this.animation.movePhysicalSlidingBlockPositionToMatchIdeal();
        }
    }

    public pressPoint(x: number, y: number): void {
        this.pressBeginX = x;
        this.pressBeginY = y;
        this.isDragOverClickMaxDistance = false;

        this.draggingPressDelta = {
            dx: x - this._description.x,
            dy: y - this._description.y,
        };
    }

    public movePoint(x: number, y: number): void {
        if (!this.isDragOverClickMaxDistance && (
            Math.abs(this.pressBeginX - x) > ClickMaxDistance ||
            Math.abs(this.pressBeginY - y) > ClickMaxDistance
        )) {
            this.isDragOverClickMaxDistance = true;
        }
        this.dragSlidingPosition(x, y);
    }

    public releasePoint(x: number, y: number): void {
        this.dragSlidingPosition(x, y);

        this.animation.movePhysicalSlidingBlockPositionToMatchIdeal();
        this.animation.idealSlidingBlock = {x: this.sideXOfIdealSlidingBlock()};
        this.draggingPressDelta = undefined;

        if (!this.isDragOverClickMaxDistance) {
            this.callbacks.onClick();
        }
    }

    private dragSlidingPosition(x: number, y: number): void {
        const {dx, dy} = this.draggingPressDelta!;

        this.animation.idealSlidingBlock = {x: x - dx, y: y - dy};

        const block = this.animation.idealSlidingBlock;

        this.setDescription({
            x: block.x!,
            y: block.y!,
        });
    }

    private onPhysicalSlidingBlockChanged = (): void => {

        if (this.draggingPressDelta) {
            // 拖动时，直接更新目标
            return;
        }
        const currentRectangle = this.animation.physicalSlidingBlock;
        const modifyDescription: Partial<SlidingBlockDescription> = {};

        if (this._description.x !== currentRectangle.x) {
            modifyDescription.x = currentRectangle.x;
        }
        if (this._description.y !== currentRectangle.y) {
            modifyDescription.y = currentRectangle.y;
        }
        if (this._description.width !== currentRectangle.width) {
            modifyDescription.width = currentRectangle.width;
        }
        if (this._description.height !== currentRectangle.height) {
            modifyDescription.height = currentRectangle.height;
        }
        if (this.changingStateDescription) {
            const schedule = this.scheduleWithPoint(currentRectangle.x, currentRectangle.y);

            if (schedule > this._description.schedule) {
                modifyDescription.schedule = schedule;
            }
            if (this._description.targetState !== this.changingStateDescription.targetState) {
                modifyDescription.targetState = this.changingStateDescription.targetState;
            }
            const state = (schedule === 1) ? this.changingStateDescription.targetState : this.changingStateDescription.beginState;

            if (this._description.state !== state) {
                modifyDescription.state = state;
            }
        }
        this.setDescription(modifyDescription);
    }

    private scheduleWithPoint(x: number, y: number): number {
        const {beginX, beginY} = this.changingStateDescription!;
        let {x: targetX, y: targetY} = this.animation.idealSlidingBlock;

        if (targetX === undefined) {
            targetX = x;
        }
        if (targetY === undefined) {
            targetY = y;
        }
        const schedule = this.distance(x - beginX, y - beginY) / this.distance(targetX - beginX, targetY - beginY);

        if (schedule < 0) {
            return 0;
        } else if (schedule > 1) {
            return 1;
        }
        return schedule;
    }

    private distance(dx: number, dy: number): number {
        return Math.sqrt(dx * dx + dy * dy);
    }

    private onAnimationComplete = (): void => {
        if (this.changingStateDescription) {
            if (this._description.schedule !== 1) {
                this.setDescription({
                    schedule: 1,
                    state: this.changingStateDescription.targetState,
                });
            }
            this.changingStateDescription = undefined;
        }
    }

    private setDescription(modifyDescription: Partial<SlidingBlockDescription>): void {
        for (const key in modifyDescription) {
            (this._description as any)[key] = (modifyDescription as any)[key];
        }
        this.callbacks.onDescriptionChanged(modifyDescription);

        let currentStaticState: SlidingBlockState | null = null;

        if (this._description.state === this._description.targetState) {
            currentStaticState = this._description.state;
        }
        if (currentStaticState !== this.staticState) {
            this.staticState = currentStaticState;
            this.callbacks.onStaticStateChanged(currentStaticState);
        }
    }

    private sideXOfIdealSlidingBlock(blockWidth?: number): number {
        const physicalWidth = this.animation.physicalSlidingBlock.width;

        if (blockWidth === undefined) {
            blockWidth = physicalWidth;
        }
        if (this._description.x <= (this.sceneWidth - physicalWidth) / 2) {
            return 0;
        }
        return this.sceneWidth - blockWidth;
    }

    private currentBlockPosition(state: SlidingBlockState): BlockPosition {
        switch (state) {
            case SlidingBlockState.Hiding: {
                return this.hiding;
            }
            case SlidingBlockState.Floating: {
                return this.floating;
            }
            case SlidingBlockState.Extending: {
                return this.extending;
            }
        }
    }

    private createRectangleWithBlockPosition({top, bottom, left, right, width, height}: BlockPosition): Rectangle {
        let x: number = 0;
        let y: number = 0;

        if (left !== undefined) {
            x = left;
        } else if (right !== undefined) {
            x = this.sceneWidth - width - right;
        }
        if (top !== undefined) {
            y = top;
        } else if (bottom !== undefined) {
            y = this.sceneHeight - height - bottom;
        }
        return {x, y, width, height};
    }
}