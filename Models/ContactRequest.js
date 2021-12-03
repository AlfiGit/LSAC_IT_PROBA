const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { isEmail } = require('validator');
const { autoIncrement } = require('../mongoose-connection.js'); 

const ContactRequestSchema = new Schema({
    id: { type: Number },
    name: { type: String, maxLength: 50, required: true },
    email: { type: String, maxLength: 50, validate: isEmail, required: true },
    message: { type: String, maxLength: 5000, required: true },
    is_resolved: { type: Boolean, default: false }
});

ContactRequestSchema.plugin(autoIncrement, { id: 'contact_req_counter', inc_field: 'id' });
const ContactRequest = model('Contact Request', ContactRequestSchema);

module.exports = ContactRequest;