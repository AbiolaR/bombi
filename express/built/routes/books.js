var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var express = require('express');
var router = express.Router();
var axios = require('axios');
var mailservice = require('../services/email');
const { findUserAsync } = require('../services/dbman');
const { upload, testAuth } = require('../services/tolinoman');
const jsdom = require('jsdom');
const { saveToDiskAsync, convertToMobiAsync, getSpellingCorrection } = require('../services/tools');
const LIBGEN_MIRROR = process.env.LIBGEN_MIRROR || 'https://libgen.rocks';
/* GET users listing. */
router.get('/search', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    var searchString = req.query.q;
    var pageNumber = req.query.p;
    var mobile = req.query.m;
    if (!searchString) {
        res.json({ error: "No search query given" });
        return;
    }
    var bookData = { books: [], suggestion: '' };
    try {
        if (process.env.STAGE == 'prod' || process.env.STAGE == 'staging') {
            bookData.books = yield search(searchString, pageNumber, mobile);
            if (bookData.books.length == 0) {
                try {
                    bookData.suggestion = yield getSpellingCorrection(searchString);
                }
                catch (error) {
                    console.warn('Error while getting spelling correction: ' + error);
                }
            }
        }
        else {
            bookData.books = [];
            bookData.suggestion = 'tiger at midnight';
            if (searchString == 'tiger at midnight') {
                bookData.books = [{ book_id: '6030060', md5: '4f67f6509a61dc38168d146626f5702d', title: 'The Straw Doll Cries at Midnight', author: 'Lincoln, K Bird', year: '2017', language: 'eng', filesize: '523087', extension: 'epub', edition_id: '5767010', isbn: undefined, filename: 'The Straw Doll Cries at Midnight.epub', cover_url: '/fictioncovers/2005000/4f67f6509a61dc38168d146626f5702d_small.jpg' }, { book_id: '6473323', md5: 'eb36babdfbcac07115e720e03b765016', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati ', year: '2019', language: 'eng', filesize: '1725912', extension: 'epub', edition_id: '6224539', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', cover_url: '/fictioncovers/2463000/eb36babdfbcac07115e720e03b765016_small.jpg' }, { book_id: '6618889', md5: '8e3036af66cec7e882eff27d61c8ed0c', title: 'The archer at dawn', author: 'Teerdhala, Swati ', year: '2020', language: 'eng', filesize: '2927549', extension: 'epub', edition_id: '6370207', isbn: '0062869248', filename: 'The archer at dawn.epub', cover_url: '/fictioncovers/2609000/8e3036af66cec7e882eff27d61c8ed0c_small.jpg' }, { book_id: '96705404', md5: '36eecaf2700a96aba3ba61ac12412033', title: 'The Tiger at Midnight', author: 'Swati Teerdhala', year: '2019', language: 'eng', filesize: '637882', extension: 'epub', edition_id: '140688051', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', cover_url: '/img/blank.png' }, { book_id: '96705405', md5: '4dd1421ad88a222c03ff147be5026098', title: 'The Chariot at Dusk', author: 'Swati Teerdhala', year: '2021', language: 'eng', filesize: '5838101', extension: 'epub', edition_id: '140688052', isbn: '9780062869296', filename: 'The Chariot at Dusk.epub', cover_url: '/img/blank.png' }, { book_id: '96705406', md5: 'af55cd1cfbbaf2dc6d82e662700ab920', title: 'The Archer at Dawn ', author: 'Teerdhala, Swati', year: '2020', language: 'eng', filesize: '678970', extension: 'epub', edition_id: '140688053', isbn: '0062869248', filename: 'The Archer at Dawn .epub', cover_url: '/img/blank.png' }, { book_id: '96924857', md5: '67b5c78e8e6bad9d602f59c0dba9b150', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati', year: '2019', language: 'eng', filesize: '2035502', extension: 'epub', edition_id: '140893528', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', cover_url: '/fictioncovers/2922000/67b5c78e8e6bad9d602f59c0dba9b150_small.jpg' }, { book_id: '96924858', md5: 'b218d9e47c09375f25d3fccd9bf66162', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati', year: '2019', language: 'eng', filesize: '1725939', extension: 'epub', edition_id: '140893529', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', cover_url: '/fictioncovers/2922000/b218d9e47c09375f25d3fccd9bf66162_small.jpg' }, { book_id: '98748789', md5: 'bd5129568653dd1bc01ef90fc8c03039', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati ', year: '2019', language: 'eng', filesize: '1725912', extension: 'epub', edition_id: '6224539', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', cover_url: '/fictioncovers/3905000/bd5129568653dd1bc01ef90fc8c03039_small.jpg' }, { book_id: '98866937', md5: 'fd605dd50887f678693bbf508e20b8ff', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati ', year: '2019', language: 'eng', filesize: '2028188', extension: 'epub', edition_id: '6224539', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', cover_url: '/fictioncovers/4023000/fd605dd50887f678693bbf508e20b8ff_small.jpg' }, { book_id: '100071444', md5: '5b5a9760600c151add11265c1129e7c7', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati', year: '2019', language: 'eng', filesize: '637879', extension: 'epub', edition_id: '143821468', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', cover_url: '/fictioncovers/4667000/5b5a9760600c151add11265c1129e7c7_small.jpg' }, { book_id: '102098014', md5: '058be4b3507e1d7f254493ecaff29f4c', title: 'The Archer at Dawn', author: 'Teerdhala, Swati', year: '2020', language: 'eng', filesize: '1324292', extension: 'epub', edition_id: '145848715', isbn: '0062869248', filename: 'The Archer at Dawn.epub', cover_url: '/fictioncovers/6159000/058be4b3507e1d7f254493ecaff29f4c_small.jpg' }];
            }
        }
    }
    catch (error) {
        console.error(error);
    }
    res.json(bookData);
}));
router.get('/download', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    var md5Hash = req.query.md5;
    var url = req.query.url;
    if (!md5Hash && !url) {
        res.json({ error: "No md5 hash or url given" });
        return;
    }
    var book = { error: 'book init' };
    if (md5Hash) {
        book = yield downloadWithMD5(md5Hash);
    }
    else {
        book = yield downloadWithUrl(url);
    }
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
}));
router.post('/send', (req, res) => __awaiter(this, void 0, void 0, function* () {
    var md5Hash = req.body.md5;
    var url = req.body.url;
    var filename = req.body.filename;
    if (!md5Hash && !url) {
        res.json({ error: "No md5 hash or url given" });
        return;
    }
    if (!filename) {
        res.json({ error: "No filename given" });
        return;
    }
    var book;
    if (md5Hash) {
        book = yield downloadWithMD5(md5Hash);
    }
    else {
        book = yield downloadWithUrl(url);
    }
    const user = yield findUserAsync(req.body.username);
    if (!user) {
        res.status(404).send('no user could be found');
    }
    var result = {};
    switch (user.eReaderType) {
        case 'K': // Kindle
            result = yield sendFileToKindle(user.eReaderEmail, book.file, filename);
            break;
        case 'T': // Tolino
            result = yield sendFileToTolino(book, filename, user);
            break;
        default:
            result = { status: 501, error: `no eReader value set on user ${user.username}` };
            break;
    }
    res.status(result.status).send(result.message);
}));
router.post('/tolino/test', (req, res) => __awaiter(this, void 0, void 0, function* () {
    var eReaderDeviceId = req.body.eReaderDeviceId;
    var eReaderRefreshToken = req.body.eReaderRefreshToken;
    var username = req.body.username;
    if (username) {
        var user = yield findUserAsync(req.body.username);
        if (!user) {
            res.status(404).send('no user could be found');
        }
        eReaderDeviceId = user.eReaderDeviceId;
        eReaderRefreshToken = user.eReaderRefreshToken;
    }
    var user = { username: username, eReaderDeviceId: eReaderDeviceId,
        eReaderRefreshToken: eReaderRefreshToken };
    var result = yield testAuth(user);
    if (result.command && result.refresh_token) {
        res.send({ refresh_token: result.refresh_token });
    }
    else {
        res.status(401).send();
    }
}));
function sendFileToKindle(recipient, data, filename) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = yield convertToMobiAsync(data, filename);
        if (!file.path)
            return;
        return yield mailservice.sendFileToKindle(recipient, file.path, file.name);
    });
}
function sendFileToTolino(book, filename, user) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = yield saveToDiskAsync(book.file, filename);
        var coverPath;
        if (book.cover.file) {
            coverPath = yield saveToDiskAsync(book.cover.file, book.cover.name);
        }
        const result = yield upload(filePath, coverPath, user);
        if (result.command && result.refresh_token) {
            return { status: 200, message: { success: 'file sent to tolino' } };
        }
        else {
            return { status: 501, message: { error: 'file not sent to tolino' } };
        }
    });
}
function downloadWithUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const request = yield axios.get(url, {
                responseType: 'stream',
            });
            return { file: yield request.data, cover: {} };
        }
        catch (err) {
            return { error: `book download failed using url: ${url} |=| ${err}` };
        }
    });
}
function downloadWithMD5(md5Hash) {
    return __awaiter(this, void 0, void 0, function* () {
        var config = {
            method: 'get',
            url: `${LIBGEN_MIRROR}/get.php?md5=${md5Hash}`,
        };
        var result = yield axios(config);
        const page = yield result.data;
        const regexDownloadURL = new RegExp(/(?<=href=")(.*)(?="><h2>GET<)/g);
        const regexCoverUrl = new RegExp(/(?<="><img src="\/)(.*)(?=")/g);
        var downloadURL = '';
        try {
            downloadURL = page.match(regexDownloadURL).toString();
        }
        catch (err) {
            return { error: `error while fetching book download url: ${err}` };
        }
        var ebook;
        try {
            const request = yield axios.get(`${LIBGEN_MIRROR}/${downloadURL}`, {
                responseType: 'stream',
            });
            ebook = yield request.data;
        }
        catch (err) {
            return { error: `book download failed: ${err}` };
        }
        var coverUrl = '';
        try {
            coverUrl = page.match(regexCoverUrl).toString();
        }
        catch (err) {
            return { error: `error while fetching book cover url: ${err}` };
        }
        var cover;
        var book = {
            file: ebook,
            cover: {
                file: cover,
            }
        };
        if (coverUrl.includes('blank')) {
            return book;
        }
        var coverName;
        try {
            const request = yield axios.get(`${LIBGEN_MIRROR}/${coverUrl}`, {
                responseType: 'stream',
            });
            cover = yield request.data;
            coverName = request.config.url.split('/').pop();
        }
        catch (err) {
            console.error('error while trying to download book cover: ', err);
        }
        book.cover.file = cover;
        book.cover.name = coverName;
        return book;
    });
}
function search(searchString, pageNumber, mobile) {
    return __awaiter(this, void 0, void 0, function* () {
        const rawBookData = yield getRawBooks(searchString, pageNumber);
        var ids = '';
        var idArray = [];
        var parsedDocument;
        try {
            parsedDocument = new jsdom.JSDOM(rawBookData).window.document;
            idArray = parseIds(parsedDocument);
            ids = idArray.join(',');
        }
        catch (error) {
            console.error(error);
            return [];
        }
        var bookDetails = {};
        try {
            var coverUrls = parseCoverUrls(parsedDocument);
            var authors = parseAuthors(parsedDocument);
            var replaceString = '';
            if (mobile == 'true') {
                replaceString = '_small';
            }
            idArray.forEach((id, index) => {
                bookDetails[id] = { coverUrl: coverUrls[index].replace(replaceString, ''), author: authors[index] };
            });
        }
        catch (error) {
            console.error(`something went wrong when extracting book details: ${error}`);
        }
        return yield getBookData(ids, bookDetails);
    });
}
function parseIds(doc) {
    const urlBeginning = '/file.php?id=';
    const ids = doc.querySelectorAll('tbody:nth-child(2) tr td:nth-child(8) a');
    return Array.from(ids).map(id => id.href.replace(urlBeginning, ''));
}
function parseCoverUrls(doc) {
    const covers = doc.querySelectorAll('tbody:nth-child(2) tr td:nth-child(1) a img');
    return Array.from(covers).map(cover => cover.src);
}
function parseAuthors(doc) {
    const authors = doc.querySelectorAll('tbody:nth-child(2) tr td:nth-child(3)');
    return Array.from(authors).map(author => author.textContent);
}
function getRawBooks(searchString, pageNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        var config = {
            method: 'get',
            url: `${LIBGEN_MIRROR}/index.php?req=${searchString}+ext:epub&columns%5B%5D=t&columns%5B%5D=a&columns%5B%5D=s&columns%5B%5D=y&columns%5B%5D=p&columns%5B%5D=i&objects%5B%5D=f&topics%5B%5D=l&topics%5B%5D=f&res=100&covers=on&gmode=on&filesuns=all&page=${pageNumber}`,
        };
        const result = yield axios(config);
        return yield result.data;
    });
}
function getBookData(ids, bookDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileData = yield getFileData(ids);
        editionIds = [];
        Object.entries(fileData).forEach(([, file]) => {
            if (file.editions) {
                Object.entries(file.editions).forEach(([, edition]) => {
                    editionIds.push(edition.e_id);
                });
            }
        });
        const editionData = yield getEditionData(editionIds);
        const bookData = [];
        Object.entries(fileData).forEach(([key, file], index) => {
            if (file.editions) {
                const editionId = Object.entries(file.editions)[0][1].e_id;
                const edition = editionData[editionId];
                var lang = '';
                var isbn = undefined;
                try {
                    Object.values(edition.add).forEach(additionalInfo => {
                        if (additionalInfo.name_en == 'Language') {
                            lang = additionalInfo;
                        }
                    });
                }
                catch (error) {
                    console.warn(`no language found for edition: ${editionId}`);
                }
                try {
                    Object.values(edition.add).forEach(additionalInfo => {
                        if (additionalInfo.name_en == 'ISBN') {
                            isbn = additionalInfo.value;
                        }
                    });
                }
                catch (error) {
                    console.warn(`no isbn found for edition: ${editionId}`);
                }
                bookData.push({ book_id: key, md5: file.md5, title: edition.title, author: edition.author || bookDetails[key].author,
                    year: edition.year, language: lang.value, filesize: file.filesize, extension: file.extension, edition_id: editionId,
                    isbn: isbn, filename: `${edition.title}.${file.extension}`, cover_url: bookDetails[key].coverUrl });
            }
        });
        return bookData;
    });
}
function getFileData(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        var config = {
            method: 'get',
            url: `${LIBGEN_MIRROR}/json.php?object=f&ids=${ids}`,
        };
        const result = yield axios(config);
        return yield result.data;
    });
}
function getEditionData(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        var config = {
            method: 'get',
            url: `${LIBGEN_MIRROR}/json.php?object=e&ids=${ids}&addkeys=101,505`,
        };
        const result = yield axios(config);
        return yield result.data;
    });
}
module.exports = router;
