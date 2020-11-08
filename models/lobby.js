const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const LobbySchema = new Schema({
    code: {type: String, required: true},
    settings: {
        type: { guinevere: Boolean, puck: Boolean, jester: Boolean, leon: Boolean, galahad: Boolean,
            lucius: Boolean, titania: Boolean, accolon: Boolean },
        required: true
    },
    players: {
        type: [{sessionId: String, socketId: String, name: String, active: Boolean, gameInformation: String}],
        default: []
    }
}, {collection: 'lobby'});

const Lobby = mongoose.model('Lobby', LobbySchema);

module.exports = Lobby;