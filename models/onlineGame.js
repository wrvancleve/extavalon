const Game = require('./game');
const Roles = require('./roles');
const Proposal = require('./proposal');
const Mission = require('./mission');
const Affects = require('./affects');
const { shuffle, choice, sample } = require('../utils/random');

function OnlineGame(playerInformation, firstLeaderId, settings) {
    Game.call(this, playerInformation, firstLeaderId, settings);

    let teamSizes = null;
    switch (this.playerCount)
    {
        case 5:
            teamSizes = [ 2, 3, 2, 3, 3 ];
            break;
        case 6:
            teamSizes = [ 2, 3, 4, 3, 4 ];
            break;
        case 7:
            teamSizes = [ 2, 3, 3, 4, 4 ];
            break;
        case 8:
        case 9:
        case 10:
            teamSizes = [ 3, 4, 4, 5, 5 ];
            break;
    }
    const requiredFails = this.playerCount >= 7 ? [ 1, 1, 1, 2, 1 ] : [ 1, 1, 1, 1, 1 ];
    for (let id = 0; id < Game.NUM_MISSIONS; id++) {
        this.missions.push(new Mission(id, teamSizes[id], requiredFails[id]));
    }
    this.currentMissionId = 0;
    
    this.robinUsedIntel = new Map();
    this.castedBinds = [];
}

OnlineGame.PHASE_PROPOSE = "PROPOSE";
OnlineGame.PHASE_VOTE = "VOTE";
OnlineGame.PHASE_VOTE_REACT = "VOTE_REACT";
OnlineGame.PHASE_CONDUCT = "CONDUCT";
OnlineGame.PHASE_CONDUCT_REACT = "CONDUCT_REACT";

OnlineGame.prototype = Object.create(Game.prototype);
Object.defineProperty(OnlineGame.prototype, 'constructor', { 
    value: OnlineGame, 
    enumerable: false,
    writable: true 
});

OnlineGame.prototype.isOnlineGame = function () {
    return true;
}

OnlineGame.prototype.getPossibleRoles = function() {
    const possibleRoles = Game.prototype.getPossibleRoles.call(this);

    if (this.playerCount >= 9) {
        if (this.settings.sirrobin) {
            possibleRoles.possibleResistanceRoles.push(Roles.SirRobin.name);
        }
    }
    if (this.playerCount >= 7) {
        if (this.settings.geraint) {
            possibleRoles.possibleResistanceRoles.push(Roles.Geraint.name);
        }
        if (this.settings.gaheris) {
            possibleRoles.possibleResistanceRoles.push(Roles.Gaheris.name);
        }
        if (this.settings.cerdic) {
            possibleRoles.possibleSpyRoles.push(Roles.Cerdic.name);
        }
        if (this.settings.cynric) {
            possibleRoles.possibleSpyRoles.push(Roles.Cynric.name);
        }
    }

    return possibleRoles;
}

OnlineGame.prototype.assignRoles = function (identityPickInformation) {
    Game.prototype.assignRoles.call(this, identityPickInformation);
    this._startProposal();
}

OnlineGame.prototype.isCurrentLeader = function(id) {
    return this.currentLeaderId === id;
}

OnlineGame.prototype.getCurrentMission = function() {
    return this.missions[this.currentMissionId];
}

OnlineGame.prototype.getCurrentProposal = function() {
    return this.getCurrentMission().getCurrentProposal();
}

OnlineGame.prototype.isGameOver = function() {
    return this.phase === Game.PHASE_DONE; 
}

OnlineGame.prototype.getSetupProposalInformation = function() {
    const players = [];
    const currentProposedTeam = this.getCurrentProposal().team;
    
    let currentPlayerId = this.currentLeaderId;
    for (let i = 0; i < this.playerCount; i++) {
        const currentPlayer = this.players[currentPlayerId];
        players.push({
            id: currentPlayer.id,
            name: currentPlayer.name,
            isLeader: i === 0,
            isOnTeam: currentProposedTeam.includes(currentPlayer.id)
        });
        currentPlayerId += 1;
        currentPlayerId %= this.playerCount;
    }

    return { 
        players: players,
        requiredTeamSize: this.getCurrentMission().teamSize
    };
}

