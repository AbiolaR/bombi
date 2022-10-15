var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

var books = require('./routes/books');
var users = require('./routes/users');
var authorization = require('./filters/authorization');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:4200', 'http://tinympc:4200', 'https://bombi.tinym.de']
}));

app.use('/api/v1/books/send', authorization);
app.use('/api/v1/books', books);
app.use('/api/v1/users', users);
app.use('/', express.static('./static'));
app.use('/*', express.static('./static'));

module.exports = app;