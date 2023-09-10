export interface ServerResponse<Type> {
    status: number,
    message: string,
    data: Type
}