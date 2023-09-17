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
var express = require('express');
var router = express.Router();
var axios = require('axios');
var mailservice = require('../services/email');
var findUserAsync = require('../services/dbman').findUserAsync;
var _a = require('../services/tolinoman'), upload = _a.upload, testAuth = _a.testAuth;
var jsdom = require('jsdom');
var _b = require('../services/tools'), saveToDiskAsync = _b.saveToDiskAsync, convertToMobiAsync = _b.convertToMobiAsync, getSpellingCorrection = _b.getSpellingCorrection;
var LIBGEN_MIRROR = process.env.LIBGEN_MIRROR || 'https://libgen.rocks';
/* GET users listing. */
router.get('/search', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var searchString, pageNumber, mobile, bookData, _a, _b, error_1, error_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                searchString = req.query.q;
                pageNumber = req.query.p;
                mobile = req.query.m;
                if (!searchString) {
                    res.json({ error: "No search query given" });
                    return [2 /*return*/];
                }
                bookData = { books: [], suggestion: '' };
                _c.label = 1;
            case 1:
                _c.trys.push([1, 9, , 10]);
                if (!(process.env.STAGE == 'prod' || process.env.STAGE == 'staging')) return [3 /*break*/, 7];
                _a = bookData;
                return [4 /*yield*/, search(searchString, pageNumber, mobile)];
            case 2:
                _a.books = _c.sent();
                if (!(bookData.books.length == 0)) return [3 /*break*/, 6];
                _c.label = 3;
            case 3:
                _c.trys.push([3, 5, , 6]);
                _b = bookData;
                return [4 /*yield*/, getSpellingCorrection(searchString)];
            case 4:
                _b.suggestion = _c.sent();
                return [3 /*break*/, 6];
            case 5:
                error_1 = _c.sent();
                console.warn('Error while getting spelling correction: ' + error_1);
                return [3 /*break*/, 6];
            case 6: return [3 /*break*/, 8];
            case 7:
                bookData.books = [];
                bookData.suggestion = 'tiger at midnight';
                if (searchString == 'tiger at midnight') {
                    bookData.books = [{ book_id: '6030060', md5: '4f67f6509a61dc38168d146626f5702d', title: 'The Straw Doll Cries at Midnight', author: 'Lincoln, K Bird', year: '2017', language: 'eng', filesize: '523087', extension: 'epub', edition_id: '5767010', isbn: undefined, filename: 'The Straw Doll Cries at Midnight.epub', cover_url: '/fictioncovers/2005000/4f67f6509a61dc38168d146626f5702d_small.jpg' }, { book_id: '6473323', md5: 'eb36babdfbcac07115e720e03b765016', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati ', year: '2019', language: 'eng', filesize: '1725912', extension: 'epub', edition_id: '6224539', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', cover_url: '/fictioncovers/2463000/eb36babdfbcac07115e720e03b765016_small.jpg' }, { book_id: '6618889', md5: '8e3036af66cec7e882eff27d61c8ed0c', title: 'The archer at dawn', author: 'Teerdhala, Swati ', year: '2020', language: 'eng', filesize: '2927549', extension: 'epub', edition_id: '6370207', isbn: '0062869248', filename: 'The archer at dawn.epub', cover_url: '/fictioncovers/2609000/8e3036af66cec7e882eff27d61c8ed0c_small.jpg' }, { book_id: '96705404', md5: '36eecaf2700a96aba3ba61ac12412033', title: 'The Tiger at Midnight', author: 'Swati Teerdhala', year: '2019', language: 'eng', filesize: '637882', extension: 'epub', edition_id: '140688051', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', cover_url: '/img/blank.png' }, { book_id: '96705405', md5: '4dd1421ad88a222c03ff147be5026098', title: 'The Chariot at Dusk', author: 'Swati Teerdhala', year: '2021', language: 'eng', filesize: '5838101', extension: 'epub', edition_id: '140688052', isbn: '9780062869296', filename: 'The Chariot at Dusk.epub', cover_url: '/img/blank.png' }, { book_id: '96705406', md5: 'af55cd1cfbbaf2dc6d82e662700ab920', title: 'The Archer at Dawn ', author: 'Teerdhala, Swati', year: '2020', language: 'eng', filesize: '678970', extension: 'epub', edition_id: '140688053', isbn: '0062869248', filename: 'The Archer at Dawn .epub', cover_url: '/img/blank.png' }, { book_id: '96924857', md5: '67b5c78e8e6bad9d602f59c0dba9b150', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati', year: '2019', language: 'eng', filesize: '2035502', extension: 'epub', edition_id: '140893528', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', cover_url: '/fictioncovers/2922000/67b5c78e8e6bad9d602f59c0dba9b150_small.jpg' }, { book_id: '96924858', md5: 'b218d9e47c09375f25d3fccd9bf66162', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati', year: '2019', language: 'eng', filesize: '1725939', extension: 'epub', edition_id: '140893529', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', cover_url: '/fictioncovers/2922000/b218d9e47c09375f25d3fccd9bf66162_small.jpg' }, { book_id: '98748789', md5: 'bd5129568653dd1bc01ef90fc8c03039', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati ', year: '2019', language: 'eng', filesize: '1725912', extension: 'epub', edition_id: '6224539', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', cover_url: '/fictioncovers/3905000/bd5129568653dd1bc01ef90fc8c03039_small.jpg' }, { book_id: '98866937', md5: 'fd605dd50887f678693bbf508e20b8ff', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati ', year: '2019', language: 'eng', filesize: '2028188', extension: 'epub', edition_id: '6224539', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', cover_url: '/fictioncovers/4023000/fd605dd50887f678693bbf508e20b8ff_small.jpg' }, { book_id: '100071444', md5: '5b5a9760600c151add11265c1129e7c7', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati', year: '2019', language: 'eng', filesize: '637879', extension: 'epub', edition_id: '143821468', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', cover_url: '/fictioncovers/4667000/5b5a9760600c151add11265c1129e7c7_small.jpg' }, { book_id: '102098014', md5: '058be4b3507e1d7f254493ecaff29f4c', title: 'The Archer at Dawn', author: 'Teerdhala, Swati', year: '2020', language: 'eng', filesize: '1324292', extension: 'epub', edition_id: '145848715', isbn: '0062869248', filename: 'The Archer at Dawn.epub', cover_url: '/fictioncovers/6159000/058be4b3507e1d7f254493ecaff29f4c_small.jpg' }];
                }
                _c.label = 8;
            case 8: return [3 /*break*/, 10];
            case 9:
                error_2 = _c.sent();
                console.error(error_2);
                return [3 /*break*/, 10];
            case 10:
                res.json(bookData);
                return [2 /*return*/];
        }
    });
}); });
router.get('/download', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var md5Hash, url, book;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                md5Hash = req.query.md5;
                url = req.query.url;
                if (!md5Hash && !url) {
                    res.json({ error: "No md5 hash or url given" });
                    return [2 /*return*/];
                }
                book = { error: 'book init' };
                if (!md5Hash) return [3 /*break*/, 2];
                return [4 /*yield*/, downloadWithMD5(md5Hash)];
            case 1:
                book = _a.sent();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, downloadWithUrl(url)];
            case 3:
                book = _a.sent();
                _a.label = 4;
            case 4:
                try {
                    book.file.pipe(res);
                    res.set('Content-disposition', 'attachment; filename=book.epub');
                    res.set('Content-Type', 'application/octet-stream');
                }
                catch (error) {
                    console.error(error);
                    console.error(book.error);
                    res.json(book.error);
                }
                return [2 /*return*/];
        }
    });
}); });
router.post('/send', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var md5Hash, url, filename, book, user, result, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                md5Hash = req.body.md5;
                url = req.body.url;
                filename = req.body.filename;
                if (!md5Hash && !url) {
                    res.json({ error: "No md5 hash or url given" });
                    return [2 /*return*/];
                }
                if (!filename) {
                    res.json({ error: "No filename given" });
                    return [2 /*return*/];
                }
                if (!md5Hash) return [3 /*break*/, 2];
                return [4 /*yield*/, downloadWithMD5(md5Hash)];
            case 1:
                book = _b.sent();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, downloadWithUrl(url)];
            case 3:
                book = _b.sent();
                _b.label = 4;
            case 4: return [4 /*yield*/, findUserAsync(req.body.username)];
            case 5:
                user = _b.sent();
                if (!user) {
                    res.status(404).send('no user could be found');
                }
                result = {};
                _a = user.eReaderType;
                switch (_a) {
                    case 'K': return [3 /*break*/, 6];
                    case 'T': return [3 /*break*/, 8];
                }
                return [3 /*break*/, 10];
            case 6: return [4 /*yield*/, sendFileToKindle(user.eReaderEmail, book.file, filename)];
            case 7:
                result = _b.sent();
                return [3 /*break*/, 11];
            case 8: return [4 /*yield*/, sendFileToTolino(book, filename, user)];
            case 9:
                result = _b.sent();
                return [3 /*break*/, 11];
            case 10:
                result = { status: 501, error: "no eReader value set on user ".concat(user.username) };
                return [3 /*break*/, 11];
            case 11:
                res.status(result.status).send(result.message);
                return [2 /*return*/];
        }
    });
}); });
router.post('/tolino/test', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var eReaderDeviceId, eReaderRefreshToken, username, user, user, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                eReaderDeviceId = req.body.eReaderDeviceId;
                eReaderRefreshToken = req.body.eReaderRefreshToken;
                username = req.body.username;
                if (!username) return [3 /*break*/, 2];
                return [4 /*yield*/, findUserAsync(req.body.username)];
            case 1:
                user = _a.sent();
                if (!user) {
                    res.status(404).send('no user could be found');
                }
                eReaderDeviceId = user.eReaderDeviceId;
                eReaderRefreshToken = user.eReaderRefreshToken;
                _a.label = 2;
            case 2:
                user = { username: username, eReaderDeviceId: eReaderDeviceId,
                    eReaderRefreshToken: eReaderRefreshToken };
                return [4 /*yield*/, testAuth(user)];
            case 3:
                result = _a.sent();
                if (result.command && result.refresh_token) {
                    res.send({ refresh_token: result.refresh_token });
                }
                else {
                    res.status(401).send();
                }
                return [2 /*return*/];
        }
    });
}); });
function sendFileToKindle(recipient, data, filename) {
    return __awaiter(this, void 0, void 0, function () {
        var file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, convertToMobiAsync(data, filename)];
                case 1:
                    file = _a.sent();
                    if (!file.path)
                        return [2 /*return*/];
                    return [4 /*yield*/, mailservice.sendFileToKindle(recipient, file.path, file.name)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function sendFileToTolino(book, filename, user) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, coverPath, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, saveToDiskAsync(book.file, filename)];
                case 1:
                    filePath = _a.sent();
                    if (!book.cover.file) return [3 /*break*/, 3];
                    return [4 /*yield*/, saveToDiskAsync(book.cover.file, book.cover.name)];
                case 2:
                    coverPath = _a.sent();
                    _a.label = 3;
                case 3: return [4 /*yield*/, upload(filePath, coverPath, user)];
                case 4:
                    result = _a.sent();
                    if (result.command && result.refresh_token) {
                        return [2 /*return*/, { status: 200, message: { success: 'file sent to tolino' } }];
                    }
                    else {
                        return [2 /*return*/, { status: 501, message: { error: 'file not sent to tolino' } }];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function downloadWithUrl(url) {
    return __awaiter(this, void 0, void 0, function () {
        var request, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, axios.get(url, {
                            responseType: 'stream',
                        })];
                case 1:
                    request = _b.sent();
                    _a = {};
                    return [4 /*yield*/, request.data];
                case 2: return [2 /*return*/, (_a.file = _b.sent(), _a.cover = {}, _a)];
                case 3:
                    err_1 = _b.sent();
                    return [2 /*return*/, { error: "book download failed using url: ".concat(url, " |=| ").concat(err_1) }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function downloadWithMD5(md5Hash) {
    return __awaiter(this, void 0, void 0, function () {
        var config, result, page, regexDownloadURL, regexCoverUrl, downloadURL, ebook, request, err_2, coverUrl, cover, book, coverName, request, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = {
                        method: 'get',
                        url: "".concat(LIBGEN_MIRROR, "/get.php?md5=").concat(md5Hash),
                    };
                    return [4 /*yield*/, axios(config)];
                case 1:
                    result = _a.sent();
                    return [4 /*yield*/, result.data];
                case 2:
                    page = _a.sent();
                    regexDownloadURL = new RegExp(/(?<=href=")(.*)(?="><h2>GET<)/g);
                    regexCoverUrl = new RegExp(/(?<="><img src="\/)(.*)(?=")/g);
                    downloadURL = '';
                    try {
                        downloadURL = page.match(regexDownloadURL).toString();
                    }
                    catch (err) {
                        return [2 /*return*/, { error: "error while fetching book download url: ".concat(err) }];
                    }
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, axios.get("".concat(LIBGEN_MIRROR, "/").concat(downloadURL), {
                            responseType: 'stream',
                        })];
                case 4:
                    request = _a.sent();
                    return [4 /*yield*/, request.data];
                case 5:
                    ebook = _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    err_2 = _a.sent();
                    return [2 /*return*/, { error: "book download failed: ".concat(err_2) }];
                case 7:
                    coverUrl = '';
                    try {
                        coverUrl = page.match(regexCoverUrl).toString();
                    }
                    catch (err) {
                        return [2 /*return*/, { error: "error while fetching book cover url: ".concat(err) }];
                    }
                    book = {
                        file: ebook,
                        cover: {
                            file: cover,
                        }
                    };
                    if (coverUrl.includes('blank')) {
                        return [2 /*return*/, book];
                    }
                    _a.label = 8;
                case 8:
                    _a.trys.push([8, 11, , 12]);
                    return [4 /*yield*/, axios.get("".concat(LIBGEN_MIRROR, "/").concat(coverUrl), {
                            responseType: 'stream',
                        })];
                case 9:
                    request = _a.sent();
                    return [4 /*yield*/, request.data];
                case 10:
                    cover = _a.sent();
                    coverName = request.config.url.split('/').pop();
                    return [3 /*break*/, 12];
                case 11:
                    err_3 = _a.sent();
                    console.error('error while trying to download book cover: ', err_3);
                    return [3 /*break*/, 12];
                case 12:
                    book.cover.file = cover;
                    book.cover.name = coverName;
                    return [2 /*return*/, book];
            }
        });
    });
}
function search(searchString, pageNumber, mobile) {
    return __awaiter(this, void 0, void 0, function () {
        var rawBookData, ids, idArray, parsedDocument, bookDetails, coverUrls, authors, replaceString;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getRawBooks(searchString, pageNumber)];
                case 1:
                    rawBookData = _a.sent();
                    ids = '';
                    idArray = [];
                    try {
                        parsedDocument = new jsdom.JSDOM(rawBookData).window.document;
                        idArray = parseIds(parsedDocument);
                        ids = idArray.join(',');
                    }
                    catch (error) {
                        console.error(error);
                        return [2 /*return*/, []];
                    }
                    bookDetails = {};
                    try {
                        coverUrls = parseCoverUrls(parsedDocument);
                        authors = parseAuthors(parsedDocument);
                        replaceString = '';
                        if (mobile == 'true') {
                            replaceString = '_small';
                        }
                        idArray.forEach(function (id, index) {
                            bookDetails[id] = { coverUrl: coverUrls[index].replace(replaceString, ''), author: authors[index] };
                        });
                    }
                    catch (error) {
                        console.error("something went wrong when extracting book details: ".concat(error));
                    }
                    return [4 /*yield*/, getBookData(ids, bookDetails)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function parseIds(doc) {
    var urlBeginning = '/file.php?id=';
    var ids = doc.querySelectorAll('tbody:nth-child(2) tr td:nth-child(8) a');
    return Array.from(ids).map(function (id) { return id.href.replace(urlBeginning, ''); });
}
function parseCoverUrls(doc) {
    var covers = doc.querySelectorAll('tbody:nth-child(2) tr td:nth-child(1) a img');
    return Array.from(covers).map(function (cover) { return cover.src; });
}
function parseAuthors(doc) {
    var authors = doc.querySelectorAll('tbody:nth-child(2) tr td:nth-child(3)');
    return Array.from(authors).map(function (author) { return author.textContent; });
}
function getRawBooks(searchString, pageNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var config, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = {
                        method: 'get',
                        url: "".concat(LIBGEN_MIRROR, "/index.php?req=").concat(searchString, "+ext:epub&columns%5B%5D=t&columns%5B%5D=a&columns%5B%5D=s&columns%5B%5D=y&columns%5B%5D=p&columns%5B%5D=i&objects%5B%5D=f&topics%5B%5D=l&topics%5B%5D=f&res=100&covers=on&gmode=on&filesuns=all&page=").concat(pageNumber),
                    };
                    return [4 /*yield*/, axios(config)];
                case 1:
                    result = _a.sent();
                    return [4 /*yield*/, result.data];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getBookData(ids, bookDetails) {
    return __awaiter(this, void 0, void 0, function () {
        var fileData, editionData, bookData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getFileData(ids)];
                case 1:
                    fileData = _a.sent();
                    editionIds = [];
                    Object.entries(fileData).forEach(function (_a) {
                        var file = _a[1];
                        if (file.editions) {
                            Object.entries(file.editions).forEach(function (_a) {
                                var edition = _a[1];
                                editionIds.push(edition.e_id);
                            });
                        }
                    });
                    return [4 /*yield*/, getEditionData(editionIds)];
                case 2:
                    editionData = _a.sent();
                    bookData = [];
                    Object.entries(fileData).forEach(function (_a, index) {
                        var key = _a[0], file = _a[1];
                        if (file.editions) {
                            var editionId = Object.entries(file.editions)[0][1].e_id;
                            var edition = editionData[editionId];
                            var lang = '';
                            var isbn = undefined;
                            try {
                                Object.values(edition.add).forEach(function (additionalInfo) {
                                    if (additionalInfo.name_en == 'Language') {
                                        lang = additionalInfo;
                                    }
                                });
                            }
                            catch (error) {
                                console.warn("no language found for edition: ".concat(editionId));
                            }
                            try {
                                Object.values(edition.add).forEach(function (additionalInfo) {
                                    if (additionalInfo.name_en == 'ISBN') {
                                        isbn = additionalInfo.value;
                                    }
                                });
                            }
                            catch (error) {
                                console.warn("no isbn found for edition: ".concat(editionId));
                            }
                            bookData.push({ book_id: key, md5: file.md5, title: edition.title, author: edition.author || bookDetails[key].author,
                                year: edition.year, language: lang.value, filesize: file.filesize, extension: file.extension, edition_id: editionId,
                                isbn: isbn, filename: "".concat(edition.title, ".").concat(file.extension), cover_url: bookDetails[key].coverUrl });
                        }
                    });
                    return [2 /*return*/, bookData];
            }
        });
    });
}
function getFileData(ids) {
    return __awaiter(this, void 0, void 0, function () {
        var config, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = {
                        method: 'get',
                        url: "".concat(LIBGEN_MIRROR, "/json.php?object=f&ids=").concat(ids),
                    };
                    return [4 /*yield*/, axios(config)];
                case 1:
                    result = _a.sent();
                    return [4 /*yield*/, result.data];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getEditionData(ids) {
    return __awaiter(this, void 0, void 0, function () {
        var config, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = {
                        method: 'get',
                        url: "".concat(LIBGEN_MIRROR, "/json.php?object=e&ids=").concat(ids, "&addkeys=101,505"),
                    };
                    return [4 /*yield*/, axios(config)];
                case 1:
                    result = _a.sent();
                    return [4 /*yield*/, result.data];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
module.exports = router;
