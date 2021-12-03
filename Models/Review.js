const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { autoIncrement } = require('../mongoose-connection.js'); 

const ReviewSchema = new Schema({
    message: { type: String, maxLength: 500, required: true },
    user_id: { type: Number, required: true }
})

ReviewSchema.plugin(autoIncrement, { id: 'reviews_counter', inc_field: 'id' });
const Review = model('Review', ReviewSchema);

module.exports = Review;