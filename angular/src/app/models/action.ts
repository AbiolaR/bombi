export class Action {
    action: string = '';
    type: string = '';
    title: string = '';
    icon: string = '';

    constructor(action: string = '', type: string = '', title: string = '', icon: string = '') {
        this.action = action;
        this.type = type;
        this.title = title;
        this.icon = icon;
    }

    static Download(title: string) : Action {
        return new Action('download', 'button', title);
    } 
    
    static SendToEReader(title: string) : Action {
        return new Action('send-to-ereader', 'button', title);
    }
}