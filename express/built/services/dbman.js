var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var mongoose = require('mongoose');
var DEC = require('./secman').DEC;
var ENV = process.env.STAGE == 'prod' ? 'Prod' : 'Test';
var USERNAME;
var PASSWORD;
if (ENV == 'Prod') {
    USERNAME = DEC('U2FsdGVkX1/Jrs54r5J/aCJxlgDaGxCSGf4KYvIm+dU=');
    PASSWORD = DEC('U2FsdGVkX18KcCln+9q3P4lmjRN5Sz+NbBhza89fyFhcCooVGRhWsBVHvlEQIfjQ1VE7kmMZWPl9LLYmcD4DLw==');
}
else {
    USERNAME = DEC('U2FsdGVkX19RvYn9V3O/iHHG66d6vdHVQIFs9UB5ItM=');
    PASSWORD = DEC('U2FsdGVkX1/7pbFBpu1QpLGKmysIK+wsMAInfucrtU7ZV7a7sez3MhktwNr5gV0z');
}
var CONNECTION_URL = "mongodb://".concat(USERNAME, ":").concat(PASSWORD, "@192.168.2.101:27017/bombi").concat(ENV, "DB?authMechanism=DEFAULT");
mongoose.connect(CONNECTION_URL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var PushSubscriptionKeysSchema = mongoose.Schema({
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
});
var PushSubscriptionSchema = mongoose.Schema({
    endpoint: { type: String, required: true },
    keys: { type: PushSubscriptionKeysSchema, required: true },
    expirationTime: Number,
});
var BookSchema = mongoose.Schema({
    editionId: { type: Number, required: true },
    title: { type: String, required: true },
    md5: { type: String, required: true },
    filename: { type: String, required: true },
    author: String,
    language: String,
    coverUrl: String,
    isbn: Number
});
var ContactSchema = mongoose.Schema({
    name: { type: String, required: true },
    unreadMessages: Number,
    sharedBooks: [BookSchema]
});
var UserSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    searchHistory: { type: Map, of: String, required: true },
    passwordResetHash: { type: String, required: false },
    passwordResetCode: { type: String, required: false },
    eReaderType: { type: String, required: true },
    eReaderEmail: String,
    eReaderDeviceId: String,
    eReaderRefreshToken: String,
    language: String,
    friendRequests: [String],
    contacts: [ContactSchema],
    pushSubscriptions: [PushSubscriptionSchema],
    tsgUsername: String,
    tsgCookies: [String],
    grUserId: String,
    grCookies: [String]
});
var User = mongoose.model('User', UserSchema);
module.exports.findUser = function (username, callback) {
    User.findOne({ username: username }, function (err, user) {
        if (callback) {
            if (err)
                callback(err);
            callback(user);
        }
    }).collation({ locale: 'de', strength: 2 });
};
module.exports.findUserAsync = function (username) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, User.findOne({ username: username }).collation({ locale: 'de', strength: 2 })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
module.exports.findUserByHash = function (hash, callback) {
    User.findOne({ passwordResetHash: hash }, function (err, user) {
        if (callback) {
            if (err)
                callback(err);
            callback(user);
        }
    });
};
module.exports.findUserByHashAsync = function (hash) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, User.findOne({ passwordResetHash: hash })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
module.exports.findUserByUsernameAndCode = function (username, code, callback) {
    User.findOne({ username: username, passwordResetCode: code(__makeTemplateObject([""], [""])) }, function (err, user) {
        if (callback) {
            if (err)
                callback(err);
            callback(user);
        }
    });
};
module.exports.findUserByUsernameAndCode = function (username, code) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, User.findOne({ username: username, passwordResetCode: code })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
module.exports.createUser = function (user, callback) {
    new User(user).save(function (err) {
        if (err)
            callback(err);
        callback('saved user succesfully');
    });
};
module.exports.updateUser = function (userdata, callback) {
    User.findOneAndUpdate({ username: userdata.username }, userdata, function (err, user) {
        if (err)
            callback(err);
        callback(user);
    });
};
module.exports.updateUserAsync = function (userdata) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, User.findOneAndUpdate({ username: userdata.username }, userdata)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
