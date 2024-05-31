import { Contact } from "./contact.model";
import { PocketBookConfig } from "./pocketbook-config.model";
import { PushSubscription } from "./push-subscription.model";

export interface User {
    save(): any;
    username: string,
    password: string,
    role: string,
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
    tsgUseSyncTag: boolean,
    tsgUsername: string,
    tsgCookies: string[],
    grPreferedLanguage: string,
    grRigidLanguage: boolean,
    grUseSyncTag: boolean,
    grUserId: string,
    grCookies: string[],
    pocketBookConfig: PocketBookConfig
}