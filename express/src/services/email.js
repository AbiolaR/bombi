const { DEC } = require('./secman');
const nodemailer = require('nodemailer');
const fs = require('fs');
const { compressEpubAsync } = require('./tools');

const EMAIL_USERNAME = DEC('U2FsdGVkX1/BOVsuuHLZSv6HtP1DfHEHcI08D4vNe9c=');
const EMAIL_PASSWORD = DEC('U2FsdGVkX18pqmzHNBqcgdZ5DBiNHnxYcB9/y9bTZOM=');
const SUPPORT_SENDER = `Bombi Support <${EMAIL_USERNAME}>`;

const config = {
    host: 'smtp.strato.de',
    port: 465,
    secure: true,
    auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD
    }
};

const mail = nodemailer.createTransport(config);

const MAX_SIZE_BYTES = 52428800;

const sendFileViaEmail = async (recipient, filePath, filename) => {
    if(fs.statSync(filePath).size > MAX_SIZE_BYTES) {
        filePath = await compressEpubAsync(filePath);
    }

    let bookName = filename.split('.').shift();
    
    var mailOptions = {
        from: EMAIL_USERNAME,
        to: recipient,
        subject: bookName,
        text: `Enjoy reading ${bookName}`,
        html: `Enjoy reading <b>${bookName}</b>`,
        attachments: [{
            filename: filename,
            path: filePath
        }]
    }

    var result = await mail.sendMail(mailOptions);
    
    if (result.accepted.length > 0) {
        return { status: 200, message: { success: 'file sent successfully' } };
    } else {
        const error = result.rejected[0];
        console.error(error);
        return { status: 501, message: { error: `could not send file via mail: ${error}` } };
    }
}

