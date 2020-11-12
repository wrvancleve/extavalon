const ArrayHelper = require('./arrayHelper');

class PlayerInformation {
    constructor(players, settings) {
        this.players = players;
        this.settings = settings;

        this.playerCount = players.length;
        if (this.playerCount < 7) {
            this.spyCount = 2;
        }
        else if (this.playerCount < 10) {
            this.spyCount = 3;
        }
        else {
            this.spyCount = 4;
        }
        this.resistanceCount = this.playerCount - this.spyCount;

        this.resistancePlayerIndexes = [];
        this.spyPlayerIndexes = [];
        this.playerRoles = [];
        this.playerIndexesByRole = new Map();
        this.assassinIndex = -1;
        this.utherInformationIndex = -1;
        this.leonInformation = {};
        this.luciusInformation = {};
        this.titaniaSabotageIndex = -1;
        this.accolonSabotage = {};

        this._setupGame();
    }

    _setupGame() {
        const spyRoles = this._getSpyRoles();
        const resistanceRoles = this._getResistanceRoles(spyRoles.includes("Morgana"), spyRoles.includes("Lucius"));
        const spyIndexes = this._getSpyIndexes();
        this.assassinIndex = ArrayHelper.shuffle(spyIndexes)[0];

        for (var i = 0; i < this.playerCount; i++) {
            const isSpy = spyIndexes.includes(i);
            const roleList = isSpy ? spyRoles : resistanceRoles;
            const currentRole = roleList.pop();

            if (!isSpy) {
                this.resistancePlayerIndexes.push(i);
            } else {
                if (currentRole === "Maelagant") {
                    this.spyPlayerIndexes.unshift(i);
                } else {
                    this.spyPlayerIndexes.push(i);
                }
            }

            this.playerRoles.push(currentRole);
            this.playerIndexesByRole.set(currentRole, i);
        }

        this._setUtherInformationIndex();
        this._setTitaniaSabotage();
        this._setAccolonSabotage();
        this._setLeonInformation();
        this._setLuciusInformation();
    }

    _setUtherInformationIndex() {
        const utherIndex = this.getRoleIndex("Uther");
        if (utherIndex !== -1) {
            this.utherInformationIndex = this.getPlayerIndexes({
                excludedRoles: ["Uther"],
                includedTeams: ["Resistance"]
            })[0];
        }
    }

    _setLeonInformation() {
        const leonIndex = this.getRoleIndex("Leon");
        if (leonIndex !== -1) {
            if (this.accolonSabotage.source === leonIndex) {
                const indexes = [];
                indexes.push(this.getPlayerIndexes({
                    includedTeams: ["Spy"]
                })[0]);
                Array.prototype.push.apply(indexes, this.getPlayerIndexes({
                    excludedRoles: ["Leon"],
                    includedTeams: ["Resistance"]
                }).slice(0, 2));
                this.leonInformation = {indexes: ArrayHelper.shuffle(indexes), spyCount: 1};
                console.log("Leon Sabotage: %j", this.leonInformation);
            } else {
                this.leonInformation = {indexes: [], spyCount: 0};
                const indexes = ArrayHelper.shuffle(ArrayHelper.getArrayTo(this.playerCount));
                for (var i = 0; i < this.playerCount; i++) {
                    const currentIndex = indexes[i];
                    if (currentIndex !== leonIndex && this.leonInformation.indexes.length < 2) {
                        this.leonInformation.indexes.push(currentIndex);
                        if (this.spyPlayerIndexes.includes(currentIndex)) {
                            this.leonInformation.spyCount += 1;
                        }
                    }
                }
            }
        }
    }

