const GameState = require('./gameState');
const Roles = require('./roles');
const Mission = require('./mission');

const { shuffle, choice } = require('../utils/random');
const Proposal = require('./proposal');

class Game {
    constructor(playerInformation, settings) {
        this.state = new GameState(playerInformation, settings);
        this.resultHTML = null;
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

    getPlayerOfRole(role) {
        return this.state.playersByRole.get(role);
    }

    isRoleActive(role) {
        return this.state.playersByRole.has(role);
    }

    isGameOver() {
        return this.state.winner !== null; 
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
                const proposalResult = this.getProposalResult();
                if (!proposalResult.gameOver) {
                    this.state.phase = GameState.PHASE_VOTE_REACT;
                } else {
                    this.state.winner = "Spies";
                    this.resultHTML = `
                        <p>
                            Resistance failed to propose a mission!
                        </p>
                        <p>
                            Spies win!
                        </p>
                    `;
                    this.state.phase = GameState.PHASE_DONE;
                }
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
                const missionResult = this.getMissionResult();
                if (!missionResult.gameOver) {
                    this.state.phase = GameState.PHASE_CONDUCT_REACT;
                } else {
                    if (missionResult.result === "Success") {
                        this.state.phase = GameState.PHASE_ASSASSINATION;
                    } else {
                        this.state.winner = "Spies";
                        this.resultHTML = `
                            <p>
                                Spies win!
                            </p>
                        `;
                        this.state.phase = GameState.PHASE_DONE;
                    }
                }
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
            case GameState.PHASE_ASSASSINATION:
                this.state.phase = GameState.PHASE_DONE;
                break;
        }
        return this.state.phase;
    }

    createProposal(ids) {
        const proposal = new Proposal(this.state.currentLeaderId, ids);
        this.getCurrentMission().addProposal(this.state.currentLeaderId, proposal);
        this.advance();
    }

    addProposalVote(id, vote) {
        const currentProposal = this.getCurrentProposal();
        currentProposal.addVote(id, vote);
        if (currentProposal.voteCount === this.state.playerCount) {
            currentProposal.finalize();
            this.advance();
            return true;
        } else {
            return false;
        }
    }

    getProposalResult() {
        const currentProposal = this.getCurrentProposal();
        if (currentProposal.result) {
            const approved = currentProposal.result;
            const currentMission = this.getCurrentMission();
            const advanceMission = !approved && currentMission.failedProposalCount === this.state.playerCount;
            return {
                votes: currentProposal.votesByPlayerId,
                approved: approved,
                advanceMission: advanceMission
            };
        } else {
            return null;
        }
    }

    addMissionAction(id, action) {
        const currentMission = this.getCurrentMission();
        currentMission.addAction(id, action);
        if (currentMission.actionCount === currentMission.teamSize) {
            currentMission.finalize();
            this.advance();
            return true;
        } else {
            return false;
        }
    }

    getMissionResult(missionId) {
        if (!missionId) {
            missionId = this.state.currentMissionId;
        }
        const currentMission = this.state.missions[missionId];

        if (currentMission.result) {
            return {
                result: currentMission.result,
                successCount: currentMission.actionCount - currentMission.failActionCount - currentMission.reverseActionCount,
                failCount: currentMission.failActionCount,
                reverseCount: currentMission.reverseActionCount
            };
        } else {
            return null;
        }
    }
}

module.exports = Game;