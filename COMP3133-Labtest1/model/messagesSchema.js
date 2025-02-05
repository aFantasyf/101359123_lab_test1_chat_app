const mongoose = require('mongoose')

const messagesSchema = new mongoose.Schema({
    room: { type: String, required: true },  
    user: { type: String, required: true }, 
    message: { type: String, required: true },  
    timestamp: { type: Date, default: Date.now }  
})

const Message = mongoose.model('Message', messagesSchema)

module.exports = Message