    _setLuciusInformation() {
        if (this.getRoleIndex("Lucius") !== -1) {
            const seeRoles = ["Merlin", "Percival", "Tristan", "Iseult", "Uther", "Leon", "Galahad"];
            const guinevereSees = this.getPlayerIndexes({
                includedRoles: ["Lancelot", "Maelagant"],
                includedTeams: []
            });
            if (guinevereSees.length > 0) {
                seeRoles.push("Guinevere");
            }
            const resistanceSeeIndexes = this.getPlayerIndexes({
                includedRoles: seeRoles,
                includedTeams: []
            });

            const sourceIndex = ArrayHelper.shuffle(resistanceSeeIndexes)[0];
            this.luciusInformation.source = sourceIndex;
            switch (this.playerRoles[sourceIndex]) {
                case "Merlin":
                    this.luciusInformation.destination = this.getPlayerIndexes({
                        includedRoles: ["Puck"],
                        excludedRoles: ["Mordred"],
                        includedTeams: ["Spy"]
                    })[0];
                    break;
                case "Percival":
                    this.luciusInformation.destination =
                        this.getPlayerIndexes({
                            includedRoles: ["Merlin", "Morgana"],
                            includedTeams: []
                        })[0];
                    break;
                case "Tristan":
                    this.luciusInformation.destination = this.getRoleIndex("Iseult");
                    break;
                case "Iseult":
                    this.luciusInformation.destination = this.getRoleIndex("Tristan");
                    break;
                case "Uther":
                    this.luciusInformation.destination = this.utherInformationIndex;
                    break;
                case "Leon":
                    this.luciusInformation.destination = ArrayHelper.shuffle(this.leonInformation.indexes)[0];
                    break;
                case "Guinevere":
                    this.luciusInformation.destination = ArrayHelper.shuffle(guinevereSees)[0];
                    break;
                case "Galahad":
                    this.luciusInformation.destination = this.getRoleIndex("Arthur");
                    break;
            }
        }
    }

    _setTitaniaSabotage() {
        if (this.getRoleIndex("Titania") !== -1) {
            this.titaniaSabotageIndex = this.getPlayerIndexes({
                excludedRoles: ["Colgrevance"],
                includedTeams: ["Spy"]
            })[0];
        }
    }

    _setAccolonSabotage() {
        if (this.getRoleIndex("Accolon") !== -1) {
            const informationRoles = [
                "Merlin", "Percival", "Tristan", "Iseult", "Uther", "Leon", "Galahad"
            ];

            var possibleArthurSabotage = [];
            if (this.playerIndexesByRole.has("Arthur")) {
                possibleArthurSabotage = this.getPlayerIndexes({
                    excludedRoles: ["Arthur", "Tristan", "Iseult"],
                    includedTeams: ["Resistance"]
                });
                if (possibleArthurSabotage.length > 0) {
                    informationRoles.push("Arthur");
                }
            }
            if (this.playerIndexesByRole.has("Jester")) {
                const assassinableRolesCount = this.getPlayerIndexes({
                    includedRoles: ["Merlin", "Tristan", "Iseult"],
                    includedTeams: []
                }).length;
                if (assassinableRolesCount !== 3) {
                    informationRoles.push("Jester");
                }
            }
            if (this.playerIndexesByRole.has("Guinevere")) {
                const guinevereListCount = this.getPlayerIndexes({
                    includedRoles: ["Lancelot", "Maelagant"],
                    includedTeams: []
                }).length;
                if (guinevereListCount > 0) {
                    informationRoles.push("Guinevere");
                }
            }

            this.accolonSabotage.source = this.getPlayerIndexes({
                includedRoles: informationRoles,
                includedTeams: []
            })[0];

            switch (this.getPlayerRole(this.accolonSabotage.source)) {
                case "Merlin":
                    this.accolonSabotage.destination = this.getPlayerIndexes({
                        excludedRoles: ["Merlin", "Puck"],
                        includedTeams: ["Resistance"]
                    })[0];
                    break;
                case "Percival":
                    this.accolonSabotage.destination =
                        this.getPlayerIndexes({excludedRoles: ["Percival", "Merlin", "Morgana"]})[0];
                    break;
                case "Tristan":
                    this.accolonSabotage.destination =
                        this.getPlayerIndexes({excludedRoles: ["Tristan", "Iseult"]})[0];
                    break;
                case "Iseult":
                    this.accolonSabotage.destination =
                        this.getPlayerIndexes({excludedRoles: ["Tristan", "Iseult"]})[0];
                    break;
                case "Uther":
                    this.accolonSabotage.destination =
                        this.getPlayerIndexes({
                            excludedRoles: ["Uther", this.getPlayerRole(this.utherInformationIndex)]
                        })[0];
                    break;
                case "Guinevere":
                    this.accolonSabotage.destination =
                        this.getPlayerIndexes({excludedRoles: ["Guinevere", "Lancelot", "Maelagant"]})[0];
                    break;
                case "Galahad":
                    this.accolonSabotage.destination =
                        this.getPlayerIndexes({excludedRoles: ["Arthur", "Galahad"]})[0];
                    break;
                case "Arthur":
                    this.accolonSabotage.destination = possibleArthurSabotage[0];
                    break;
            }
        }
    }

