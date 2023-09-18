var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const webpush = require('web-push');
const { DEC } = require('./secman');
const PUBLIC_VAPID_KEY = DEC('U2FsdGVkX1+JGRexJOYxmSCR54O3ARSYwDLCJAA4j1xxhteugnRKVQz4htJuD5tWdROeNwgrrTmPjNAsS4rA8wRZKxoBUhiE4K6+Fe/ochmT2mcrNt8NpgTby6d0apsfrlMSb4hrRnWXve73TkDifg==');
const PRIVATE_VAPID_KEY = DEC('U2FsdGVkX1/YXXXxc3E6Nyo2diirNzQm4WJWeRO+vN682t021lVw/1eohYh4KfnefLFdSDDnS6mA1MjdWB937Q==');
const SERVER_URL = 'https://bombi.tinym.de';
webpush.setVapidDetails('https://bombi.tinym.de', PUBLIC_VAPID_KEY, PRIVATE_VAPID_KEY);
module.exports.sendPushNotifications = (subscriptions, title, message, actions = [], book) => __awaiter(this, void 0, void 0, function* () {
    subscriptions.forEach((subscription) => __awaiter(this, void 0, void 0, function* () {
        yield this.sendPushNotification(subscription, title, message, actions, book);
    }));
});
module.exports.sendPushNotification = (subscription, title, message, actions = [], book) => __awaiter(this, void 0, void 0, function* () {
    let data = { type: 'BOMBI_NOTIFICATION', url: SERVER_URL };
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
    yield webpush.sendNotification(subscription, JSON.stringify(payload))
        .then(() => {
        return { status: 0 };
    })
        .catch(() => {
        return { status: 1, message: 'unable to send notification' };
    });
});