OnlineGame.prototype.advance = function() {
    switch (this.phase) {
        case OnlineGame.PHASE_PROPOSE:
            this.phase = OnlineGame.PHASE_VOTE;
            break;
        case OnlineGame.PHASE_VOTE:
            if (this.getProposalResult()) {
                this.phase = OnlineGame.PHASE_VOTE_REACT;
            } else {
                const currentMission = this.getCurrentMission();
                currentMission.failedProposalCount += 1;
                if (currentMission.failedProposalCount === this.playerCount) {
                    currentMission.result = 'Fail';
                    if (Game.prototype._processMissionResult.call(this, currentMission.result)) {
                        this.winner = "Spies";
                        this.phase = Game.PHASE_DONE;
                    } else {
                        this.phase = OnlineGame.PHASE_CONDUCT_REACT;
                    }
                } else {
                    this.phase = OnlineGame.PHASE_VOTE_REACT;
                }
            }
            break;
        case OnlineGame.PHASE_VOTE_REACT:
            if (this.getProposalResult()) {
                for (let usedAffect of this.getCurrentProposal().getUsedAffects()) {
                    if (Affects.areEqual(Affects.ResistanceBindAffect, usedAffect) || Affects.areEqual(Affects.SpyBindAffect, usedAffect)) {
                        this.castedBinds.push(usedAffect);
                    }
                }
                this.phase = OnlineGame.PHASE_CONDUCT;
            } else {
                this._advanceLeader();
                this._startProposal();
            }
            break;
        case OnlineGame.PHASE_CONDUCT:
            const missionResult = this.getMissionResult();
            const roundsWinner = Game.prototype._processMissionResult.call(this, missionResult.result);
            if (roundsWinner) {
                Game.prototype.handleMissionsFinished.call(this, roundsWinner);
            } else {
                this.phase = OnlineGame.PHASE_CONDUCT_REACT;
            }
            break;
        case OnlineGame.PHASE_CONDUCT_REACT:
            this._advanceLeader();
            this.currentMissionId += 1;
            this._startProposal();
            break;
        case Game.PHASE_REDEMPTION:
            this.phase = Game.PHASE_DONE;
            break;
        case Game.PHASE_ASSASSINATION:
            this.phase = Game.PHASE_DONE;
            break;
    }
}

OnlineGame.prototype.getCurrentProposedTeamInformation = function() {
    return {
        leaderName: this.players[this.currentLeaderId].name,
        team: this.getCurrentProposal().team.map(playerId => {
            return this._getProposalInformationForPlayerId(playerId, true);
        })
    };
}

OnlineGame.prototype._getProposalInformationForPlayerId = function(playerId, isOnTeam) {
    return {
        id: playerId,
        name: this.players[playerId].name,
        isLeader: playerId === this.currentLeaderId,
        isOnTeam: isOnTeam
    };
}

OnlineGame.prototype.updateProposal = function(ids) {
    this.getCurrentProposal().updateTeam(ids);
}

OnlineGame.prototype.finalizeProposalTeam = function(ids) {
    this.updateProposal(ids);
    this.advance();
}

