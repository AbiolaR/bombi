var cryptoJS = require('crypto-js');

const DEC = (string) => {
    if (process.env.SEC_MAN_KEY) {
        return cryptoJS.AES.decrypt(string, process.env.SEC_MAN_KEY).toString(cryptoJS.enc.Utf8);
    } else {
        console.error('No secret key environment variable set!')
    }
}

const ENC = (string) => {
    if (process.env.SEC_MAN_KEY) {
        return cryptoJS.AES.encrypt(string, process.env.SEC_MAN_KEY).toString();
    } else {
        console.error('No secret key environment variable set!')
    }
}


module.exports.ENC = ENC;
module.exports.DEC = DEC;