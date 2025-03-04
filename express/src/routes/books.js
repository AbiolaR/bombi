var express = require('express');
var router = express.Router();
var mailservice = require('../services/email');
const { findUserAsync } = require('../services/dbman');
const { upload } = require('../services/tolinoman');
const jsdom = require('jsdom');
const axios = require('axios');
const { LibgenDbService } = require('../services/db/libgen-db.service');
const { BookService } = require('../services/book/book.service');
const { GoogleBooksSearchService } = require('../services/search/google-books-search.service');
const { PocketBookCloudService } = require('../services/e-readers/pocketbook-cloud.service');
const path = require('path');
const { ServerResponse } = require('../models/server-response');
const { BookSyncDbService } = require('../services/db/book-sync-db.service');
const { SyncStatus } = require('../models/sync-status.model');
const { HugendubelTolinoService } = require('../services/e-readers/hugendubel-tolino.service');

const TEMP_DIR = '/tmp/app.bombi/';

const tolinoService = new HugendubelTolinoService();

//const DAY_IN_MS = 1000 * 60 * 60 * 24;
//const axios = setupCache(Axios, { ttl: DAY_IN_MS, headerInterpreter: () => {return 'not enough headers'} });

router.get('/search', async(req, res) => {
  let libgenDbService = new LibgenDbService();

  var searchString = req.query.q;
  var defaultLang = req.query.dl;
  var pageNumber = req.query.p;

  if(!searchString) {
    res.json({error: "No search query given"});
    return;
  }

  var bookData = {books: [], suggestion: ''};
  
  try {
    if (process.env.STAGE == 'prod' || process.env.STAGE == 'staging') {
      bookData.books = await libgenDbService.indexedFullSearch(searchString, defaultLang, pageNumber)
      if (bookData.books.length == 0) {
        try {
          if (process.env.STAGE == 'prod') {
            bookData.suggestion = await BookService.getSpellingCorrection(searchString);
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

router.get('/search/isbn', async(req, res) => {
  let bookTitle = await GoogleBooksSearchService.searchByIsbn(req.query.isbn);
  res.send(new ServerResponse(bookTitle));
});

router.get('/fictioncovers/*', (req, res) => {
  const url = req.url.replace('/fictioncovers/', '').replace('-g', '');

  axios.get('https://libgen.vg/' + url, {responseType: 'stream', cache: false}).then(async (response) => {
    response.data.pipe(res);
  }).catch(() => {});
});

router.get('/coversproxy/*', (req, res) => { 
  const url = req.url.replace('/coversproxy/', '').replace('-g', '');

  axios.get('https://libgen.vg/' + url, {responseType: 'stream', cache: false}).then(async (response) => {
    response.data.pipe(res);
  }).catch(() => {});
});

router.get('/requests', (req, res) => {
  const bookSyncDbService = new BookSyncDbService();
  bookSyncDbService.findSyncRequests().then((syncRequests) => {
    const filteredRequests = syncRequests.filter(syncRequest => syncRequest.status != SyncStatus.IGNORE);
    res.status(200).send(new ServerResponse(filteredRequests));
  })
});

router.post('/upload', (req, res, next) => {
  const bookFile = req.files.bookFile;
  const coverFile = req.files.coverFile;
  const bookData = JSON.parse(req.body.bookData);
  const bookFilePath = path.join('..', 'books', bookData.author, bookData.title, bookFile.name);
  
  bookData.filename = bookFilePath;
  bookData.coverUrl = '';

  bookFile.mv(path.join(TEMP_DIR, bookFilePath), (error) => {
    if (error) {
      const errorMessage = 'Error while trying to save uploaded book';
      console.error(errorMessage + ': ', error);
      return res.status(200).send(new ServerResponse(undefined, 0, errorMessage));
    }
    if (coverFile) {
      const coverUrl = path.join('/assets/images/MediaCover/Books/custom/', coverFile.name);
      bookData.coverUrl = coverUrl;
      const coverFolder = `${path.dirname(require.main.filename)}/../static`;
      coverFile.mv(path.join(coverFolder, coverUrl), async (error) => {
        if (error) {
          const errorMessage = 'Error while trying to save uploaded book';
          console.error(errorMessage + ': ', error);
          return res.status(200).send(new ServerResponse(undefined, 0, errorMessage));
        }
        await LibgenDbService.createLocalBook(bookData);
        res.status(200).send(new ServerResponse(undefined, 1));
      });    
    } else {
      res.status(200).send(new ServerResponse(undefined, 1));
    }
  });
});

router.get('/download', async(req, res, next) => {
  let bookData = JSON.parse(req.query.bookData);

  if (!bookData) {
    res.status(404).send({error: "No book data given"});
    return;
  }

  let coverUrl = bookData.coverUrl.split(/\/.*covers\//).pop();
  bookData.coverUrl = bookData.coverUrl.replace(coverUrl, '');
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
    let coverUrl = bookData.coverUrl.split(/\/.*covers\//).pop();
    bookData.coverUrl = bookData.coverUrl.replace(coverUrl, '');
  }
  let kindleMode = false;
  if (user.eReaderType == 'K') {
    kindleMode = true;
  }

  let downloadResponse;
  try {
    downloadResponse = await BookService.download(bookData, kindleMode);
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

router.get('/progress', async(req, res) => {
  let books = [];

  tolinoBooks = tolinoService.getBooksProgress(req.body.username);
  //tolinoBooks = [ { "id": 0, "md5": "", "title": "Fourth Wing 01 - Flammengeküsst", "author": "Yarros, Rebecca", "series": "", "publisher": "", "isbn": "", "language": "", "pubDate": "2023-10-24T12:58:38.429Z", "extension": ".epub", "filename": "", "coverUrl": "https://bosh.pageplace.de/bosh/rest/cover/308401010/bosh_10_3084010105806826712045637671", "progress": 0, "message": "" }, { "id": 0, "md5": "", "title": "Harry Potter und der Orden des Phönix", "author": "Rowling, J.K.", "series": "", "publisher": "", "isbn": "", "language": "", "pubDate": "2023-11-11T16:00:01.648Z", "extension": ".epub", "filename": "", "coverUrl": "https://bosh.pageplace.de/bosh/rest/cover/308401010/bosh_10_3084010106482246648887751944", "progress": 1, "message": "" }, { "id": 0, "md5": "", "title": "Harry Potter und der Halbblutprinz", "author": "J.K. Rowling", "series": "", "publisher": "", "isbn": "", "language": "", "pubDate": "2023-11-03T16:12:22.568Z", "extension": ".epub", "filename": "", "coverUrl": "https://bosh.pageplace.de/bosh/rest/cover/308401010/bosh_10_3084010106666619656848046225", "progress": 1, "message": "" }, { "id": 0, "md5": "", "title": "My Name Is Barbra", "author": "Barbra Streisand", "series": "", "publisher": "", "isbn": "", "language": "", "pubDate": "2023-11-25T00:32:18.645Z", "extension": ".epub", "filename": "", "coverUrl": "https://bosh.pageplace.de/bosh/rest/cover/308401010/bosh_10_3084010107464870560043785461", "progress": 1, "message": "" }, { "id": 0, "md5": "", "title": "The Book of Azrael", "author": "Amber Nicole", "series": "", "publisher": "", "isbn": "", "language": "", "pubDate": "2024-07-28T18:42:25.313Z", "extension": ".epub", "filename": "", "coverUrl": "https://bosh.pageplace.de/bosh/rest/cover/308401010/bosh_10_3084010107534643864025175413", "progress": 0, "message": "" }, { "id": 0, "md5": "", "title": "Harry Potter 3", "author": "Joanne K. Rowling", "series": "", "publisher": "", "isbn": "", "language": "", "pubDate": "2023-10-24T12:58:23.372Z", "extension": ".epub", "filename": "", "coverUrl": "https://bosh.pageplace.de/bosh/rest/cover/308401010/bosh_10_3084010107622592345860667102", "progress": 0, "message": "" }, { "id": 0, "md5": "", "title": "Eragon 04 - Das Erbe Der Macht", "author": "Christopher Paolini", "series": "", "publisher": "", "isbn": "", "language": "", "pubDate": "2024-08-24T12:51:17.921Z", "extension": ".epub", "filename": "", "coverUrl": "https://bosh.pageplace.de/bosh/rest/cover/308401010/bosh_10_3084010107640737054873495110", "progress": 24, "message": "" }, { "id": 0, "md5": "", "title": "Harry Potter - Gesamtausgabe", "author": "Joanne K. Rowling", "series": "", "publisher": "", "isbn": "", "language": "", "pubDate": "2023-11-03T15:59:08.059Z", "extension": ".epub", "filename": "", "coverUrl": "https://bosh.pageplace.de/bosh/rest/cover/308401010/bosh_10_3084010108169929310734035058", "progress": 0, "message": "" }, { "id": 0, "md5": "", "title": "Ark Angel", "author": "Anthony Horowitz", "series": "", "publisher": "", "isbn": "", "language": "", "pubDate": "2022-10-19T16:11:12.892Z", "extension": ".epub", "filename": "", "coverUrl": "https://bosh.pageplace.de/bosh/rest/cover/308401010/bosh_10_3084010108913743361390155178", "progress": 2, "message": "" } ];
  pocketBookBooks = PocketBookCloudService.getBooksProgress(req.body.username);
  
  books = books.concat(...await Promise.all([tolinoBooks, pocketBookBooks]));

  res.send(new ServerResponse(books));
});

router.post('/tolino/connect', async(req, res) => {
  let credentials = req.body.credentials;

  if (!credentials?.username || !credentials?.password) {
    res.send({ status: 1, message: 'missing credentials' });
    return;
  }
  let result = await tolinoService.connect(req.body.username, credentials);
  res.send(result)
});

router.delete('/tolino/disconnect', async(req, res) => {
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

module.exports = router;