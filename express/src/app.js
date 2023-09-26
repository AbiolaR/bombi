var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');


var books = require('./routes/books');
var users = require('./routes/users');
var authorization = require('./filters/authorization');
const { LibgenDbService } = require('./services/db/libgen-db.service');
const { ENC } = require('./services/secman');
const { BookSyncDbService } = require('./services/db/book-sync-db.service');
const { BookSyncService } = require('./services/book/book-sync.service');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:8080', 'http://tinympc:4200', 'http://tinympc.local:4200', 'https://bombi.tinym.de', 'https://vk.com', 'https://m.vk.com']
}));

app.use('/api/v1/books/send', authorization);
app.use('/api/v1/users/save', authorization);
app.use('/api/v1/users/data', authorization);
app.use('/api/v1/users/share', authorization);
app.use('/api/v1/users/shared', authorization);
app.use('/api/v1/users/friend-request/send', authorization);
app.use('/api/v1/users/friend-request/accept', authorization);
app.use('/api/v1/users/srp-connection', authorization);
app.use('/api/v1/users/srp-sync', authorization);
app.use('/api/v1/users/srp-sync/status', authorization);
app.use('/api/v1/books', books);
app.use('/api/v1/users', users);
app.use('/', express.static('./static'));
app.use('/*', express.static('./static'));

service = new BookSyncDbService();

/*new LibgenDbService().initDB().then((libgenDbService) => {
    new BookSyncService(libgenDbService).updateHostIp();
});*/

//console.log('start')
new LibgenDbService();

/*console.log(await (this.libgenDbService.getParam('host_ip')))
//console.log(new BookSyncService().updateHostIp())
console.log('end')*/

//console.log(service)

module.exports = app;