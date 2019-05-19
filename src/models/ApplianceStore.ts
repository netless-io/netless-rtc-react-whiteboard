import {observable, action} from "mobx";
import {Room, GlobalState, MemberState, BroadcastState, RoomState, RoomMember, Scene} from "white-react-sdk";

export interface ApplianceStore {
    readonly state?: ApplianceStateStore;
    registerRoom(room: Room): void;
    unregisterRoom(): void;
}

class ApplianceStoreImplement implements ApplianceStore {

    @observable
    private _state?: ApplianceStateStoreImplement = undefined;

    public get state(): ApplianceStateStore | undefined {
        return this._state;
    }

    public registerRoom(room: Room): void {
        if (!this._state) {
            this._state = new ApplianceStateStoreImplement(room);
        }
    }

    public unregisterRoom(): void {
        if (this._state) {
            this._state = undefined;
        }
    }
}

export interface ApplianceStateStore {
    readonly room: Room;
    readonly globalState: Readonly<GlobalState>;
    readonly memberState: Readonly<MemberState>;
    readonly broadcastState: BroadcastState;
    readonly scenes: ReadonlyArray<Scene>;
    readonly zoomScale: number;
    readonly sceneIndex: number;
    readonly scenePath: string;
    readonly roomMembers: ReadonlyArray<RoomMember>;

    zoomChange(scale: number): void;
    setMemberState(modifyState: Partial<MemberState>): void;
    setGlobalState(modifyState: Partial<GlobalState>): void;
    updateRoomState(modifyProps: Partial<RoomState>): void;
}

class ApplianceStateStoreImplement implements ApplianceStateStore {

    @observable
    private _globalState: Readonly<GlobalState>;

    @observable
    private _memberState: Readonly<MemberState>;

    @observable
    private _roomMembers: ReadonlyArray<RoomMember>;

    @observable
    private _broadcastState: BroadcastState;

    @observable
    private _zoomScale: number;

    @observable
    private _scenes: ReadonlyArray<Scene>;

    @observable
    private _sceneIndex: number;


    @observable
    private _scenePath: string;
    public constructor(
        public readonly room: Room,
    ) {
        this._globalState = room.state.globalState;
        this._memberState = room.state.memberState;
        this._broadcastState = room.state.broadcastState;
        this._zoomScale = room.state.zoomScale;
        this._roomMembers = room.state.roomMembers;
        this._sceneIndex = room.state.sceneState.index;
        this._scenePath = room.state.sceneState.scenePath;
        this._scenes = room.state.sceneState.scenes;
    }

    public get globalState(): Readonly<GlobalState> {
        return this._globalState;
    }

    public get memberState(): Readonly<MemberState> {
        return this._memberState;
    }

    public get broadcastState(): BroadcastState {
        return this._broadcastState;
    }

    public get zoomScale(): number {
        return this._zoomScale;
    }

    public get sceneIndex(): number {
        return this._sceneIndex;
    }

    public get scenePath(): string {
        return this._scenePath;
    }

    public get scenes(): ReadonlyArray<Scene> {
        return this._scenes;
    }

    public get roomMembers(): ReadonlyArray<RoomMember> {
        return this._roomMembers;
    }
    @action
    public zoomChange(scale: number): void {
        this.room.zoomChange(scale);
        this._zoomScale = scale;
    }
    @action
    public setMemberState(modifyState: Partial<MemberState>): void {
        this._memberState = this.room.setMemberState(modifyState);
    }

    @action
    public setGlobalState(modifyState: Partial<GlobalState>): void {
        this._globalState = this.room.setGlobalState(modifyState);
    }

    @action
    public updateRoomState(modifyProps: RoomState): void {

        if (modifyProps.globalState) {
            this._globalState = modifyProps.globalState;
        }
        if (modifyProps.memberState) {
            this._memberState = modifyProps.memberState;
        }
        if (modifyProps.roomMembers) {
            this._roomMembers = modifyProps.roomMembers;
        }
        if (modifyProps.broadcastState) {
            this._broadcastState = modifyProps.broadcastState;
        }
        if (modifyProps.zoomScale) {
            this._zoomScale = modifyProps.zoomScale;
        }
        if (modifyProps.sceneState) {
            this._sceneIndex = modifyProps.sceneState.index;
            this._scenePath = modifyProps.sceneState.scenePath;
            this._scenes = modifyProps.sceneState.scenes;
        }
    }
}

export const applianceStore: ApplianceStore = new ApplianceStoreImplement();
