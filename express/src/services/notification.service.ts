import { Book } from "../models/db/mongodb/book.model";
import { PushSubscription } from "../models/db/mongodb/push-subscription.model";
import webpush from 'web-push';
import { DEC } from './secman';

const PUBLIC_VAPID_KEY = DEC('U2FsdGVkX1+JGRexJOYxmSCR54O3ARSYwDLCJAA4j1xxhteugnRKVQz4htJuD5tWdROeNwgrrTmPjNAsS4rA8wRZKxoBUhiE4K6+Fe/ochmT2mcrNt8NpgTby6d0apsfrlMSb4hrRnWXve73TkDifg==');
const PRIVATE_VAPID_KEY = DEC('U2FsdGVkX1/YXXXxc3E6Nyo2diirNzQm4WJWeRO+vN682t021lVw/1eohYh4KfnefLFdSDDnS6mA1MjdWB937Q==');
const SERVER_URL = 'https://bombi.tinym.de';

webpush.setVapidDetails('https://bombi.tinym.de', PUBLIC_VAPID_KEY, PRIVATE_VAPID_KEY);

export async function sendPushNotifications(subscriptions: PushSubscription[], title: string, 
message: string, actions: any = [], book: Book = undefined) {
    subscriptions.forEach(async subscription => {
        await sendPushNotification(subscription, title, message, actions, book);
    });
}

export async function sendPushNotification(subscription: PushSubscription, title: string, 
message: string, actions: any = [], book: Book) {
    let data = { type: 'BOMBI_NOTIFICATION', url: SERVER_URL, filename: undefined, md5: undefined };
    if (book) {
        data.url = `${SERVER_URL}/shared`;
        data.filename = book.filename;
        data.md5 = book.md5;
    }
    const payload = {
        'notification': {
            'title': title,
            'body': message,
            'icon': 'https://bombi.tinym.de/assets/images/icons/bombi-icon.png',
            'badge': 'https://bombi.tinym.de/assets/images/icons/bombi-icon-monochrome.png',
            'urgency': 'high',
            'vibrate': [100, 50, 100],
            'data': data,
            'actions': actions
        }
    };

    await webpush.sendNotification(subscription, JSON.stringify(payload))
    .then(() => {
        return { status: 0 };
    })
    .catch(() => {
        return { status: 1, message: 'unable to send notification' };
    });
}