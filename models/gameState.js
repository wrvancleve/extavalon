const Roles = require('./roles');
const Player = require('./player');
const Mission = require('./mission');
const Proposal = require('./proposal');

const Roles = require('./roles');
const { shuffle, choice } = require('../utils/random');

class GameState {
    static get PHASE_PROPOSE() {
        return 0;
    }

    static get PHASE_VOTE() {
        return 1;
    }

    static get PHASE_VOTE_REACT() {
        return 2;
    }

    static get PHASE_CONDUCT() {
        return 3;
    }

    static get PHASE_CONDUCT_REACT() {
        return 4;
    }

    static get PHASE_ASSASSINATION() {
        return 5;
    }

    static get PHASE_DONE() {
        return 6;
    }

    static get NUM_WINS() {
        return 3;
    }

    static get NUM_MISSIONS() {
        return 5;
    }

    constructor(playerInformation, settings) {
        this.resistanceWins = 0;
        this.spyWins = 0;
        this.playersByRole = new Map();
        this.resistance = [];
        this.spys = [];
        this.settings = settings;
        this._createPlayers(playerInformation);
        this._createMissions();
        this.phase = GameState.PHASE_PROPOSE;
        this.winner = null;
    }

    _createPlayers(playerInformation) {
        this.playerCount = playerInformation.length;
        this.spyPlayerCount = this._getSpyCount();
        this.resistancePlayerCount = this.playerCount - this.spyPlayerCount;

        const playerRoles = Roles.generateRoles(this.resistancePlayerCount, this.spyPlayerCount, this.settings);
        this.players = [];

        for (let id = 0; id < this.playerCount; id++) {
            const playerRole = playerRoles.pop();
            const player = new Player(this, id, playerInformation[id].name, playerRole);
            this.players.push(player);
            this.playersByRole.set(playerRole, player);
            
            if (playerRole.team === "Resistance") {
                this.resistance.push(player);
            } else {
                if (playerRole === Roles.Maelagant) {
                    this.spys.unshift(player);
                } else {
                    this.spys.push(player);
                }
            }
        }

        // Set First Leader
        this.currentLeaderId = Math.floor(Math.random() * this.playerCount);
        console.debug(`First Leader Id: ${this.currentLeaderId}`);

        // Set Assassin
        this.assassinId = choice(this.spys).id;
        console.debug(`Assassin Id: ${this.assassinId}`);

        this._addResistanceRoleIntel();
        if (this.playersByRole.has(Roles.Accolon)) {
            this._performAccolonSabotage();
        }
        this._addSpyTeamIntel();
        this._addSpyRoleIntel();
        if (this.playersByRole.has(Roles.Titania)) {
            this._performTitaniaSabotage();
        }
    }

    _getSpyCount() {
        if (this.playerCount < 7) {
            return 2;
        }
        else if (this.playerCount < 10) {
            return 3;
        }
        else {
            return 4;
        }
    }

    _performAccolonSabotage() {
        let possibleTargetRoles = [
            Roles.Merlin, Roles.Percival, Roles.Tristan, Roles.Iseult, Roles.Arthur,
            Roles.Jester, Roles.Uther, Roles.Galahad, Roles.Guinevere, Roles.Bedivere
        ];
        if (this.playersByRole.has(Roles.Leon) && this.playersByRole.get(Roles.Leon).intel[0].spyCount < 2) {
            possibleTargetRoles.push(Roles.Leon);
        }

        const target = this.selectPlayers({
            includedRoles: possibleTargetRoles,
            includedTeams: []
        })[0];
        let intel = target.intel[0];

        if (target.role === Roles.Arthur || target.role === Roles.Bedivere) {
            const randomIndex = Math.floor(Math.random() * intel.length);
            intel[randomIndex] = null;
            target.performSabotage(intel);
        } else if (target.role === Roles.Jester) {
            target.performSabotage(intel.length);
        } else if (target.role === Roles.Leon) {
            let insertPlayer = null;
            if (intel.spyCount === 0) {
                insertPlayer = this.selectPlayers({
                    excludedIds: [intel.players[0].id, intel.players[1].id],
                    includedTeams: ["Spies"]
                })[0];
                intel.spyCount += 1;
            } else {
                insertPlayer = this.selectPlayers({
                    excludedIds: [intel.players[0].id, intel.players[1].id],
                    includedTeams: ["Resistance"]
                })[0];
            }

            intel.players.push({id: insertPlayer.id, name: insertPlayer.name});
            intel.players = shuffle(intel.players);
            target.performSabotage(intel);
        } else {
            let insertPlayer = null;
            switch (target.role) {
                case Roles.Merlin:
                    insertPlayer = this.selectPlayers({
                        excludedRoles: [Roles.Merlin, Roles.Puck],
                        includedTeams: ["Resistance"]
                    })[0];
                    break;
                case Roles.Tristan:
                case Roles.Iseult:
                    insertPlayer = this.selectPlayers({
                        excludedRoles: [Roles.Tristan, Roles.Iseult]
                    })[0];
                    break;
                case Roles.Uther:
                    insertPlayer = this.selectPlayers({
                        excludedRoles: [Roles.Uther],
                        excludedIds: [intel[0].id]
                    })[0];
                    break;
                case Roles.Guinevere:
                    insertPlayer = this.selectPlayers({
                        excludedRoles: [Roles.Guinevere, Roles.Lancelot, Roles.Maelagant]
                    })[0];
                    break;
                case Roles.Percival:
                    insertPlayer = this.selectPlayers({
                        excludedRoles: [Roles.Percival, Roles.Merlin, Roles.Morgana]
                    })[0];
                    break;
                case Roles.Galahad:
                    insertPlayer = this.selectPlayers({
                        excludedRoles: [Roles.Arthur, Roles.Galahad]
                    })[0];
                    break;
            }
            intel.push({id: insertPlayer.id, name: insertPlayer.name});
            intel = shuffle(intel);
            target.performSabotage(intel);
        }
    }

