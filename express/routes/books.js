var express = require('express');
var router = express.Router();
var axios = require('axios');
var mailservice = require('../services/email');
var fs = require('fs');
var ebookconvert = require('ebook-convert');
const util = require('util');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);
const convertAsync = util.promisify(ebookconvert);


/* GET users listing. */
router.get('/search', async(req, res, next) => {

  var searchString = req.query.q;

  if(!searchString) {
    res.json({error: "No search query given"});
    return;
  }

  var bookData = {};
  
  try {
    if (process.env.STAGE == 'prod') {
      bookData = await search(searchString);
    } else {
      bookData = [{"book_id":"6030060","md5":"4f67f6509a61dc38168d146626f5702d","title":"The Straw Doll Cries at Midnight","author":"","language":"eng","filesize":"523087","extension":"epub","filename":"The Straw Doll Cries at Midnight.epub","cover_url":"fictioncovers/2463000/eb36babdfbcac07115e720e03b765016_small.jpg"},{"book_id":"6473323","md5":"eb36babdfbcac07115e720e03b765016","title":"The Tiger at Midnight","author":"","language":"eng","filesize":"1725912","extension":"epub","filename":"The Tiger at Midnight.epub","cover_url":"img/blank.png"},{"book_id":"6618889","md5":"8e3036af66cec7e882eff27d61c8ed0c","title":"The archer at dawn","author":"","language":"eng","filesize":"2927549","extension":"epub","filename":"The archer at dawn.epub","cover_url":"fictioncovers/2609000/8e3036af66cec7e882eff27d61c8ed0c_small.jpg"},{"book_id":"96705404","md5":"36eecaf2700a96aba3ba61ac12412033","title":"The Tiger at Midnight","author":"Swati Teerdhala","language":"eng","filesize":"637882","extension":"epub","filename":"The Tiger at Midnight.epub","cover_url":"img/blank.png"},{"book_id":"96705405","md5":"4dd1421ad88a222c03ff147be5026098","title":"The Chariot at Dusk","author":"Swati Teerdhala","language":"eng","filesize":"5838101","extension":"epub","filename":"The Chariot at Dusk.epub","cover_url":"img/blank.png"},{"book_id":"96705406","md5":"af55cd1cfbbaf2dc6d82e662700ab920","title":"The Archer at Dawn ","author":"Teerdhala, Swati","language":"eng","filesize":"678970","extension":"epub","filename":"The Archer at Dawn .epub","cover_url":"fictioncovers/2005000/4f67f6509a61dc38168d146626f5702d_small.jpg"},{"book_id":"96924857","md5":"67b5c78e8e6bad9d602f59c0dba9b150","title":"The Tiger at Midnight","author":"Teerdhala, Swati","language":"eng","filesize":"2035502","extension":"epub","filename":"The Tiger at Midnight.epub","cover_url":"fictioncovers/2922000/67b5c78e8e6bad9d602f59c0dba9b150_small.jpg"},{"book_id":"96924858","md5":"b218d9e47c09375f25d3fccd9bf66162","title":"The Tiger at Midnight","author":"Teerdhala, Swati","language":"eng","filesize":"1725939","extension":"epub","filename":"The Tiger at Midnight.epub","cover_url":"fictioncovers/2922000/b218d9e47c09375f25d3fccd9bf66162_small.jpg"}];
    }
  } catch(error) {
    console.error(error);
  }
  res.json(bookData);

});

router.get('/download', async(req, res, next) => {
  var md5Hash = req.query.md5;

  if (!md5Hash) {
    res.json({error: "No md5 hash given"});
    return;
  }

  var file = await download(md5Hash);
  
  try {
    file.pipe(res);
    res.set('Content-disposition', 'attachment; filename=book.epub');
    res.set('Content-Type', 'application/octet-stream');
  } catch(error) {
    res.json(file)
  }
});

router.post('/send', async(req, res) => {
  var md5Hash = req.body.md5;
  var filename = req.body.filename;

  if (!md5Hash) {
    res.json({error: "No md5 hash given"});
    return;
  }
  if (!filename) {
    res.json({error: "No filename given"});
    return;
  }

  var file = await download(md5Hash);

  var filePath = await convert(file, filename);

  filename = filename.replace('.epub', '.mobi');

  var result = await mailservice.sendFileToKindle(filePath, filename);
  res.json(result);
});

