export class ServerResponse<Type> {
    status: number;
    message: string;
    data: Type;

    constructor(data: Type = undefined, status: number = 0, message: string = '') {
        this.data = data;
        this.status = status;
        this.message = message;
    }
}