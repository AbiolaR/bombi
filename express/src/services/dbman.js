const mongoose = require('mongoose');
const { DEC } = require('./secman');
const { PocketBookConfig: PocketBookConfigClass } = require('../models/db/mongodb/pocketbook-config.model');

const ENV = process.env.STAGE == 'prod' ? 'Prod' : 'Test';

var USERNAME;
var PASSWORD;
if (ENV == 'Prod') {
    USERNAME = DEC('U2FsdGVkX1/Jrs54r5J/aCJxlgDaGxCSGf4KYvIm+dU=');
    PASSWORD = DEC('U2FsdGVkX18KcCln+9q3P4lmjRN5Sz+NbBhza89fyFhcCooVGRhWsBVHvlEQIfjQ1VE7kmMZWPl9LLYmcD4DLw==');
} else {
    USERNAME = DEC('U2FsdGVkX19RvYn9V3O/iHHG66d6vdHVQIFs9UB5ItM=');
    PASSWORD = DEC('U2FsdGVkX1/7pbFBpu1QpLGKmysIK+wsMAInfucrtU7ZV7a7sez3MhktwNr5gV0z');
}

const CONNECTION_URL = `mongodb://${USERNAME}:${PASSWORD}@192.168.2.101:27017/bombi${ENV}DB?authMechanism=DEFAULT`

mongoose.set('strictQuery', true);
mongoose.connect(CONNECTION_URL);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const PushSubscriptionKeysSchema = mongoose.Schema({
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
});

const PushSubscriptionSchema = mongoose.Schema({
    endpoint: { type: String, required: true },
    keys: { type: PushSubscriptionKeysSchema, required: true },
    expirationTime: Number,
});

const BookSchema = mongoose.Schema({
    id: Number,
    title: String,
    md5: String,
    filename: String,
    author: String,
    series: String,
    year: String,
    extension: String,
    language: String,
    coverUrl: String,
    isbn: String,
    message: String
});

const ContactSchema = mongoose.Schema({
    name: { type: String, required: true },
    unreadMessages: Number,
    sharedBooks: [BookSchema]
});

const PocketBookCloudConfig = mongoose.Schema({
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true }
});

const PocketBookConfig = mongoose.Schema({
    cloudConfig: PocketBookCloudConfig,
    sendToEmail: String 
});

const UserSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: String,
    email: { type: String, required: true },
    searchHistory : { type: Map, of: String, required: true },
    passwordResetHash: {type: String, required: false },
    passwordResetCode: {type: String, required: false },
    eReaderType: { type: String, required: true },
    eReaderEmail: String,
    eReaderDeviceId: String,
    eReaderRefreshToken: String,
    language: String,
    friendRequests: [String],
    contacts: [ContactSchema],
    pushSubscriptions: [PushSubscriptionSchema],
    tsgPreferedLanguage: String,
    tsgRigidLanguage: Boolean,
    tsgUseSyncTag: Boolean,
    tsgUsername: String,
    tsgCookies: [String],
    grPreferedLanguage: String,
    grRigidLanguage: Boolean,
    grUseSyncTag: Boolean,
    grUserId: String,
    grCookies: [String],
    pocketBookConfig: { type: PocketBookConfig, default: new PocketBookConfigClass() }
});

module.exports.UserSchema = UserSchema;

const User = mongoose.model('User', UserSchema);

module.exports.findAllUsersAsync = async () => {
    return await User.find();
}

module.exports.findUser = (username, callback) => {
    User.findOne({ username: username }, (err, user) => {
        if (callback) {
            if (err) callback(err);
            callback(user);
        }
    }).collation({ locale: 'de', strength: 2 });
}

module.exports.findUserAsync = async (username) => {
    return await User.findOne({ username: username }).collation({ locale: 'de', strength: 2 });
}

module.exports.findUserByHash = (hash, callback) => {
    User.findOne({ passwordResetHash: hash }, (err, user) => {
        if (callback) {
            if (err) callback(err);
            callback(user)
        }
    });
}

module.exports.findUserByHashAsync = async (hash) => {
    return await User.findOne({ passwordResetHash: hash });
}

module.exports.findUserByUsernameAndCode = (username, code, callback) => {
    User.findOne({ username: username, passwordResetCode: code`` }, (err, user) => {
        if (callback) {
            if (err) callback(err);
            callback(user)
        }
    });
} 

module.exports.findUserByUsernameAndCode = async (username, code) => {
    return await User.findOne({ username: username, passwordResetCode: code });
}

module.exports.createUser = (user, callback) => {
    new User(user).save((err) => {
        if (err) {
            console.error('Error while trying to register user: ', err)
            callback(err); 
        }
        callback('saved user succesfully')
    });
}

module.exports.updateUser = (userdata, callback) => {
    User.findOneAndUpdate({ username: userdata.username }, userdata, (err, user) => {
        if (err) callback(err);
        callback(user);
    })
}

module.exports.updateUserAsync = async (userdata) => {
    return await User.findOneAndUpdate({ username: userdata.username }, userdata);
}