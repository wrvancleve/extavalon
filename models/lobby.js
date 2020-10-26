const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const LobbySchema = new Schema({
    code: {type: String, required: true},
    status: {type: String, required: true},
    settings: {
        type: { guinevere: Boolean, puck: Boolean, jester: Boolean, lucius: Boolean,
            leon: Boolean, galahad: Boolean, assassin: String },
        required: true
    },
    players: {type: [{sessionId: String, socketId: String, name: String}], default: []}
}, {collection: 'lobby'});

const Lobby = mongoose.model('Lobby', LobbySchema);

module.exports = Lobby;