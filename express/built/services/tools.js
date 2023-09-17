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
var util = require('util');
var spawn = require('child_process').spawn;
var stream = require('stream');
var pipeline = util.promisify(stream.pipeline);
var fs = require('fs');
var jszip = require('jszip');
var _a = require('xml2js'), parseStringPromise = _a.parseStringPromise, Builder = _a.Builder;
var ebookconvert = require('ebook-convert');
var ebookConvertAsync = util.promisify(ebookconvert);
var DEC = require('./secman').DEC;
var axios = require('axios');
var TEMP_DIR = '/tmp/app.bombi/';
var ENGLISH = 'en';
var MOBI = '.mobi';
var EPUB = '.epub';
var SEARCH_SUFFIX = ' book';
var SEARCH_LANG_OPERATOR = 'lang:';
var GOOGLE_CUSTOM_SEARCH_URL = 'https://www.googleapis.com/customsearch/v1';
var GOOGLE_SEARCH_API_KEY = DEC('U2FsdGVkX1+OzilJcaZ0HHvEiXBKwMqai8HVF4YBD2ZT2vNmyao3/nGxc0FaZiz/HVERMeGf2eXoao0gYAj0Aw==');
var GOOGLE_SEARCH_ENGINE_ID = DEC('U2FsdGVkX18Ojn/1fd2EQDZtxcO5EMndOFxadSUZkt7b9ogUBQ1glL0JsREgLY+9');
module.exports.convertToMobiAsync = function (file, filename) { return __awaiter(_this, void 0, void 0, function () {
    var filePath, dotIndex, fileEnding;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, this.saveToDiskAsync(file, filename)];
            case 1:
                filePath = _a.sent();
                return [4 /*yield*/, calibreConvertAsync(filePath)];
            case 2:
                if (!(_a.sent()))
                    return [2 /*return*/, { name: '', path: '' }];
                dotIndex = filename.lastIndexOf('.');
                fileEnding = filename.slice(dotIndex);
                fs.unlinkSync(filePath);
                filePath = filePath.replace(fileEnding, MOBI);
                filename = filename.replace(fileEnding, MOBI);
                return [2 /*return*/, { name: filename, path: filePath }];
        }
    });
}); };
function calibreConvertAsync(inputPath) {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    outputPath = inputPath.replace(EPUB, MOBI);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, ebookConvertAsync({ input: inputPath, output: outputPath })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error(err_1);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/, true];
            }
        });
    });
}
module.exports.getSpellingCorrection = function (searchString) { return __awaiter(_this, void 0, void 0, function () {
    var searchUrl, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                searchUrl = "".concat(GOOGLE_CUSTOM_SEARCH_URL, "?key=").concat(GOOGLE_SEARCH_API_KEY)
                    + "&cx=".concat(GOOGLE_SEARCH_ENGINE_ID, "&num=1");
                searchString = searchString.split(SEARCH_LANG_OPERATOR)[0];
                return [4 /*yield*/, axios.get("".concat(searchUrl, "&q=").concat(searchString).concat(SEARCH_SUFFIX))];
            case 1:
                response = _a.sent();
                if (response.data.spelling) {
                    return [2 /*return*/, response.data.spelling.correctedQuery.replace(SEARCH_SUFFIX, '')];
                }
                else {
                    return [2 /*return*/, ''];
                }
                return [2 /*return*/];
        }
    });
}); };
function kindlegenConvertAsync(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var process, output, exitCode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    process = spawn('/bin/kindlegen', [filePath]);
                    output = '';
                    process.stderr.on('data', function (data) {
                        output += data;
                    });
                    process.stdout.on('data', function (data) {
                        output += data;
                    });
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            process.on('close', resolve);
                        })];
                case 1:
                    exitCode = _a.sent();
                    if (!![0, 1].includes(exitCode)) return [3 /*break*/, 5];
                    if (!output.includes('E23006')) return [3 /*break*/, 4];
                    return [4 /*yield*/, setEpubLanguage(filePath, ENGLISH)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, kindlegenConvertAsync(filePath)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    console.log(exitCode);
                    console.error('error while trying to convert: ', output);
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/, true];
            }
        });
    });
}
function setEpubLanguage(filePath, lang) {
    return __awaiter(this, void 0, void 0, function () {
        var fileContent, jsZip, zip, metadataFile, metadataContent, json, xml, content;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fileContent = fs.readFileSync(filePath);
                    jsZip = new jszip();
                    return [4 /*yield*/, jsZip.loadAsync(fileContent)];
                case 1:
                    zip = _a.sent();
                    metadataFile = Object.keys(zip.files).find(function (key) { return key.endsWith('.opf'); });
                    return [4 /*yield*/, (zip.files[metadataFile].async('text'))];
                case 2:
                    metadataContent = _a.sent();
                    return [4 /*yield*/, parseStringPromise(metadataContent)];
                case 3:
                    json = _a.sent();
                    json.package.metadata[0]['dc:language'] = [lang];
                    xml = new Builder().buildObject(json);
                    zip.file(metadataFile, xml);
                    return [4 /*yield*/, zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })];
                case 4:
                    content = _a.sent();
                    return [4 /*yield*/, pipeline(content, fs.createWriteStream(filePath))];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
module.exports.saveToDiskAsync = function (file, filename) { return __awaiter(_this, void 0, void 0, function () {
    var dotIndex, name, fileEnding, timestamp, path;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dotIndex = filename.lastIndexOf('.');
                name = filename.slice(0, dotIndex).replace(/[^a-z0-9]/gi, '');
                fileEnding = filename.slice(dotIndex);
                timestamp = Date.now();
                path = "".concat(TEMP_DIR).concat(name, "_").concat(timestamp).concat(fileEnding);
                return [4 /*yield*/, pipeline(file, fs.createWriteStream(path))];
            case 1:
                _a.sent();
                return [2 /*return*/, path];
        }
    });
}); };
