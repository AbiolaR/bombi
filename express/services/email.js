const { DEC } = require('./secman');
const nodemailer = require('nodemailer');
const fs = require('fs');

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

const sendFileToKindle = async (recipient, filePath, filename) => {
    var mailOptions = {
        from: EMAIL_USERNAME,
        to: recipient,
        subject: 'new book',
        text: 'new book',
        attachments: [{
            filename: filename,
            path: filePath
        }]
    }

    var result = await mail.sendMail(mailOptions);
    fs.unlinkSync(filePath);
    if (result.accepted.length > 0) {
        console.log('file sent successfully')
        return {success: 'file sent successfully'};
    } else {
        const error = result.rejected[0];
        console.warn(error);
        fs.unlinkSync(filePath);
        return {error: `could not send file via mail: ${error}`};
    }
}

module.exports.sendFileToKindle = sendFileToKindle;