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
var util = require('util');
var exec = require('child_process').exec;
var execAsync = util.promisify(exec);
var updateUserAsync = require('./dbman').updateUserAsync;
var STATIC_ARGS = 'python3 resources/python/tolinoclient.py --partner 10 --use-device';
module.exports.upload = function (filePath, coverPath, user) { return __awaiter(_this, void 0, void 0, function () {
    var coverArg, commandArgs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                coverArg = '';
                if (coverPath) {
                    coverArg = "--cover ".concat(coverPath);
                }
                commandArgs = "".concat(filePath, " ").concat(coverArg);
                return [4 /*yield*/, executeScript('upload', commandArgs, user)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
module.exports.testAuth = function (user) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, executeScript('test', '', user)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
function executeScript(command, commandArgs, user) {
    return __awaiter(this, void 0, void 0, function () {
        var credentials, result, stdout, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    credentials = "--user ".concat(user.eReaderDeviceId, " --password ").concat(user.eReaderRefreshToken);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 6]);
                    return [4 /*yield*/, execAsync("".concat(STATIC_ARGS, " ").concat(credentials, " ").concat(command, " ").concat(commandArgs))];
                case 2:
                    stdout = (_a.sent()).stdout;
                    return [4 /*yield*/, new TolinoResult(stdout, user).handle()];
                case 3:
                    result = _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [4 /*yield*/, new TolinoResult(error_1.stderr, user).handle()];
                case 5:
                    result = _a.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/, result];
            }
        });
    });
}
var TolinoResult = /** @class */ (function () {
    function TolinoResult(result, user) {
        this.SUCCESS = 'SUCCESS\n';
        this.result = result;
        this.user = user;
    }
    TolinoResult.prototype.handle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var possibleRefreshToken, token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        possibleRefreshToken = this.result.split('REFRESH_TOKEN_START')
                            .pop().split('REFRESH_TOKEN_END');
                        if (!(possibleRefreshToken[1] && possibleRefreshToken[0])) return [3 /*break*/, 2];
                        this.user.eReaderRefreshToken = possibleRefreshToken[0];
                        return [4 /*yield*/, updateUserAsync(this.user)];
                    case 1:
                        _a.sent();
                        token = possibleRefreshToken[0];
                        return [3 /*break*/, 3];
                    case 2:
                        console.error('no refresh token for user: ', this.user.username);
                        _a.label = 3;
                    case 3: return [2 /*return*/, { command: this.result.endsWith(this.SUCCESS), refresh_token: token }];
                }
            });
        });
    };
    return TolinoResult;
}());
