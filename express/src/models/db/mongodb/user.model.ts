import { Contact } from "./contact.model";
import { PushSubscription } from "./push-subscription.model";

export interface User {
    save(): any;
    username: string,
    password: string,
    email: string,
    searchHistory: Map<string, string>,
    passwordResetHash: string,
    passwordResetCode: string,
    eReaderType: string,
    eReaderEmail: string,
    eReaderDeviceId: string,
    eReaderRefreshToken: string,
    language: string,
    friendRequests: string[],
    contacts: Contact[],
    pushSubscriptions: PushSubscription[],
    tsgPreferedLanguage: string,
    tsgRigidLanguage: boolean,
    tsgUsername: string,
    tsgCookies: string[],
    grPreferedLanguage: string,
    grRigidLanguage: boolean,
    grUserId: string,
    grCookies: string[]
}