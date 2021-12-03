const mongoose = require('mongoose');
const mongooseSequence = require('mongoose-sequence');

const MONGO_PORT = process.env.PORT || 27017;
const MONGO_URL = process.env.URL || `mongodb://localhost:${MONGO_PORT}/IT_PROBA_DB`;

const connection = mongoose.connect(MONGO_URL).catch(err => console.log(err));
const autoIncrement = mongooseSequence(mongoose);

module.exports = { connection, autoIncrement };