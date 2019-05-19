export enum UserInfType {
    name = "name",
    uuid = "uuid",
}

export class MiniPersistStore {

    public updateUserInf(name: string, uuid: string, index: string): void {
        localStorage.setItem(`name${index}`, name);
        localStorage.setItem(`uuid${index}`, uuid);
    }

    public getUserInf(type: UserInfType, index: string): string {
        const userInf = localStorage.getItem(`${type}${index}`);
        if (userInf) {
            return userInf;
        } else {
            if (type === UserInfType.uuid) {
                return `Netless uuid ${index}`;
            } else {
                return `Netless user ${index}`;
            }
        }
    }
    public logout(): void {
        localStorage.clear();
    }
}

export const userInfDataStore = new MiniPersistStore();
