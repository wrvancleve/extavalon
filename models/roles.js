const { choice, shuffle } = require('../utils/random');

class Roles {
    static get Mordred() {
        return {
            name: "Mordred",
            team: "Spies"
        };
    }

    static get Morgana() {
        return {
            name: "Morgana",
            team: "Spies"
        };
    }

    static get Maelagant() {
        return {
            name: "Maelagant",
            team: "Spies"
        };
    }

    static get Colgrevance() {
        return {
            name: "Colgrevance",
            team: "Spies"
        };
    }

    static get Lucius() {
        return {
            name: "Lucius",
            team: "Spies"
        };
    }

    static get Accolon() {
        return {
            name: "Accolon",
            team: "Spies"
        };
    }

    static get Claudas() {
        return {
            name: "Claudas",
            team: "Spies"
        };
    }
    
    static get Merlin() {
        return {
            name: "Merlin",
            team: "Resistance"
        };
    }

    static get Percival() {
        return {
            name: "Percival",
            team: "Resistance"
        };
    }

    static get Uther() {
        return {
            name: "Uther",
            team: "Resistance"
        };
    }

    static get Tristan() {
        return {
            name: "Tristan",
            team: "Resistance"
        };
    }

    static get Iseult() {
        return {
            name: "Iseult",
            team: "Resistance"
        };
    }

    static get Arthur() {
        return {
            name: "Arthur",
            team: "Resistance"
        };
    }

    static get Lancelot() {
        return {
            name: "Lancelot",
            team: "Resistance"
        };
    }

    static get Guinevere() {
        return {
            name: "Guinevere",
            team: "Resistance"
        };
    }

    static get Puck() {
        return {
            name: "Puck",
            team: "Resistance"
        };
    }

    static get Jester() {
        return {
            name: "Jester",
            team: "Resistance"
        };
    }

    static get Galahad() {
        return {
            name: "Galahad",
            team: "Resistance"
        };
    }

    static get Leon() {
        return {
            name: "Leon",
            team: "Resistance"
        };
    }

    static get Titania() {
        return {
            name: "Titania",
            team: "Resistance"
        };
    }

    static get Gawain() {
        return {
            name: "Gawain",
            team: "Resistance"
        };
    }

    static get Ector() {
        return {
            name: "Ector",
            team: "Resistance"
        };
    }

    static get Bedivere() {
        return {
            name: "Bedivere",
            team: "Resistance"
        };
    }

    static get Lamorak() {
        return {
            name: "Lamorak",
            team: "Resistance"
        };
    }

    static get Bors() {
        return {
            name: "Bors",
            team: "Resistance"
        };
    }

    static get Kay() {
        return {
            name: "Kay",
            team: "Resistance"
        };
    }

    static get Gaheris() {
        return {
            name: "Gaheris",
            team: "Resistance"
        };
    }

    static get Gareth() {
        return {
            name: "Gareth",
            team: "Resistance"
        };
    }

    static generateRoles(resistanceCount, spyCount, settings) {
        const generatedRoles = this(resistanceCount, spyCount, settings);
        return generatedRoles.getRoles();
    }

    constructor(resistanceCount, spyCount, settings) {
        this.generatedRoles = [];
        this.playerCount = resistanceCount + spyCount;
        this.spyCount = spyCount;
        this.resistanceCount = resistanceCount;
        this.settings = settings;

        const assassinatableRole = this._getAssassinatableRole();
        this.usedResistanceRoles = [];
        this.possibleResistanceRoles = this._getPossibleResistanceRoles(assassinatableRole);
        this.usedSpyRoles = [];
        this.possibleSpyRoles = this._getPossibleSpyRoles(assassinatableRole);
        
        this._addResistanceRole(assassinatableRole);
        if (assassinatableRole === Roles.Tristan) {
            this._addResistanceRole(Roles.Iseult);
        }

        do {
            const resistanceRole = this.possibleResistanceRoles.pop();
            this._addResistanceRole(resistanceRole);

            if (this.usedSpyRoles.length < spyCount) {
                const spyRole = this.possibleSpyRoles.pop();
                this._addSpyRole(spyRole);
            }
        } while (this.usedResistanceRoles.length < resistanceCount);

        this.generatedRoles = [];
        Array.prototype.push.apply(this.generatedRoles, this.usedSpyRoles);
        Array.prototype.push.apply(this.generatedRoles, this.usedResistanceRoles);
        this.generatedRoles = shuffle(this.generatedRoles);
    }

