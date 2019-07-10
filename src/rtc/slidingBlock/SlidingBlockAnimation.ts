import {Rectangle} from "./SlidingController";

// 低于此距离，视为距离为 0
const MatchingDistance = 0.45;

// 低于此速度，视为速度为 0
const ZeroSpeed = 0.25;

// 滑块体积形变的弹性系数 k
const KDeformation = 0.07;

// 滑块被拉向指定目标的弹性系数 k
const KDistance = 0.1;

// 体积形变阻尼（线性）
const DeformationSpeedDamping = 0.4;

// 速度阻尼（与速度方向相反）
const VelocityDamping = 0.15;

// 边缘回弹导致的速度损失（模拟非弹性碰撞）
const BorderSpringbackSpeedLose = 0.85;

export type SlidingBlockAnimationParams = {
    readonly slidingBlock: Rectangle;
    readonly sceneWidth: number;
    readonly sceneHeight: number;
};

export type SlidingBlockAnimationCallbacks = {
    readonly onPhysicalSlidingBlockChanged: () => void;
    readonly onAnimationComplete: () => void;
};

export class SlidingBlockAnimation {

    private animationId?: number;
    private readonly _idealSlidingBlock: Partial<Rectangle>;
    private readonly _physicalSlidingBlock: Rectangle;

    private velocityX: number = 0;
    private velocityY: number = 0;
    private widthDeformationSpeed: number = 0;
    private heightDeformationSpeed: number = 0;

    private sceneWidth: number;
    private sceneHeight: number;

    public constructor(
        {slidingBlock, sceneWidth, sceneHeight}: SlidingBlockAnimationParams,
        private readonly callbacks: SlidingBlockAnimationCallbacks,
    ) {
        this._idealSlidingBlock = {...slidingBlock};
        this._physicalSlidingBlock = {...slidingBlock};
        this.callbacks = {...callbacks};
        this.sceneWidth = sceneWidth;
        this.sceneHeight = sceneHeight;
    }

    public updateSceneSize(width: number, height: number): void {
        this.sceneWidth = width;
        this.sceneHeight = height;
    }

    public get idealSlidingBlock(): Readonly<Partial<Rectangle>> {
        return this._idealSlidingBlock;
    }

    public set idealSlidingBlock({x, y, width, height}: Readonly<Partial<Rectangle>>) {
        this._idealSlidingBlock.x = x;
        this._idealSlidingBlock.y = y;
        this._idealSlidingBlock.width = width;
        this._idealSlidingBlock.height = height;

        this.keepIdealSlidingBlockNotOverRange();
        this.checkShouldPlayAnimation();
    }

    private keepIdealSlidingBlockNotOverRange(): void {
        if (this._idealSlidingBlock.x !== undefined) {
            if (this._idealSlidingBlock.x < 0) {
                this._idealSlidingBlock.x = 0;
            } else {
                const width = this._idealSlidingBlock.width === undefined ? this._physicalSlidingBlock.width :
                                                                            this._idealSlidingBlock.width;
                const right = this._idealSlidingBlock.x + width;

                if (right > this.sceneWidth) {
                    this._idealSlidingBlock.x = this.sceneWidth - width;
                }
            }
        }
        if (this._idealSlidingBlock.y !== undefined) {
            if (this._idealSlidingBlock.y < 0) {
                this._idealSlidingBlock.y = 0;
            } else {
                const height = this._idealSlidingBlock.height === undefined ? this._physicalSlidingBlock.height :
                                                                              this._idealSlidingBlock.height;
                const bottom = this._idealSlidingBlock.y + height;

                if (bottom > this.sceneHeight) {
                    this._idealSlidingBlock.y = this.sceneHeight - height;
                }
            }
        }
    }

    private checkShouldPlayAnimation(): void {
        if (this.animationId === undefined) {
            if (this.checkSpeedAndPositionShouldContinueUpdate()) {
                this.animationId = window.requestAnimationFrame(this.onAnimationFrame);
            } else {
                this.callbacks.onPhysicalSlidingBlockChanged();
                this.callbacks.onAnimationComplete();
            }
        }
    }

    private checkSpeedAndPositionShouldContinueUpdate(): boolean {
        if (this.isPositionMatching() && this.isSizeMatching() && this.isSpeedZero()) {
            this.velocityX = 0;
            this.velocityY = 0;
            this.widthDeformationSpeed = 0;
            this.heightDeformationSpeed = 0;
            this.movePhysicalSlidingBlockPositionToMatchIdeal();

            return false;
        }
        return true;
    }

    public get physicalSlidingBlock(): Readonly<Rectangle> {
        return this._physicalSlidingBlock;
    }

    public movePhysicalSlidingBlockPositionToMatchIdeal(): void {
        const {x, y} = this._idealSlidingBlock;
        if (x !== undefined) {
            this._physicalSlidingBlock.x = x;
        }
        if (y !== undefined) {
            this._physicalSlidingBlock.y = y;
        }
    }