const sendPasswordResetMail = async (recipient, hash) => {
    var mailOptions = {
        from: SUPPORT_SENDER,
        to: recipient,
        subject: 'Password reset requested',
        html: `<!DOCTYPE html>

        <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
        <head>
        <title></title>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
        <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
        <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
        <!--[if !mso]><!-->
        <link href="https://fonts.googleapis.com/css?family=Abril+Fatface" rel="stylesheet" type="text/css"/>
        <link href="https://fonts.googleapis.com/css?family=Bitter" rel="stylesheet" type="text/css"/>
        <link href="https://fonts.googleapis.com/css?family=Cabin" rel="stylesheet" type="text/css"/>
        <link href="https://fonts.googleapis.com/css?family=Droid+Serif" rel="stylesheet" type="text/css"/>
        <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" type="text/css"/>
        <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" type="text/css"/>
        <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css"/>
        <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro" rel="stylesheet" type="text/css"/>
        <link href="https://fonts.googleapis.com/css?family=Merriweather" rel="stylesheet" type="text/css"/>
        <link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet" type="text/css"/>
        <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet" type="text/css"/>
        <!--<![endif]-->
        <style>
                * {
                    box-sizing: border-box;
                }
        
                body {
                    margin: 0;
                    padding: 0;
                }
        
                a[x-apple-data-detectors] {
                    color: inherit !important;
                    text-decoration: inherit !important;
                }
        
                #MessageViewBody a {
                    color: inherit;
                    text-decoration: none;
                }
        
                p {
                    line-height: inherit
                }
        
                .desktop_hide,
                .desktop_hide table {
                    mso-hide: all;
                    display: none;
                    max-height: 0px;
                    overflow: hidden;
                }
        
                @media (max-width:700px) {
                    .desktop_hide table.icons-inner {
                        display: inline-block !important;
                    }
        
                    .icons-inner {
                        text-align: center;
                    }
        
                    .icons-inner td {
                        margin: 0 auto;
                    }
        
                    .fullMobileWidth,
                    .row-content {
                        width: 100% !important;
                    }
        
                    .mobile_hide {
                        display: none;
                    }
        
                    .stack .column {
                        width: 100%;
                        display: block;
                    }
        
                    .mobile_hide {
                        min-height: 0;
                        max-height: 0;
                        max-width: 0;
                        overflow: hidden;
                        font-size: 0px;
                    }
        
                    .desktop_hide,
                    .desktop_hide table {
                        display: table !important;
                        max-height: none !important;
                    }
                }
            </style>
        </head>
        <body style="background-color: #fffbeb; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fffbeb;" width="100%">
        <tbody>
        <tr>
        <td>
        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tbody>
        <tr>
        <td>
        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 680px;" width="680">
        <tbody>
        <tr>
        <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
        <div class="spacer_block" style="height:30px;line-height:30px;font-size:1px;"> </div>
        </td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        </tbody>
        </table>
        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tbody>
        <tr>
        <td>
        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px;" width="680">
        <tbody>
        <tr>
        <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
        <table border="0" cellpadding="0" cellspacing="0" class="heading_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tr>
        <td class="pad" style="text-align:center;width:100%;">
        <h1 style="margin: 0; color: #000000; direction: ltr; font-family: 'Nunito', Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 38px; font-weight: 700; letter-spacing: 7px; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0;"><a href="https://bombi.tinym.de" rel="noopener" style="text-decoration: none; color: #000000;" target="_blank"><span class="tinyMce-placeholder">BOMBI</span></a></h1>
        </td>
        </tr>
        </table>
        <table border="0" cellpadding="15" cellspacing="0" class="image_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tr>
        <td class="pad">
        <div align="center" class="alignment" style="line-height:10px"><img alt="Resetting Password" class="fullMobileWidth" src="https://bombi.tinym.de/assets/images/email/password_reset.png" style="display: block; height: auto; border: 0; width: 238px; max-width: 100%;" title="Resetting Password" width="238"/></div>
        </td>
        </tr>
        </table>
        <table border="0" cellpadding="0" cellspacing="0" class="heading_block block-4" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tr>
        <td class="pad" style="text-align:center;width:100%;padding-top:35px;">
        <h1 style="margin: 0; color: #101010; direction: ltr; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 27px; font-weight: normal; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0;"><strong>Forgot Your Password?</strong></h1>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        </tbody>
        </table>
        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tbody>
        <tr>
        <td>
        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px;" width="680">
        <tbody>
        <tr>
        <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="16.666666666666668%">
        <div class="spacer_block" style="height:10px;line-height:5px;font-size:1px;"> </div>
        </td>
        <td class="column column-2" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="66.66666666666667%">
        <table border="0" cellpadding="0" cellspacing="0" class="text_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
        <tr>
        <td class="pad" style="padding-bottom:10px;padding-left:20px;padding-right:10px;padding-top:15px;">
        <div style="font-family: sans-serif">
        <div class="" style="font-size: 12px; mso-line-height-alt: 21.6px; color: #848484; line-height: 1.8; font-family: Arial, Helvetica Neue, Helvetica, sans-serif;">
        <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 25.2px;"><span style="font-size:14px;">We received a request to reset your password.</span></p>
        <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 25.2px;"><span style="font-size:14px;">If you didn't make this request, simply ignore this email.</span></p>
        </div>
        </div>
        </td>
        </tr>
        </table>
        <table border="0" cellpadding="0" cellspacing="0" class="button_block block-4" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tr>
        <td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:20px;text-align:center;">
        <div align="center" class="alignment">
        <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://bombi.tinym.de/resetPassword/${hash}" style="height:44px;width:160px;v-text-anchor:middle;" arcsize="10%" strokeweight="0.75pt" strokecolor="#673ab7" fillcolor="#673ab7"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:16px"><![endif]--><a href="https://bombi.tinym.de/resetPassword/${hash}" style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#673ab7;border-radius:4px;width:auto;border-top:1px solid transparent;font-weight:undefined;border-right:1px solid transparent;border-bottom:1px solid transparent;border-left:1px solid transparent;padding-top:5px;padding-bottom:5px;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:16px;text-align:center;mso-border-alt:none;word-break:keep-all;" target="_blank"><span style="padding-left:20px;padding-right:20px;font-size:16px;display:inline-block;letter-spacing:normal;"><span dir="ltr" style="word-break: break-word; line-height: 32px;">Reset Password</span></span></a>
        <!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
        </div>
        </td>
        </tr>
        </table>
        <table border="0" cellpadding="0" cellspacing="0" class="text_block block-5" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
        <tr>
        <td class="pad" style="padding-bottom:15px;padding-left:20px;padding-right:10px;padding-top:10px;">
        <div style="font-family: sans-serif">
        <div class="" style="font-size: 12px; mso-line-height-alt: 21.6px; color: #848484; line-height: 1.8; font-family: Arial, Helvetica Neue, Helvetica, sans-serif;">
        <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 21.6px;"><span style="font-size:12px;">The link is valid for up to 15 Minutes. After that it will expire and a new one will need to be requested.</span></p>
        </div>
        </div>
        </td>
        </tr>
        </table>
        </td>
        <td class="column column-3" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="16.666666666666668%">
        <div class="spacer_block" style="height:30px;line-height:5px;font-size:1px;"> </div>
        </td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        </tbody>
        </table>
        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-4" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tbody>
        <tr>
        <td>
        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 680px;" width="680">
        <tbody>
        <tr>
        <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
        <div class="spacer_block" style="height:30px;line-height:30px;font-size:1px;"> </div>
        </td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        </tbody>
        </table><!-- End -->
        </body>
        </html>`
    }
    
    var result = await mail.sendMail(mailOptions);
    if (result.accepted.length > 0) {
        return { status: 200, message: { success: 'email sent successfully' } };
    } else {
        const error = result.rejected[0];
        console.error(error);
        return { status: 501, message: { error: `could not send password reset mail: ${error}` } };
    }
}

module.exports.sendFileViaEmail = sendFileViaEmail;
module.exports.sendPasswordResetMail = sendPasswordResetMail;