class PlayerCollection {
    constructor() {
        this.players = [];
        this.playersByUserId = new Map();
        this.playersBySocketId = new Map();
        this.playersByPlayerId = new Map();
    }

    getPlayerCount() {
        return this.players.length;
    }

    getPlayers() {
        return this.players;
    }

    getGamePlayers() {
        return this.players.filter(player => player.id !== null);
    }

    getLobbyPlayers() {
        return this.players.map(({ displayName, active }) => ({name: displayName, active}));
    }

    doesUserIdExist(userId) {
        return this.playersByUserId.has(userId);
    }

    doesSocketIdExist(socketId) {
        return this.playersBySocketId.has(socketId);
    }

    getPlayerOfPlayerId(playerId) {
        return this.playersByPlayerId.get(playerId);
    }

    getPlayerOfUserId(userId) {
        return this.playersByUserId.get(userId);
    }

    getPlayerIdOfUserId(userId) {
        return this.getPlayerOfUserId(userId).id;
    }

    getSocketIdOfPlayerId(playerId) {
        return this.getPlayerOfPlayerId(playerId).socketId;
    }

    getUserIdOfPlayerId(playerId) {
        return this.getPlayerOfPlayerId(playerId).userId;
    }

    _getDisplayNameFromFirstAndLastName(userId, firstName, lastName) {
        var displayName = firstName;
        for (let player of this.players) {
            if (player.userId !== userId) {
                if (player.firstName === firstName) {
                    const firstInitialsEqual = player.lastName[0] === lastName[0];
                    if (firstInitialsEqual) {
                        return `${firstName} ${lastName}`;
                    } else if (displayName === firstName) {
                        displayName += ` ${lastName[0]}`;
                    }
                }
            }
        }
        return displayName;
    }

    _updatePlayerDisplayNames() {
        for (let player of this.players) {
            player.displayName = this._getDisplayNameFromFirstAndLastName(player.userId, player.firstName, player.lastName);
        }
    }

    addPlayer(socket) {
        const userId = socket.handshake.query.userId;
        const socketId = socket.id;
        const firstName = socket.handshake.query.firstName;
        const lastName = socket.handshake.query.lastName;
        const displayName = this._getDisplayNameFromFirstAndLastName(userId, firstName, lastName);
        const newPlayer = {
            userId: userId,
            socketId: socketId,
            firstName: firstName,
            lastName: lastName,
            displayName: displayName,
            active: true,
            id: null
        };

        this.players.push(newPlayer);
        this.playersByUserId.set(userId, newPlayer);
        this.playersBySocketId.set(socketId, newPlayer);

        this._updatePlayerDisplayNames();
    }

    removePlayer(playerIndex) {
        const removedPlayer = this.players.splice(playerIndex, 1)[0];
        this.playersByUserId.delete(removedPlayer.userId);
        this.playersBySocketId.delete(removedPlayer.socketId);
        if (removedPlayer.id !== null) {
            this.playersByPlayerId.delete(removedPlayer.id);
        }
        this._updatePlayerDisplayNames();
    }

    updatePlayer(userId, socketId, active) {
        const player = this.playersByUserId.get(userId);
        player.socketId = socketId;
        player.active = active;
    }

    updateSocketId(userId, socketId) {
        this._updateSocketId(this.playersByUserId.get(userId), socketId);
    }

    deactivatePlayer(userId) {
        const player = this.playersByUserId.get(userId);
        player.active = false;
    }

    updatePlayerIdByUserId(userId, playerId) {
        const player = this.playersByUserId.get(userId);
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
        this.playersByPlayerId.clear();
    }

    _updateSocketId(player, socketId) {
        this.playersBySocketId.delete(player.socketId);
        player.socketId = socketId;
        this.playersBySocketId.set(player.socketId, player);
    }

    handleUpdatePlayerIndex(playerIndexUpdateInformation) {
        const oldIndex = playerIndexUpdateInformation.oldIndex;
        const newIndex = playerIndexUpdateInformation.newIndex;
        const player = this.players.splice(oldIndex, 1)[0];
        this.players.splice(newIndex, 0, player);
    }
}

module.exports = PlayerCollection;