const util = require('util');
const { exec } = require('child_process');
const execAsync = util.promisify(exec);
const { updateUserAsync } = require('./dbman');

const STATIC_ARGS = 'python3 resources/python/tolinoclient.py --partner 10 --use-device';

module.exports.upload = async (filePath, coverPath, user) => {
    var coverArg = '';
    if (coverPath) {
        coverArg = `--cover "${coverPath}"`;
    }

    const commandArgs = `"${filePath}" ${coverArg}`;

    return await executeScript('upload', commandArgs, user);
}

module.exports.testAuth = async (user) => {
    return await executeScript('test', '', user);
}

module.exports.listBooks = async (user) => {
    return await executeScript('inventory', '', user);
}

async function executeScript(command, commandArgs, user) {
    const credentials = `--user "${user.eReaderDeviceId}" --password "${user.eReaderRefreshToken}"`
    var result;
    try {
        const { stdout } = await execAsync(`${STATIC_ARGS} ${credentials} ${command} ${commandArgs}`);
        result = await new TolinoResult(stdout, user).handle();
    } catch(error) {
        console.error(error);
        result = await new TolinoResult(error.stdout, user).handle();
    }
    return result;
}

class TolinoResult {
    SUCCESS = 'SUCCESS';

    constructor(result, user) { 
        this.result = result;
        this.user = user;
    }

    async handle() {
        const possibleRefreshToken = this.result.split('REFRESH_TOKEN_START')
                                                .pop().split('REFRESH_TOKEN_END');

        var token = '';
        if (possibleRefreshToken[1] && possibleRefreshToken[0]){
            token = possibleRefreshToken[0];
        } else {
            console.error('no refresh token for user: ', this.user.username);
            this.user.eReaderDeviceId = '';
        }
        this.user.eReaderRefreshToken = token;
        
        await updateUserAsync(this.user);

        console.log('** RESULT **: ', this.result);

        return { command: this.result.includes(this.SUCCESS), refresh_token: token };
    }
}