export class GroupedBook {
    md5: string;
    id: number;
    local: boolean;

    constructor(md5: string, id: number, local: boolean) {
        this.md5 = md5;
        this.id = id;
        this.local = local;
    }
}