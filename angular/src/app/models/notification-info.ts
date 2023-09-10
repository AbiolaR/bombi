import { Action } from "./action";

export class NotificationInfo {
    title: string = '';
    message: string = '';
    actions: Action[] = [];

    constructor(title: string = '', message: string = '', actions: Action[] = []) {
        this.title = title;
        this.message = message;
        this.actions = actions;
    }
}