    private isPositionMatching(): boolean {
        return (
            (this._idealSlidingBlock.x === undefined ||
                Math.abs(this._idealSlidingBlock.x - this._physicalSlidingBlock.x) < MatchingDistance) &&
            (this._idealSlidingBlock.y === undefined ||
                Math.abs(this._idealSlidingBlock.y - this._physicalSlidingBlock.y) < MatchingDistance)
        );
    }

    private isSizeMatching(): boolean {
        return (
            (this._idealSlidingBlock.width === undefined ||
                Math.abs(this._idealSlidingBlock.width - this._physicalSlidingBlock.width) < MatchingDistance) &&
            (this._idealSlidingBlock.height === undefined ||
                Math.abs(this._idealSlidingBlock.height - this._physicalSlidingBlock.height) < MatchingDistance)
        );
    }

    private isSpeedZero(): boolean {
        return (
            Math.abs(this.velocityX) < ZeroSpeed &&
            Math.abs(this.velocityY) < ZeroSpeed &&
            Math.abs(this.widthDeformationSpeed) < ZeroSpeed &&
            Math.abs(this.heightDeformationSpeed) < ZeroSpeed
        );
    }

    private onAnimationFrame = (): void => {
        this.updatePhysicalSlidingBlock();

        if (this.checkSpeedAndPositionShouldContinueUpdate()) {
            this.animationId = window.requestAnimationFrame(this.onAnimationFrame);
            this.callbacks.onPhysicalSlidingBlockChanged();

        } else {
            this.animationId = undefined;
            this.callbacks.onPhysicalSlidingBlockChanged();
            this.callbacks.onAnimationComplete();
        }
    }

    private updatePhysicalSlidingBlock(): void {
        this.updateSize();
        this.updatePosition();
        this.updateBorderSpringback();
    }

    private updateSize(): void {
        const {width, height} = this._idealSlidingBlock;

        if (width !== undefined) {
            this.widthDeformationSpeed += KDeformation * (width - this._physicalSlidingBlock.width);
        }
        if (height !== undefined) {
            this.heightDeformationSpeed += KDeformation * (height - this._physicalSlidingBlock.height);
        }
        const originWidth = this._physicalSlidingBlock.width;
        const originHeight = this._physicalSlidingBlock.height;

        this._physicalSlidingBlock.width = Math.max(0, this._physicalSlidingBlock.width + this.widthDeformationSpeed);
        this._physicalSlidingBlock.height = Math.max(0, this._physicalSlidingBlock.height + this.heightDeformationSpeed);

        const incrementWidth = this._physicalSlidingBlock.width - originWidth;
        const incrementHeight = this._physicalSlidingBlock.height - originHeight;

        this._physicalSlidingBlock.x -= incrementWidth / 2;
        this._physicalSlidingBlock.y -= incrementHeight / 2;

        this.widthDeformationSpeed = incrementWidth * (1 - DeformationSpeedDamping);
        this.heightDeformationSpeed = incrementHeight * (1 - DeformationSpeedDamping);
    }

    private updatePosition(): void {
        let vectorX = 0;
        let vectorY = 0;

        const {x: idealX, y: idealY} = this._idealSlidingBlock;

        if (idealX !== undefined) {
            vectorX = idealX - this._physicalSlidingBlock.x;
        }
        if (idealY !== undefined) {
            vectorY = idealY - this._physicalSlidingBlock.y;
        }
        this.velocityX += KDistance * vectorX;
        this.velocityY += KDistance * vectorY;

        this._physicalSlidingBlock.x += this.velocityX;
        this._physicalSlidingBlock.y += this.velocityY;

        this.velocityX *= VelocityDamping;
        this.velocityY *= VelocityDamping;
    }

    private updateBorderSpringback(): void {
        const right = this._physicalSlidingBlock.x + this._physicalSlidingBlock.width;

        if (this._physicalSlidingBlock.x < 0) {
            this._physicalSlidingBlock.x = 0;

            if (this.velocityX <= 0) {
                this.velocityX = - this.velocityX * (1 - BorderSpringbackSpeedLose) + this.widthDeformationSpeed / 2;
            }
        } else if (right > this.sceneWidth) {
            this._physicalSlidingBlock.x = this.sceneWidth - this._physicalSlidingBlock.width;

            if (this.velocityX >= 0) {
                this.velocityX = - this.velocityX * (1 - BorderSpringbackSpeedLose) - this.widthDeformationSpeed / 2;
            }
        }
        const bottom = this._physicalSlidingBlock.y + this._physicalSlidingBlock.height;

        if (this._physicalSlidingBlock.y < 0) {
            this._physicalSlidingBlock.y = 0;

            if (this.velocityY <= 0) {
                this.velocityY = - this.velocityY * (1 - BorderSpringbackSpeedLose) + this.heightDeformationSpeed / 2;
            }
        } else if (bottom > this.sceneHeight) {
            this._physicalSlidingBlock.y = this.sceneHeight - this._physicalSlidingBlock.height;

            if (this.velocityY >= 0) {
                this.velocityY = - this.velocityY * (1 - BorderSpringbackSpeedLose) - this.heightDeformationSpeed / 2;
            }
        }
    }
}