    _getSpyRoles() {
        const usedSpyRoles = [];
        const enabledSpyRoles = ["Mordred", "Morgana", "Maelagant", "Colgrevance"];
        if (this.settings.lucius) {
            enabledSpyRoles.push("Lucius");
        }
        if (this.settings.accolon && this.playerCount > 7) {
            enabledSpyRoles.push("Accolon");
        }

        const possibleSpyRoles = ArrayHelper.shuffle(enabledSpyRoles);
        for (var i = 0; i < possibleSpyRoles.length; i++) {
            const spyRole = possibleSpyRoles.pop();
            usedSpyRoles.push(spyRole);
            if (usedSpyRoles.length === this.spyCount) {
                return usedSpyRoles;
            }

            if (spyRole === "Lucius") {
                var accolonIndex = possibleSpyRoles.findIndex(e => e === "Accolon");
                if (accolonIndex !== -1) {
                    possibleSpyRoles.splice(accolonIndex,1);
                }
            } else if (spyRole === "Accolon") {
                var luciusIndex = possibleSpyRoles.findIndex(e => e === "Lucius");
                if (luciusIndex !== -1) {
                    possibleSpyRoles.splice(luciusIndex,1);
                }
            }
        }
    }

    _getEnabledResistanceRoles() {
        var resistanceRoles = ["Merlin", "Percival", "Lancelot", "Tristan", "Iseult", "Arthur"];
        if (this.settings.guinevere) {
            resistanceRoles.push("Guinevere");
        }
        if (this.settings.puck) {
            resistanceRoles.push("Puck");
        }
        if (this.settings.titania && this.playerCount > 7) {
            resistanceRoles.push("Titania");
        }
        if (this.settings.galahad) {
            resistanceRoles.push("Galahad");
        }
        if (this.settings.jester) {
            resistanceRoles.push("Jester");
        }
        return resistanceRoles;
    }

