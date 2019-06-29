import Fetcher from "@netless/fetch-middleware";

const fetcher = new Fetcher(5000, "https://api.agora.io");

export class RecordOperator {

    private readonly appId: string;
    private readonly appSecret: string;
    private readonly channelName: string;
    private readonly mode: string;
    private readonly recordingConfig: any;
    private readonly storageConfig: any;

    private recordId?: string;
    private resourceId?: string;
    private readonly userId: string;

    public constructor(appId: string, appSecret: string, channelName: string, recordingConfig: any, storageConfig: any, mode: string = "mix") {
        this.appId = appId;
        this.appSecret = appSecret;
        this.channelName = channelName;
        this.recordingConfig = recordingConfig;
        this.storageConfig = storageConfig;
        this.mode = mode;
        this.userId = `${Math.floor(Math.random() * 100000)}`;
    }

    public async acquire(): Promise<void> {
        const json = await fetcher.post<any>({
            path: `/v1/apps/${this.appId}/cloud_recording/acquire`,
            headers: {
                Authorization: this.basicAuthorization(this.appId, this.appSecret),
            },
            body: {
                cname: this.channelName,
                uid: this.userId,
                clientRequest: {},
            },
        });
        const res = json as any;
        if (typeof res.resourceId === "string") {
            this.resourceId = res.resourceId;
        } else {
            throw new Error("acquire resource error");
        }
    }

    public async release(): Promise<void> {
        this.resourceId = undefined;
        this.recordId = undefined;
    }


    public async start(): Promise<any> {
        if (this.resourceId === undefined) {
            throw new Error("call 'acquire' method acquire resource");
        }
        const json = await fetcher.post<any>({
            path: `/v1/apps/${this.appId}/cloud_recording/resourceid/${this.resourceId}/mode/${this.mode}/start`,
            headers: {
                Authorization: this.basicAuthorization(this.appId, this.appSecret),
            },
            body: {
                cname: this.channelName,
                uid: this.userId,
                clientRequest: { recordingConfig: this.recordingConfig, storageConfig: this.storageConfig },
            },
        });
        const res = json as any;
        if (typeof res.sid === "string") {
            this.recordId = res.sid;
        } else {
            throw new Error("start record error");
        }
        return res;
    }

    public async stop(): Promise<any> {
        if (this.resourceId === undefined) {
            throw new Error("call 'acquire' method acquire resource");
        }
        if (this.recordId === undefined) {
            throw new Error("call 'start' method start record");
        }
        try {
            const json = await fetcher.post<any>({
                path: `/v1/apps/${this.appId}/cloud_recording/resourceid/${this.resourceId}/sid/${this.recordId}/mode/${this.mode}/stop`,
                headers: {
                    Authorization: this.basicAuthorization(this.appId, this.appSecret),
                },
                body: {
                    cname: this.channelName,
                    uid: this.userId,
                    clientRequest: {},
                },
            });
            return json as any;
        } finally {
            await this.release();
        }
    }

    public async query(): Promise<any> {
        if (this.resourceId === undefined) {
            throw new Error("call 'acquire' method acquire resource");
        }
        if (this.recordId === undefined) {
            throw new Error("call 'start' method start record");
        }
        const json = await fetcher.get<any>({
            path: `/v1/apps/${this.appId}/cloud_recording/resourceid/${this.resourceId}/sid/${this.recordId}/mode/${this.mode}/query`,
            headers: {
                Authorization: this.basicAuthorization(this.appId, this.appSecret),
            },
        });
        return json as any;
    }

    private basicAuthorization(appId: string, appSecret: string): string {
        const plainCredentials = `${appId}:${appSecret}`;
        return btoa(plainCredentials);
    }
}
