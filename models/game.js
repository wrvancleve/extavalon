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

    getPlayerName(index) {
        return this.state.getPlayerName(index);
    }

    getPlayerRole(index) {
        return this.state.getPlayerRole(index);
    }
}

module.exports = Game;