import * as H from "history";

import {observable} from "mobx";
import {push} from "@netless/i18n-react-router";

export enum PageErrorType {
    Page404 = "PasswordResetAccount",
    PageRoomNotFind = "PageRoomNotFind",
    PageRoomNotConnected = "PageRoomNotConnected",
}


export class ErrorPageStore {
    @observable
    public pageErrorState: PageErrorType = PageErrorType.Page404;

    public goToError404(history: H.History): void {
        this.pageErrorState = PageErrorType.Page404;
        push(history, "/error_page");
    }

    public goToErrorPageRoomNotFind(history: H.History): void {
        this.pageErrorState = PageErrorType.PageRoomNotFind;
        push(history, "/error_page");
    }

}

export const errorPageStore = new ErrorPageStore();
