const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    messages: [{
        role: String,
        content: String,
        timestamp: { type: Date, default: Date.now }
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true }, { collection: 'chats' });

module.exports = mongoose.model('Chat', chatSchema)