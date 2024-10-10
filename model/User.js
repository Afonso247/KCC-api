const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    chats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }],
    resetToken: {
        type: String
    },
    resetTokenExpiration: {
        type: Date
    }
}, { timestamps: true } , { collection: 'users' });

module.exports = mongoose.model('User', userSchema)