    _getResistanceRoles(containsMorgana, containsLucius) {
        var enabledResistanceRoles = this._getEnabledResistanceRoles();
        var usedResistanceRoles = [];

        var selectingRoles = true;
        do {
            usedResistanceRoles = [];
            var possibleResistanceRoles = ArrayHelper.shuffle(enabledResistanceRoles);
            var containsAssassinableRole = false;
            var containsSeeRole = false;
            var leonPossible = this.playerCount > 7;

            do {
                const currentRole = possibleResistanceRoles.pop();

                var add = true;
                if (usedResistanceRoles.length === this.resistanceCount - 1 &&
                    ((currentRole === "Percival" && !containsMorgana &&
                        possibleResistanceRoles.findIndex(e => e === "Merlin") !== -1) ||
                        (currentRole === "Galahad" &&
                            possibleResistanceRoles.findIndex(e => e === "Arthur") !== -1))) {
                    add = false;
                }

                if (add) {
                    switch (currentRole) {
                        case "Lancelot":
                            usedResistanceRoles.push(currentRole);
                            var puckIndex = possibleResistanceRoles.findIndex(e => e === "Puck");
                            if (puckIndex != -1) {
                                possibleResistanceRoles.splice(puckIndex,1);
                            }
                            break;
                        case "Puck":
                            usedResistanceRoles.push(currentRole);
                            var lancelotIndex = possibleResistanceRoles.findIndex(e => e === "Lancelot");
                            if (lancelotIndex != -1) {
                                possibleResistanceRoles.splice(lancelotIndex,1);
                            }
                            var jesterIndex = possibleResistanceRoles.findIndex(e => e === "Jester");
                            if (jesterIndex != -1) {
                                possibleResistanceRoles.splice(jesterIndex,1);
                            }
                            break;
                        case "Jester":
                            usedResistanceRoles.push(currentRole);
                            var arthurIndex = possibleResistanceRoles.findIndex(e => e === "Arthur");
                            if (arthurIndex != -1) {
                                possibleResistanceRoles.splice(arthurIndex,1);
                            }
                            var puckIndex = possibleResistanceRoles.findIndex(e => e === "Puck");
                            if (puckIndex != -1) {
                                possibleResistanceRoles.splice(puckIndex,1);
                            }
                            var galahadIndex = possibleResistanceRoles.findIndex(e => e === "Galahad");
                            if (galahadIndex != -1) {
                                possibleResistanceRoles.splice(galahadIndex,1);
                            }
                            break;
                        case "Arthur":
                            usedResistanceRoles.push(currentRole);
                            var jesterIndex = possibleResistanceRoles.findIndex(e => e === "Jester");
                            if (jesterIndex != -1) {
                                possibleResistanceRoles.splice(jesterIndex,1);
                            }
                            containsAssassinableRole = true;
                            break;
                        case "Galahad":
                            usedResistanceRoles.push(currentRole);
                            var tristanIndex = possibleResistanceRoles.findIndex(e => e === "Tristan");
                            if (tristanIndex != -1) {
                                possibleResistanceRoles.splice(tristanIndex,1);
                            }
                            var iseultIndex = possibleResistanceRoles.findIndex(e => e === "Iseult");
                            if (iseultIndex != -1) {
                                possibleResistanceRoles.splice(iseultIndex,1);
                            }
                            var arthurIndex = possibleResistanceRoles.findIndex(e => e === "Arthur");
                            if (arthurIndex != -1) {
                                usedResistanceRoles.push("Arthur");
                                possibleResistanceRoles.splice(arthurIndex,1);
                                var jesterIndex = possibleResistanceRoles.findIndex(e => e === "Jester");
                                if (jesterIndex != 1) {
                                    possibleResistanceRoles.splice(jesterIndex,1);
                                }
                                containsAssassinableRole = true;
                            }
                            containsSeeRole = true;
                            break;
                        case "Percival":
                            usedResistanceRoles.push(currentRole);
                            var merlinIndex = possibleResistanceRoles.findIndex(e => e === "Merlin")
                            if (!containsMorgana && merlinIndex != -1) {
                                usedResistanceRoles.push("Merlin");
                                possibleResistanceRoles.splice(merlinIndex,1);
                                containsAssassinableRole = true;
                            }
                            containsSeeRole = true;
                            leonPossible = false;
                            break;
                        case "Merlin":
                            usedResistanceRoles.push(currentRole);
                            containsAssassinableRole = true;
                            containsSeeRole = true;
                            break;
                        case "Tristan":
                        case "Iseult":
                            usedResistanceRoles.push(currentRole);
                            var galahadIndex = possibleResistanceRoles.findIndex(e => e === "Galahad");
                            if (galahadIndex !== -1) {
                                possibleResistanceRoles.splice(galahadIndex,1);
                            }
                            containsSeeRole = true;
                            break;
                        case "Guinevere":
                            usedResistanceRoles.push(currentRole);
                            containsSeeRole = true;
                            leonPossible = false;
                            break;
                        default:
                            usedResistanceRoles.push(currentRole);
                            break;
                    }
                }
            } while (possibleResistanceRoles.length > 0 && usedResistanceRoles.length < this.resistanceCount);
            selectingRoles = (usedResistanceRoles.length !== this.resistanceCount) || !containsAssassinableRole
                || (containsLucius && !containsSeeRole);

            const tristanFinalIndex = usedResistanceRoles.findIndex(e => e === "Tristan");
            const iseultFinalIndex = usedResistanceRoles.findIndex(e => e === "Iseult");
            if (tristanFinalIndex === -1 ^ iseultFinalIndex === -1) {
                const replacementIndex = tristanFinalIndex === -1 ? iseultFinalIndex : tristanFinalIndex;
                if (leonPossible && this.settings.leon) {
                    usedResistanceRoles[replacementIndex] = "Leon";
                } else {
                    usedResistanceRoles[replacementIndex] = "Uther";
                }
            }
        } while (selectingRoles);

        return ArrayHelper.shuffle(usedResistanceRoles);
    }

