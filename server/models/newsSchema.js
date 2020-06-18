var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const newsSchema = new Schema(
    { 
        event: {type: String, enum: [ 'New Alumni', 'New Student', 'Confirmed Meeting' ] }, 
        alumni: [{type: Schema.Types.ObjectId, ref: 'Alumni'}], 
        students: [{type: Schema.Types.ObjectId, ref: 'Student'}], 
        time: {type: Date, default: Date.now}, 
        role: {type: String, default: 'BOTH', enum: ['BOTH', 'ALUMNI', 'STUDENT']} 
    }
);

module.exports = mongoose.model('News', newsSchema);