const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ChapterSchema = new Schema({
    title: {
        type: String,
        default: "Untitled",
        required: true
    },
    body: {
        type: String,
        default: "",
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Chapter', ChapterSchema);