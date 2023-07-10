const util = require('util');
const { spawn } = require('child_process');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);
const fs = require('fs');
const jszip = require('jszip');
const { parseStringPromise, Builder } = require('xml2js');
const ebookconvert = require('ebook-convert');
const ebookConvertAsync = util.promisify(ebookconvert);

const TEMP_DIR = '/tmp/app.bombi/';
const ENGLISH = 'en';
const MOBI = '.mobi';
const EPUB = '.epub';

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
            console.log(exitCode)
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
    var dotIndex = filename.lastIndexOf('.');
    var name = filename.slice(0, dotIndex).replace(/[^a-z0-9]/gi, '');
    var fileEnding = filename.slice(dotIndex);
  
    const timestamp = Date.now();
    const path = `${TEMP_DIR}${name}_${timestamp}${fileEnding}`;
    await pipeline(file, fs.createWriteStream(path));
    return path;
}