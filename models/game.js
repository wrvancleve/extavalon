const GameState = require('./gameState');
const Roles = require('./roles');
const Mission = require('./mission');

const { shuffle, choice } = require('../utils/random');
const Proposal = require('./proposal');

class Game {
    constructor(playerInformation, settings) {
        this.state = new GameState(playerInformation, settings);
    }

    getPlayerHTML(id) {
        return this.state.players[id].getPlayerHTML();
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

    isCurrentLeader(id) {
        return this.state.currentLeaderId === id;
    }

    getCurrentLeader() {
        return this.state.players[this.state.currentLeaderId];
    }

    getPreviousLeader() {
        return this.state.currentLeaderId === 0
            ? this.state.players[this.state.playerCount - 1]
            : this.state.players[this.state.currentLeaderId - 1]
    }

    getCurrentMission() {
        return this.state.missions[this.state.currentMissionId];
    }

    getCurrentProposal() {
        return this.getCurrentMission().getCurrentProposal();
    }

    getPlayer(id) {
        return this.state.players[id].getPlayerObject();
    }

    _advanceLeader() {
        this.state.currentLeaderId += 1;
        this.state.currentLeaderId %= this.state.playerCount;
    }

    _gameOver() {
        return this.state.resistanceWins === 3 || this.state.spyWins === 3;
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

    advance() {
        switch (this.state.phase) {
            case GameState.PHASE_PROPOSE:
                this.state.phase = GameState.PHASE_VOTE;
                break;
            case GameState.PHASE_VOTE:
                this.state.phase = GameState.PHASE_VOTE_REACT;
                break;
            case GameState.PHASE_VOTE_REACT:
                const proposalResult = this.getProposalResult();
                if (proposalResult.approved) {
                    this.state.phase = GameState.PHASE_CONDUCT;
                } else {
                    this._advanceLeader();
                    const currentMission = this.getCurrentMission();
                    currentMission.failedProposalCount += 1;
                    if (currentMission.failedProposalCount === this.state.playerCount) {
                        currentMission.result = 'Fail';
                        this.state.currentMissionId += 1;
                    }
                    this.state.phase = GameState.PHASE_PROPOSE;
                }
                break;
            case GameState.PHASE_CONDUCT:
                this.state.phase = GameState.PHASE_CONDUCT_REACT
                break;
            case GameState.PHASE_CONDUCT_REACT:
                const missionResult = this.getMissionResult();
                if (missionResult.result === 'Success') {
                    this.state.resistanceWins += 1;
                } else {
                    this.state.spyWins += 1;
                }                
                this._advanceLeader();
                this.state.currentMissionId += 1;
                this.state.phase = GameState.PHASE_PROPOSE;
                break;
        }
        return this.state.phase;
    }

    createProposal(ids) {
        const proposal = new Proposal(this.state.currentLeaderId, ids);
        this.state.getCurrentMission().addProposal(this.state.currentLeaderId, proposal);
        this.advance();
    }

    addProposalVote(id, vote) {
        const currentProposal = this.getCurrentProposal();
        currentProposal.addVote(id, vote);
        if (currentProposal.voteCount === this.state.playerCount) {
            currentProposal.finalize();
            this.advance();
            return this.getProposalResult();
        } else {
            return null;
        }
    }

    getProposalResult() {
        const currentProposal = this.getCurrentProposal();
        const approved = currentProposal.approved;
        const currentMission = this.getCurrentMission();
        const advanceMission = !approved && currentMission.failedProposalCount === this.state.playerCount;
        const gameOver = advanceMission && (this.state.spyWins + 1 === this.state.NUM_WINS);
        return {
            votes: currentProposal.votesByPlayerId,
            approved: approved,
            advanceMission: advanceMission,
            gameOver: gameOver
        };
    }

    addMissionAction(id, action) {
        const currentMission = this.state.getCurrentMission();
        currentMission.addAction(id, action);
        if (currentMission.actionCount === currentMission.teamSize) {
            currentMission.finalize();
            this.advance();
            return this.getMissionResult();
        } else {
            return null;
        }
    }

    getMissionResult() {
        const currentMission = this.state.getCurrentMission();
        const result = currentMission.result;
        let gameOver = this.state.spyWins === 2 && this.state.resistanceWins === 2;
        if (!gameOver) {
            gameOver = result === "Success" ? this.state.resistanceWins === 2 : this.state.spyWins === 2;
        }
        return {
            result: result,
            successCount: currentMission.actionCount - currentMission.failActionCount - currentMission.reverseActionCount,
            failCount: currentMission.failActionCount,
            reverseCount: currentMission.reverseActionCount,
            gameOver: gameOver
        };
    }
}

module.exports = Game;