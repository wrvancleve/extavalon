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

    getCurrentPhase() {
        return this.state.phase;
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

    isGameOver() {
        return this.state.phase === GameState.PHASE_DONE; 
    }

    _advanceLeader() {
        this.state.currentLeaderId += 1;
        this.state.currentLeaderId %= this.state.playerCount;
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

        if (this.state.resistanceWins === 3) {
            return "Resistance";
        } else if (this.state.spyWins === 3) {
            return "Spies";
        }

        return null;
    }

    advance() {
        let proposalResult = null;
        switch (this.state.phase) {
            case GameState.PHASE_PROPOSE:
                this.state.phase = GameState.PHASE_VOTE;
                break;
            case GameState.PHASE_VOTE:
                proposalResult = this.getProposalResult();
                if (proposalResult.approved) {
                    this.state.phase = GameState.PHASE_VOTE_REACT;
                } else {
                    const currentMission = this.getCurrentMission();
                    currentMission.failedProposalCount += 1;
                    if (currentMission.failedProposalCount === this.state.playerCount) {
                        currentMission.result = 'Fail';
                        if (this._processMissionResult(currentMission.result)) {
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
                        } else {
                            this.state.phase = GameState.PHASE_CONDUCT_REACT;
                        }
                    } else {
                        this.state.phase = GameState.PHASE_VOTE_REACT;
                    }
                }
                break;
            case GameState.PHASE_VOTE_REACT:
                proposalResult = this.getProposalResult();
                if (proposalResult.approved) {
                    this.state.phase = GameState.PHASE_CONDUCT;
                } else {
                    this._advanceLeader();
                    this.state.phase = GameState.PHASE_PROPOSE;
                }
                break;
            case GameState.PHASE_CONDUCT:
                const missionResult = this.getMissionResult();
                const roundsWinner = this._processMissionResult(missionResult.result);
                if (roundsWinner) {
                    if (roundsWinner === "Spies") {
                        this.state.winner = "Spies";
                        this.resultHTML = `
                            <p>
                                Spies win!
                            </p>
                        `;
                        this.state.phase = GameState.PHASE_DONE;
                    } else {
                        this.state.phase = GameState.PHASE_ASSASSINATION;
                    }
                } else {
                    this.state.phase = GameState.PHASE_CONDUCT_REACT;
                }
                break;
            case GameState.PHASE_CONDUCT_REACT:             
                this._advanceLeader();
                this.state.currentMissionId += 1;
                this.state.phase = GameState.PHASE_PROPOSE;
                break;
            case GameState.PHASE_ASSASSINATION:
                this.state.phase = GameState.PHASE_DONE;
                break;
        }
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
        if (currentProposal && currentProposal.result !== null) {
            const approved = currentProposal.result;
            return {
                votes: currentProposal.votesByPlayerId,
                approved: approved
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
        if (missionId === undefined) {
            missionId = this.state.currentMissionId;
        }
        const mission = this.state.missions[missionId];

        if (mission && mission.result !== null) {
            return {
                result: mission.result,
                successCount: mission.actionCount - mission.failActionCount - mission.reverseActionCount,
                failCount: mission.failActionCount,
                reverseCount: mission.reverseActionCount
            };
        } else {
            return null;
        }
    }

    processAssassinationAttempt(ids, role) {
        const targetOne = this.getPlayer(ids[0]);
        const targetTwo = role === "Lovers" ? this.getPlayer(ids[1]) : null;

        if (targetOne.role === "Jester") {
            this.state.winner = targetOne.name;
            this.resultHTML = this._createJesterWinMessage(ids, role, targetOne.name);
        } else if (targetTwo && targetTwo.role === "Jester") {
            this.state.winner = targetTwo.name;
            this.resultHTML = this._createJesterWinMessage(ids, role, targetTwo.name);
        } else {
            switch (role) {
                case "Merlin":
                    if (targetOne.role === "Merlin") {
                        this.state.winner = "Spies";
                        this.resultHTML = this._createCorrectAssassinationMessage(ids, role);
                    } else {
                        this.state.winner = "Resistance";
                        this.resultHTML = this._createIncorrectAssassinationMessage(ids, role);
                    }
                    break;
                case "Arthur":
                    if (targetOne.role === "Arthur") {
                        this.state.winner = "Spies";
                        this.resultHTML = this._createCorrectAssassinationMessage(ids, role);
                    } else {
                        this.state.winner = "Resistance";
                        this.resultHTML = this._createIncorrectAssassinationMessage(ids, role);
                    }
                    break;
                case "Lovers":
                    if ((targetOne.role === "Tristan" || targetOne.role === "Iseult")
                        && (targetTwo.role === "Tristan" || targetTwo.role === "Iseult")) {
                        this.state.winner = "Spies";
                        this.resultHTML = this._createCorrectAssassinationMessage(ids, role);
                    } else {
                        this.state.winner = "Resistance";
                        this.resultHTML = this._createIncorrectAssassinationMessage(ids, role);
                    }
                    break;
            }
        }

        this.advance();
    }

    _createJesterWinMessage(ids, role, winner) {
        return `
          <p>
          ${this.getPlayer(this.state.assassinId).name} attempted to assassinate
          ${ids.map(id => this.getPlayer(id).name).join(' and ')} as ${role}.
          </p>
          <p>
          However, ${winner} was the Jester. ${winner} wins!
          </p>
        `;
    }
  
    _createCorrectAssassinationMessage(ids, role) {
        return `
            <p>
            ${this.getPlayer(this.state.assassinId).name} correctly assassinated
            ${ids.map(id => this.getPlayer(id).name).join(' and ')} as ${role}.
            </p>
            <p>
            Spies win!
            </p>
        `;
    }

    _createIncorrectAssassinationMessage(ids, role) {
        let winnerDescriptor = "Resistance";
        let loserDescriptor = "";

        if (this.state.playersByRole.has(Roles.Puck)) {
            const puckName = this.state.playersByRole.get(Roles.Puck).name;
            if (this.state.currentMissionId === 4) {
                winnerDescriptor = `Resistance (including ${puckName} as Puck)`;
            } else {
                loserDescriptor = `
                    ${puckName} failed to extend the game to 5 rounds and has lost as Puck!
                `;
            }
        } else if (this.state.playersByRole.has(Roles.Jester)) {
            loserDescriptor = `
                ${this.state.playersByRole.get(Roles.Jester).name} failed to get assassinated and has lost as Jester!
            `;
        }

        let message = `
            <p>
            ${this.getPlayer(this.state.assassinId).name} incorrectly assassinated
            ${ids.map(id => this.getPlayer(id).name).join(' and ')} as ${role}.
            </p>
            <p>
            ${winnerDescriptor} wins!
            </p>
        `;

        if (loserDescriptor) {
            message += `
                <p>
                ${loserDescriptor}
                </p>
            `;
        }

        return message;
    }

    getGameResult() {
        if (this.state.winner) {
            return {winner: this.state.winner, message: this.resultHTML};
        } else {
            return null;
        }
    }
}

module.exports = Game;