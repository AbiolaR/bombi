const util = require('util');
const { spawn } = require('child_process');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);
const fs = require('fs');
const jszip = require('jszip');

const TEMP_DIR = '/tmp/app.bombi/';
const ENGLISH = 'en';

module.exports.convertToMobiAsync = async (file, filename) => {
    var filePath = await this.saveToDisk(file, filename);

    console.log('before convert')
    if (!(await convertAsync(filePath))) return { name: '', path: ''};
    console.log('after convert')

    var dotIndex = filename.lastIndexOf('.');
    var fileEnding = filename.slice(dotIndex);

    filePath.replace(fileEnding, 'mobi');
    filename.replace(fileEnding, 'mobi');
    return { name: filename, path: filePath };
}

async function convertAsync(filePath) {
    const process = spawn('kindlegen', [filePath]);

    var error = "";
    child.stderr.on('data', (data) => {
        error += data;    
    });

    const exitCode = await new Promise((resolve) => {
        process.on('close', resolve);
    });

    console.log('during convert');

    if (exitCode != 0) {
        if (error.includes('E23006')) {
            setEpubLanguage(filePath, ENGLISH);
        } else {
            console.error('error while trying to convert');
            return false;
        }
    }
}

async function setEpubLanguage(filePath, lang) {
    const fileContent = fs.readFileSync(filePath);
    const jsZip = new jszip();

    const epubFiles = await jsZip.loadAsync(fileContent);
    
}

module.exports.saveToDisk = async (file, filename) => {
    var dotIndex = filename.lastIndexOf('.');
    var name = filename.slice(0, dotIndex).replace(/\s/g, '');;
    var fileEnding = filename.slice(dotIndex);
  
    const timestamp = Date.now();
    const path = `${TEMP_DIR}${name}_${timestamp}${fileEnding}`;
    await pipeline(file, fs.createWriteStream(path));
    return path;
  }