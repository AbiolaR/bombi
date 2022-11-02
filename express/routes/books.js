var express = require('express');
var router = express.Router();
var axios = require('axios');
var mailservice = require('../services/email');
const { findUserAsync } = require('../services/dbman');
const { upload, testAuth } = require('../services/tolinoman');
const jsdom = require('jsdom');
const { saveToDiskAsync, convertToMobiAsync } = require('../services/tools');

const LIBGEN_MIRROR = process.env.LIBGEN_MIRROR || 'https://libgen.rocks';


/* GET users listing. */
router.get('/search', async(req, res, next) => {

  var searchString = req.query.q;

  if(!searchString) {
    res.json({error: "No search query given"});
    return;
  }

  var bookData = {};
  
  try {
    if (process.env.STAGE == 'prod' || process.env.STAGE == 'staging') {
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

  var book = await download(md5Hash);
  
  try {
    book.file.pipe(res);
    res.set('Content-disposition', 'attachment; filename=book.epub');
    res.set('Content-Type', 'application/octet-stream');
  } catch(error) {
    console.log(error);
    console.log(book.error);
    res.json(book.error);
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

  var book = await download(md5Hash);

  const user = await findUserAsync(req.body.username);

  if (!user) {
    res.status(404).send('no user could be found');
  }

  var result = {};
  switch(user.eReaderType) {
    case 'K': // Kindle
      result = await sendFileToKindle(user.eReaderEmail, book.file, filename);
      break;
    case 'T': // Tolino
      result = await sendFileToTolino(book, filename, user);
      break;
    default:
      result = { status: 501, error: `no eReader value set on user ${user.username}` };
      break;  
  }

  res.status(result.status).send(result.message);
});

router.post('/tolino/test', async(req, res) => {
  var eReaderDeviceId = req.body.eReaderDeviceId;
  var eReaderRefreshToken = req.body.eReaderRefreshToken;
  var username = req.body.username;

  if (username) {
    var user = await findUserAsync(req.body.username);

    if (!user) {
      res.status(404).send('no user could be found');
    }

    eReaderDeviceId = user.eReaderDeviceId;
    eReaderRefreshToken = user.eReaderRefreshToken;
  }

  var user = { username: username, eReaderDeviceId: eReaderDeviceId, 
    eReaderRefreshToken: eReaderRefreshToken }

  var result = await testAuth(user);
  if (result.command && result.refresh_token) {
    res.send({ refresh_token: result.refresh_token });
  } else {
    res.status(401).send();
  }
  
});

async function sendFileToKindle(recipient, data, filename) {
  const file = await convertToMobiAsync(data, filename);
  if (!file.path) return;
  return await mailservice.sendFileToKindle(recipient, file.path, file.name);
}

async function sendFileToTolino(book, filename, user) {
  const filePath = await saveToDiskAsync(book.file, filename);

  var coverPath;
  if (book.cover.file) {
    coverPath = await saveToDiskAsync(book.cover.file, book.cover.name);
  }

  const result = await upload(filePath, coverPath, user);

  if (result.command && result.refresh_token) {
    return { status: 200, message: { success: 'file sent to tolino' } };
  } else {
    return { status: 501, message: { error: 'file not sent to tolino' } };
  }
}

async function download(md5Hash) {
  var config = {
    method: 'get',
    url: `${LIBGEN_MIRROR}/get.php?md5=${md5Hash}`,
  };

  var result = await axios(config);
  const page = await result.data;
  const regexDownloadURL = new RegExp(/(?<=href=")(.*)(?="><h2>GET<)/g);
  const regexCoverUrl = new RegExp(/(?<="><img src="\/)(.*)(?=")/g);

  var downloadURL = '';
  try {
    downloadURL = page.match(regexDownloadURL).toString();
  } catch(err) {
    return {error: `error while fetching book download url: ${err}`}
  }

  var ebook;
  try {
    const request = await axios.get(`${LIBGEN_MIRROR}/${downloadURL}`, {
      responseType: 'stream',
    });
    ebook = await request.data;
  } catch (err) {
    return {error: `book download failed: ${err}`}
  }

  var coverUrl = '';
  try {
    coverUrl = page.match(regexCoverUrl).toString();
  } catch (err) {
    return {error: `error while fetching book cover url: ${err}`}
  }

  var cover;

  var book = {
    file: ebook,
    cover: {
      file: cover,
    }
  }

  if (coverUrl.includes('blank')) {
    return book;
  }

  var coverName;

  try {
    const request = await axios.get(`${LIBGEN_MIRROR}/${coverUrl}`, {
      responseType: 'stream',
    });
    cover = await request.data;
    coverName = request.config.url.split('/').pop();
  }  catch (err) {
    console.log('error while trying to download book cover: ', err)
  }

  book.cover.file = cover;
  book.cover.name = coverName;

  return book;
}

async function search(searchString) {
  const rawBookData = await getRawBooks(searchString);
  var ids = '';
  var idArray = [];
  var parsedDocument;
  try {
    parsedDocument = new jsdom.JSDOM(rawBookData).window.document;
    idArray = parseIds(parsedDocument);
    ids = idArray.join(',');
  } catch(error) {
    console.error(error)
    return [];
  }
  var bookDetails = {};
  try {
    var coverUrls = parseCoverUrls(parsedDocument);
    var authors = parseAuthors(parsedDocument);

    idArray.forEach((id, index) => {
      bookDetails[id] = { coverUrl: coverUrls[index], author: authors[index] };
    })
  } catch(error) {
    console.error(`something went wrong when extracting book details: ${error}`);
  }
  return await getBookData(ids, bookDetails);
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
  return Array.from(authors).map(author => author.innerHTML);
}

async function getRawBooks(searchString) {
  var config = {
    method: 'get',
    url: `${LIBGEN_MIRROR}/index.php?req=${searchString}+ext:epub&columns%5B%5D=t&columns%5B%5D=a&columns%5B%5D=s&columns%5B%5D=y&columns%5B%5D=p&columns%5B%5D=i&objects%5B%5D=f&topics%5B%5D=l&topics%5B%5D=f&res=100&covers=on&gmode=on&filesuns=all`,
  };

  const result = await axios(config);
  return await result.data;
}

async function getBookData(ids, bookDetails) {
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
      bookData.push({book_id: key, md5: file.md5, title: edition.title, author: edition.author || bookDetails[key].author, 
        language: lang.value, filesize: file.filesize, extension: file.extension, 
        filename: `${edition.title}.${file.extension}`, cover_url: bookDetails[key].coverUrl});
    }
  });

  return bookData;
}

async function getFileData(ids) {
  var config = {
    method: 'get',
    url: `${LIBGEN_MIRROR}/json.php?object=f&ids=${ids}`,
  };

  const result = await axios(config);
  return await result.data;
}

async function getEditionData(ids) {
  var config = {
    method: 'get',
    url: `${LIBGEN_MIRROR}/json.php?object=e&ids=${ids}&addkeys=101`,
  };

  const result = await axios(config);
  return await result.data;
}

module.exports = router;