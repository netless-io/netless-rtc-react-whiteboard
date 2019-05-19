import * as React from "react";
import {observer} from "mobx-react";
import { CursorAdapter, CursorDescription, Cursor} from "white-react-sdk";
import Identicon from "react-identicons";
import "./UserCursor.less";
import {applianceStore} from "../../models/ApplianceStore";

export type CursorComponentProps = {
    memberId: number;
};

@observer
class CursorComponent extends React.Component<CursorComponentProps, {}> {
    public constructor(props: CursorComponentProps) {
        super(props);
    }
    public render(): React.ReactNode {
        if (applianceStore.state) {
            const userInf = applianceStore.state.roomMembers.find(data => data.memberId === this.props.memberId);
            if (userInf) {
                return <div className="cursor-box">
                    <Identicon
                        size={24}
                        string={userInf.information.avatar}/>
                </div>;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
}

export class UserCursor implements CursorAdapter {
     public createCursor(memberId: number): CursorDescription & {
         readonly reactNode?: any;
     } {
        return {reactNode: <CursorComponent memberId={memberId}/>, x: 16, y: 16, width: 32, height: 32};
     }
     public onAddedCursor(cursor: Cursor): void {
     }
     public onRemovedCursor(cursor: Cursor): void {
     }
}
