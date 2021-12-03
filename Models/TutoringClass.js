const { Schema, model } = require('mongoose');
const { autoIncrement } = require('../mongoose-connection.js');

const TutoringClassSchema = new Schema({
    description: { type: String, maxLength: 500, required: true },
    subject: { type: String, maxLength: 80, required: true },
    teacher_id: { type: Number, required: true },
    users: { type: [Number] }
});

TutoringClassSchema.plugin(autoIncrement, { id: 'tutoring_class_counter', inc_field: 'id' });
const TutoringClass = model('tutoring_class', TutoringClassSchema);

module.exports = TutoringClass;