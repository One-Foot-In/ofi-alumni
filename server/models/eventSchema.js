var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const eventSchema = new Schema(
    {
        creator: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        title: {type: String, required: true},
        date: {type: Date, required: true},
        link: {type: String, required: true},
        description: {type: String, required: true},
        school: {type: Schema.Types.ObjectId, ref: 'School', required: false},
        startYear: {type: Number, required: false},
        endYear: {type: Number, required: false}
    }
);

module.exports = mongoose.model('Event', eventSchema);