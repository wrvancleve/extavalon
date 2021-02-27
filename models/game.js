const GameState = require('./gameState');
const Roles = require('./roles');
const Mission = require('./mission');

const { shuffle, choice } = require('../utils/random');
const Proposal = require('./proposal');

class Game {
    constructor(playerInformation, settings) {
        this.state = new GameState(playerInformation, settings);
    }

    _gameOver() {
        if (this.state.failedProposalCount === this.state.playerCount) {
            return true;
        } else {
            return this.state.resistanceWins === 3 || this.state.spyWins === 3;
        }
    }

    getPlayerHTML(sessionId) {
        return this.state.getPlayerHTML(sessionId);
    }

    isFirstPlayer(sessionId) {
        return this.state.isFirstPlayer(sessionId);
    }

    getPlayerInformation() {
        const playerInformation = [];
        for (let i = 0; i < this.state.playerCount; i++) {
            const player = this.state.players[i];
            playerInformation.push({
                name: player.name,
                role: player.role.name,
                team: player.role.team
            });
        }
        return playerInformation;
    }

    getPlayerIndex(sessionId) {
        return this.state.playersBySession.get(sessionId).id;
    }

    getPlayerName(index) {
        return this.state.getPlayerName(index);
    }

    getPlayerRole(index) {
        return this.state.getPlayerRole(index);
    }
}

module.exports = Game;