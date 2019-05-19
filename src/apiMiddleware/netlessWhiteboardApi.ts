import {UserOperator} from "./UserOperator";
import {RoomOperator} from "./RoomOperator";

export const netlessWhiteboardApi = new class {
    public readonly user: UserOperator = new UserOperator();
    public readonly room: RoomOperator = new RoomOperator();
};
