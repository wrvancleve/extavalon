const { choice, shuffle } = require('../utils/random');

const Morgana = {
    name: "Morgana",
    team: "Spies"
};

const Maelagant = {
    name: "Maelagant",
    team: "Spies"
};

const Colgrevance = {
    name: "Colgrevance",
    team: "Spies"
};

const Lucius = {
    name: "Lucius",
    team: "Spies"
};

const Accolon = {
    name: "Accolon",
    team: "Spies"
};

const Claudas = {
    name: "Claudas",
    team: "Spies"
};

const Merlin = {
    name: "Merlin",
    team: "Resistance"
};

const Percival = {
    name: "Percival",
    team: "Resistance"
};

const Uther = {
    name: "Uther",
    team: "Resistance"
};

const Tristan = {
    name: "Tristan",
    team: "Resistance"
};

const Iseult = {
    name: "Iseult",
    team: "Resistance"
};

const Arthur = {
    name: "Arthur",
    team: "Resistance"
};

const Lancelot = {
    name: "Lancelot",
    team: "Resistance"
};

const Guinevere = {
    name: "Guinevere",
    team: "Resistance"
};

const Puck = {
    name: "Puck",
    team: "Resistance"
};

const Jester = {
    name: "Jester",
    team: "Resistance"
};

const Galahad = {
    name: "Galahad",
    team: "Resistance"
};

const Leon = {
    name: "Leon",
    team: "Resistance"
};

const Titania = {
    name: "Titania",
    team: "Resistance"
};

const Gawain = {
    name: "Gawain",
    team: "Resistance"
};

const Ector = {
    name: "Ector",
    team: "Resistance"
};

const Bedivere = {
    name: "Bedivere",
    team: "Resistance"
};

const Lamorak = {
    name: "Lamorak",
    team: "Resistance"
};

const Bors = {
    name: "Bors",
    team: "Resistance"
};

const Kay = {
    name: "Kay",
    team: "Resistance"
};

const Gaheris = {
    name: "Gaheris",
    team: "Resistance"
};

const Gareth = {
    name: "Gareth",
    team: "Resistance"
};

class Roles {
    static generateRoles(resistanceCount, spyCount, settings) {
        const generatedRoles = new this(resistanceCount, spyCount, settings);
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
        if (assassinatableRole === Tristan) {
            this._addResistanceRole(Iseult);
        }

        do {
            const resistanceRole = this.possibleResistanceRoles.pop();
            this._addResistanceRole(resistanceRole);

            if (this.usedSpylength < spyCount) {
                const spyRole = this.possibleSpyRoles.pop();
                this._addSpyRole(spyRole);
            }
        } while (this.usedResistancelength < resistanceCount);

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
            Merlin, Tristan, Arthur
        ];
        if (this.settings.ector && this.playerCount > 7) {
            possibleAssassinatableRoles.push(Ector);
        }
    
