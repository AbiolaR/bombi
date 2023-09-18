var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const util = require('util');
const { exec } = require('child_process');
const execAsync = util.promisify(exec);
const { updateUserAsync } = require('./dbman');
const STATIC_ARGS = 'python3 resources/python/tolinoclient.py --partner 10 --use-device';
module.exports.upload = (filePath, coverPath, user) => __awaiter(this, void 0, void 0, function* () {
    var coverArg = '';
    if (coverPath) {
        coverArg = `--cover ${coverPath}`;
    }
    const commandArgs = `${filePath} ${coverArg}`;
    return yield executeScript('upload', commandArgs, user);
});
module.exports.testAuth = (user) => __awaiter(this, void 0, void 0, function* () {
    return yield executeScript('test', '', user);
});
function executeScript(command, commandArgs, user) {
    return __awaiter(this, void 0, void 0, function* () {
        const credentials = `--user ${user.eReaderDeviceId} --password ${user.eReaderRefreshToken}`;
        var result;
        try {
            const { stdout } = yield execAsync(`${STATIC_ARGS} ${credentials} ${command} ${commandArgs}`);
            result = yield new TolinoResult(stdout, user).handle();
        }
        catch (error) {
            console.error(error);
            result = yield new TolinoResult(error.stderr, user).handle();
        }
        return result;
    });
}
class TolinoResult {
    constructor(result, user) {
        this.SUCCESS = 'SUCCESS\n';
        this.result = result;
        this.user = user;
    }
    handle() {
        return __awaiter(this, void 0, void 0, function* () {
            const possibleRefreshToken = this.result.split('REFRESH_TOKEN_START')
                .pop().split('REFRESH_TOKEN_END');
            var token;
            if (possibleRefreshToken[1] && possibleRefreshToken[0]) {
                this.user.eReaderRefreshToken = possibleRefreshToken[0];
                yield updateUserAsync(this.user);
                token = possibleRefreshToken[0];
            }
            else {
                console.error('no refresh token for user: ', this.user.username);
            }
            return { command: this.result.endsWith(this.SUCCESS), refresh_token: token };
        });
    }
}
