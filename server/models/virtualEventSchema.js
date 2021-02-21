const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const virtualEvent = new Schema(
    {
        creator: [{type: Schema.Types.ObjectId, ref: 'User'}],
        // dateCreated 
    }
);