OnlineGame.prototype.getSetupVoteInformation = function(id) {
    const playerRoleName = this.getPlayerRoleName(id);
    let applyAffect = null;
    if (this.resistanceWins !== 2 && this.spyWins !== 2) {
        switch (playerRoleName) {
            case Roles.Cerdic.name:
                // Spy Bind
                if (this.castedBinds.find(Affects.isSpyBind) === undefined) {
                    applyAffect = "SpyBind";
                }
                break;
            case Roles.Cynric.name:
                if (this.castedBinds.find(Affects.isResistanceBind) === undefined) {
                    applyAffect = "ResistanceProtect";
                }
                break;
            case Roles.Gaheris.name:
                // Resistance Bind
                if (this.castedBinds.find(Affects.isResistanceBind) === undefined) {
                    applyAffect = "ResistanceBind";
                }
                break;
            case Roles.Geraint.name:
                if (this.castedBinds.find(Affects.isSpyBind) === undefined) {
                    applyAffect = "SpyProtect";
                }
                break;
        }
    }

    const currentProposal = this.getCurrentProposal();
    const team = currentProposal.team.map(playerId => {
        const currentProposalInformationForPlayer = this._getProposalInformationForPlayerId(playerId, true);
        if (applyAffect) {
            switch (playerRoleName) {
                case Roles.Cerdic.name:
                    // Spy Bind
                    if (currentProposal.hasAffectOnPlayerId(playerId, Affects.SpyBindAffect)) {
                        currentProposalInformationForPlayer.affect = Affects.SpyBindAffect;
                    }
                    break;
                case Roles.Cynric.name:
                    if (currentProposal.hasAffectOnPlayerId(playerId, Affects.ResistanceProtectAffect)) {
                        currentProposalInformationForPlayer.affect = Affects.ResistanceProtectAffect;
                    }
                    break;
                case Roles.Gaheris.name:
                    // Resistance Bind
                    if (currentProposal.hasAffectOnPlayerId(playerId, Affects.ResistanceBindAffect)) {
                        currentProposalInformationForPlayer.affect = Affects.ResistanceBindAffect;
                    }
                    break;
                case Roles.Geraint.name:
                    if (currentProposal.hasAffectOnPlayerId(playerId, Affects.SpyProtectAffect)) {
                        currentProposalInformationForPlayer.affect = Affects.SpyProtectAffect;
                    }
                    break;
            }
        }

        return currentProposalInformationForPlayer;
    });

    const playersStillVoting = [];
    for (let i = 0; i < this.playerCount; i++) {
        if (!currentProposal.hasVoted(i)) {
            playersStillVoting.push(this._getPlayer(i, ["id", "name"]));
        }
    }

    return {
        team: team,
        selectedVote: currentProposal.getVote(id),
        applyAffect: applyAffect,
        playersStillVoting: playersStillVoting
    };
}

OnlineGame.prototype.setProposalVote = function(id, vote) {
    const currentProposal = this.getCurrentProposal();
    currentProposal.setVote(id, vote);
    if (currentProposal.voteCount === this.playerCount) {
        currentProposal.finalize();
        this.advance();
        return true;
    } else {
        return false;
    }
}

OnlineGame.prototype.hasPlayerVoted = function(id) {
    return this.getCurrentProposal().hasVoted(id);
}

OnlineGame.prototype.toggleAffect = function(sourceId, destinationId) {
    let affect = Affects.getAffectFromRole(this.getPlayerRoleName(sourceId));
    if (Affects.isResistanceBind(affect)) {
        affect.valid = this.getPlayerRoleName(destinationId) !== Roles.Morgana.name;
    } else {
        affect.valid = true;
    }
    this.getCurrentProposal().toggleAffect(sourceId, destinationId, affect);
}

OnlineGame.prototype.getProposalResult = function () {
    return this.getCurrentProposal().result;
}

