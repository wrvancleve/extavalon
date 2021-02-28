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

    getPlayerHTML(id) {
        return this.state.players[id].getPlayerHTML();
    }

    isFirstPlayer(id) {
        return this.state.currentLeaderId === id;
    }

    getCurrentLeader() {
        return this.state.getCurrentLeader();
    }

    getCurrentMission() {
        return this.state.getCurrentMission();
    }

    getPlayerInformation(id) {
        const playerInformation = [];
        const currentPlayer = this.state.players[id];

        if (currentPlayer.isSpy) {
            for (let i = 0; i < this.state.playerCount; i++) {
                const player = this.state.players[i];
                const status = player.isSpy ? "spy" : "resistance";
                const playerObject = player.getPlayerObject();
                playerObject.status = status;
                playerInformation.push(playerObject);
            }
        } else {
            for (let i = 0; i < this.state.playerCount; i++) {
                const player = this.state.players[i];
                const playerObject = player.getPlayerObject();
                let status = "unknown";
                if (i === currentPlayer.id) {
                    status = "resistance"
                } else {
                    switch (currentPlayer.role) {
                        case Roles.Merlin:
                            if((player.isSpy && player.role !== Roles.Mordred) || player.role === Roles.Puck) {
                                status = "suspicious";
                            }
                            break;
                        case Roles.Tristan:
                            if(player.role === Roles.Iseult){
                                status = "resistance";
                            }
                            break;
                        case Roles.Iseult:
                            if(player.role === Roles.Tristan){
                                status = "resistance";
                            }
                            break;
                        case Roles.Percival:
                            if(player.role === Roles.Merlin || player.role === Roles.Morgana){
                                status = "suspicious";
                            }
                            break;
                        case Roles.Guinevere:
                            if(player.role === Roles.Maelagant || player.role === Roles.Lancelot){
                                status = "suspicious";
                            }
                            break;
                        case Roles.Uther:
                            if (player == this.state.utherSight) {
                                status = "resistance";
                            }
                            break;
                    }
                }
                
                playerObject.status = status;
                playerInformation.push(playerObject);
            }
        }
        
        return playerInformation;
    }
}

module.exports = Game;