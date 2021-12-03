const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { autoIncrement } = require('../mongoose-connection.js'); 
const { encryptPassword } = require('../helpers.js');

const emailRegex = /\w+@(stud\.upb\.ro)|(onmicrosoft\.upb\.ro)/;
const UserSchema = new Schema({
    lastname: { type: String, maxLength: 50, required: true },
    firstname: { type: String, maxLength: 50, required: true },
    email: { type: String, maxLength: 50, match: emailRegex, required: true, unique: true },
    password: { type: String, maxLength: 75, minLength: 8, required: true },
    role: { type: String, enum: ['student', 'teacher'], required: true },
    salt: { type: String },
    reviews: { type: [Number] },
    tutoring_classes: { type: [Number] }
});

UserSchema.pre('save', async function(next) {
    await encryptPassword(this);
    next(); 
});

UserSchema.plugin(autoIncrement, { id: 'users_counter', inc_field: 'id' });
const User = model('User', UserSchema);

module.exports = User;