        return choice(shuffle(possibleAssassinatableRoles));
    }

    _getPossibleResistanceRoles(assassinatableRole) {
        const possibleResistanceRoles = [
            Lancelot
        ];
        if (this.settings.bedivere) {
            possibleResistanceRoles.push(Bedivere);
        }
        if (this.settings.gareth) {
            possibleResistanceRoles.push(Gareth);
        }
        if (this.settings.jester) {
            possibleResistanceRoles.push(Jester);
        }
        if (this.settings.lamorak) {
            possibleResistanceRoles.push(Lamorak);
        }
        if (this.settings.puck && this.playerCount > 6) {
            possibleResistanceRoles.push(Puck);
        }
        if (this.settings.bors && this.playerCount > 7) {
            possibleResistanceRoles.push(Bors);
        }
        if (this.settings.gawain && this.playerCount > 7) {
            possibleResistanceRoles.push(Gawain);
        }
        if (this.settings.titania && this.playerCount > 7) {
            possibleResistanceRoles.push(Titania);
        }
        
        if (assassinatableRole !== Ector) {
            possibleResistanceRoles.push(Percival);
            if (this.settings.guinevere) {
                possibleResistanceRoles.push(Guinevere);
            }

            if (this.settings.galahad && assassinatableRole === Arthur) {
                possibleResistanceRoles.push(Galahad);
            }

            if (assassinatableRole !== Tristan) {
                possibleResistanceRoles.push(Uther);
                if (this.settings.leon && this.playerCount > 7) {
                    possibleResistanceRoles.push(Leon);
                }
            }
        }

        if (assassinatableRole !== Merlin) {
            if (this.settings.kay && this.playerCount > 8) {
                possibleResistanceRoles.push(Kay);
            }
        }

        if (assassinatableRole !== Arthur) {
            if (this.settings.gaheris) {
                possibleResistanceRoles.push(Gaheris);
            }
        }

        return shuffle(possibleResistanceRoles);
    }
    
    _getPossibleSpyRoles(assassinatableRole) {
        const possibleSpyRoles = [
            Mordred, Morgana, Maelagant, Colgrevance
        ];
        if (this.settings.claudas) {
            possibleSpyRoles.push(Claudas);
        }

        if (assassinatableRole !== Ector) {
            if (this.settings.lucius) {
                possibleSpyRoles.push(Lucius);
            }
            if (this.settings.accolon && this.playerCount > 7) {
                possibleSpyRoles.push(Accolon);
            }
        }

        return shuffle(possibleSpyRoles);
    }

    _addResistanceRole(role) {
        switch (role) {
            case Percival:
                let containsMerlin = this.usedResistanceRoles.includes(Merlin);
                let containsMorgana = this.usedSpyRoles.includes(Morgana);
                if (!containsMerlin && !containsMorgana) {
                    if (this.usedSpylength < this.spyCount) {
                        this._addSpyRole(Maelagant);
                        containsMorgana = true;
                    } else {
                        return false;
                    }
                }

                if (containsMerlin) {
                    this._removePossibleRole(Gaheris, this.possibleResistanceRoles);
                }
                if (containsMorgana) {
                    this._removePossibleRole(Bedivere, this.possibleResistanceRoles);
                    this._removePossibleRole(Gareth, this.possibleResistanceRoles);
                    this._removePossibleRole(Kay, this.possibleResistanceRoles);
                }
                if (containsMerlin && containsMorgana) {
                    this._removePossibleRole(Guinevere, this.possibleResistanceRoles);
                }
                this._removePossibleRole(Leon, this.possibleResistanceRoles);
                break;
            case Leon:
                this._removePossibleRole(Percival, this.possibleResistanceRoles);
                this._removePossibleRole(Kay, this.possibleResistanceRoles);
                this._removePossibleRole(Guinevere, this.possibleResistanceRoles);
                this._removePossibleRole(Morgana, this.possibleSpyRoles);
            case Uther:
            case Galahad:
                this._removePossibleRole(Uther, this.possibleResistanceRoles);
                this._removePossibleRole(Galahad, this.possibleResistanceRoles);
                this._removePossibleRole(Leon, this.possibleResistanceRoles);
                break;
            case Lancelot:
            case Puck:
                this._removePossibleRole(Lancelot, this.possibleResistanceRoles);
                this._removePossibleRole(Puck, this.possibleResistanceRoles);
                break;
            case Guinevere:
                let containsLancelot = this.usedResistanceRoles.includes(Lancelot);
                let containsMaelagant = this.usedSpyRoles.includes(Maelagant);
                if (!containsLancelot && !containsMaelagant) {
                    let maelagantPossible = this.usedSpylength < this.spyCount;
                    let lancelotPossible = (this.usedResistancelength + 1) < this.resistanceCount
                        && this.possibleResistanceRoles.includes(Lancelot);
                    if (!lancelotPossible && !maelagantPossible) {
                        return false;
                    } else if (lancelotPossible && maelagantPossible) {
                        if (Math.random() < 0.5) {
                            this._addResistanceRole(Lancelot);
                            containsLancelot = true;
                        } else {
                            this._addSpyRole(Maelagant);
                            containsMaelagant = true;
                        }
                    } else if (lancelotPossible) {
                        this._addResistanceRole(Lancelot);
                        containsLancelot = true;
                    } else {
                        this._addSpyRole(Maelagant);
                        containsMaelagant = true;
                    }
                }

                if (containsLancelot) {
                    this._removePossibleRole(Gaheris, this.possibleResistanceRoles);
                }
                if (containsMaelagant) {
                    this._removePossibleRole(Bedivere, this.possibleResistanceRoles);
                    this._removePossibleRole(Gareth, this.possibleResistanceRoles);
                    this._removePossibleRole(Kay, this.possibleResistanceRoles);
                }
                if (containsLancelot && containsMaelagant) {
                    this._removePossibleRole(Percival, this.possibleResistanceRoles);
                    this._removePossibleRole(Morgana, this.possibleSpyRoles);
                }
                this._removePossibleRole(Leon, this.possibleResistanceRoles);
                break;
            case Bedivere:
            case Gareth:
                this._removePossibleRole(Bedivere, this.possibleResistanceRoles);
                this._removePossibleRole(Gareth, this.possibleResistanceRoles);
                this._removePossibleRole(Morgana, this.possibleSpyRoles);
                if (!this.usedResistanceRoles.includes(Merlin)) {
                    this._removePossibleRole(Percival, this.possibleResistanceRoles);
                }
                if (this.usedSpyRoles.includes(Maelagant)) {
                    this._removePossibleRole(Guinevere, this.possibleResistanceRoles);
                }
                break;
            case Gaheris:
                if (this.usedResistanceRoles.includes(Merlin)) {
                    this._removePossibleRole(Percival, this.possibleResistanceRoles);
                }
                if (this.usedResistanceRoles.includes(Lancelot)) {
                    this._removePossibleRole(Guinevere, this.possibleResistanceRoles);
                }
                break;
        }

        this.usedResistanceRoles.push(role);
        return true;
    }

    _addSpyRole(role) {
        switch (role) {
            case Morgana:
                if (!this.usedResistanceRoles.includes(Percival)) {
                    if ((this.usedResistancelength + 1) < this.resistanceCount) {
                        this._addResistanceRole(Percival);
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
        const roleIndex = possibleindexOf(role);
        if (roleIndex !== -1) {
            possibleRoles.splice(roleIndex, 1);
        }
    }
}

module.exports = {
    
}