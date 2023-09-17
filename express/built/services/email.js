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
var DEC = require('./secman').DEC;
var nodemailer = require('nodemailer');
var fs = require('fs');
var EMAIL_USERNAME = DEC('U2FsdGVkX1/BOVsuuHLZSv6HtP1DfHEHcI08D4vNe9c=');
var EMAIL_PASSWORD = DEC('U2FsdGVkX18pqmzHNBqcgdZ5DBiNHnxYcB9/y9bTZOM=');
var SUPPORT_SENDER = "Bombi Support <".concat(EMAIL_USERNAME, ">");
var connection = "smtps://".concat(EMAIL_USERNAME, ":").concat(EMAIL_PASSWORD, "@smtp.strato.de");
var mail = nodemailer.createTransport(connection);
/*const passwordResetTemplate = mail.templateSender({
    subject: 'Password reset requested',
    html: ''
})*/
var sendFileToKindle = function (recipient, filePath, filename) { return __awaiter(_this, void 0, void 0, function () {
    var mailOptions, result, error;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mailOptions = {
                    from: EMAIL_USERNAME,
                    to: recipient,
                    subject: 'new book',
                    text: 'new book',
                    attachments: [{
                            filename: filename,
                            path: filePath
                        }]
                };
                return [4 /*yield*/, mail.sendMail(mailOptions)];
            case 1:
                result = _a.sent();
                fs.unlinkSync(filePath);
                if (result.accepted.length > 0) {
                    return [2 /*return*/, { status: 200, message: { success: 'file sent successfully' } }];
                }
                else {
                    error = result.rejected[0];
                    console.error(error);
                    return [2 /*return*/, { status: 501, message: { error: "could not send file via mail: ".concat(error) } }];
                }
                return [2 /*return*/];
        }
    });
}); };
var sendPasswordResetMail = function (recipient, hash) { return __awaiter(_this, void 0, void 0, function () {
    var mailOptions, result, error;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mailOptions = {
                    from: SUPPORT_SENDER,
                    to: recipient,
                    subject: 'Password reset requested',
                    html: "<!DOCTYPE html>\n\n        <html lang=\"en\" xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:v=\"urn:schemas-microsoft-com:vml\">\n        <head>\n        <title></title>\n        <meta content=\"text/html; charset=utf-8\" http-equiv=\"Content-Type\"/>\n        <meta content=\"width=device-width, initial-scale=1.0\" name=\"viewport\"/>\n        <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->\n        <!--[if !mso]><!-->\n        <link href=\"https://fonts.googleapis.com/css?family=Abril+Fatface\" rel=\"stylesheet\" type=\"text/css\"/>\n        <link href=\"https://fonts.googleapis.com/css?family=Bitter\" rel=\"stylesheet\" type=\"text/css\"/>\n        <link href=\"https://fonts.googleapis.com/css?family=Cabin\" rel=\"stylesheet\" type=\"text/css\"/>\n        <link href=\"https://fonts.googleapis.com/css?family=Droid+Serif\" rel=\"stylesheet\" type=\"text/css\"/>\n        <link href=\"https://fonts.googleapis.com/css?family=Lato\" rel=\"stylesheet\" type=\"text/css\"/>\n        <link href=\"https://fonts.googleapis.com/css?family=Open+Sans\" rel=\"stylesheet\" type=\"text/css\"/>\n        <link href=\"https://fonts.googleapis.com/css?family=Roboto\" rel=\"stylesheet\" type=\"text/css\"/>\n        <link href=\"https://fonts.googleapis.com/css?family=Source+Sans+Pro\" rel=\"stylesheet\" type=\"text/css\"/>\n        <link href=\"https://fonts.googleapis.com/css?family=Merriweather\" rel=\"stylesheet\" type=\"text/css\"/>\n        <link href=\"https://fonts.googleapis.com/css?family=Montserrat\" rel=\"stylesheet\" type=\"text/css\"/>\n        <link href=\"https://fonts.googleapis.com/css?family=Nunito\" rel=\"stylesheet\" type=\"text/css\"/>\n        <!--<![endif]-->\n        <style>\n                * {\n                    box-sizing: border-box;\n                }\n        \n                body {\n                    margin: 0;\n                    padding: 0;\n                }\n        \n                a[x-apple-data-detectors] {\n                    color: inherit !important;\n                    text-decoration: inherit !important;\n                }\n        \n                #MessageViewBody a {\n                    color: inherit;\n                    text-decoration: none;\n                }\n        \n                p {\n                    line-height: inherit\n                }\n        \n                .desktop_hide,\n                .desktop_hide table {\n                    mso-hide: all;\n                    display: none;\n                    max-height: 0px;\n                    overflow: hidden;\n                }\n        \n                @media (max-width:700px) {\n                    .desktop_hide table.icons-inner {\n                        display: inline-block !important;\n                    }\n        \n                    .icons-inner {\n                        text-align: center;\n                    }\n        \n                    .icons-inner td {\n                        margin: 0 auto;\n                    }\n        \n                    .fullMobileWidth,\n                    .row-content {\n                        width: 100% !important;\n                    }\n        \n                    .mobile_hide {\n                        display: none;\n                    }\n        \n                    .stack .column {\n                        width: 100%;\n                        display: block;\n                    }\n        \n                    .mobile_hide {\n                        min-height: 0;\n                        max-height: 0;\n                        max-width: 0;\n                        overflow: hidden;\n                        font-size: 0px;\n                    }\n        \n                    .desktop_hide,\n                    .desktop_hide table {\n                        display: table !important;\n                        max-height: none !important;\n                    }\n                }\n            </style>\n        </head>\n        <body style=\"background-color: #fffbeb; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;\">\n        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"nl-container\" role=\"presentation\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fffbeb;\" width=\"100%\">\n        <tbody>\n        <tr>\n        <td>\n        <table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"row row-1\" role=\"presentation\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt;\" width=\"100%\">\n        <tbody>\n        <tr>\n        <td>\n        <table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"row-content stack\" role=\"presentation\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 680px;\" width=\"680\">\n        <tbody>\n        <tr>\n        <td class=\"column column-1\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;\" width=\"100%\">\n        <div class=\"spacer_block\" style=\"height:30px;line-height:30px;font-size:1px;\">\u200A</div>\n        </td>\n        </tr>\n        </tbody>\n        </table>\n        </td>\n        </tr>\n        </tbody>\n        </table>\n        <table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"row row-2\" role=\"presentation\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt;\" width=\"100%\">\n        <tbody>\n        <tr>\n        <td>\n        <table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"row-content stack\" role=\"presentation\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px;\" width=\"680\">\n        <tbody>\n        <tr>\n        <td class=\"column column-1\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;\" width=\"100%\">\n        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"heading_block block-1\" role=\"presentation\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt;\" width=\"100%\">\n        <tr>\n        <td class=\"pad\" style=\"text-align:center;width:100%;\">\n        <h1 style=\"margin: 0; color: #000000; direction: ltr; font-family: 'Nunito', Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 38px; font-weight: 700; letter-spacing: 7px; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0;\"><a href=\"https://bombi.tinym.de\" rel=\"noopener\" style=\"text-decoration: none; color: #000000;\" target=\"_blank\"><span class=\"tinyMce-placeholder\">BOMBI</span></a></h1>\n        </td>\n        </tr>\n        </table>\n        <table border=\"0\" cellpadding=\"15\" cellspacing=\"0\" class=\"image_block block-2\" role=\"presentation\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt;\" width=\"100%\">\n        <tr>\n        <td class=\"pad\">\n        <div align=\"center\" class=\"alignment\" style=\"line-height:10px\"><img alt=\"Resetting Password\" class=\"fullMobileWidth\" src=\"https://bombi.tinym.de/assets/images/email/password_reset.png\" style=\"display: block; height: auto; border: 0; width: 238px; max-width: 100%;\" title=\"Resetting Password\" width=\"238\"/></div>\n        </td>\n        </tr>\n        </table>\n        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"heading_block block-4\" role=\"presentation\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt;\" width=\"100%\">\n        <tr>\n        <td class=\"pad\" style=\"text-align:center;width:100%;padding-top:35px;\">\n        <h1 style=\"margin: 0; color: #101010; direction: ltr; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 27px; font-weight: normal; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0;\"><strong>Forgot Your Password?</strong></h1>\n        </td>\n        </tr>\n        </table>\n        </td>\n        </tr>\n        </tbody>\n        </table>\n        </td>\n        </tr>\n        </tbody>\n        </table>\n        <table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"row row-3\" role=\"presentation\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt;\" width=\"100%\">\n        <tbody>\n        <tr>\n        <td>\n        <table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"row-content stack\" role=\"presentation\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px;\" width=\"680\">\n        <tbody>\n        <tr>\n        <td class=\"column column-1\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;\" width=\"16.666666666666668%\">\n        <div class=\"spacer_block\" style=\"height:10px;line-height:5px;font-size:1px;\">\u200A</div>\n        </td>\n        <td class=\"column column-2\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;\" width=\"66.66666666666667%\">\n        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"text_block block-2\" role=\"presentation\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;\" width=\"100%\">\n        <tr>\n        <td class=\"pad\" style=\"padding-bottom:10px;padding-left:20px;padding-right:10px;padding-top:15px;\">\n        <div style=\"font-family: sans-serif\">\n        <div class=\"\" style=\"font-size: 12px; mso-line-height-alt: 21.6px; color: #848484; line-height: 1.8; font-family: Arial, Helvetica Neue, Helvetica, sans-serif;\">\n        <p style=\"margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 25.2px;\"><span style=\"font-size:14px;\">We received a request to reset your password.</span></p>\n        <p style=\"margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 25.2px;\"><span style=\"font-size:14px;\">If you didn't make this request, simply ignore this email.</span></p>\n        </div>\n        </div>\n        </td>\n        </tr>\n        </table>\n        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"button_block block-4\" role=\"presentation\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt;\" width=\"100%\">\n        <tr>\n        <td class=\"pad\" style=\"padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:20px;text-align:center;\">\n        <div align=\"center\" class=\"alignment\">\n        <!--[if mso]><v:roundrect xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:w=\"urn:schemas-microsoft-com:office:word\" href=\"https://bombi.tinym.de/resetPassword/".concat(hash, "\" style=\"height:44px;width:160px;v-text-anchor:middle;\" arcsize=\"10%\" strokeweight=\"0.75pt\" strokecolor=\"#673ab7\" fillcolor=\"#673ab7\"><w:anchorlock/><v:textbox inset=\"0px,0px,0px,0px\"><center style=\"color:#ffffff; font-family:Arial, sans-serif; font-size:16px\"><![endif]--><a href=\"https://bombi.tinym.de/resetPassword/").concat(hash, "\" style=\"text-decoration:none;display:inline-block;color:#ffffff;background-color:#673ab7;border-radius:4px;width:auto;border-top:1px solid transparent;font-weight:undefined;border-right:1px solid transparent;border-bottom:1px solid transparent;border-left:1px solid transparent;padding-top:5px;padding-bottom:5px;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:16px;text-align:center;mso-border-alt:none;word-break:keep-all;\" target=\"_blank\"><span style=\"padding-left:20px;padding-right:20px;font-size:16px;display:inline-block;letter-spacing:normal;\"><span dir=\"ltr\" style=\"word-break: break-word; line-height: 32px;\">Reset Password</span></span></a>\n        <!--[if mso]></center></v:textbox></v:roundrect><![endif]-->\n        </div>\n        </td>\n        </tr>\n        </table>\n        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"text_block block-5\" role=\"presentation\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;\" width=\"100%\">\n        <tr>\n        <td class=\"pad\" style=\"padding-bottom:15px;padding-left:20px;padding-right:10px;padding-top:10px;\">\n        <div style=\"font-family: sans-serif\">\n        <div class=\"\" style=\"font-size: 12px; mso-line-height-alt: 21.6px; color: #848484; line-height: 1.8; font-family: Arial, Helvetica Neue, Helvetica, sans-serif;\">\n        <p style=\"margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 21.6px;\"><span style=\"font-size:12px;\">The link is valid for up to 15 Minutes. After that it will expire and a new one will need to be requested.</span></p>\n        </div>\n        </div>\n        </td>\n        </tr>\n        </table>\n        </td>\n        <td class=\"column column-3\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;\" width=\"16.666666666666668%\">\n        <div class=\"spacer_block\" style=\"height:30px;line-height:5px;font-size:1px;\">\u200A</div>\n        </td>\n        </tr>\n        </tbody>\n        </table>\n        </td>\n        </tr>\n        </tbody>\n        </table>\n        <table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"row row-4\" role=\"presentation\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt;\" width=\"100%\">\n        <tbody>\n        <tr>\n        <td>\n        <table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"row-content stack\" role=\"presentation\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 680px;\" width=\"680\">\n        <tbody>\n        <tr>\n        <td class=\"column column-1\" style=\"mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;\" width=\"100%\">\n        <div class=\"spacer_block\" style=\"height:30px;line-height:30px;font-size:1px;\">\u200A</div>\n        </td>\n        </tr>\n        </tbody>\n        </table>\n        </td>\n        </tr>\n        </tbody>\n        </table>\n        </td>\n        </tr>\n        </tbody>\n        </table><!-- End -->\n        </body>\n        </html>")
                };
                return [4 /*yield*/, mail.sendMail(mailOptions)];
            case 1:
                result = _a.sent();
                if (result.accepted.length > 0) {
                    return [2 /*return*/, { status: 200, message: { success: 'email sent successfully' } }];
                }
                else {
                    error = result.rejected[0];
                    console.error(error);
                    return [2 /*return*/, { status: 501, message: { error: "could not send password reset mail: ".concat(error) } }];
                }
                return [2 /*return*/];
        }
    });
}); };
module.exports.sendFileToKindle = sendFileToKindle;
module.exports.sendPasswordResetMail = sendPasswordResetMail;
