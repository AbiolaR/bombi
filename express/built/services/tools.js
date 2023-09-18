var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const util = require('util');
const { spawn } = require('child_process');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);
const fs = require('fs');
const jszip = require('jszip');
const { parseStringPromise, Builder } = require('xml2js');
const ebookconvert = require('ebook-convert');
const ebookConvertAsync = util.promisify(ebookconvert);
const { DEC } = require('./secman');
var axios = require('axios');
const TEMP_DIR = '/tmp/app.bombi/';
const ENGLISH = 'en';
const MOBI = '.mobi';
const EPUB = '.epub';
const SEARCH_SUFFIX = ' book';
const SEARCH_LANG_OPERATOR = 'lang:';
const GOOGLE_CUSTOM_SEARCH_URL = 'https://www.googleapis.com/customsearch/v1';
const GOOGLE_SEARCH_API_KEY = DEC('U2FsdGVkX1+OzilJcaZ0HHvEiXBKwMqai8HVF4YBD2ZT2vNmyao3/nGxc0FaZiz/HVERMeGf2eXoao0gYAj0Aw==');
const GOOGLE_SEARCH_ENGINE_ID = DEC('U2FsdGVkX18Ojn/1fd2EQDZtxcO5EMndOFxadSUZkt7b9ogUBQ1glL0JsREgLY+9');
module.exports.convertToMobiAsync = (file, filename) => __awaiter(this, void 0, void 0, function* () {
    var filePath = yield this.saveToDiskAsync(file, filename);
    if (!(yield calibreConvertAsync(filePath)))
        return { name: '', path: '' };
    var dotIndex = filename.lastIndexOf('.');
    var fileEnding = filename.slice(dotIndex);
    fs.unlinkSync(filePath);
    filePath = filePath.replace(fileEnding, MOBI);
    filename = filename.replace(fileEnding, MOBI);
    return { name: filename, path: filePath };
});
function calibreConvertAsync(inputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        outputPath = inputPath.replace(EPUB, MOBI);
        try {
            yield ebookConvertAsync({ input: inputPath, output: outputPath });
        }
        catch (err) {
            console.error(err);
            return false;
        }
        return true;
    });
}
module.exports.getSpellingCorrection = (searchString) => __awaiter(this, void 0, void 0, function* () {
    const searchUrl = `${GOOGLE_CUSTOM_SEARCH_URL}?key=${GOOGLE_SEARCH_API_KEY}`
        + `&cx=${GOOGLE_SEARCH_ENGINE_ID}&num=1`;
    searchString = searchString.split(SEARCH_LANG_OPERATOR)[0];
    var response = yield axios.get(`${searchUrl}&q=${searchString}${SEARCH_SUFFIX}`);
    if (response.data.spelling) {
        return response.data.spelling.correctedQuery.replace(SEARCH_SUFFIX, '');
    }
    else {
        return '';
    }
});
function kindlegenConvertAsync(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const process = spawn('/bin/kindlegen', [filePath]);
        var output = '';
        process.stderr.on('data', (data) => {
            output += data;
        });
        process.stdout.on('data', (data) => {
            output += data;
        });
        const exitCode = yield new Promise((resolve, reject) => {
            process.on('close', resolve);
        });
        if (![0, 1].includes(exitCode)) {
            if (output.includes('E23006')) {
                yield setEpubLanguage(filePath, ENGLISH);
                yield kindlegenConvertAsync(filePath);
            }
            else {
                console.log(exitCode);
                console.error('error while trying to convert: ', output);
                return false;
            }
        }
        return true;
    });
}
function setEpubLanguage(filePath, lang) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileContent = fs.readFileSync(filePath);
        const jsZip = new jszip();
        const zip = yield jsZip.loadAsync(fileContent);
        const metadataFile = Object.keys(zip.files).find(key => key.endsWith('.opf'));
        const metadataContent = yield (zip.files[metadataFile].async('text'));
        const json = yield parseStringPromise(metadataContent);
        json.package.metadata[0]['dc:language'] = [lang];
        const xml = new Builder().buildObject(json);
        zip.file(metadataFile, xml);
        const content = yield zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true });
        yield pipeline(content, fs.createWriteStream(filePath));
    });
}
module.exports.saveToDiskAsync = (file, filename) => __awaiter(this, void 0, void 0, function* () {
    var dotIndex = filename.lastIndexOf('.');
    var name = filename.slice(0, dotIndex).replace(/[^a-z0-9]/gi, '');
    var fileEnding = filename.slice(dotIndex);
    const timestamp = Date.now();
    const path = `${TEMP_DIR}${name}_${timestamp}${fileEnding}`;
    yield pipeline(file, fs.createWriteStream(path));
    return path;
});
