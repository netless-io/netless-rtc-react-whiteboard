import * as React from "react";
import {StreamsStatesType} from "./RtcDesktop";
import {RoomMember} from "@netless/white-react-sdk";
export type RtcBlockContext = {
    readonly remoteMediaStreams: any[];
    readonly userId: number;
    readonly roomMembers: ReadonlyArray<RoomMember>;
    readonly localStream: any;
    remoteMediaStreamsStates: StreamsStatesType[];
    setSliderFloating: () => void;
    setSliderExtending: () => void;
    setSliderHiding: () => void;
    stopRtc: () => void;
    joinRoomTime: number;
};

const context = React.createContext<RtcBlockContext>(undefined as any);

export const RtcBlockContextProvider = context.Provider;
export const RtcBlockContextConsumer = context.Consumer;
