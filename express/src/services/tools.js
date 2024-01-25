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
const sharp = require('sharp');
const { dirname } = require('path');

const TEMP_DIR = '/tmp/app.bombi/';
const ENGLISH = 'en';
const MOBI = '.mobi';
const EPUB = '.epub';
const SEARCH_SUFFIX = ' book';
const SEARCH_LANG_OPERATOR = 'lang:';
const GOOGLE_CUSTOM_SEARCH_URL = 'https://www.googleapis.com/customsearch/v1';
const GOOGLE_SEARCH_API_KEY = DEC('U2FsdGVkX1+OzilJcaZ0HHvEiXBKwMqai8HVF4YBD2ZT2vNmyao3/nGxc0FaZiz/HVERMeGf2eXoao0gYAj0Aw==');
const GOOGLE_SEARCH_ENGINE_ID = DEC('U2FsdGVkX18Ojn/1fd2EQDZtxcO5EMndOFxadSUZkt7b9ogUBQ1glL0JsREgLY+9');

module.exports.convertToMobiAsync = async (file, filename) => {
    var filePath = await this.saveToDiskAsync(file, filename);

    if (!(await calibreConvertAsync(filePath))) return { name: '', path: ''};

    var dotIndex = filename.lastIndexOf('.');
    var fileEnding = filename.slice(dotIndex);

    fs.unlinkSync(filePath);
    filePath = filePath.replace(fileEnding, MOBI);
    filename = filename.replace(fileEnding, MOBI);
    return { name: filename, path: filePath };
}

async function calibreConvertAsync(inputPath) {
    outputPath = inputPath.replace(EPUB, MOBI);
    try {
        await ebookConvertAsync({input: inputPath, output: outputPath});
    } catch(err) {
        console.error(err);
        return false;
    }
    return true;      
}

module.exports.getSpellingCorrection = async (searchString) => {

    const searchUrl = `${GOOGLE_CUSTOM_SEARCH_URL}?key=${GOOGLE_SEARCH_API_KEY}`
        + `&cx=${GOOGLE_SEARCH_ENGINE_ID}&num=1`;
    searchString = searchString.split(SEARCH_LANG_OPERATOR)[0];
    var response = await axios.get(`${searchUrl}&q=${searchString}${SEARCH_SUFFIX}`);
    if (response.data.spelling) {
        return response.data.spelling.correctedQuery.replace(SEARCH_SUFFIX, '');
    } else {
        return '';
    }
}

async function kindlegenConvertAsync(filePath) {
    const process = spawn('/bin/kindlegen', [filePath]);
    var output = '';
    process.stderr.on('data', (data) => {
        output += data;    
    });
    process.stdout.on('data', (data) => {
        output += data;    
    });

    const exitCode = await new Promise((resolve, reject) => {
        process.on('close', resolve);
    });


    if (![0, 1].includes(exitCode)) {
        if (output.includes('E23006')) {
            await setEpubLanguage(filePath, ENGLISH);
            await kindlegenConvertAsync(filePath);
        } else {
            console.error('error while trying to convert: ', output);
            return false;
        }
    }
    return true;
}

async function setEpubLanguage(filePath, lang) {
    const fileContent = fs.readFileSync(filePath);
    const jsZip = new jszip();

    const zip = await jsZip.loadAsync(fileContent);
    const metadataFile = Object.keys(zip.files).find(key => key.endsWith('.opf'));
    const metadataContent = await (zip.files[metadataFile].async('text'));

    const json = await parseStringPromise(metadataContent)
    json.package.metadata[0]['dc:language'] = [ lang ];
    
    const xml = new Builder().buildObject(json);

    zip.file(metadataFile, xml);
    const content = await zip.generateNodeStream({type:'nodebuffer', streamFiles:true});
    await pipeline(content, fs.createWriteStream(filePath));
}

module.exports.saveToDiskAsync = async (file, filename) => {
    const path = `${TEMP_DIR}${filename}`;
    fs.mkdirSync(dirname(path));
    await pipeline(file, fs.createWriteStream(path));
    return path;
}

module.exports.compressEpubAsync = async(filePath) => {
    const fileContent = fs.readFileSync(filePath);
    const jsZip = new jszip();

    const zip = await jsZip.loadAsync(fileContent);
    const jpgs = Object.keys(zip.files).filter(key => key.endsWith('.jpg'));

    for (const jpg of jpgs) {
        let buffer = await zip.files[jpg].async('nodebuffer');
        buffer = await sharp(buffer).jpeg({quality: 40}).toBuffer();
        zip.file(jpg, buffer);
    }
    const stream = zip.generateNodeStream({type:'nodebuffer', streamFiles:true});
    return await this.saveToDiskAsync(stream, filePath.split('/').pop());;
}