OnlineGame.prototype.getProposalResultExtendedInformation = function(playerId) {
    const currentProposal = this.getCurrentProposal();
    if (currentProposal && currentProposal.result !== null) {
        const missionTeam = currentProposal.team;
        const approvedVoteInformation = [];
        const importantApprovedVoteInformation = [];
        const rejectedVoteInformation = [];
        const importantRejectedVoteInformation = [];
        const voteInformation = [];
        const bindInformation = [];

        const isSpy = this.players[playerId].isSpy;
        for (let id = 0; id < this.playerCount; id++) {
            const isMissionLeader = this.currentLeaderId === id;

            const playerAffect = currentProposal.getAffectOnPlayerId(id);
            let visibleAffect = null;
        
            if (playerAffect !== null) {
                const isViewerTheSource = playerAffect.sourceId === playerId;
                const isViewerTheDestination = playerAffect.destinationId === playerId;
            
                if (playerAffect.name === "Protect") {
                    const isViewerTheBinder = playerAffect.bindSourceId === playerId;
                    const isBinderASpy = this.players[playerAffect.bindSourceId].isSpy;
                    const isDestinationASpy = this.players[playerAffect.destinationId].isSpy;

                    // If you casted the protect, were blocked or spy buddy was blocked
                    if (isViewerTheSource || isViewerTheBinder || (isSpy && (isDestinationASpy || isBinderASpy))) {
                        visibleAffect = {
                            name: playerAffect.name,
                            type: playerAffect.type
                        };

                        if (isViewerTheSource) {
                            if (isViewerTheDestination) {
                                bindInformation.push(`You successfully protected yourself from a <span class="${playerAffect.type.toLowerCase()}">${playerAffect.type}</span> bind.`);
                            } else {
                                bindInformation.push(`You successfully protected ${this.players[id].name} from a <span class="${playerAffect.type.toLowerCase()}">${playerAffect.type}</span> bind.`);
                            }
                        } else if (isViewerTheBinder || isDestinationASpy) {
                            bindInformation.push(`<span class="${playerAffect.type.toLowerCase()}">${playerAffect.type}</span> bind on ${this.players[id].name} was blocked!`);
                        } else {
                            bindInformation.push(`${this.players[playerAffect.bindSourceId].name}'s <span class="${playerAffect.type.toLowerCase()}">${playerAffect.type}</span> bind on ${this.players[id].name} was blocked!`);
                        }
                    }
                } else if (playerAffect.name === "Bind") {
                    if (isSpy || isViewerTheSource || isViewerTheDestination) {
                        visibleAffect = {
                            name: playerAffect.name,
                            type: playerAffect.type
                        };
                        const bindedTeam = playerAffect.type === "Spy" ? "Spies" : "Resistance";
                        if (isViewerTheSource) {
                            bindInformation.push(`You successfully bound ${this.players[id].name} to the <span class="${playerAffect.type.toLowerCase()}">${bindedTeam}</span>.`);
                        } else if (isViewerTheDestination) {
                            bindInformation.push(`You have been bound to the <span class="${playerAffect.type.toLowerCase()}">${bindedTeam}</span>.`);
                        } else {
                            bindInformation.push(`${this.players[id].name} has been bound to the <span class="${playerAffect.type.toLowerCase()}">${bindedTeam}</span>.`);
                        }
                    }
                }
            }
            
            const isOnTeam = missionTeam.includes(id);
            if (isMissionLeader || isOnTeam) {
                if (currentProposal.getVote(id)) {
                    importantApprovedVoteInformation.push({
                        name: this.players[id].name,
                        vote: true,
                        isLeader: isMissionLeader,
                        isOnTeam: isOnTeam,
                        affect: visibleAffect
                    });
                } else {
                    importantRejectedVoteInformation.push({
                        name: this.players[id].name,
                        vote: false,
                        isLeader: isMissionLeader,
                        isOnTeam: isOnTeam,
                        affect: visibleAffect
                    });
                }
            } else {
                if (currentProposal.getVote(id)) {
                    approvedVoteInformation.push({
                        name: this.players[id].name,
                        vote: true,
                        isLeader: false,
                        isOnTeam: false,
                        affect: visibleAffect
                    });
                } else {
                    rejectedVoteInformation.push({
                        name: this.players[id].name,
                        vote: false,
                        isLeader: false,
                        isOnTeam: false,
                        affect: visibleAffect
                    });
                }
            }
        }

        Array.prototype.push.apply(voteInformation, importantApprovedVoteInformation);
        Array.prototype.push.apply(voteInformation, approvedVoteInformation);
        Array.prototype.push.apply(voteInformation, importantRejectedVoteInformation);
        Array.prototype.push.apply(voteInformation, rejectedVoteInformation);
        return {
            voteInformation: voteInformation,
            bindInformation: bindInformation,
            result: currentProposal.result
        };
    } else {
        return null;
    }
}

