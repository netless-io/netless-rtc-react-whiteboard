import {BlockPosition} from "./slidingBlock";

export const HidingPosition: BlockPosition = Object.freeze({
    bottom: 0,
    left: 154,
    width: 32,
    height: 32,
});

export const FloatingPosition: BlockPosition = Object.freeze({
    bottom: 54,
    left: 0,
    width: 90,
    height: 90,
});

export const ExtendingPosition: BlockPosition = Object.freeze({
    bottom: 64,
    left: 0,
    width: 120,
    height: 120,
});
