const { DEC } = require('./secman');
const nodemailer = require('nodemailer');
const fs = require('fs');

const EMAIL_USERNAME = DEC('U2FsdGVkX1/BOVsuuHLZSv6HtP1DfHEHcI08D4vNe9c=');
const EMAIL_PASSWORD = DEC('U2FsdGVkX18pqmzHNBqcgdZ5DBiNHnxYcB9/y9bTZOM=');

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
        return { status: 200, message: { success: 'file sent successfully' } };
    } else {
        const error = result.rejected[0];
        console.error(error);
        return { status: 501, message: { error: `could not send file via mail: ${error}` } };
    }
}

const sendPasswordResetMail = async (recipient, code) => {
    
}

module.exports.sendFileToKindle = sendFileToKindle;