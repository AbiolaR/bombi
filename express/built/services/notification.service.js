var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var webpush = require('web-push');
var DEC = require('./secman').DEC;
var PUBLIC_VAPID_KEY = DEC('U2FsdGVkX1+JGRexJOYxmSCR54O3ARSYwDLCJAA4j1xxhteugnRKVQz4htJuD5tWdROeNwgrrTmPjNAsS4rA8wRZKxoBUhiE4K6+Fe/ochmT2mcrNt8NpgTby6d0apsfrlMSb4hrRnWXve73TkDifg==');
var PRIVATE_VAPID_KEY = DEC('U2FsdGVkX1/YXXXxc3E6Nyo2diirNzQm4WJWeRO+vN682t021lVw/1eohYh4KfnefLFdSDDnS6mA1MjdWB937Q==');
var SERVER_URL = 'https://bombi.tinym.de';
webpush.setVapidDetails('https://bombi.tinym.de', PUBLIC_VAPID_KEY, PRIVATE_VAPID_KEY);
module.exports.sendPushNotifications = function (subscriptions, title, message, actions, book) {
    if (actions === void 0) { actions = []; }
    return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            subscriptions.forEach(function (subscription) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.sendPushNotification(subscription, title, message, actions, book)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
};
module.exports.sendPushNotification = function (subscription, title, message, actions, book) {
    if (actions === void 0) { actions = []; }
    return __awaiter(_this, void 0, void 0, function () {
        var data, payload;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = { type: 'BOMBI_NOTIFICATION', url: SERVER_URL };
                    if (book) {
                        data.url = "".concat(SERVER_URL, "/shared");
                        data.filename = book.filename;
                        data.md5 = book.md5;
                    }
                    payload = {
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
                    return [4 /*yield*/, webpush.sendNotification(subscription, JSON.stringify(payload))
                            .then(function () {
                            return { status: 0 };
                        })
                            .catch(function () {
                            return { status: 1, message: 'unable to send notification' };
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
