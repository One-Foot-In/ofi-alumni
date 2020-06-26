var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const timeAvailabilitySchema = new Schema({
  id: {type: String, required: true},
  day: {type: String, enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
  time: {type: Number, required: true}
})

const requestSchema = new Schema(
  {
    student: {type: Schema.Types.ObjectId, ref: 'Student'},
    mentor: {type: Schema.Types.ObjectId, ref: 'Alumni'},
    time: [timeAvailabilitySchema],
    zoomLink: {type: String},
    topic: {type: String, required: true},
    status: {type: String, 
                enum: [ 
                        'Awaiting Confirmation',
                        'Confirmed',
                        'Completed',
                        'Rejected'
                      ]
            },
    studentNote: {type: String},
    finalNote: {type: String},
    feedback: {type: String}
  }
);

module.exports = mongoose.model('Requests', requestSchema);