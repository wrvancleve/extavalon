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
        return this.state.resistanceWins === 3 || this.state.spyWins === 3;
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

    getPreviousLeader() {
        return this.state.currentLeaderId === 0
            ? this.state.players[this.state.playerCount - 1]
            : this.state.players[this.state.currentLeaderId - 1]
    }

    getCurrentMission() {
        return this.state.getCurrentMission();
    }

    getCurrentProposal() {
        return this.state.getCurrentProposal();
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

    createProposal(ids) {
        const proposal = new Proposal(this.state.currentLeaderId, ids);
        this.state.getCurrentMission().addProposal(this.state.currentLeaderId, proposal);
    }

    addProposalVote(id, vote) {
        const currentProposal = this.state.getCurrentProposal();
        currentProposal.addVote(id, vote);
        if (currentProposal.voteCount === this.state.playerCount) {
            const result = currentProposal.finalize();
            const gameOver = this._processProposalResult(result);
            return {proposal: currentProposal, approved: result, gameOver: gameOver};
        } else {
            return null;
        }
    }

    _processProposalResult(result) {
        if (!result) {
            const currentMission = this.state.getCurrentMission();
            currentMission.failedProposalCount += 1;
            if (currentMission.failedProposalCount === this.state.playerCount) {
                currentMission.result = 'Fail';
                this._processMissionResult('Fail');
            } else {
                this._advanceLeader();
            }
        }

        return false;
    }

    addMissionAction(id, action) {
        const currentMission = this.state.getCurrentMission();
        currentMission.addAction(id, action);
        if (currentMission.actionCount === currentMission.teamSize) {
            const result = currentMission.finalize();
            const gameOver = this._processMissionResult(result);
            return {
                result: result,
                successCount: currentMission.actionCount - currentMission.failActionCount - currentMission.reverseActionCount,
                failCount: currentMission.failActionCount,
                reverseCount: currentMission.reverseActionCount,
                gameOver: gameOver
            };
        } else {
            return null;
        }
    }

    _processMissionResult(result) {
        switch (result) {
            case "Success":
                this.state.resistanceWins += 1;
                break;
            case "Fail":
                this.state.spyWins += 1;
                break;
        }

        if (this._gameOver()) {
            return true;
        }

        this.state.currentMissionId += 1;
        this._advanceLeader();
        return false;
    }

    _advanceLeader() {
        this.state.currentLeaderId += 1;
        this.state.currentLeaderId %= this.state.playerCount;
    }

    getPlayer(id) {
        return this.state.players[id].getPlayerObject();
    }

    getPlayersByIds(ids) {
        const players = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            players.push(this.state.players[id].getPlayerObject());
        }
        return players;
    }
}

module.exports = Game;