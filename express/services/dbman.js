const mongoose = require('mongoose');
const { DEC, ENC } = require('./secman');

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

mongoose.connect(CONNECTION_URL);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const UserSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    eReaderType: { type: String, required: true },
    eReaderEmail: String,
    eReaderDeviceId: String,
    eReaderRefreshToken: String
});

const User = mongoose.model('User', UserSchema);


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

module.exports.createUser = (user, callback) => {  
    new User(user).save((err) => {
        if (err) callback(err);
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