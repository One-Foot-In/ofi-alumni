var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const requestSchema = new Schema(
  {
    student: {type: Schema.Types.ObjectId, ref: 'Student'},
    alumni: {type: Schema.Types.ObjectId, ref: 'Alumni'},
    time: {type: String, required: true},
    zoomLink: {type: String},
    topic: {type: String, required: true},
    status: {type: String, 
                enum: [ 'Awaiting Confirmation',
                        'Completed',
                        'Rejected',
                        'Feedback Provided'
                      ]
            },
    intro: {type: String},
    note: {type: String}
  }
);

module.exports = mongoose.model('Requests', requestSchema);