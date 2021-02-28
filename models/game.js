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

    getCurrentLeader() {
        return this.state.getCurrentLeader();
    }

    getCurrentMission() {
        return this.state.getCurrentMission();
    }

    getPlayerInformation(sessionId) {
        const playerInformation = [];
        const currentPlayer = this.state.playersBySession.get(sessionId);

        if (currentPlayer.isSpy) {
            for (let i = 0; i < this.state.playerCount; i++) {
                const player = this.state.players[i];
                const status = player.isSpy ? "spy" : "resistance";
                playerInformation.push({
                    name: player.name,
                    role: player.role.name,
                    team: player.role.team,
                    status: status
                });
            }
        } else {
            for (let i = 0; i < this.state.playerCount; i++) {
                const player = this.state.players[i];
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
                
                playerInformation.push({
                    name: player.name,
                    role: player.role.name,
                    team: player.role.team,
                    status: status
                });
            }
        }
        
        return playerInformation;
    }

    getPlayerName(index) {
        return this.state.getPlayerName(index);
    }

    getPlayerRole(index) {
        return this.state.getPlayerRole(index);
    }
}

module.exports = Game;