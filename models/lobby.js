const PlayerCollection = require('./playerCollection');

function Lobby(code, host, type, settings) {
    this.code = code;
    this.host = host;
    this.type = type;
    this.settings = settings;
    this.game = null;
    this.playerCollection = new PlayerCollection();
    this.updateTime = Date.now();
    this.currentIdentityPicker = null;
    this.previousIdentityPickers = [];
}

module.exports = Lobby;