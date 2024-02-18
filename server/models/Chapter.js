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
        required: false
    },
    isDraft: {
        type: Boolean,
        default: true,
        required: true
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