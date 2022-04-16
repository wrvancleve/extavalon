const Roles = require('./roles');
const Player = require('./player');
const { shuffle, choice, sample, nextBoolean } = require('../utils/random');

function Game(playerInformation, firstLeaderId, settings) {
    this.phase = Game.PHASE_SETUP;
    this.playersByRole = new Map();
    this.resistance = [];
    this.spies = [];
    this.settings = settings;

    this.currentLeaderId = firstLeaderId;
    this.rolePickerId = null;
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

    this.resistanceWins = 0;
    this.spyWins = 0;

    this.players = [];
    for (let id = 0; id < this.playerCount; id++) {
        const player = new Player(id, playerInformation[id].name);
        this.players.push(player);
    }

    this.missions = [];
    
    this.redemptionAttemptInformation = null;
    this.assassinationAttemptInformation = null;
    this.winner = null;

    this.startTime = new Date(Date.now());
}

Game.NUM_MISSIONS = 5;

Game.PHASE_SETUP = "SETUP";
Game.PHASE_MISSIONS = "MISSIONS";
Game.PHASE_REDEMPTION = "REDEMPTION";
Game.PHASE_ASSASSINATION = "ASSASSINATION";
Game.PHASE_DONE = "DONE";

// #region Public functions

Game.prototype.isOnlineGame = function() {
    return false;
}

Game.prototype.getRoleInformation = function(id) {
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
        case 10:
            if (this.settings.titania) {
                possibleResistanceRoles.push(Roles.Titania.name);
            }
        case 9:
            if (this.settings.bors) {
                possibleResistanceRoles.push(Roles.Bors.name);
            }
        case 8:
            possibleResistanceRoles.push(Roles.Bedivere.name);
            if (this.settings.kay) {
                possibleResistanceRoles.push(Roles.Kay.name);
            }
            if (this.settings.lamorak) {
                possibleResistanceRoles.push(Roles.Lamorak.name);
            }
            if (this.settings.ector) {
                possibleResistanceRoles.push(Roles.Ector.name);
            }
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

    if (this.playerCount > 6 && this.settings.accolon) {
        possibleSpyRoles.push(Roles.Accolon.name);
    }
    if (this.playerCount > 8) {
        possibleSpyRoles.push(Roles.Lucius.name);
    }

    return {
        possibleResistanceRoles: possibleResistanceRoles,
        possibleSpyRoles: possibleSpyRoles
    };
}