async function convert(file, filename) {
  var dotIndex = filename.lastIndexOf('.');
  var bookname = filename.slice(0, dotIndex).replace(/\s/g, '');;
  var fileEnding = filename.slice(dotIndex);

  const timestamp = Date.now();
  const inputPath = `/tmp/app.bombi/${bookname}_${timestamp}${fileEnding}`;
  const outputPath = `/tmp/app.bombi/${bookname}_${timestamp}.mobi`;

  await pipeline(file, fs.createWriteStream(inputPath));

  try {
    await convertAsync({input: inputPath, output: outputPath});
  } catch(err) {
    console.error(err);
  }
  fs.unlinkSync(inputPath);
  return outputPath;
}

async function download(md5Hash) {
  var config = {
    method: 'get',
    url: `https://libgen.li/get.php?md5=${md5Hash}`,
  };

  var result = await axios(config);
  const page = await result.data;
  const regexDownloadURL = new RegExp(/(?<=href=")(.*)(?="><h2>GET<)/g);

  var downloadURL = '';
  try {
    downloadURL = page.match(regexDownloadURL).toString();
  } catch(err) {
    return {error: `error while fetching book download url: ${err}`}
  }

  var ebook;
  try {
    const request = await axios.get(`https://libgen.li/${downloadURL}`, {
      responseType: 'stream',
    });
    ebook = await request.data;
  } catch (err) {
    return {error: `book download failed: ${err}`}
  }

  return ebook;
}

async function search(searchString) {
  const regexIds = new RegExp(/(?<=\/json\.php\?object=f&ids\=)(.*)(?="><font)/g);
  const regexCoverUrls = new RegExp(/(?<="><img src="\/)(.*)(?=")/g);

  const rawBookData = await getRawBooks(searchString);
  var ids = '';
  try {
    ids = rawBookData.match(regexIds).toString();
  } catch(error) {
    console.error(error)
    return {message: 'no books found'};
  }
  var coverUrls = [];
  try {
    coverUrls = rawBookData.match(regexCoverUrls).toString().split(',');
  } catch(error) {
    console.error(`something went wrong when extracting cover urls: ${error}`);
  }
  return await getBookData(ids, coverUrls);
}

async function getRawBooks(searchString) {
  var config = {
    method: 'get',
    url: `https://libgen.li/index.php?req=${searchString}+ext:epub&columns%5B%5D=t&columns%5B%5D=a&columns%5B%5D=s&columns%5B%5D=y&columns%5B%5D=p&columns%5B%5D=i&objects%5B%5D=f&topics%5B%5D=l&topics%5B%5D=c&topics%5B%5D=f&topics%5B%5D=m&topics%5B%5D=r&topics%5B%5D=s&res=100&covers=on&gmode=on&filesuns=all`,
  };

  const result = await axios(config);
  return await result.data;
}

async function getBookData(ids, coverUrls) {
  const fileData = await getFileData(ids);
  editionIds = [];

  Object.entries(fileData).forEach(([ ,file]) => {
    if (file.editions) {
      Object.entries(file.editions).forEach(([ ,edition]) => {
        editionIds.push(edition.e_id);
      })
    }
  });

  const editionData = await getEditionData(editionIds);

  const bookData = [];

  Object.entries(fileData).forEach(([key,file], index) => {
    if (file.editions) {
      const editionId = Object.entries(file.editions)[0][1].e_id
      const edition = editionData[editionId];
      var lang = '';
      try {
        lang = Object.values(edition.add)[0];
      } catch(error) {
        console.warn(`no language found for edition: ${editionId}`);
      }
      
      bookData.push({book_id: key, md5: file.md5, title: edition.title, author: edition.author, 
        language: lang.value, filesize: file.filesize, extension: file.extension, 
        filename: `${edition.title}.${file.extension}`, cover_url: coverUrls[index]});
    }
  });

  return bookData;
}

async function getFileData(ids) {
  var config = {
    method: 'get',
    url: `https://libgen.li/json.php?object=f&ids=${ids}`,
  };

  const result = await axios(config);
  return await result.data;
}

async function getEditionData(ids) {
  var config = {
    method: 'get',
    url: `https://libgen.li/json.php?object=e&ids=${ids}&addkeys=101`,
  };

  const result = await axios(config);
  return await result.data;
}

module.exports = router;