    _getSpyIndexes() {
        return ArrayHelper.shuffle(ArrayHelper.getArrayTo(this.playerCount)).slice(0, this.spyCount);
    }

    getRoleIndex(role) {
        if (this.playerIndexesByRole.has(role)) {
            return this.playerIndexesByRole.get(role);
        } else {
            return -1;
        }
    }

    getPlayerIndexes(searchSettings, shuffled=true) {
        const includedRoles = 'includedRoles' in searchSettings ? searchSettings.includedRoles : [];
        const excludedRoles = 'excludedRoles' in searchSettings ? searchSettings.excludedRoles : [];
        const includedTeams = 'includedTeams' in searchSettings ? searchSettings.includedTeams : ["Resistance", "Spy"];

        const roleIndexes = [];
        for (var i = 0; i < this.playerCount; i++) {
            const role = this.playerRoles[i];
            const team = this.spyPlayerIndexes.includes(i) ? "Spy" : "Resistance";
            if ((includedRoles.includes(role) || includedTeams.includes(team)) && !excludedRoles.includes(role)) {
                roleIndexes.push(i);
            }
        }

        return shuffled ? ArrayHelper.shuffle(roleIndexes) : roleIndexes;
    }

    getPlayerRole(index) {
        return this.playerRoles[index];
    }

    getPlayerName(index) {
        return this.players[index].name;
    }

    getUtherInformationIndex() {
        return this.utherInformationIndex;
    }

    getLeonInformation() {
        return this.leonInformation;
    }

    getLuciusInformation() {
        return this.luciusInformation;
    }

    getAccolonSabotage(index) {
        if ('source' in this.accolonSabotage) {
            return this.accolonSabotage.source === index ? this.accolonSabotage : null;
        } else {
            return null;
        }
    }

    getSpySeeInformation(index) {
        const spyPlayerIndexes = ArrayHelper.getArrayClone(this.spyPlayerIndexes);
        const doesTitaniaSabotage = this.titaniaSabotageIndex === index;
        if (doesTitaniaSabotage) {
            const insertMin = this.playerIndexesByRole.has("Maelagant") ? 1 : 0;
            const insertIndex = ArrayHelper.shuffle(ArrayHelper.getArrayTo(spyPlayerIndexes.length, insertMin))[0];
            spyPlayerIndexes.splice(insertIndex, 0, this.playerIndexesByRole.get("Titania"));
        }

        return {indexes: spyPlayerIndexes, sabotaged: doesTitaniaSabotage};
    }

    isAssassin(index) {
        return this.assassinIndex === index;
    }
}

module.exports = PlayerInformation;