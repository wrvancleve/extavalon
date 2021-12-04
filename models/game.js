const Roles = require('./roles');
const Player = require('./player');
const Mission = require('./mission');
const Proposal = require('./proposal');
const Affects = require('./affects');
const { shuffle, choice } = require('../utils/random');

function Game(playerInformation, firstLeaderId, settings) {
    this.resistanceWins = 0;
    this.spyWins = 0;
    this.playersByRole = new Map();
    this.resistance = [];
    this.spies = [];
    this.settings = settings;

    this.currentLeaderId = firstLeaderId;
    this.playerCount = playerInformation.length;
    if (this.playerCount >= 10) {
        this.spyPlayerCount = 4;
    }
    else if (this.playerCount >= 7) {
        this.spyPlayerCount = 3;
    }
    else {
        this.spyPlayerCount = 2;
    }
    this.resistancePlayerCount = this.playerCount - this.spyPlayerCount;
    this.players = [];

    for (let id = 0; id < this.playerCount; id++) {
        const player = new Player(id, playerInformation[id].name);
        this.players.push(player);
    }

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
    this.missions = [];
    for (let id = 0; id < 5; id++) {
        this.missions.push(new Mission(id, teamSizes[id], requiredFails[id]));
    }
    this.currentMissionId = 0;

    this.phase = Game.PHASE_SETUP;
    this.castedBinds = [];
    this.redemptionAttemptInformation = null;
    this.assassinationAttemptInformation = null;
    this.winner = null;

    this.startTime = new Date(Date.now());
}

Game.PHASE_SETUP = 0;
Game.PHASE_PROPOSE = 1;
Game.PHASE_VOTE = 2;
Game.PHASE_VOTE_REACT = 3;
Game.PHASE_CONDUCT = 4;
Game.PHASE_CONDUCT_REACT = 5;
Game.PHASE_REDEMPTION = 6;
Game.PHASE_ASSASSINATION = 7;
Game.PHASE_DONE = 8;
Game.NUM_WINS = 3;
Game.NUM_MISSIONS = 5;

// #region Public functions

Game.prototype.getStartGameInformation = function(id) {
    return this.players[id].getPlayerHTML();
}

Game.prototype.getPossibleRoles = function() {
    const possibleResistanceRoles = [
        Roles.Merlin.name,
        Roles.Percival.name,
        Roles.Uther.name,
        Roles.Tristan.name,
        Roles.Iseult.name,
        Roles.Arthur.name,
        Roles.Lancelot.name,
        Roles.Jester.name,
        Roles.Galahad.name
    ];

    switch (this.playerCount) {
        case 12:
        case 11:
        case 10:
        case 9:
            if (this.settings.bedivere) {
                possibleResistanceRoles.push(Roles.Bedivere.name);
            }
            if (this.settings.titania) {
                possibleResistanceRoles.push(Roles.Titania.name);
            }
        case 8:
            possibleResistanceRoles.push(Roles.Ector.name);
            possibleResistanceRoles.push(Roles.Kay.name);
            possibleResistanceRoles.push(Roles.SirRobin.name);
            possibleResistanceRoles.push(Roles.Gareth.name);
            possibleResistanceRoles.push(Roles.Gaheris.name);
        case 7:
            possibleResistanceRoles.push(Roles.Guinevere.name);
            possibleResistanceRoles.push(Roles.Puck.name);
            break;
    }

    const possibleSpyRoles = [
        Roles.Mordred.name,
        Roles.Morgana.name,
        Roles.Maelagant.name,
        Roles.Colgrevance.name
    ];

    if (this.playerCount > 6) {
        possibleSpyRoles.push(Roles.Accolon.name);
        possibleSpyRoles.push(Roles.Cerdic.name);
        possibleSpyRoles.push(Roles.Cynric.name);
    }

    return {
        possibleResistanceRoles: possibleResistanceRoles,
        possibleSpyRoles: possibleSpyRoles
    };
}