Game.prototype.assignRoles = function(identityPickInformation) {
    this.rolePickerId = identityPickInformation.id;
    const playerRoles = Roles.generateRoles(this.resistancePlayerCount, this.spyPlayerCount, this.isOnlineGame(), this.settings, [identityPickInformation]);

    for (let id = 0; id < this.playerCount; id++) {
        const player = this.players[id];
        const playerRole = playerRoles.pop();
        player.assignRole(playerRole);
        this.playersByRole.set(playerRole.name, player);
        
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
    if (this.playersByRole.has(Roles.Accolon.name)) {
        this._performAccolonSabotage();
    }
    this._addSpyTeamIntel();
    this._addSpyRoleIntel();
    if (this.playersByRole.has(Roles.Titania.name)) {
        this._performTitaniaSabotage();
    }

    this.phase = Game.PHASE_MISSIONS
}

Game.prototype.getCurrentLeader = function() {
    return this._getPlayer(this.currentLeaderId);
}

Game.prototype.getPlayerRoleName = function(id) {
    return this.players[id].role.name;
}

Game.prototype.setMissionResults = function(missionResults) {
    let roundsWinner = null;
    for (let missionResult of missionResults) {
        if (missionResult !== null) {
            roundsWinner = this._processMissionResult(missionResult === "Resistance" ? "Success" : "Fail");
        }
        this.missions.push(missionResult);
    }

    this.handleMissionsFinished(roundsWinner);
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

Game.prototype.handleMissionsFinished = function(roundsWinner) {
    if (roundsWinner === "Spies") {
        if (this.playersByRole.has(Roles.Kay.name)) {
            this.phase = Game.PHASE_REDEMPTION;
        } else {
            this.winner = "Spies";
            this.phase = Game.PHASE_DONE;
        }
    } else {
        this.phase = Game.PHASE_ASSASSINATION;
    }
}

Game.prototype.getConductRedemptionInformation = function(id) {
    return {
        players: this._selectPlayers({}, ['id', 'name'], false),
        spyCount: this.spyPlayerCount
    };
}

Game.prototype.handleRedemptionAttempt = function(ids) {
    if (this.processRedemptionAttempt(ids)) {
        this.phase = Game.PHASE_ASSASSINATION;
    } else {
        this.winner = "Spies";
        this.phase = Game.PHASE_DONE;
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

    return incorrectSpies === 0;
}

Game.prototype.getConductAssassinationInformation = function(id) {
    return {
        players: this.resistance.map(player => player.getPlayerInformation())
    };
}

Game.prototype.handleAssassinationAttempt = function(conductAssassinationInformation) {
    this.processAssassinationAttempt(conductAssassinationInformation);
    this.phase = Game.PHASE_DONE;
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

    if (targetOne.role === Roles.Jester.name || (targetTwo && targetTwo.role === Roles.Jester.name)) {
        this.winner = Roles.Jester.name;
    } else {
        switch (role) {
            case Roles.Merlin.name:
            case Roles.Arthur.name:
            case Roles.Ector.name:
                if (targetOne.role === role) {
                    this.winner = "Spies";
                } else {
                    this.winner = "Resistance";
                }
                break;
            case "Lovers":
                if ((targetOne.role === Roles.Tristan.name || targetOne.role === Roles.Iseult.name)
                    && (targetTwo.role === Roles.Tristan.name || targetTwo.role === Roles.Iseult.name)) {
                    this.winner = "Spies";
                } else {
                    this.winner = "Resistance";
                }
                break;
        }
    }
}

Game.prototype.getGameResult = function() {    
    return {
        winner: this.winner,
        missions: this.missions,
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
        if (this.playersByRole.has(Roles.Puck.name)) {
            gameResultInformation.puck = this.playersByRole.get(Roles.Puck.name).getPlayerInformation(["name"]);
            if (this.missions[this.NUM_MISSIONS - 1] instanceof String) {
                gameResultInformation.puck.won = this.winner === "Resistance" && this.missions[this.NUM_MISSIONS - 1] === "Resistance";
            } else {
                gameResultInformation.puck.won = this.winner === "Resistance" && this.missions[this.NUM_MISSIONS - 1].result === "Success";
            }
        }
        if (this.playersByRole.has(Roles.Jester.name)) {
            gameResultInformation.jester = this.playersByRole.get(Roles.Jester.name).getPlayerInformation(["name"]);
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
        Roles.Uther, Roles.Galahad, Roles.Guinevere, Roles.Bedivere, Roles.Lamorak
    ];

    const target = this.players[this._selectPlayers({
        includedRoles: possibleTargetRoles,
        includedTeams: [],
        excludedIds: [this.rolePickerId]
    })[0].id];
    let intel = target.intel[0];

    if (target.role === Roles.Arthur) {
        const possibleIndexes = [];
        for (let i = 0; i < intel.length; i++) {
            if (intel[i] !== Roles.Tristan.name && Roles.Iseult.name) {
                possibleIndexes.push(i);
            }
        }
        const randomIndex = choice(possibleIndexes);
        intel[randomIndex] = null;
        target.performSabotage(intel);
    } else if (target.role === Roles.Bedivere) {
        const possibleIndexes = [];
        for (let i = 0; i < intel.length; i++) {
            if (intel[i] !== Roles.Accolon.name) {
                possibleIndexes.push(i);
            }
        }
        const randomIndex = choice(possibleIndexes);
        intel[randomIndex] = null;
        target.performSabotage(intel);
    } else if (target.role === Roles.Lamorak) {
        const insertIntoSameTeam = nextBoolean();
        let isFirstPairSameTeam = false;
        let firstPairTeam = null;
        for (const player in intel[0]) {
            if (firstPairTeam === null) {
                firstPairTeam = player.team;
            } else {
                isFirstPairSameTeam = player.team === firstPairTeam;
            }
        }
        if (insertIntoSameTeam) {
            if (isFirstPairSameTeam) {
                intel[0][choice([0, 1])] = target.getPlayerInformation();
            } else {
                intel[1][choice([0, 1])] = target.getPlayerInformation();
            }
        } else {
            if (isFirstPairSameTeam) {
                intel[1][choice([0, 1])] = target.getPlayerInformation();
            } else {
                intel[0][choice([0, 1])] = target.getPlayerInformation();
            }
        }
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
    if (this.playersByRole.has(Roles.Maelagant.name)) {
        index = Math.floor(Math.random() * (this.spyCount - 1)) + 1;
    } else {
        index = Math.floor(Math.random() * this.spyCount);
    }

    const target = this._selectPlayers({
        excludedRoles: [Roles.Colgrevance],
        includedTeams: ["Spies"]
    })[0];
    let intel = target.intel[0];

    const titaniaPlayer = this.playersByRole.get(Roles.Titania,name);
    intel.splice(index, 0, titaniaPlayer.getPlayerInformation());
    target.performSabotage(intel);
}

Game.prototype._addResistanceRoleIntel = function() {
    const ector = this.playersByRole.get(Roles.Ector.name);
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
            case Roles.Lamorak:
                resistancePlayer.addIntel(this._getLamorakIntel());
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
    return [this.playersByRole.get(Roles.Iseult.name).getPlayerInformation()];
}

Game.prototype._getIseultIntel = function() {
    return [this.playersByRole.get(Roles.Tristan.name).getPlayerInformation()];
}

Game.prototype._getGalahadIntel = function() {
    return [this.playersByRole.get(Roles.Arthur.name).getPlayerInformation()];
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
        includedRoles: [Roles.Tristan, Roles.Iseult, Roles.Merlin, Roles.Arthur, Roles.Ector],
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

Game.prototype._getLamorakIntel = function() {
    const sameTeamPair = [];
    const differentTeamPair = [];
    const usedPlayerIds = [];

    const firstRandomPlayer = this._selectPlayers({
        excludedRoles: [Roles.Lamorak, Roles.Ector]
    }, ['id', 'name', 'role', 'team'])[0];
    usedPlayerIds.push(firstRandomPlayer.id);
    const isFirstPairOnSameTeam = nextBoolean();
    if (isFirstPairOnSameTeam) {
        sameTeamPair.push(firstRandomPlayer);
        const sameTeamPlayer = this._selectPlayers({
            excludedRoles: [Roles.Lamorak, Roles.Ector],
            excludedIds: [firstRandomPlayer.id],
            includedTeams: [firstRandomPlayer.team]
        }, ['id', 'name', 'role', 'team'])[0];
        sameTeamPair.push(sameTeamPlayer);
        usedPlayerIds.push(sameTeamPlayer.id);
    } else {
        differentTeamPair.push(firstRandomPlayer);
        const differentTeamPlayer = this._selectPlayers({
            excludedRoles: [Roles.Lamorak, Roles.Ector],
            excludedTeams: [firstRandomPlayer.team]
        }, ['id', 'name', 'role', 'team'])[0];
        differentTeamPair.push(differentTeamPlayer);
        usedPlayerIds.push(differentTeamPlayer.id);
    }

    if (isFirstPairOnSameTeam) {
        const firstPlayerOfDifferentTeam = this._selectPlayers({
            excludedRoles: [Roles.Lamorak, Roles.Ector],
            excludedIds: usedPlayerIds
        }, ['id', 'name', 'role', 'team'])[0];
        differentTeamPair.push(firstPlayerOfDifferentTeam);
        usedPlayerIds.push(firstPlayerOfDifferentTeam.id);

        const secondPlayerOfDifferentTeam = this._selectPlayers({
            excludedRoles: [Roles.Lamorak, Roles.Ector],
            excludedIds: usedPlayerIds,
            excludedTeams: [firstPlayerOfDifferentTeam.team]
        }, ['id', 'name', 'role', 'team'])[0];
        differentTeamPair.push(secondPlayerOfDifferentTeam);
        usedPlayerIds.push(secondPlayerOfDifferentTeam.id);
    } else {
        Array.prototype.push.apply(sameTeamPair, this._selectPlayers({
            excludedRoles: [Roles.Lamorak, Roles.Ector],
            excludedIds: usedPlayerIds,
            excludedTeams: [nextBoolean() ? "Resistance" : "Spies"]
        }, ['id', 'name', 'role', 'team']).slice(0, 2));
    }

    if (nextBoolean()) {
        return [sameTeamPair, differentTeamPair];
    } else {
        return [differentTeamPair, sameTeamPair];
    }
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

Game.prototype._getPlayer = function(id, playerInformationFields=['id', 'name', 'role', 'team']) {
    return this.players[id].getPlayerInformation(playerInformationFields);
}

Game.prototype._selectPlayers = function(searchOptions, playerInformationOptions, shuffled=true) {
    const includedRoles = 'includedRoles' in searchOptions ? searchOptions.includedRoles : [];
    const excludedRoles = 'excludedRoles' in searchOptions ? searchOptions.excludedRoles : [];
    const excludedIds = 'excludedIds' in searchOptions ? searchOptions.excludedIds : [];
    const includedTeams = 'includedTeams' in searchOptions ? searchOptions.includedTeams : ["Resistance", "Spies"];
    const excludedTeams = 'excludedTeams' in searchOptions ? searchOptions.excludedTeams : [];

    const players = [];
    for (let i = 0; i < this.players.length; i++) {
        const player = this.players[i];
        const role = player.role;
        const team = role.team;
        if ((includedRoles.includes(role) || includedTeams.includes(team))
            && !excludedRoles.includes(role) && !excludedIds.includes(i) && !excludedTeams.includes(team)) {
            players.push(player.getPlayerInformation(playerInformationOptions));
        }
    }

    return shuffled ? shuffle(players) : players;
}

// #endregion

module.exports = Game;