OnlineGame.prototype._getVisibleAffectForPlayerId = function(playerId, visibleAffect) {
    if (!visibleAffect) {
        return null;
    }

    const isSpy = this.players[playerId].isSpy;
    const isSource = visibleAffect.sourceId === playerId;
    const isDestination = visibleAffect.destinationId === playerId;

    if (visibleAffect.name === "Protect") {
        if (isSpy || isSource) {
            return {
                name: visibleAffect.name,
                type: visibleAffect.type
            };
        }
    } else if (visibleAffect.name === "Bind") {
        if (isSpy || isSource || isDestination) {
            return {
                name: visibleAffect.name,
                type: visibleAffect.type
            };
        }
    }

    return null;
}

OnlineGame.prototype.getConductMissionInformation = function(id) {
    const player = this.players[id];
    const currentMission = this.getCurrentMission();
    const isOnMission = currentMission.isOnMissionTeam(id);
    const hasConducted = currentMission.hasConducted(id);
    if (isOnMission && !hasConducted) {
        const playerRole = player.role.name;
        const playerTeam = player.role.team;
        const playerBind = currentMission.getBindOnPlayerId(id);
        const resistanceBound = Affects.isResistanceBind(playerBind);
        const spyBound = Affects.isSpyBind(playerBind);
        const successAllowed = !spyBound;
        const failAllowed = (playerTeam === "Spies" || playerRole === Roles.Puck.name || spyBound) && !resistanceBound;
        const reverseAllowed = (playerRole === Roles.Lancelot.name || playerRole === Roles.Maelagant.name) && !resistanceBound && !spyBound;
        let sirRobinIntel = undefined;
        let spySuggestion = null;

        if (playerRole === Roles.SirRobin.name) {
            sirRobinIntel = this._getSirRobinIntel(id, currentMission);
        }

        if (playerTeam === "Spies" && !resistanceBound && !spyBound) {
            const sabotagingPlayers = this._getSabotagingPlayers(currentMission);
            if (sabotagingPlayers.includes(id)) {
                if (sabotagingPlayers.length === currentMission.requiredFails) {
                    if (playerRole === Roles.Maelagant && currentMission.requiredFails === 1) {
                        spySuggestion = ["fail", "reverse"];
                    } else {
                        spySuggestion = ["fail"];
                    }
                } else {
                    if (playerRole === Roles.Maelagant) {
                        // 2 fails required, you are Maelagant
                        spySuggestion = ["reverse"];
                    } else if (this.resistanceWins !== 2) {
                        // 2 fails required, no second spy
                        spySuggestion = ["success"];
                    }
                }
            } else {
                spySuggestion = ["success"];
            }
        }
        
        const conductMissionInformation = {
            resistanceBound: resistanceBound,
            spyBound: spyBound,
            spySuggestion: spySuggestion,
            successAllowed: successAllowed,
            failAllowed: failAllowed,
            reverseAllowed: reverseAllowed
        };
        if (sirRobinIntel !== undefined) {
            conductMissionInformation.sirRobinIntel = sirRobinIntel;
        }
        return conductMissionInformation;
    } else {
        return null;
    }
}