    getRoles() {
        return this.generatedRoles;
    }

    _getAssassinatableRole() {
        const possibleAssassinatableRoles = [
            Roles.Merlin, Roles.Tristan, Roles.Arthur
        ];
        if (this.settings.ector && this.playerCount > 7) {
            possibleAssassinatableRoles.push(Roles.Ector);
        }
    
        return choice(shuffle(possibleAssassinatableRoles));
    }

    _getPossibleResistanceRoles(assassinatableRole) {
        const possibleResistanceRoles = [
            Roles.Lancelot
        ];
        if (this.settings.bedivere) {
            possibleResistanceRoles.push(Roles.Bedivere);
        }
        if (this.settings.gareth) {
            possibleResistanceRoles.push(Roles.Gareth);
        }
        if (this.settings.jester) {
            possibleResistanceRoles.push(Roles.Jester);
        }
        if (this.settings.lamorak) {
            possibleResistanceRoles.push(Roles.Lamorak);
        }
        if (this.settings.puck && this.playerCount > 6) {
            possibleResistanceRoles.push(Roles.Puck);
        }
        if (this.settings.bors && this.playerCount > 7) {
            possibleResistanceRoles.push(Roles.Bors);
        }
        if (this.settings.gawain && this.playerCount > 7) {
            possibleResistanceRoles.push(Roles.Gawain);
        }
        if (this.settings.titania && this.playerCount > 7) {
            possibleResistanceRoles.push(Roles.Titania);
        }
        
        if (assassinatableRole !== Roles.Ector) {
            possibleResistanceRoles.push(Roles.Percival);
            if (this.settings.guinevere) {
                possibleResistanceRoles.push(Roles.Guinevere);
            }

            if (this.settings.galahad && assassinatableRole === Roles.Arthur) {
                possibleResistanceRoles.push(Roles.Galahad);
            }

            if (assassinatableRole !== Roles.Tristan) {
                possibleResistanceRoles.push(Roles.Uther);
                if (this.settings.leon && this.playerCount > 7) {
                    possibleResistanceRoles.push(Roles.Leon);
                }
            }
        }

        if (assassinatableRole !== Roles.Merlin) {
            if (this.settings.kay && this.playerCount > 8) {
                possibleResistanceRoles.push(Roles.Kay);
            }
        }

        if (assassinatableRole !== Roles.Arthur) {
            if (this.settings.gaheris) {
                possibleResistanceRoles.push(Roles.Gaheris);
            }
        }

        return shuffle(possibleResistanceRoles);
    }
    
    _getPossibleSpyRoles(assassinatableRole) {
        const possibleSpyRoles = [
            Roles.Mordred, Roles.Morgana, Roles.Maelagant, Roles.Colgrevance
        ];
        if (this.settings.claudas) {
            possibleSpyRoles.push(Roles.Claudas);
        }

        if (assassinatableRole !== Roles.Ector) {
            if (this.settings.lucius) {
                possibleSpyRoles.push(Roles.Lucius);
            }
            if (this.settings.accolon && this.playerCount > 7) {
                possibleSpyRoles.push(Roles.Accolon);
            }
        }

        return shuffle(possibleSpyRoles);
    }

