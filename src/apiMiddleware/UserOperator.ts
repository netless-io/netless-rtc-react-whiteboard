import Fetcher from "@netless/fetch-middleware";
const fetcher = new Fetcher(5000, "https://cloudcapiv4.herewhite.com");


export class UserOperator {
    public async getUserData(email: string, password: string): Promise<any> {
        const json = await fetcher.post<any>({
            path: "login",
            body: {
                email: email,
                password: password,
            },
        });
        return json as any;
    }
}
