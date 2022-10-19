const mongoose = require('mongoose');
const { DEC } = require('./secman');

const ENV = process.env.STAGE == 'prod' ? 'Prod' : 'Test';
const USERNAME = DEC('U2FsdGVkX19RvYn9V3O/iHHG66d6vdHVQIFs9UB5ItM=');
const PASSWORD = DEC('U2FsdGVkX1/7pbFBpu1QpLGKmysIK+wsMAInfucrtU7ZV7a7sez3MhktwNr5gV0z');
const CONNECTION_URL = `mongodb://${USERNAME}:${PASSWORD}@192.168.2.101:27017/bombi${ENV}DB?authMechanism=DEFAULT`

mongoose.connect(CONNECTION_URL);
const db = mongoose.connection;

//console.log(ENC('FDwfK8u3Qe5kFKC8xy5x'))

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const UserSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    eReaderEmail: String,
    eReader: String
});

const User = mongoose.model('User', UserSchema);


module.exports.findUser = (username, callback) => {
    User.findOne({ username: username }, (err, user) => {
        if (err) callback(err);
        callback(user);
    });
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