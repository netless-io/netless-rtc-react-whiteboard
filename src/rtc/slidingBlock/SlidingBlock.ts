import * as React from "react";

import {SlidingBlockState} from "./SlidingController";

export type SlidingBlockProps = {
    state: SlidingBlockState;
    targetState: SlidingBlockState;
    schedule: number;
    width: number;
    height: number;
};

export type SlidingBlock = React.ComponentType<SlidingBlockProps>;