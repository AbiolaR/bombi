var express = require('express');
var router = express.Router();
var mailservice = require('../services/email');
const { findUserAsync } = require('../services/dbman');
const { upload } = require('../services/tolinoman');
const jsdom = require('jsdom');
const { saveToDiskAsync, getSpellingCorrection } = require('../services/tools');
const axios = require('axios');
const { TolinoService } = require('../services/e-readers/tolino.service');
const { LibgenDbService } = require('../services/db/libgen-db.service');
const { BookService } = require('../services/book/book.service');
const { GoogleBooksSearchService } = require('../services/search/google-books-search.service');
const { PocketBookCloudService } = require('../services/e-readers/pocketbook-cloud.service');

const LIBGEN_MIRROR = process.env.LIBGEN_MIRROR || 'https://libgen.rocks';

//const DAY_IN_MS = 1000 * 60 * 60 * 24;
//const axios = setupCache(Axios, { ttl: DAY_IN_MS, headerInterpreter: () => {return 'not enough headers'} });

router.get('/search', async(req, res) => {
  let libgenDbService = new LibgenDbService();

  var searchString = req.query.q;
  var pageNumber = req.query.p;

  if(!searchString) {
    res.json({error: "No search query given"});
    return;
  }

  var bookData = {books: [], suggestion: ''};
  
  try {
    if (process.env.STAGE == 'prod' || process.env.STAGE == 'staging') {
      bookData.books = await libgenDbService.indexedSearch(searchString, pageNumber)
      if (bookData.books.length == 0) {
        try {
          if (process.env.STAGE == 'prod') {
            bookData.suggestion = await getSpellingCorrection(searchString);
          }
        } catch (error) {
          console.warn('Error while getting spelling correction: ' + error);
        }
      }
    } else {      
      bookData.books = [];
      bookData.suggestion = 'tiger at midnight'
      if (searchString == 'tiger at midnight') {
        bookData.books = [ { book_id: '6030060', md5: '4f67f6509a61dc38168d146626f5702d', title: 'The Straw Doll Cries at Midnight', author: 'Lincoln, K Bird', year: '2017', language: 'eng', filesize: '523087', extension: 'epub', edition_id: '5767010', isbn: undefined, filename: 'The Straw Doll Cries at Midnight.epub', coverUrl: '/fictioncovers/2005000/4f67f6509a61dc38168d146626f5702d_small.jpg' }, { book_id: '6473323', md5: 'eb36babdfbcac07115e720e03b765016', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati ', year: '2019', language: 'eng', filesize: '1725912', extension: 'epub', edition_id: '6224539', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', coverUrl: '/fictioncovers/2463000/eb36babdfbcac07115e720e03b765016_small.jpg' }, { book_id: '6618889', md5: '8e3036af66cec7e882eff27d61c8ed0c', title: 'The archer at dawn', author: 'Teerdhala, Swati ', year: '2020', language: 'eng', filesize: '2927549', extension: 'epub', edition_id: '6370207', isbn: '0062869248', filename: 'The archer at dawn.epub', coverUrl: '/fictioncovers/2609000/8e3036af66cec7e882eff27d61c8ed0c_small.jpg' }, { book_id: '96705404', md5: '36eecaf2700a96aba3ba61ac12412033', title: 'The Tiger at Midnight', author: 'Swati Teerdhala', year: '2019', language: 'eng', filesize: '637882', extension: 'epub', edition_id: '140688051', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', coverUrl: '/img/blank.png' }, { book_id: '96705405', md5: '4dd1421ad88a222c03ff147be5026098', title: 'The Chariot at Dusk', author: 'Swati Teerdhala', year: '2021', language: 'eng', filesize: '5838101', extension: 'epub', edition_id: '140688052', isbn: '9780062869296', filename: 'The Chariot at Dusk.epub', coverUrl: '/img/blank.png' }, { book_id: '96705406', md5: 'af55cd1cfbbaf2dc6d82e662700ab920', title: 'The Archer at Dawn ', author: 'Teerdhala, Swati', year: '2020', language: 'eng', filesize: '678970', extension: 'epub', edition_id: '140688053', isbn: '0062869248', filename: 'The Archer at Dawn .epub', coverUrl: '/img/blank.png' }, { book_id: '96924857', md5: '67b5c78e8e6bad9d602f59c0dba9b150', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati', year: '2019', language: 'eng', filesize: '2035502', extension: 'epub', edition_id: '140893528', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', coverUrl: '/fictioncovers/2922000/67b5c78e8e6bad9d602f59c0dba9b150_small.jpg' }, { book_id: '96924858', md5: 'b218d9e47c09375f25d3fccd9bf66162', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati', year: '2019', language: 'eng', filesize: '1725939', extension: 'epub', edition_id: '140893529', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', coverUrl: '/fictioncovers/2922000/b218d9e47c09375f25d3fccd9bf66162_small.jpg' }, { book_id: '98748789', md5: 'bd5129568653dd1bc01ef90fc8c03039', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati ', year: '2019', language: 'eng', filesize: '1725912', extension: 'epub', edition_id: '6224539', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', coverUrl: '/fictioncovers/3905000/bd5129568653dd1bc01ef90fc8c03039_small.jpg' }, { book_id: '98866937', md5: 'fd605dd50887f678693bbf508e20b8ff', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati ', year: '2019', language: 'eng', filesize: '2028188', extension: 'epub', edition_id: '6224539', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', coverUrl: '/fictioncovers/4023000/fd605dd50887f678693bbf508e20b8ff_small.jpg' }, { book_id: '100071444', md5: '5b5a9760600c151add11265c1129e7c7', title: 'The Tiger at Midnight', author: 'Teerdhala, Swati', year: '2019', language: 'eng', filesize: '637879', extension: 'epub', edition_id: '143821468', isbn: '0062869213', filename: 'The Tiger at Midnight.epub', coverUrl: '/fictioncovers/4667000/5b5a9760600c151add11265c1129e7c7_small.jpg' }, { book_id: '102098014', md5: '058be4b3507e1d7f254493ecaff29f4c', title: 'The Archer at Dawn', author: 'Teerdhala, Swati', year: '2020', language: 'eng', filesize: '1324292', extension: 'epub', edition_id: '145848715', isbn: '0062869248', filename: 'The Archer at Dawn.epub', coverUrl: '/fictioncovers/6159000/058be4b3507e1d7f254493ecaff29f4c_small.jpg' } ];
      }

    }
  } catch(error) {
    console.error(error);
  }
  res.json(bookData);
});

router.post('/search/upcoming', async(req, res) => {
  let bookData = {books: [], suggestion: ''};
  bookData.books = await GoogleBooksSearchService.search(req.body.searchString, req.body.foundBooks);
  res.send(bookData)
});

router.get('/fictioncovers/*', (req, res) => {

  if (!req.url.replace('/fictioncovers/', '')) {
    res.status(404).send('incorrect cover url');
    return;
  }
  axios.get('https://library.lol' + req.url, {responseType: 'stream', cache: false}).then(async (response) => {
    response.data.pipe(res)
  }).catch(() => {});
});

router.get('/download', async(req, res, next) => {
  let bookData = JSON.parse(req.query.bookData);

  if (!bookData) {
    res.status(404).send({error: "No book data given"});
    return;
  }
  bookData.coverUrl = '';
  let response = await BookService.download(bookData);
  
  try {
    response.book.data.pipe(res);
    res.set('Content-disposition', 'attachment; filename=book.epub');
    res.set('Content-Type', 'application/octet-stream');
  } catch(error) {
    console.error(error);
    res.status(500).send({error: 'error while trying to download book'});
  }
});

router.post('/send', async(req, res) => {
  let bookData = req.body.bookData;

  if (!bookData) {
    res.status(404).send({error: "No book data given"});
    return;
  }

  const user = await findUserAsync(req.body.username);
  if (!user) {
    res.status(401).send('no user could be found');
  }

  if (user.eReaderType != 'T') {
    bookData.coverUrl = '';
  }

  let downloadResponse;
  try {
    downloadResponse = await BookService.download(bookData);
  } catch(error) {}

  if (!downloadResponse) {
    res.status(501).send({error: 'error while trying to download book'});
    return;
  }

  var result = {};
  switch(user.eReaderType) {
    case 'K': // Kindle
      result = await BookService.sendFileToKindle(user.eReaderEmail, downloadResponse.book);
      break;
    case 'T': // Tolino
      result = await  BookService.sendFileToTolino(downloadResponse.book, downloadResponse.cover, user);
      break;
    case 'P': // PocketBook
      result = await  BookService.sendFileToPocketBook(downloadResponse.book, user);
      break;
    default:
      result = { status: 501, error: `no eReader value set on user ${user.username}` };
      break;  
  }
  res.status(result.status).send(result.message);
});

router.post('/tolino/connect', async(req, res) => {
  let credentials = req.body.credentials;

  if (!credentials?.username || !credentials?.password) {
    res.send({ status: 1, message: 'missing credentials' });
    return;
  }
  let tolinoService = new TolinoService();
  let result = await tolinoService.connect(req.body.username, credentials);
  res.send(result)
});

router.delete('/tolino/disconnect', async(req, res) => {
  let tolinoService = new TolinoService();
  await tolinoService.disconnect(req.body.username);
  res.send({ status: 0, message: 'disconnected from tolino account' });
});

router.post('/pocketbook-cloud/providers', async (req, res) => {
  let email = req.body.email;

  if (!email) {
    res.send({ status: 1, message: 'missing email' });
    return;
  }

  const providers = await PocketBookCloudService.getProviders(email);
  //const providers = [ { "alias": "umbreit1", "name": "Buchladen zur schwankenden Weltkugel", "shop_id": "601520", "icon": "https://www.buchladen-weltkugel.de/sites/601520.umbreitshopsolution.de/files/neues_logo.jpg", "icon_eink": "https://www.buchladen-weltkugel.de/sites/601520.umbreitshopsolution.de/files/neues_logo.jpg", "logged_by": "password" }, { "alias": "pocketbook_de", "name": "Pocketbook.de", "shop_id": "1", "icon": "https://pocketbook.de/media/logo/stores/1/Logo_PocketBook_E-Books-u-E-Reader_green.png", "icon_eink": "https://pocketbook.de/media/logo/stores/1/Logo_PocketBook_E-Books-u-E-Reader_green.png", "logged_by": "facebook|gmail" } ];

  if (providers) {
    res.send({ status: 0, data: providers });
  } else {
    res.send( { status: 2, message: 'No account found for given email' });
  }
});

router.post('/pocketbook-cloud/connect', async (req, res) => {
  let username = req.body.username;
  let credentials = req.body.credentials;
  let provider = req.body.provider;

  const connected = await PocketBookCloudService.connect(username, credentials, provider);
  //let connected;

  if (connected) {
    res.send({ status: 0, data: true });
  } else {
    res.send({ status: 1, message: 'Could not connect, please check your password is correct' })
  }
});

router.delete('/pocketbook-cloud/disconnect', async (req, res) => {
  await PocketBookCloudService.disconnect(req.body.username);
  res.send({ status: 0, message: 'disconnected from pocketbook-cloud account' });
});

/*async function sendFileToKindle(recipient, data, filename) {
  const filePath = await saveToDiskAsync(data, filename);
  if (!filePath) return;
  return await mailservice.sendFileToKindle(recipient, filePath, filename);
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

async function downloadWithUrl(url) {
  try {
    const request = await axios.get(url, {
      responseType: 'stream',
    });
    return {file: await request.data, cover: {} };
  } catch (err) {
    return {error: `book download failed using url: ${url} |=| ${err}`}
  }
}

async function downloadWithMD5(md5Hash) {
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
    console.error('error while trying to download book cover: ', err)
  }

  book.cover.file = cover;
  book.cover.name = coverName;

  return book;
}*/

async function search(searchString, pageNumber, mobile) {
  const rawBookData = await getRawBooks(searchString, pageNumber);
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
    var replaceString = '';

    if (mobile == 'true') {
      replaceString = '_small';
    }

    idArray.forEach((id, index) => {
      bookDetails[id] = { coverUrl: coverUrls[index].replace(replaceString, ''), author: authors[index] };
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
  return Array.from(authors).map(author => author.textContent);
}

async function getRawBooks(searchString, pageNumber) {
  var config = {
    method: 'get',
    url: `${LIBGEN_MIRROR}/index.php?req=${searchString}+ext:epub&columns%5B%5D=t&columns%5B%5D=a&columns%5B%5D=s&columns%5B%5D=y&columns%5B%5D=p&columns%5B%5D=i&objects%5B%5D=f&topics%5B%5D=l&topics%5B%5D=f&res=100&covers=on&gmode=on&filesuns=all&page=${pageNumber}`,
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
      var isbn = undefined;
      try {
        Object.values(edition.add).forEach(additionalInfo => {
          if (additionalInfo.name_en == 'Language') {
            lang = additionalInfo;
          }
        });
      } catch(error) {
        console.warn(`no language found for edition: ${editionId}`);
      }
      try {
        Object.values(edition.add).forEach(additionalInfo => {
          if (additionalInfo.name_en == 'ISBN') {
            isbn = additionalInfo.value;
          }
        });
      } catch(error) {
        console.warn(`no isbn found for edition: ${editionId}`);
      }
      bookData.push({book_id: key, md5: file.md5, title: edition.title, author: edition.author || bookDetails[key].author, 
        year: edition.year, language: lang.value, filesize: file.filesize, extension: file.extension, edition_id: editionId,
        isbn: isbn, filename: `${edition.title}.${file.extension}`, coverUrl: bookDetails[key].coverUrl});
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
    url: `${LIBGEN_MIRROR}/json.php?object=e&ids=${ids}&addkeys=101,505`,
  };

  const result = await axios(config);
  return await result.data;
}

module.exports = router;