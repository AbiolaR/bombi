var cryptoJS = require('crypto-js');

module.exports.DEC = (string) => {
    if (process.env.SEC_MAN_KEY) {
        return cryptoJS.AES.decrypt(string, process.env.SEC_MAN_KEY).toString(cryptoJS.enc.Utf8);
    } else {
        console.error('No secret key environment variable set!')
    }
}

module.exports.ENC = (string) => {
    if (process.env.SEC_MAN_KEY) {
        return cryptoJS.AES.encrypt(string, process.env.SEC_MAN_KEY).toString();
    } else {
        console.error('No secret key environment variable set!')
    }
}

module.exports.TOKEN_SECRET = this.DEC('U2FsdGVkX185sh04QOyoMo9x7PA+XefduAbYokB587mDMQzOOU+ldqyqt6/Xvx7A');