    _performTitaniaSabotage() {
        let index = null;
        if (this.playersByRole.has(Roles.Maelagant)) {
            index = Math.floor(Math.random() * (this.spyCount - 1)) + 1;
        } else {
            index = Math.floor(Math.random() * this.spyCount);
        }

        const target = this.selectPlayers({
            excludedRoles: [Roles.Colgrevance],
            includedTeams: ["Spies"]
        })[0];
        let intel = target.intel[0];

        const titaniaPlayer = this.playersByRole.get(Roles.Titania);
        intel.splice(index, 0, {id: titaniaPlayer.id, name: titaniaPlayer.name});
        target.performSabotage(intel);
    }

    _addResistanceRoleIntel() {
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
                case Roles.Leon:
                    resistancePlayer.addIntel(this._getLeonIntel());
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
                resistancePlayer.addIntel({id: ector.id, name: ector.name});
            }
        }
    }

    _addSpyTeamIntel() {
        for (let i = 0; i < this.spys.length; i++) {
            const spyPlayer = this.spys[i];
            spyPlayer.addIntel(this._getSpyIntel(spyPlayer));
        }
    }

    _addSpyRoleIntel() {
        for (let i = 0; i < this.spys.length; i++) {
            const spyPlayer = this.spys[i];
            switch (spyPlayer.role) {
                case Roles.Lucius:
                    spyPlayer.addIntel(this._getLuciusIntel());
                    break;
            }
        }
    }

    _getMerlinIntel() {
        const seenPlayers = this.selectPlayers({
            includedRoles: [Roles.Puck],
            excludedRoles: [Roles.Mordred],
            includedTeams: ["Spies"]
        });

        return seenPlayers.map(player => {
            return {
                id: player.id,
                name: player.name
            }
        });
    }

    _getPercivalIntel() {
        const seenPlayers = this.selectPlayers({
            includedRoles: [Roles.Merlin, Roles.Morgana],
            includedTeams: []
        });

        return seenPlayers.map(player => {
            return {
                id: player.id,
                name: player.name
            }
        });
    }

    _getTristanIntel() {
        const seenPlayers = [this.playersByRole.get(Roles.Iseult)];

        return seenPlayers.map(player => {
            return {
                id: player.id,
                name: player.name
            }
        });
    }

    _getIseultIntel() {
        const seenPlayers = [this.playersByRole.get(Roles.Tristan)];

        return seenPlayers.map(player => {
            return {
                id: player.id,
                name: player.name
            }
        });
    }

    _getGalahadIntel() {
        const seenPlayers = [this.playersByRole.get(Roles.Arthur)];

        return seenPlayers.map(player => {
            return {
                id: player.id,
                name: player.name
            }
        });
    }

    _getUtherIntel() {
        const seenPlayers = [this.selectPlayers({
            excludedRoles: [Roles.Uther],
            includedTeams: ["Resistance"]
        })[0]];

        return seenPlayers.map(player => {
            return {
                id: player.id,
                name: player.name
            }
        });
    }

    _getLeonIntel() {
        const seenPlayers = this.selectPlayers({
            excludedRoles: [Roles.Leon]
        }).slice(0, 2);

        const players = [];
        let spyCount = 0;
        for (let i = 0; i < seenPlayers.length; i++) {
            const seenPlayer = seenPlayers[i];
            if (seenPlayer.isSpy) {
                spyCount += 1;
            }

            players.push({
                id: seenPlayer.id,
                name: seenPlayer.name
            });
        }

        return  {
            players: players,
            spyCount: spyCount
        };
    }

    _getArthurIntel() {
        const seenPlayers = this.selectPlayers({
            excludedRoles: [Roles.Arthur],
            includedTeams: ["Resistance"]
        });

        return seenPlayers.map(player => {
            return player.role.name;
        });
    }

    _getJesterIntel() {
        const seenPlayers = this.selectPlayers({
            includedRoles: [Roles.Tristan, Roles.Iseult, Roles.Merlin, Roles.Arthur, Roles.Ector],
            includedTeams: []
        });

        return seenPlayers.map(player => {
            return player.role.name;
        });
    }

    _getGuinevereIntel() {
        const seenPlayers = this.selectPlayers({
            includedRoles: [Roles.Lancelot, Roles.Maelagant],
            includedTeams: []
        });

        return seenPlayers.map(player => {
            return {
                id: player.id,
                name: player.name
            }
        });
    }

    _getBedivereIntel() {
        const seenPlayers = this.selectPlayers({
            includedTeams: ["Spies"]
        });

        return seenPlayers.map(player => {
            return player.role.name;
        });
    }

    _getLuciusIntel() {
        const seenPlayers = this.selectPlayers({
            excludedRoles: [
                Roles.Arthur, Roles.Tristan, Roles.Iseult, Roles.Merlin, Roles.Ector,
                Roles.Percival, Roles.Galahad, Roles.Uther, Roles.Leon
            ],
            includedTeams: ["Resistance"]
        });

        return seenPlayers.map(player => {
            return player.role.name;
        });
    }

    _getSpyIntel(currentPlayer) {
        let spyPlayers = this.spys.slice(0);
        if (currentPlayer.role === Roles.Colgrevance) {
            return spyPlayers.map(player => {
                return {
                    id: player.id,
                    name: player.name,
                    role: player.role.name
                };
            });
        } else {
            return spyPlayers.map(player => {
                return {
                    id: player.id,
                    name: player.name
                };
            });
        }
    }

    _createMissions() {
        const teamSizes = this._getMissionTeamSizes();
        const requiredFails = this._getMissionRequiredFails();
        this.missions = [];
        for (let id = 0; id < 5; id++) {
            this.missions.push(new Mission(id, teamSizes[id], requiredFails[id]));
        }
        this.currentMissionId = 0;
    }

    _getMissionTeamSizes() {
        switch (this.playerCount)
        {
            case 5:
                return [ 2, 3, 2, 3, 3 ];
            case 6:
                return [ 2, 3, 4, 3, 4 ];
            case 7:
                return [ 2, 3, 3, 4, 4 ];
            case 8:
            case 9:
            case 10:
                return [ 3, 4, 4, 5, 5 ];
            default:
                return null;
        }
    }

    _getMissionRequiredFails()
    {
        switch (this.playerCount)
        {
            case 5:
            case 6:
                return [ 1, 1, 1, 1, 1 ];
            case 7:
            case 8:
            case 9:
            case 10:
                return [ 1, 1, 1, 2, 1 ];
            default:
                return null;
        }
    }

    selectPlayers(searchSettings, shuffled=true) {
        const includedRoles = 'includedRoles' in searchSettings ? searchSettings.includedRoles : [];
        const excludedRoles = 'excludedRoles' in searchSettings ? searchSettings.excludedRoles : [];
        const excludedIds = 'excludedIds' in searchSettings ? searchSettings.excludedIds : [];
        const includedTeams = 'includedTeams' in searchSettings ? searchSettings.includedTeams : ["Resistance", "Spies"];

        const players = [];
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            const role = player.role;
            const team = role.team;
            if ((includedRoles.includes(role) || includedTeams.includes(team))
                && !excludedRoles.includes(role) && !excludedIds.includes(i)) {
                players.push(player);
            }
        }

        return shuffled ? shuffle(players) : players;
    }
}

module.exports = GameState;