OnlineGame.prototype._getSirRobinIntel = function (id, currentMission) {
    let intel = null;
    if (this.robinUsedIntel.has(this.currentMissionId)) {
        intel = this.players[this.robinUsedIntel.get(this.currentMissionId)].name;
    } else if (!this.playersByRole.has(Roles.Accolon.name) || !currentMission.isOnMissionTeam(this.playersByRole.get(Roles.Accolon.name).id)) {
        const possibleIntel = currentMission.getMissionTeam()
            .filter(missionPlayerId => missionPlayerId !== id && !Array.from(this.robinUsedIntel.values()).includes(missionPlayerId) && !this.players[missionPlayerId].isSpy);
        if (possibleIntel.length > 0) {
            const usedIntel = choice(possibleIntel);
            this.robinUsedIntel.set(this.currentMissionId, usedIntel);
            intel = this.players[usedIntel].name;
        }
    }

    return intel;
}

OnlineGame.prototype.addMissionAction = function(id, action) {
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

OnlineGame.prototype.getMissionResult = function(missionId) {
    if (missionId === undefined) {
        missionId = this.currentMissionId;
    }
    const mission = this.missions[missionId];

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

OnlineGame.prototype.getMissionResultsInformation = function() {
    const missions = [];
    for (let i = 0; i < Game.NUM_MISSIONS; i++) {
        const mission = this.missions[i];
        missions.push({
            teamSize: mission.teamSize,
            requiredFails: mission.requiredFails,
            result: mission.result
        });
    }

    return {
        missions: missions
    };
}

OnlineGame.prototype.getConductRedemptionInformation = function(id) {
    const currentPlayer = this.players[id];
    if (currentPlayer.role === Roles.Kay) {
        return {
            players: this._selectPlayers({
                excludedIds: [id]
            }, ['id', 'name'], false),
            spyCount: this.spyPlayerCount
        };
    } else {
        return {
            kay: this.playersByRole.get(Roles.Kay.name).name
        };
    }
}

OnlineGame.prototype.getConductAssassinationInformation = function(id) {
    const currentPlayer = this.players[id];
    if (currentPlayer.isAssassin === true) {
        return {
            players: this.resistance.map(player => player.getPlayerInformation())
        };
    } else {
        return {
            assassin: this.players[this.assassinId].name
        };
    }
}

OnlineGame.prototype.handleAssassinationAttempt = function(conductAssassinationInformation) {
    Game.prototype.processAssassinationAttempt.call(this, conductAssassinationInformation);
    this.advance();
}

OnlineGame.prototype.getGameResult = function() {
    const missions = [];
    for (let i = 0; i < Game.NUM_MISSIONS; i++) {
        let missionResult = null;
        switch (this.missions[i].result) {
            case "Success":
                missionResult = "Resistance";
                break;
            case "Fail":
                missionResult = "Spies";
                break;
        }
        missions.push(missionResult);
    }
    
    return {
        winner: this.winner,
        missions: missions,
        assassination: this.assassinationAttemptInformation
    };
}

// #region Advance Helper Functions

OnlineGame.prototype._advanceLeader = function() {
    this.currentLeaderId += 1;
    this.currentLeaderId %= this.playerCount;
}

OnlineGame.prototype._startProposal = function() {
    const proposal = new Proposal(this.currentLeaderId);
    this.getCurrentMission().addProposal(this.currentLeaderId, proposal);
    this.phase = OnlineGame.PHASE_PROPOSE;
}

// #endregion

Game.prototype._getSabotagingPlayers = function(currentMission) {
    const sabotagingPlayers = currentMission.getMissionTeam().filter(playerId => Affects.isSpyBind(currentMission.getBindOnPlayerId(playerId)));
    const requiredFails = currentMission.requiredFails;
    let currentSpyIndex = 0;
    while (sabotagingPlayers.length < requiredFails && currentSpyIndex < this.spies.length) {
        const spyId = this.spies[currentSpyIndex].id;
        if (!sabotagingPlayers.includes(spyId) && currentMission.isOnMissionTeam(spyId) && !Affects.isResistanceBind(currentMission.getBindOnPlayerId(spyId))) {
            sabotagingPlayers.push(spyId);
        }
        currentSpyIndex += 1;
    }

    return sabotagingPlayers;
}

module.exports = OnlineGame;