    _addResistanceRole(role) {
        switch (role) {
            case Roles.Percival:
                let containsMerlin = this.usedResistanceRoles.includes(Roles.Merlin);
                let containsMorgana = this.usedSpyRoles.includes(Roles.Morgana);
                if (!containsMerlin && !containsMorgana) {
                    if (this.usedSpyRoles.length < this.spyCount) {
                        this._addSpyRole(Roles.Maelagant);
                        containsMorgana = true;
                    } else {
                        return false;
                    }
                }

                if (containsMerlin) {
                    this._removePossibleRole(Roles.Gaheris, this.possibleResistanceRoles);
                }
                if (containsMorgana) {
                    this._removePossibleRole(Roles.Bedivere, this.possibleResistanceRoles);
                    this._removePossibleRole(Roles.Gareth, this.possibleResistanceRoles);
                    this._removePossibleRole(Roles.Kay, this.possibleResistanceRoles);
                }
                if (containsMerlin && containsMorgana) {
                    this._removePossibleRole(Roles.Guinevere, this.possibleResistanceRoles);
                }
                this._removePossibleRole(Roles.Leon, this.possibleResistanceRoles);
                break;
            case Roles.Leon:
                this._removePossibleRole(Roles.Percival, this.possibleResistanceRoles);
                this._removePossibleRole(Roles.Kay, this.possibleResistanceRoles);
                this._removePossibleRole(Roles.Guinevere, this.possibleResistanceRoles);
                this._removePossibleRole(Roles.Morgana, this.possibleSpyRoles);
            case Roles.Uther:
            case Roles.Galahad:
                this._removePossibleRole(Roles.Uther, this.possibleResistanceRoles);
                this._removePossibleRole(Roles.Galahad, this.possibleResistanceRoles);
                this._removePossibleRole(Roles.Leon, this.possibleResistanceRoles);
                break;
            case Roles.Lancelot:
            case Roles.Puck:
                this._removePossibleRole(Roles.Lancelot, this.possibleResistanceRoles);
                this._removePossibleRole(Roles.Puck, this.possibleResistanceRoles);
                break;
            case Roles.Guinevere:
                let containsLancelot = this.usedResistanceRoles.includes(Roles.Lancelot);
                let containsMaelagant = this.usedSpyRoles.includes(Roles.Maelagant);
                if (!containsLancelot && !containsMaelagant) {
                    let maelagantPossible = this.usedSpyRoles.length < this.spyCount;
                    let lancelotPossible = (this.usedResistanceRoles.length + 1) < this.resistanceCount
                        && this.possibleResistanceRoles.includes(Lancelot);
                    if (!lancelotPossible && !maelagantPossible) {
                        return false;
                    } else if (lancelotPossible && maelagantPossible) {
                        if (Math.random() < 0.5) {
                            this._addResistanceRole(Roles.Lancelot);
                            containsLancelot = true;
                        } else {
                            this._addSpyRole(Roles.Maelagant);
                            containsMaelagant = true;
                        }
                    } else if (lancelotPossible) {
                        this._addResistanceRole(Roles.Lancelot);
                        containsLancelot = true;
                    } else {
                        this._addSpyRole(Roles.Maelagant);
                        containsMaelagant = true;
                    }
                }

                if (containsLancelot) {
                    this._removePossibleRole(Roles.Gaheris, this.possibleResistanceRoles);
                }
                if (containsMaelagant) {
                    this._removePossibleRole(Roles.Bedivere, this.possibleResistanceRoles);
                    this._removePossibleRole(Roles.Gareth, this.possibleResistanceRoles);
                    this._removePossibleRole(Roles.Kay, this.possibleResistanceRoles);
                }
                if (containsLancelot && containsMaelagant) {
                    this._removePossibleRole(Roles.Percival, this.possibleResistanceRoles);
                    this._removePossibleRole(Roles.Morgana, this.possibleSpyRoles);
                }
                this._removePossibleRole(Roles.Leon, this.possibleResistanceRoles);
                break;
            case Roles.Bedivere:
            case Roles.Gareth:
                this._removePossibleRole(Roles.Bedivere, this.possibleResistanceRoles);
                this._removePossibleRole(Roles.Gareth, this.possibleResistanceRoles);
                this._removePossibleRole(Roles.Morgana, this.possibleSpyRoles);
                if (!this.usedResistanceRoles.includes(Roles.Merlin)) {
                    this._removePossibleRole(Roles.Percival, this.possibleResistanceRoles);
                }
                if (this.usedSpyRoles.includes(Roles.Maelagant)) {
                    this._removePossibleRole(Roles.Guinevere, this.possibleResistanceRoles);
                }
                break;
            case Roles.Gaheris:
                if (this.usedResistanceRoles.includes(Roles.Merlin)) {
                    this._removePossibleRole(Roles.Percival, this.possibleResistanceRoles);
                }
                if (this.usedResistanceRoles.includes(Roles.Lancelot)) {
                    this._removePossibleRole(Roles.Guinevere, this.possibleResistanceRoles);
                }
                break;
        }

        this.usedResistanceRoles.push(role);
        return true;
    }

    _addSpyRole(role) {
        switch (role) {
            case Roles.Morgana:
                if (!this.usedResistanceRoles.includes(Roles.Percival)) {
                    if ((this.usedResistanceRoles.length + 1) < this.resistanceCount) {
                        this._addResistanceRole(Roles.Percival);
                    } else {
                        return false;
                    }
                }
                break;
        }
        this.usedSpyRoles.push(role);
        return true;
    }
    
    _removePossibleRole(role, possibleRoles) {
        const roleIndex = possibleRoles.indexOf(role);
        if (roleIndex !== -1) {
            possibleRoles.splice(roleIndex, 1);
        }
    }
}

module.exports = Roles;