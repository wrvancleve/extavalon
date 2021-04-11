class PlayerCollection {
    constructor() {
        this.players = [];
        this.playersBySessionId = new Map();
        this.playersBySocketId = new Map();
        this.playersByPlayerId = new Map();
    }

    getPlayerCount() {
        return this.players.length;
    }

    getLobbyPlayers() {
        return this.players.map(({ name, active }) => ({name, active}));
    }

    getActivePlayers() {
        return this.players.filter(player => player.active);
    }

    doesSessionIdExist(sessionId) {
        return this.playersBySessionId.has(sessionId);
    }

    doesSocketIdExist(socketId) {
        return this.playersBySocketId.has(socketId);
    }

    getPlayerOfPlayerId(playerId) {
        return this.playersByPlayerId.get(playerId);
    }

    getPlayerOfSessionId(sessionId) {
        return this.playersBySessionId.get(sessionId);
    }

    getPlayerIdOfSessionId(sessionId) {
        return this.getPlayerOfSessionId(sessionId).id;
    }

    getSocketIdOfPlayerId(playerId) {
        return this.getPlayerOfPlayerId(playerId).socketId;
    }

    addPlayer(socket, name) {
        const sessionId = socket.request.session.id;
        const socketId = socket.id;
        const newPlayer = {
            sessionId: sessionId,
            socketId: socketId,
            name: name,
            active: true,
            id: null
        };

        this.players.push(newPlayer);
        this.playersBySessionId.set(sessionId, newPlayer);
        this.playersBySocketId.set(socketId, newPlayer);
    }

    updatePlayer(sessionId, socketId, name, active) {
        const player = this.playersBySessionId.get(sessionId);
        player.socketId = socketId;
        player.name = name;
        player.active = active;
    }

    updateSocketId(sessionId, socketId) {
        this._updateSocketId(this.playersBySessionId.get(sessionId), socketId);
    }

    deactivatePlayer(sessionId) {
        const player = this.playersBySessionId.get(sessionId);
        player.active = false;
    }

    updatePlayerIdBySessionId(sessionId, playerId) {
        const player = this.playersBySessionId.get(sessionId);
        if (this.playersByPlayerId.has(playerId)) {
            this.playersByPlayerId.get(playerId).id = null;
            this.playersByPlayerId.delete(playerId);
        }
        player.id = playerId;
        this.playersByPlayerId.set(playerId, player);
    }

    updatePlayerIdBySocketId(socketId, playerId) {
        const player = this.playersBySocketId.get(socketId);
        if (this.playersByPlayerId.has(playerId)) {
            this.playersByPlayerId.get(playerId).id = null;
            this.playersByPlayerId.delete(playerId);
        }
        player.id = playerId;
        this.playersByPlayerId.set(playerId, player);
    }

    clearPlayerIds() {
        for (let player of this.players) {
            player.id = null;
        }
    }

    _updateSocketId(player, socketId) {
        this.playersBySocketId.delete(player.socketId);
        player.socketId = socketId;
        this.playersBySocketId.set(player.socketId, player);
    }
}

module.exports = PlayerCollection;