Game.prototype.assignRoles = function(identityPickInformation) {
    const playerRoles = Roles.generateRoles(this.resistancePlayerCount, this.spyPlayerCount, this.settings, identityPickInformation);

    this.gaherisBindPossible = null;
    for (let id = 0; id < this.playerCount; id++) {
        const player = this.players[id];
        const playerRole = playerRoles.pop();
        player.assignRole(playerRole);
        this.playersByRole.set(playerRole, player);
        if (playerRole === Roles.Gaheris) {
            this.gaherisBindPossible = true;
        }
        
        if (playerRole.team === "Resistance") {
            this.resistance.push(player);
        } else {
            if (playerRole === Roles.Maelagant) {
                this.spies.unshift(player);
            } else {
                this.spies.push(player);
            }
        }
    }

    this.assassinId = choice(this.spies).id;
    this.players[this.assassinId].setIsAssassin();

    this._addResistanceRoleIntel();
    if (this.playersByRole.has(Roles.Accolon)) {
        this._performAccolonSabotage();
    }
    this._addSpyTeamIntel();
    this._addSpyRoleIntel();
    if (this.playersByRole.has(Roles.Titania)) {
        this._performTitaniaSabotage();
    }

    this._startProposal();
}

Game.prototype.getPlayerRoleName = function(id) {
    return this.players[id].role.name;
}

Game.prototype.isCurrentLeader = function(id) {
    return this.currentLeaderId === id;
}

Game.prototype.getCurrentMission = function() {
    return this.missions[this.currentMissionId];
}

Game.prototype.getCurrentProposal = function() {
    return this.getCurrentMission().getCurrentProposal();
}

Game.prototype.isGameOver = function() {
    return this.phase === Game.PHASE_DONE; 
}

Game.prototype.getSetupProposalInformation = function() {
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

Game.prototype.advance = function() {
    switch (this.phase) {
        case Game.PHASE_PROPOSE:
            this.phase = Game.PHASE_VOTE;
            break;
        case Game.PHASE_VOTE:
            if (this.getProposalResult()) {
                this.phase = Game.PHASE_VOTE_REACT;
            } else {
                const currentMission = this.getCurrentMission();
                currentMission.failedProposalCount += 1;
                if (currentMission.failedProposalCount === this.playerCount) {
                    currentMission.result = 'Fail';
                    if (this._processMissionResult(currentMission.result)) {
                        this.winner = "Spies";
                        this.phase = Game.PHASE_DONE;
                    } else {
                        this.phase = Game.PHASE_CONDUCT_REACT;
                    }
                } else {
                    this.phase = Game.PHASE_VOTE_REACT;
                }
            }
            break;
        case Game.PHASE_VOTE_REACT:
            if (this.getProposalResult()) {
                for (let usedAffect of this.getCurrentProposal().getUsedAffects()) {
                    if (Affects.ResistanceBindAffect.isSameAffect(usedAffect) || Affects.SpyBindAffect.isSameAffect(usedAffect)) {
                        this.castedBinds.push(usedAffect);
                    }
                }
                this.phase = Game.PHASE_CONDUCT;
            } else {
                this._advanceLeader();
                this._startProposal();
            }
            break;
        case Game.PHASE_CONDUCT:
            const missionResult = this.getMissionResult();
            const roundsWinner = this._processMissionResult(missionResult.result);
            if (roundsWinner) {
                if (roundsWinner === "Spies") {
                    if (this.playersByRole.has(Roles.Kay)) {
                        this.phase = Game.PHASE_REDEMPTION;
                    } else {
                        this.winner = "Spies";
                        this.phase = Game.PHASE_DONE;
                    }
                } else {
                    this.phase = Game.PHASE_ASSASSINATION;
                }
            } else {
                this.phase = Game.PHASE_CONDUCT_REACT;
            }
            break;
        case Game.PHASE_CONDUCT_REACT:
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

Game.prototype.getCurrentProposedTeamInformation = function() {
    return {
        leaderName: this.players[this.currentLeaderId].name,
        team: this.getCurrentProposal().team.map(playerId => {
            return this._getProposalInformationForPlayerId(playerId, true);
        })
    };
}

Game.prototype._getProposalInformationForPlayerId = function(playerId, isOnTeam) {
    return {
        id: playerId,
        name: this.players[playerId].name,
        isLeader: playerId === this.currentLeaderId,
        isOnTeam: isOnTeam
    };
}

Game.prototype.updateProposal = function(ids) {
    this.getCurrentProposal().updateTeam(ids);
}

Game.prototype.finalizeProposalTeam = function(ids) {
    this.updateProposal(ids);
    this.advance();
}

Game.prototype.getSetupVoteInformation = function(id) {
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
                        currentProposalInformationForPlayer.affect = Affects.SpyBindAffect.getKey();
                    }
                    break;
                case Roles.Cynric.name:
                    if (currentProposal.hasAffectOnPlayerId(playerId, Affects.ResistanceProtectAffect)) {
                        currentProposalInformationForPlayer.affect = Affects.ResistanceProtectAffect.getKey();
                    }
                    break;
                case Roles.Gaheris.name:
                    // Resistance Bind
                    if (currentProposal.hasAffectOnPlayerId(playerId, Affects.ResistanceBindAffect)) {
                        currentProposalInformationForPlayer.affect = Affects.ResistanceBindAffect.getKey();
                    }
                    break;
                case Roles.Geraint.name:
                    if (currentProposal.hasAffectOnPlayerId(playerId, Affects.SpyProtectAffect)) {
                        currentProposalInformationForPlayer.affect = Affects.SpyProtectAffect.getKey();
                    }
                    break;
            }
        }

        return currentProposalInformationForPlayer;
    })

    return {
        team: team,
        selectedVote: this.getCurrentProposal().getVote(id),
        applyAffect: applyAffect
    };
}

