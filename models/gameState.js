const Roles = require('./roles');
const Player = require('./player');
const Mission = require('./mission');
const Proposal = require('./proposal');

const { getRoles } = require('../utils/playerRoles');
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

        const playerRoles = getRoles(this.resistancePlayerCount, this.spyPlayerCount, this.settings);
        this.players = [];
        let utherPlayer = null;
        let titaniaPlayer = null;
        let accolonPlayer = null;
        let leonPlayer = null;
        let luciusPlayer = null;

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

            switch (playerRole) {
                case Roles.Uther:
                    utherPlayer = player;
                    break;
                case Roles.Titania:
                    titaniaPlayer = player;
                    break;
                case Roles.Accolon:
                    accolonPlayer = player;
                    break;
                case Roles.Leon:
                    leonPlayer = player;
                    break;
                case Roles.Lucius:
                    luciusPlayer = player;
                    break;
            }
        }

        // Set Additional Role Information
        this._setUtherSight(utherPlayer);
        this._setTitaniaSabotage(titaniaPlayer);
        this._setAccolonSabotage(accolonPlayer);
        this._setLeonSight(leonPlayer);
        this._setLuciusSight(luciusPlayer);

        // Set First Leader
        this.currentLeaderId = Math.floor(Math.random() * this.playerCount);
        console.debug(`First Leader Id: ${this.currentLeaderId}`);

        // Set Assassin
        this.assassinId = choice(this.spys).id;
        console.debug(`Assassin Id: ${this.assassinId}`);
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

    _setUtherSight(utherPlayer) {
        this.utherSight = null;
        if (utherPlayer !== null) {
            const shuffledResistance = shuffle(this.resistance);
            for (let i = 0 ; i < shuffledResistance.length; i++) {
                const resistance = shuffledResistance[i];
                if (resistance.id !== utherPlayer.id) {
                    this.utherSight = resistance;
                    break;
                }
            }
        }
    }

    _setLeonSight(leonPlayer) {
        this.leonSight = {};
        if (leonPlayer !== null) {
            if (this.accolonSabotage.source && this.accolonSabotage.source.id === leonPlayer.id) {
                const players = [];
                players.push(this.selectPlayers({
                    includedTeams: ["Spies"]
                })[0]);
                Array.prototype.push.apply(players, this.selectPlayers({
                    excludedRoles: [Roles.Leon],
                    includedTeams: ["Resistance"]
                }).slice(0, 2));
                this.leonSight = {players: shuffle(players), spyCount: 1};
            } else {
                this.leonSight = {players: [], spyCount: 0};
                const players = shuffle(this.players);
                for (var i = 0; i < this.playerCount; i++) {
                    const player = players[i];
                    if (player.id !== leonPlayer.id && this.leonSight.players.length < 2) {
                        this.leonSight.players.push(player);
                        if (player.isSpy) {
                            this.leonSight.spyCount += 1;
                        }
                    }
                }
            }
        }
    }

    _setLuciusSight(luciusPlayer) {
        this.luciusSight = {};
        if (luciusPlayer !== null) {
            const seeRoles = [
                Roles.Merlin, Roles.Percival, Roles.Tristan, Roles.Iseult,
                Roles.Uther, Roles.Leon, Roles.Galahad];
            const guinevereSees = this.selectPlayers({
                includedRoles: [Roles.Lancelot, Roles.Maelagant],
                includedTeams: []
            });
            if (guinevereSees.length > 0) {
                seeRoles.push(Roles.Guinevere);
            }

            this.luciusSight.source = this.selectPlayers({
                includedRoles: seeRoles,
                includedTeams: []
            })[0];
            switch (this.luciusSight.source.role) {
                case Roles.Merlin:
                    this.luciusSight.destination = this.selectPlayers({
                        includedRoles: [Roles.Puck],
                        excludedRoles: [Roles.Mordred],
                        includedTeams: ["Spies"]
                    })[0];
                    break;
                case Roles.Percival:
                    this.luciusSight.destination =
                        this.selectPlayers({
                            includedRoles: [Roles.Merlin, Roles.Morgana],
                            includedTeams: []
                        })[0];
                    break;
                case Roles.Tristan:
                    this.luciusSight.destination = this.playersByRole.get(Roles.Iseult);
                    break;
                case Roles.Iseult:
                    this.luciusSight.destination = this.playersByRole.get(Roles.Tristan);
                    break;
                case Roles.Uther:
                    this.luciusSight.destination = this.utherSight;
                    break;
                case Roles.Leon:
                    this.luciusSight.destination = choice(this.leonSight.players);
                    break;
                case Roles.Guinevere:
                    this.luciusSight.destination = choice(guinevereSees);
                    break;
                case Roles.Galahad:
                    this.luciusSight.destination = this.playersByRole.get(Roles.Arthur);
                    break;
            }
        }
    }

    _setTitaniaSabotage(titaniaPlayer) {
        this.titaniaSabotage = {};
        if (titaniaPlayer !== null) {
            let index = null;
            if (this.playersByRole.has(Roles.Maelagant)) {
                index = Math.floor(Math.random() * (this.playerCount - 1)) + 1;
            } else {
                index = Math.floor(Math.random() * this.playerCount);
            }

            const player = this.selectPlayers({
                excludedRoles: [Roles.Colgrevance],
                includedTeams: ["Spies"]
            })[0]; 
            this.titaniaSabotage.insertIndex = index;
            this.titaniaSabotage.player = player;
        }
    }

    _setAccolonSabotage(accolonPlayer) {
        this.accolonSabotage = {};
        if (accolonPlayer !== null) {
            const informationRoles = [
                Roles.Merlin, Roles.Percival, Roles.Tristan, Roles.Iseult,
                Roles.Uther, Roles.Leon, Roles.Galahad
            ];

            let possibleArthurSabotage = [];
            if (this.playersByRole.has(Roles.Arthur)) {
                possibleArthurSabotage = this.selectPlayers({
                    excludedRoles: [Roles.Arthur, Roles.Tristan, Roles.Iseult],
                    includedTeams: ["Resistance"]
                });
                if (possibleArthurSabotage.length > 0) {
                    informationRoles.push(Roles.Arthur);
                }
            }
            if (this.playersByRole.has(Roles.Jester)) {
                const assassinableRolesCount = this.selectPlayers({
                    includedRoles: [Roles.Merlin, Roles.Tristan, Roles.Iseult],
                    includedTeams: []
                }).length;
                if (assassinableRolesCount !== 3) {
                    informationRoles.push(Roles.Jester);
                }
            }
            if (this.playersByRole.has(Roles.Guinevere)) {
                const guinevereListCount = this.selectPlayers({
                    includedRoles: [Roles.Lancelot, Roles.Maelagant],
                    includedTeams: []
                }).length;
                if (guinevereListCount > 0) {
                    informationRoles.push(Roles.Guinevere);
                }
            }

            this.accolonSabotage.source = this.selectPlayers({
                includedRoles: informationRoles,
                includedTeams: []
            })[0];

            switch (this.accolonSabotage.source.role) {
                case Roles.Merlin:
                    this.accolonSabotage.destination = this.selectPlayers({
                        excludedRoles: [Roles.Merlin, Roles.Puck],
                        includedTeams: ["Resistance"]
                    })[0];
                    break;
                case Roles.Percival:
                    this.accolonSabotage.destination =
                        this.selectPlayers({excludedRoles: [Roles.Percival, Roles.Merlin, Roles.Morgana]})[0];
                    break;
                case Roles.Tristan:
                    this.accolonSabotage.destination =
                        this.selectPlayers({excludedRoles: [Roles.Tristan, Roles.Iseult]})[0];
                    break;
                case Roles.Iseult:
                    this.accolonSabotage.destination =
                        this.selectPlayers({excludedRoles: [Roles.Tristan, Roles.Iseult]})[0];
                    break;
                case Roles.Uther:
                    this.accolonSabotage.destination =
                        this.selectPlayers({
                            excludedRoles: [Roles.Uther, this.utherSight.role]
                        })[0];
                    break;
                case Roles.Guinevere:
                    this.accolonSabotage.destination =
                        this.selectPlayers({excludedRoles: [Roles.Guinevere, Roles.Lancelot, Roles.Maelagant]})[0];
                    break;
                case Roles.Galahad:
                    this.accolonSabotage.destination =
                        this.selectPlayers({excludedRoles: [Roles.Arthur, Roles.Galahad]})[0];
                    break;
                case Roles.Arthur:
                    this.accolonSabotage.destination = possibleArthurSabotage[0];
                    break;
            }
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
        const includedTeams = 'includedTeams' in searchSettings ? searchSettings.includedTeams : ["Resistance", "Spies"];

        const players = [];
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            const role = player.role;
            const team = role.team;
            if ((includedRoles.includes(role) || includedTeams.includes(team)) && !excludedRoles.includes(role)) {
                players.push(player);
            }
        }

        return shuffled ? shuffle(players) : players;
    }

    getAccolonSabotage(id) {
        if ('source' in this.accolonSabotage) {
            return this.accolonSabotage.source.id === id ? this.accolonSabotage : null;
        } else {
            return null;
        }
    }
}

module.exports = GameState;