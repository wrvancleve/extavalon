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

    static get PHASE_CONDUCT() {
        return 2;
    }

    static get NUM_WINS() {
        return 3;
    }

    static get NUM_MISSIONS() {
        return 5;
    }

    constructor(playerInformation, settings) {
        this.phase = GameState.PHASE_SETUP;
        this.resistanceWins = 0;
        this.spyWins = 0;
        this.playersByRole = new Map();
        this.resistance = [];
        this.spys = [];
        this.settings = settings;
        this.players = this._createPlayers(playerInformation);
        this.missions = this._createMissions();
        this.phase = GameState.PHASE_PROPOSE;
    }

    _createPlayers(playerInformation) {
        this.playerCount = playerInformation.length;
        this.spyPlayerCount = this._getSpyCount();
        this.resistancePlayerCount = this.playerCount - this.spyPlayerCount;

        const playerRoles = getRoles(this.resistancePlayerCount, this.spyPlayerCount, this.settings);
        const players = [];
        let utherPlayer = null;

        for (let id = 0; id < this.playerCount; id++) {
            const playerRole = playerRoles.pop();
            const player = new Player(this, id, playerInformation[id].name, playerRole);
            players.push(player);
            this.playersByRole.set(playerRole, player);
            
            if (playerRole.team === "Resistance") {
                this.resistance.push(player);
                if (playerRole == Roles.Uther) {
                    utherPlayer = player;
                }
            } else {
                if (playerRole === Roles.Maelagant) {
                    this.spys.unshift(player);
                } else {
                    this.spys.push(player);
                }
            }
        }

        // Set Uther Information Index
        if (utherPlayer !== null) {
            const shuffledResistance = shuffle(this.resistance);
            for (let i = 0 ; i < shuffledResistance.length; i++) {
                const resistance = shuffledResistance[i];
                if (resistance.id !== utherPlayer.id) {
                    this.utherSight = resistance;
                    break;
                }
            }
        } else {
            this.utherSight = null;
        }

        // Set First Leader
        this.currentLeaderId = Math.floor(Math.random() * this.playerCount);
        console.debug(`First Leader Id: ${this.currentLeaderId}`);

        // Set Assassin
        this.assassinId = choice(this.spys).id;
        console.debug(`Assassin Id: ${this.assassinId}`);

        return players;
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

    _createMissions() {
        const teamSizes = this._getMissionTeamSizes();
        const requiredFails = this._getMissionRequiredFails();
        const missions = [];
        for (let id = 0; id < 5; id++) {
            missions.push(new Mission(id, teamSizes[id], requiredFails[id]));
        }
        this.currentMissionId = 0;
        return missions;
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

    getCurrentLeader() {
        return this.players[this.currentLeaderId];
    }

    getCurrentMission() {
        return this.missions[this.currentMissionId];
    }

    getCurrentProposal() {
        return this.missions[this.currentMissionId].getCurrentProposal();
    }

    getPlayerName(id) {
        return this.players[id].name;
    }

    getPlayerRole(id) {
        return this.players[id].role;
    }
}

module.exports = GameState;