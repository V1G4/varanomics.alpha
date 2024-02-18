const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UnitSchema = new Schema({
    title: {
        type: String,
        default: "Untitled",
        required: true
    },
    chapters: [ mongoose.ObjectId ]
});

module.exports = mongoose.model('Unit', UnitSchema);
