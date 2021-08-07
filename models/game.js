const GameState = require('./gameState');
const Roles = require('./roles');
const Mission = require('./mission');

const Proposal = require('./proposal');

class Game {
    constructor(playerInformation, settings) {
        this.state = new GameState(playerInformation, settings);
        this.startTime = Date.now();
        this.resultHTML = null;
    }

    getPossibleRoles() {
        const possibleResistanceRoles = [
            Roles.Merlin.name,
            Roles.Percival.name,
            Roles.Uther.name,
            Roles.Tristan.name,
            Roles.Iseult.name,
            Roles.Arthur.name,
            Roles.Lancelot.name,
            Roles.Jester.name
        ];
        if (this.state.playerCount > 6) {
            possibleResistanceRoles.push(Roles.Guinevere.name);
            possibleResistanceRoles.push(Roles.Puck.name);
        }
        if (this.state.settings.galahad) {
            possibleResistanceRoles.push(Roles.Galahad.name);
        }
        if (this.state.playerCount > 8) {
            if (this.state.settings.bedivere) {
                possibleResistanceRoles.push(Roles.Bedivere.name);
            }
            if (this.state.settings.titania) {
                possibleResistanceRoles.push(Roles.Titania.name);
            }
        }

        const possibleSpyRoles = [
            Roles.Mordred.name,
            Roles.Morgana.name,
            Roles.Maelagant.name,
            Roles.Colgrevance.name
        ];
        if (this.state.settings.accolon && this.state.playerCount > 6) {
            possibleSpyRoles.push(Roles.Accolon.name);
        }
        if (this.state.settings.lucius && this.state.playerCount > 7) {
            possibleSpyRoles.push(Roles.Lucius.name);
        }

        return {
            resistanceRoles: possibleResistanceRoles,
            spyRoles: possibleSpyRoles
        };
    }

    assignRoles(identityPickInformation) {
        this.state.assignRoles(identityPickInformation);
    }

    getPlayerHTML(id) {
        return this.state.players[id].getPlayerHTML();
    }

