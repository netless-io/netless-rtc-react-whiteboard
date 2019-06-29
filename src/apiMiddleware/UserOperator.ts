export enum UserInfType {
    name = "name",
    uuid = "uuid",
}

export class UserOperator {
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
    public startTimestamp(time: number): void {
        localStorage.setItem(`startTime`, `${time}`);
    }
    public endTimestamp(time: number): void {
        localStorage.setItem(`endTime`, `${time}`);
    }

    public getStartTimestamp(): string | null {
        const time = localStorage.getItem(`startTime`);
        if (time) {
            return time;
        } else {
            return null;
        }
    }

    public getEndTimestamp(): string | null {
        const time = localStorage.getItem(`endTime`);
        if (time) {
            return time;
        } else {
            return null;
        }
    }

    public logout(): void {
        localStorage.clear();
    }
}