Game.prototype.setProposalVote = function(id, vote) {
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

Game.prototype.toggleAffect = function(sourceId, destinationId) {
    let affect = Affects.getAffectForRole(this.getPlayerRoleName(sourceId));
    if (Affects.isResistanceBind(affect)) {
        affect.valid = this.getPlayerRoleName(destinationId) !== Roles.Morgana.name;
    }
    if (affect) {
        this.getCurrentProposal().toggleAffect(sourceId, destinationId, affect);
    }
}

Game.prototype.getProposalResult = function () {
    return this.getCurrentProposal().result;
}

Game.prototype.getProposalResultExtendedInformation = function(playerId) {
    const currentProposal = this.getCurrentProposal();
    if (currentProposal && currentProposal.result !== null) {
        const missionTeam = currentProposal.team;
        const approvedVoteInformation = [];
        const importantApprovedVoteInformation = [];
        const rejectedVoteInformation = [];
        const importantRejectedVoteInformation = [];
        const voteInformation = [];

        for (let id = 0; id < this.playerCount; id++) {
            const isMissionLeader = this.currentLeaderId === id;
            const playerAffect = currentProposal.getAffectOnPlayerId(id);
            if (isMissionLeader || missionTeam.includes(id)) {
                if (currentProposal.getVote(id)) {
                    importantApprovedVoteInformation.push({
                        name: this.players[id].name,
                        vote: true,
                        isLeader: isMissionLeader,
                        isOnTeam: true,
                        affect: this._getVisibleAffectForPlayerId(playerId, playerAffect)
                    });
                } else {
                    importantRejectedVoteInformation.push({
                        name: this.players[id].name,
                        vote: false,
                        isLeader: isMissionLeader,
                        isOnTeam: true,
                        affect: this._getVisibleAffectForPlayerId(playerId, playerAffect)
                    });
                }
            } else {
                if (currentProposal.getVote(id)) {
                    approvedVoteInformation.push({
                        name: this.players[id].name,
                        vote: true,
                        isLeader: false,
                        isOnTeam: false,
                        affect: this._getVisibleAffectForPlayerId(playerId, playerAffect)
                    });
                } else {
                    rejectedVoteInformation.push({
                        name: this.players[id].name,
                        vote: false,
                        isLeader: false,
                        isOnTeam: false,
                        affect: this._getVisibleAffectForPlayerId(playerId, playerAffect)
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
            result: currentProposal.result
        };
    } else {
        return null;
    }
}

Game.prototype._getVisibleAffectForPlayerId = function (playerId, visibleAffect) {
    if (!visibleAffect) {
        return null;
    } else if (this._getPlayer(playerId).isSpy || visibleAffect.sourceId === playerId || visibleAffect.destinationId === playerId) {
        return visibleAffect.getKey();
    } else {
        // Return visibleAffect with type hidden
        return visibleAffect.getKey(true);
    }
}

Game.prototype.getConductMissionInformation = function(id) {
    const player = this._getPlayer(id);
    const currentMission = this.getCurrentMission();
    const isOnMission = currentMission.isOnMissionTeam(id);
    const hasConducted = currentMission.hasConducted(id);
    if (isOnMission && !hasConducted) {
        const playerRole = player.role;
        const playerTeam = player.team;
        const playerBind = currentMission.getBindOnPlayerId(id);
        const resistanceBound = Affects.isResistanceBind(playerBind);
        const spyBound = Affects.isSpyBind(playerBind);
        const successAllowed = !spyBound;
        const failAllowed = (playerTeam === "Spies" || playerRole === Roles.Puck.name || spyBound) && !resistanceBound;
        const reverseAllowed = (playerRole === Roles.Lancelot.name || playerRole === Roles.Maelagant.name) && !resistanceBound && !spyBound;
        let disclaimer = null;
        if (resistanceBound) {
            disclaimer = "You have been Resistance bounded for this mission! You can only play a success card.";
        } else if (spyBound) {
            disclaimer = "You have been Spy bounded for this mission! You can only play a fail card.";
        } else if (playerTeam === "Spies") {
            const sabotagingPlayers = this._getSabotagingPlayers(currentMission);
            if (sabotagingPlayers.includes(id)) {
                if (sabotagingPlayers.length === currentMission.requiredFails) {
                    if (playerRole === Roles.Maelagant && currentMission.requiredFails === 1) {
                        disclaimer = "Your Spy intuition says you may play a fail or a reverse card.";
                    } else {
                        disclaimer = "Your Spy intuition says you may play a fail card.";
                    }
                } else {
                    if (playerRole === Roles.Maelagant) {
                        // 2 fails required, you are Maelagant
                        disclaimer = "Your Spy intuition says you should play a reverse card.";
                    } else if (this.resistanceWins !== 2) {
                        // 2 fails required, no second spy
                        disclaimer = "Your Spy intuition says you should play a success card.";
                    }
                }
            } else {
                disclaimer = "Your Spy intuition says you should play a success card.";
            }
        }
        
        return {
            disclaimer: disclaimer,
            successAllowed: successAllowed,
            failAllowed: failAllowed,
            reverseAllowed: reverseAllowed
        };
    } else {
        return null;
    }
}

Game.prototype.addMissionAction = function(id, action) {
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

Game.prototype.getMissionResult = function(missionId) {
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

Game.prototype.getMissionResultsInformation = function() {
    const missions = [];
    for (let i = 0; i < Game.NUM_MISSIONS; i++) {
        const mission = this.missions[i];
        missions.push({
            teamSize: mission.teamSize,
            result: mission.result
        });
    }

    return {
        missions: missions
    };
}

Game.prototype.getConductRedemptionInformation = function(id) {
    const currentPlayer = this.players[id];
    if (!currentPlayer.isSpy) {
        return {
            players: this._selectPlayers({
                excludedRoles: [currentPlayer.role]
            }, ['id', 'name'], false),
            spyCount: this.spyCount
        };
    } else {
        return {
            kay: this.playersByRole.get(Roles.Kay).name
        }
    }
}

Game.prototype.processRedemptionAttempt = function(ids) {
    let incorrectSpies = 0;
    for (let spyPlayer of this.spies) {
        if (!ids.includes(spyPlayer.id)) {
            incorrectSpies += 1;
        }
    }

    this.redemptionAttemptInformation = {
        players: ids,
        incorrectSpies: incorrectSpies
    };

    if (incorrectSpies === 0) {
        this.phase = Game.PHASE_ASSASSINATION;
    } else {
        this.winner = "Spies";
        this.phase = Game.PHASE_DONE;
    }
}

Game.prototype.getConductAssassinationInformation = function(id) {
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

Game.prototype.processAssassinationAttempt = function(conductAssassinationInformation) {
    const ids = conductAssassinationInformation.ids;
    const role = conductAssassinationInformation.role;
    this.assassinationAttemptInformation = {
        assassin: this.players[this.assassinId].getPlayerInformation(),
        role: role,
        targets: ids.map(id => this.players[id].getPlayerInformation())
    };
    const targetOne = this._getPlayer(ids[0]);
    const targetTwo = role === "Lovers" ? this._getPlayer(ids[1]) : null;

    if (targetOne.role === "Jester") {
        this.winner = targetOne.name;
    } else if (targetTwo && targetTwo.role === "Jester") {
        this.winner = targetTwo.name;
    } else {
        switch (role) {
            case "Merlin":
            case "Arthur":
            case "Ector":
                if (targetOne.role === role) {
                    this.winner = "Spies";
                } else {
                    this.winner = "Resistance";
                }
                break;
            case "Lovers":
                if ((targetOne.role === "Tristan" || targetOne.role === "Iseult")
                    && (targetTwo.role === "Tristan" || targetTwo.role === "Iseult")) {
                    this.winner = "Spies";
                } else {
                    this.winner = "Resistance";
                }
                break;
        }
    }

    this.advance();
}

Game.prototype.getGameResult = function() {
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

Game.prototype.getGameResultInformation = function() {
    if (this.winner) {
        const gameResultInformation = {
            winner: this.winner,
            resistance: this.resistance.map(player => player.getPlayerInformation(["name", "role"])),
            spies: this.spies.map(player => player.getPlayerInformation(["name", "role"]))
        };
        if (this.playersByRole.has(Roles.Puck)) {
            gameResultInformation.puck = this.playersByRole.get(Roles.Puck).getPlayerInformation(["name"]);
            gameResultInformation.puck.won = this.currentMissionId === 4
        }
        if (this.playersByRole.has(Roles.Jester)) {
            gameResultInformation.jester = this.playersByRole.get(Roles.Jester).getPlayerInformation(["name"]);
        }
        if (this.assassinationAttemptInformation) {
            gameResultInformation.assassination = this.assassinationAttemptInformation;
        }
        if (this.redemptionAttemptInformation) {
            gameResultInformation.redemption = this.redemptionAttemptInformation;
        }

        return gameResultInformation;
    } else {
        return null;
    }
}

// #endregion

// #region Assign Roles Helper Functions

Game.prototype._performAccolonSabotage = function() {
    let possibleTargetRoles = [
        Roles.Merlin, Roles.Percival, Roles.Tristan, Roles.Iseult, Roles.Arthur,
        Roles.Uther, Roles.Galahad, Roles.Guinevere, Roles.Bedivere
    ];

    const target = this.players[this._selectPlayers({
        includedRoles: possibleTargetRoles,
        includedTeams: []
    })[0].id];
    let intel = target.intel[0];

    if (target.role === Roles.Arthur) {
        const possibleIndexes = [];
        for (let i = 0; i < intel.length; i++) {
            if (intel[i] !== Roles.Merlin.name) {
                possibleIndexes.push(i);
            }
        }
        const randomIndex = choice(possibleIndexes);
        intel[randomIndex] = null;
        target.performSabotage(intel);
    } else if (target.role === Roles.Bedivere) {
        const possibleIndexes = [];
        for (let i = 0; i < intel.length; i++) {
            if (intel[i] !== Roles.Accolon.name && intel[i] !== Roles.Mordred.name) {
                possibleIndexes.push(i);
            }
        }
        const randomIndex = choice(possibleIndexes);
        intel[randomIndex] = null;
        target.performSabotage(intel);
    } else {
        let insertPlayer = null;
        switch (target.role) {
            case Roles.Merlin:
                insertPlayer = this._selectPlayers({
                    excludedRoles: [Roles.Merlin, Roles.Puck],
                    includedTeams: ["Resistance"]
                })[0];
                break;
            case Roles.Tristan:
            case Roles.Iseult:
                insertPlayer = this._selectPlayers({
                    excludedRoles: [Roles.Tristan, Roles.Iseult]
                })[0];
                break;
            case Roles.Uther:
                insertPlayer = this._selectPlayers({
                    excludedRoles: [Roles.Uther],
                    excludedIds: [intel[0].id]
                })[0];
                break;
            case Roles.Guinevere:
                insertPlayer = this._selectPlayers({
                    excludedRoles: [Roles.Guinevere, Roles.Lancelot, Roles.Maelagant]
                })[0];
                break;
            case Roles.Percival:
                insertPlayer = this._selectPlayers({
                    excludedRoles: [Roles.Percival, Roles.Merlin, Roles.Morgana]
                })[0];
                break;
            case Roles.Galahad:
                insertPlayer = this._selectPlayers({
                    excludedRoles: [Roles.Arthur, Roles.Galahad]
                })[0];
                break;
        }
        intel.push(insertPlayer);
        intel = shuffle(intel);
        target.performSabotage(intel);
    }
}

Game.prototype._performTitaniaSabotage = function() {
    let index = null;
    if (this.playersByRole.has(Roles.Maelagant)) {
        index = Math.floor(Math.random() * (this.spyCount - 1)) + 1;
    } else {
        index = Math.floor(Math.random() * this.spyCount);
    }

    const target = this._selectPlayers({
        excludedRoles: [Roles.Colgrevance],
        includedTeams: ["Spies"]
    })[0];
    let intel = target.intel[0];

    const titaniaPlayer = this.playersByRole.get(Roles.Titania);
    intel.splice(index, 0, titaniaPlayer.getPlayerInformation());
    target.performSabotage(intel);
}

Game.prototype._addResistanceRoleIntel = function() {
    const ector = this.playersByRole.get(Roles.Ector);
    for (let i = 0; i < this.resistance.length; i++) {
        const resistancePlayer = this.resistance[i];
        switch (resistancePlayer.role) {
            case Roles.Merlin:
                resistancePlayer.addIntel(this._getMerlinIntel());
                break;
            case Roles.Percival:
                resistancePlayer.addIntel(this._getPercivalIntel());
                break;
            case Roles.Tristan:
                resistancePlayer.addIntel(this._getTristanIntel());
                break;
            case Roles.Iseult:
                resistancePlayer.addIntel(this._getIseultIntel());
                break;
            case Roles.Galahad:
                resistancePlayer.addIntel(this._getGalahadIntel());
                break;
            case Roles.Uther:
                resistancePlayer.addIntel(this._getUtherIntel());
                break;
            case Roles.Arthur:
                resistancePlayer.addIntel(this._getArthurIntel());
                break;
            case Roles.Jester:
                resistancePlayer.addIntel(this._getJesterIntel());
                break;
            case Roles.Guinevere:
                resistancePlayer.addIntel(this._getGuinevereIntel());
                break;
            case Roles.Bedivere:
                resistancePlayer.addIntel(this._getBedivereIntel());
                break;
            default:
                resistancePlayer.addIntel(null);
                break;
        }

        if (ector && resistancePlayer.Role !== Roles.Ector) {
            resistancePlayer.addIntel(ector.getPlayerInformation());
        }
    }
}

Game.prototype._addSpyTeamIntel = function() {
    for (let i = 0; i < this.spies.length; i++) {
        const spyPlayer = this.spies[i];
        spyPlayer.addIntel(this._getSpyIntel(spyPlayer));
    }
}

Game.prototype._addSpyRoleIntel = function() {
    for (let i = 0; i < this.spies.length; i++) {
        const spyPlayer = this.spies[i];
        switch (spyPlayer.role) {
            case Roles.Lucius:
                spyPlayer.addIntel(this._getLuciusIntel());
                break;
        }
    }
}

Game.prototype._getMerlinIntel = function() {
    return this._selectPlayers({
        includedRoles: [Roles.Puck],
        excludedRoles: [Roles.Mordred],
        includedTeams: ["Spies"]
    });
}

Game.prototype._getPercivalIntel = function() {
    return this._selectPlayers({
        includedRoles: [Roles.Merlin, Roles.Morgana],
        includedTeams: []
    });
}

Game.prototype._getTristanIntel = function() {
    return [this.playersByRole.get(Roles.Iseult).getPlayerInformation()];
}

Game.prototype._getIseultIntel = function() {
    return [this.playersByRole.get(Roles.Tristan).getPlayerInformation()];
}

Game.prototype._getGalahadIntel = function() {
    return [this.playersByRole.get(Roles.Arthur).getPlayerInformation()];
}

Game.prototype._getUtherIntel = function() {
    return [this._selectPlayers({
        excludedRoles: [Roles.Uther],
        includedTeams: ["Resistance"]
    })[0]];
}

Game.prototype._getArthurIntel = function() {
    const seenPlayers = this._selectPlayers({
        excludedRoles: [Roles.Arthur],
        includedTeams: ["Resistance"]
    }, ['role']);

    return seenPlayers.map(player => {
        return player.role;
    });
}

Game.prototype._getJesterIntel = function() {
    const seenPlayers = this._selectPlayers({
        includedRoles: [Roles.Tristan, Roles.Iseult, Roles.Merlin, Roles.Arthur],
        includedTeams: []
    }, ['role']);

    return seenPlayers.map(player => {
        return player.role;
    });
}

Game.prototype._getGuinevereIntel = function() {
    return this._selectPlayers({
        includedRoles: [Roles.Lancelot, Roles.Maelagant],
        includedTeams: []
    });
}

Game.prototype._getBedivereIntel = function() {
    const seenPlayers = this._selectPlayers({
        includedTeams: ["Spies"]
    }, ['role']);

    return seenPlayers.map(player => {
        return player.role;
    });
}

Game.prototype._getLuciusIntel = function() {
    const seenPlayers = this._selectPlayers({
        excludedRoles: [
            Roles.Merlin, Roles.Arthur, Roles.Tristan, Roles.Iseult,
            Roles.Galahad, Roles.Uther, Roles.Jester, Roles.Percival
        ],
        includedTeams: ["Resistance"]
    }, ['role']);

    return seenPlayers.map(player => {
        return player.role;
    });
}

Game.prototype._getSpyIntel = function(currentPlayer) {
    let spyPlayers = this.spies.slice(0);
    if (currentPlayer.role === Roles.Colgrevance) {
        return spyPlayers.map(player => player.getPlayerInformation(['id', 'name', 'role']));
    } else {
        return spyPlayers.map(player => player.getPlayerInformation());
    }
}

// #endregion

// #region Player Helper Functions

Game.prototype._getPlayer = function(id) {
    return this.players[id].getPlayerInformation(['id', 'name', 'role', 'team']);
}

Game.prototype._selectPlayers = function(searchOptions, playerInformationOptions, shuffled=true) {
    const includedRoles = 'includedRoles' in searchOptions ? searchOptions.includedRoles : [];
    const excludedRoles = 'excludedRoles' in searchOptions ? searchOptions.excludedRoles : [];
    const excludedIds = 'excludedIds' in searchOptions ? searchOptions.excludedIds : [];
    const includedTeams = 'includedTeams' in searchOptions ? searchOptions.includedTeams : ["Resistance", "Spies"];

    const players = [];
    for (let i = 0; i < this.players.length; i++) {
        const player = this.players[i];
        const role = player.role;
        const team = role.team;
        if ((includedRoles.includes(role) || includedTeams.includes(team))
            && !excludedRoles.includes(role) && !excludedIds.includes(i)) {
            players.push(player.getPlayerInformation(playerInformationOptions));
        }
    }

    return shuffled ? shuffle(players) : players;
}

// #endregion

// #region Advance Helper Functions

Game.prototype._advanceLeader = function() {
    this.currentLeaderId += 1;
    this.currentLeaderId %= this.playerCount;
}

Game.prototype._startProposal = function() {
    const proposal = new Proposal(this.currentLeaderId);
    this.getCurrentMission().addProposal(this.currentLeaderId, proposal);
    this.phase = Game.PHASE_PROPOSE;
}

Game.prototype._processMissionResult = function(result) {
    switch (result) {
        case "Success":
            this.resistanceWins += 1;
            break;
        case "Fail":
            this.spyWins += 1;
            break;
    }

    if (this.resistanceWins === 3) {
        return "Resistance";
    } else if (this.spyWins === 3) {
        return "Spies";
    }

    return null;
}

// #endregion

// #region Information Building Helper Functions

Game.prototype._getSabotagingPlayers = function(currentMission) {
    const sabotagingPlayers = currentMission.getMissionTeam().filter(playerId => Affects.isSpyBind(currentMission.getBindOnPlayerId(playerId)));
    const requiredFails = currentMission.requiredFails;
    let currentSpyIndex = 0;
    while (sabotagingPlayers.length < requiredFails && currentSpyIndex < this.spies.length) {
        const spyId = this.spies[currentSpyIndex].id;
        if (!sabotagingPlayers.includes(spyId) && currentMission.isOnMissionTeam(spyId) && !Affects.isResistanceBind(currentMission.getBindOnPlayer(spyId))) {
            sabotagingPlayers.push(spyId);
        }
        currentSpyIndex += 1;
    }

    return sabotagingPlayers;
}

// #endregion

module.exports = Game;