    getPlayerInformation(id) {
        const playerInformation = [];
        const currentPlayer = this.state.players[id];

        for (let i = 0; i < this.state.playerCount; i++) {
            const player = this.state.players[i];
            let status = null;
            if (id === i) {
                status = currentPlayer.isSpy ? "spy" : "resistance";
            } else {
                status = currentPlayer.getStatus(player);
            }

            playerInformation.push({
                id: player.id,
                name: player.name,
                status: status
            });
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

    getResistancePlayers() {
        return this.state.resistance.map(player => {
            return {
                name: player.name,
                role: player.role.name
            }
        });
    }

    getSpyPlayers() {
        return this.state.spys.map(player => {
            return {
                name: player.name,
                role: player.role.name
            }
        });
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
                            this.resultHTML = this._createResultHTML(`
                                <h2><span class="spy">Spies</span> win!</h2>
                                <section><p><span class="resistance">Resistance</span> failed to propose a mission!</p></section>
                            `);
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
                        this.resultHTML = this._createResultHTML(`<h2><span class="spy">Spies</span> win!</h2>`);
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

    setProposalVote(id, vote) {
        const currentProposal = this.getCurrentProposal();
        currentProposal.setVote(id, vote);
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
            this.resultHTML = this._createResultHTML(this._createJesterWinMessage(ids, role, targetOne.name));
        } else if (targetTwo && targetTwo.role === "Jester") {
            this.state.winner = targetTwo.name;
            this.resultHTML = this._createResultHTML(this._createJesterWinMessage(ids, role, targetTwo.name));
        } else {
            switch (role) {
                case "Merlin":
                    if (targetOne.role === "Merlin") {
                        this.state.winner = "Spies";
                        this.resultHTML = this._createResultHTML(this._createCorrectAssassinationMessage(ids, role));
                    } else {
                        this.state.winner = "Resistance";
                        this.resultHTML = this._createResultHTML(this._createIncorrectAssassinationMessage(ids, role));
                    }
                    break;
                case "Arthur":
                    if (targetOne.role === "Arthur") {
                        this.state.winner = "Spies";
                        this.resultHTML = this._createResultHTML(this._createCorrectAssassinationMessage(ids, role));
                    } else {
                        this.state.winner = "Resistance";
                        this.resultHTML = this._createResultHTML(this._createIncorrectAssassinationMessage(ids, role));
                    }
                    break;
                case "Lovers":
                    if ((targetOne.role === "Tristan" || targetOne.role === "Iseult")
                        && (targetTwo.role === "Tristan" || targetTwo.role === "Iseult")) {
                        this.state.winner = "Spies";
                        this.resultHTML = this._createResultHTML(this._createCorrectAssassinationMessage(ids, role));
                    } else {
                        this.state.winner = "Resistance";
                        this.resultHTML = this._createResultHTML(this._createIncorrectAssassinationMessage(ids, role));
                    }
                    break;
            }
        }

        this.advance();
    }

    _createJesterWinMessage(ids, role, winner) {
        return `
          <h2>${winner} wins!</h2>
          <section><p>
          <span class="spy">${this.getPlayer(this.state.assassinId).name}</span> attempted to assassinate
          ${ids.map(id => `<span class="resistance">${this.getPlayer(id).name}</span>`).join(' and ')} as <span class="resistance">${role}</span>.
          </p>
          <p>However, <span class="resistance">${winner}</span> was the <span class="resistance">Jester</span>.</p></section>
        `;
    }
  
    _createCorrectAssassinationMessage(ids, role) {
        return `
            <h2><span class="spy">Spies</span> win!</h2>
            <section><p>
            <span class="spy">${this.getPlayer(this.state.assassinId).name}</span> correctly assassinated
            ${ids.map(id => `<span class="resistance">${this.getPlayer(id).name}</span>`).join(' and ')} as <span class="resistance">${role}</span>.
            </p></section>
        `;
    }

    _createIncorrectAssassinationMessage(ids, role) {
        let winnerDescriptor = `<span class="resistance">Resistance</span>`;
        let loserDescriptor = "";

        if (this.state.playersByRole.has(Roles.Puck)) {
            const puckName = this.state.playersByRole.get(Roles.Puck).name;
            if (this.state.currentMissionId === 4) {
                winnerDescriptor = `<span class="resistance">Resistance</span> (including ${puckName} as <span class="resistance">Puck</span>)`;
            } else {
                loserDescriptor = `
                    <span class="resistance">${puckName}</span> failed to extend the game to 5 rounds and has lost as <span class="resistance">Puck</span>!
                `;
            }
        } else if (this.state.playersByRole.has(Roles.Jester)) {
            loserDescriptor = `
                <span class="resistance">${this.state.playersByRole.get(Roles.Jester).name}</span>
                failed to get assassinated and has lost as <span class="resistance">Jester</span>!
            `;
        }

        let message = `
            <h2>${winnerDescriptor} wins!</h2>
            <section><p>
            <span class="spy">${this.getPlayer(this.state.assassinId).name}</span> incorrectly assassinated
            ${ids.map(id => `<span class="resistance">${this.getPlayer(id).name}</span>`).join(' and ')} as <span class="resistance">${role}</span>.
            </p>
        `;

        if (loserDescriptor) {
            message += `<p>${loserDescriptor}</p>`;
        }

        message += "</section>";
        return message;
    }

    _createResultHTML(resultHTML) {
        resultHTML += `<section><p><span class="resistance">Resistance</span>:</p>`;
        resultHTML += `
            ${this.state.resistance.map(player => {
                return `<p>(<span class="resistance">${player.role.name}</span>) ${player.name}</p>`;
            }).join('')}
        `;
        resultHTML += "</section>";

        resultHTML += `<section><p><span class="spy">Spies</span>:</p>`;
        resultHTML += `
            ${this.state.spys.map(player => {
                return `<p>(<span class="spy">${player.role.name}</span>) ${player.name}</p>`;
            }).join('')}
        `;
        resultHTML += "</section>";

        return resultHTML;
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