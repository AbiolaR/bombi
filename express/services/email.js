var DEC = require('./sec-man').DEC;
var nodemailer = require('nodemailer');

const EMAIL_USERNAME = DEC('U2FsdGVkX1/BOVsuuHLZSv6HtP1DfHEHcI08D4vNe9c=');
const EMAIL_PASSWORD = DEC('U2FsdGVkX18pqmzHNBqcgdZ5DBiNHnxYcB9/y9bTZOM=');

/*const mail = nodemailer.createTransport({
    smpt: { 
        host: 'smtp.strato.de',
        port: '587',
        secure: false
    },
    auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD
    }
});*/

const connection = `smtps://${EMAIL_USERNAME}:${EMAIL_PASSWORD}@smtp.strato.de`;
const mail = nodemailer.createTransport(connection);

const sendFileToKindle = (file, filename) => {
    var mailOptions = {
        from: EMAIL_USERNAME,
        to: 'nelehollmann37_ky2kbb@kindle.com',
        attachments: [{
            filename: filename,
            content: file
        }]
    }

    mail.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.warn(error);
            return {error: `could not send file via mail: ${error}`};
        } else {
            console.log('file sent successfully')
            return {success: 'file sent successfully'}
        }
    });
}

module.exports.sendFileToKindle = sendFileToKindle;