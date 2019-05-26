import * as React from "react";
import {observer} from "mobx-react";
import { CursorAdapter, CursorDescription, Cursor} from "white-react-sdk";
import Identicon from "react-identicons";
import "./UserCursor.less";
import {applianceStore} from "../../models/ApplianceStore";
import * as selector from "../../assets/image/selector.svg";
import * as pencil from "../../assets/image/pencil.svg";
import * as text from "../../assets/image/text.svg";
import * as eraser from "../../assets/image/eraser.svg";
import * as ellipse from "../../assets/image/ellipse.svg";
import * as rectangle from "../../assets/image/rectangle.svg";

export type CursorComponentProps = {
    memberId: number;
};
type ApplianceDescription = {
    readonly iconUrl: string;
    readonly hasColor: boolean;
    readonly hasStroke: boolean;
};

@observer
class CursorComponent extends React.Component<CursorComponentProps, {}> {
    public constructor(props: CursorComponentProps) {
        super(props);
    }
    private static readonly descriptions: {readonly [applianceName: string]: ApplianceDescription} = Object.freeze({
        selector: Object.freeze({
            iconUrl: selector,
            hasColor: false,
            hasStroke: false,
        }),
        pencil: Object.freeze({
            iconUrl: pencil,
            hasColor: true,
            hasStroke: true,
        }),
        text: Object.freeze({
            iconUrl: text,
            hasColor: true,
            hasStroke: false,
        }),
        eraser: Object.freeze({
            iconUrl: eraser,
            hasColor: false,
            hasStroke: false,
        }),
        ellipse: Object.freeze({
            iconUrl: ellipse,
            hasColor: true,
            hasStroke: true,
        }),
        rectangle: Object.freeze({
            iconUrl: rectangle,
            hasColor: true,
            hasStroke: true,
        }),
    });

    private iconUrl = (name: string): string => {
        return CursorComponent.descriptions[name].iconUrl;
    }

    public render(): React.ReactNode {
        if (applianceStore.state) {
            const userInf = applianceStore.state.roomMembers.find(data => data.memberId === this.props.memberId);
            if (userInf) {
                const color = `rgb(${userInf.memberState.strokeColor[0]}, ${userInf.memberState.strokeColor[1]}, ${userInf.memberState.strokeColor[2]})`;
                return <div>
                        <div style={{borderColor: color}} className="cursor-box">
                            <Identicon
                                size={24}
                                string={userInf.information.avatar}/>
                        </div>
                        <div style={{backgroundColor: color}}  className="cursor-box-tool">
                            <img src={this.iconUrl(userInf.memberState.currentApplianceName)}/>
                        </div>
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
