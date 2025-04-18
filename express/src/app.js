var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var books = require('./routes/books');
var users = require('./routes/users');
var authorization = require('./filters/authorization');
const fileUpload = require('express-fileupload');
const { LibgenDbService } = require('./services/db/libgen-db.service');
const { BookSyncDbService } = require('./services/db/book-sync-db.service');
const { JobScheduler } = require('./services/job-schedule.service');
const { EpubToolsService } = require('./services/epub-tools.service');

async function initStatics() {
    let libgenDBInit = LibgenDbService.initDB();
    let bookSyncDBInit = BookSyncDbService.initDB();
    let epubToolsInit = EpubToolsService.initialize();

    await Promise.all([libgenDBInit, bookSyncDBInit, epubToolsInit]);
    console.info('[INFO] Server ready')
}

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload({ createParentPath: true }));
app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:8080', 'http://tinympc:4200', 'http://tinympc.local:4200', 'https://bombi.tinym.de', 'https://vk.com', 'https://m.vk.com']
}));

app.use('/api/v1/books/send', authorization());
app.use('/api/v1/books/tolino/connect', authorization());
app.use('/api/v1/books/tolino/disconnect', authorization());
app.use('/api/v1/books/pocketbook-cloud/providers', authorization());
app.use('/api/v1/books/pocketbook-cloud/connect', authorization());
app.use('/api/v1/books/pocketbook-cloud/disconnect', authorization());
app.use('/api/v1/books/progress', authorization());
app.use('/api/v1/books/upload', authorization('admin'));
app.use('/api/v1/books/requests', authorization('admin'));
app.use('/api/v1/users/save', authorization());
app.use('/api/v1/users/data', authorization());
app.use('/api/v1/users/role', authorization());
app.use('/api/v1/users/share', authorization());
app.use('/api/v1/users/shared', authorization());
app.use('/api/v1/users/friend-request/send', authorization());
app.use('/api/v1/users/friend-request/accept', authorization());
app.use('/api/v1/users/srp-connection', authorization());
app.use('/api/v1/users/srp-sync', authorization());
app.use('/api/v1/users/srp-resync', authorization());
app.use('/api/v1/users/srp-sync/status', authorization());
app.use('/api/v1/books', books);
app.use('/api/v1/users', users);
app.use(express.static(`${__dirname}/static/`, { redirect: false }));
app.use('*', (req, res) => {
    res.sendFile(`${__dirname}/static/index.html`);
});

initStatics().then(() => {
    JobScheduler.scheduleJobs();
});

module.exports = app;