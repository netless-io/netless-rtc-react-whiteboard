import { UserOperator } from "./UserOperator";
import { RoomOperator } from "./RoomOperator";
import { RecordOperator } from "./RecordOperator";
import { rtcAppId } from "../appToken";

export const netlessWhiteboardApi = new class {
    public readonly user: UserOperator = new UserOperator();
    public readonly room: RoomOperator = new RoomOperator();
    // recordingConfig and storageConfig read: https://docs.agora.io/cn/cloud-recording/cloud_recording_api_rest?platform=All%20Platforms#a-namestarta%E5%BC%80%E5%A7%8B%E4%BA%91%E7%AB%AF%E5%BD%95%E5%88%B6%E7%9A%84-api
    public readonly recordFactory: (channelName: string, recordingConfig: any, storageConfig: any) => RecordOperator = function (channelName: string, recordingConfig: any, storageConfig: any): RecordOperator {
        return new RecordOperator(rtcAppId.restId, rtcAppId.restSecret, channelName, recordingConfig, storageConfig);
    };
};
