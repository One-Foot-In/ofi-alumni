var mongoose = require('mongoose');
var moment = require('moment');

const Schema = mongoose.Schema;

const newsSchema = new Schema(
    { 
        event: {type: String, enum: [ 'New Alumni', 'New Student', 'Confirmed Meeting', 'New Topics' ] }, 
        alumni: [{type: Schema.Types.ObjectId, ref: 'Alumni'}], 
        students: [{type: Schema.Types.ObjectId, ref: 'Student'}], 
        school: {type: Schema.Types.ObjectId, ref: 'School'},
        dateCreated: {type: Date, default: moment()}, 
        role: {type: String, default: 'BOTH', enum: ['BOTH', 'ALUMNI', 'STUDENT']},
        grade: {type: Number, default: null},
        supportData: {type: Object, required: false}
    }
);

module.exports = mongoose.model('News', newsSchema);