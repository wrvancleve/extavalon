const PlayerCollection = require('./playerCollection');

function Lobby(code, host, settings) {
    this.code = code;
    this.host = host;
    this.settings = settings;
    this.game = null;
    this.playerCollection = new PlayerCollection();
    this.updateTime = Date.now();
    this.currentIdentityPicker = null;
    this.previousIdentityPickers = [];
    this.currentStartingPlayerInformation = null;
    this.previousStartingPlayers = [];
}

module.exports = Lobby;