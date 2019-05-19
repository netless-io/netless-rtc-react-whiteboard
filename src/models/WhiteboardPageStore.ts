import {observable} from "mobx";
import {netlessWhiteboardApi, RoomType} from "../apiMiddleware";


export class WhiteboardPageStore {
    @observable
    public whiteboardLayerDownRef: HTMLDivElement | null = null;
    @observable
    public isPlayerSeeking: boolean = false;

    public async createRoomAndGetUuid(room: string, limit: number, mode: RoomType): Promise<string | null> {
        const res = await netlessWhiteboardApi.room.createRoomApi(room, limit, mode);
        if (res.code === 200) {
            return res.msg.room.uuid;
        } else {
            return null;
        }
    }
    public async joinRoom(uuid: string): Promise<string | null> {
        const res = await netlessWhiteboardApi.room.joinRoomApi(uuid);
        if (res.code === 200) {
            return res.msg.roomToken;
        } else {
            return null;
        }
    }
}

export const whiteboardPageStore = new WhiteboardPageStore();
