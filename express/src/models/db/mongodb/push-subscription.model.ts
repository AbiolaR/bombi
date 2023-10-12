import { PushSubscriptionKeys } from "./push-subscription-keys.model";

export interface PushSubscription {
    endpoint: string,
    keys: PushSubscriptionKeys,
    expirationTime: number,
}