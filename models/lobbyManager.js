const Lobby = require('./lobby');

function LobbyManager() {
    this.lobbies = new Map();
}

LobbyManager.prototype.create = function(host, type, settings) {
    let code = null;
    do {
        var result = '';
        const characters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
        for (var i = 0; i < 4; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        if (!this.lobbies.has(code)) {
            code = result;
        }
    } while (code === null);
    const newLobby = new Lobby(code, host, type, settings);
    this.lobbies.set(code, newLobby);
    return code;
}

LobbyManager.prototype.get = function(code) {
    return this.lobbies.get(code);
}

LobbyManager.prototype.has = function(code) {
    return this.lobbies.has(code);
}

LobbyManager.prototype.delete = function(code) {
    return this.lobbies.delete(code);
}

module.exports = new LobbyManager();