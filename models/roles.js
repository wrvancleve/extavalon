const { choice, shuffle } = require('../utils/random');

const Mordred = {
    name: "Mordred",
    team: "Spies"
};

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

const Titania = {
    name: "Titania",
    team: "Resistance"
};

const Bedivere = {
    name: "Bedivere",
    team: "Resistance"
};

function generateRoles(resistanceCount, spyCount, settings) {
    playerCount = resistanceCount + spyCount;
    let usedResistanceRoles = [Merlin];
    let possibleResistanceRoles = [];
    let usedSpyRoles = [Mordred];
    let possibleSpyRoles = [];

    function getPossibleResistanceRoles() {
        const possibleResistanceRoles = [
            Arthur, Tristan, Percival, Lancelot, Uther, Jester, Guinevere
        ];

        if (playerCount > 6) {
            possibleResistanceRoles.push(Puck);
        }

        return shuffle(possibleResistanceRoles);
    }
    
    function getPossibleSpyRoles() {
        const possibleSpyRoles = [
            Maelagant, Colgrevance, Morgana
        ];

        if (settings.accolon && playerCount > 6) {
            possibleSpyRoles.push(Accolon);
        }
        if (settings.lucius && playerCount > 7) {
            possibleSpyRoles.push(Lucius);
        }

        return shuffle(possibleSpyRoles);
    }

    function addResistanceRole(role) {
        console.log(`Attempting to add ${role.name}...`);
        switch (role) {
            case Tristan:
                if (usedResistanceRoles.length + 2 <= resistanceCount) {
                    addRole(Iseult, usedResistanceRoles);
                } else {
                    return false;
                }
                break;
            case Guinevere:
                const containsLancelot = usedResistanceRoles.includes(Lancelot);
                const containsMaelagant = usedSpyRoles.includes(Maelagant);
                if (!containsLancelot && !containsMaelagant) {
                    const maelagantPossible = usedSpyRoles.length + 1 <= spyCount
                        && possibleSpyRoles.includes(Maelagant);
                    const lancelotPossible = usedResistanceRoles.length + 1 <= resistanceCount
                        && possibleResistanceRoles.includes(Lancelot);
                    if (!lancelotPossible && !maelagantPossible) {
                        return false;
                    } else if (lancelotPossible && maelagantPossible) {
                        if (Math.random() < 0.5) {
                            addRole(Lancelot, usedResistanceRoles);
                            removePossibleRole(Lancelot, possibleResistanceRoles);
                        } else {
                            addRole(Maelagant, usedSpyRoles);
                            removePossibleRole(Maelagant, possibleSpyRoles);
                        }
                    } else if (lancelotPossible) {
                        addRole(Lancelot, usedResistanceRoles);
                        removePossibleRole(Lancelot, possibleResistanceRoles);
                    } else {
                        addRole(Maelagant, usedSpyRoles);
                        removePossibleRole(Maelagant, possibleSpyRoles);
                    }
                }
                break;
        }

        addRole(role, usedResistanceRoles);
        return true;
    }

    function addSpyRole(role) {
        console.log(`Attempting to add ${role.name}...`);

        switch (role) {
            case Morgana:
                if (!usedResistanceRoles.includes(Percival)) {
                    if ((usedResistanceRoles.length + 1) <= resistanceCount && possibleResistanceRoles.includes(Percival)) {
                        addRole(Percival, usedResistanceRoles);
                        removePossibleRole(Percival, possibleResistanceRoles);
                    } else {
                        return false;
                    }
                }
                break;
        }

        addRole(role, usedSpyRoles);
        return true;
    }

    function addRole(role, usedRoles) {
        switch(role) {
            case Percival:
                removePossibleRole(Guinevere, possibleResistanceRoles);
                break;
            case Guinevere:
                removePossibleRole(Percival, possibleResistanceRoles);
                if (usedResistanceRoles.includes(Lancelot)) {
                    removePossibleRole(Maelagant, possibleSpyRoles);
                } else {
                    removePossibleRole(Lancelot, possibleResistanceRoles);
                }
                break;
            case Tristan:
                removePossibleRole(Arthur, possibleResistanceRoles);
                removePossibleRole(Uther, possibleResistanceRoles);
                removePossibleRole(Galahad, possibleResistanceRoles);
                break;
            case Arthur:
                removePossibleRole(Tristan, possibleResistanceRoles);
                if (possibleResistanceRoles.includes(Uther) && settings.galahad) {
                    possibleResistanceRoles.push(Galahad);
                }
                break;
            case Uther:
                removePossibleRole(Tristan, possibleResistanceRoles);
                removePossibleRole(Galahad, possibleResistanceRoles);
                break;
            case Galahad:
                removePossibleRole(Tristan, possibleResistanceRoles);
                removePossibleRole(Uther, possibleResistanceRoles);
                break;
            case Jester:
                removePossibleRole(Puck, possibleResistanceRoles);
                break;
            case Puck:
                removePossibleRole(Lancelot, possibleResistanceRoles);
                removePossibleRole(Jester, possibleResistanceRoles);
                break;
            case Lancelot:
                removePossibleRole(Puck, possibleResistanceRoles);
                if (usedSpyRoles.includes(Maelagant)) {
                    removePossibleRole(Guinevere, possibleResistanceRoles);
                }
                break;
            case Maelagant:
                if (usedResistanceRoles.includes(Lancelot)) {
                    removePossibleRole(Guinevere, possibleResistanceRoles);
                }
                break;
            case Accolon:
                removePossibleRole(Lucius, possibleSpyRoles);
                break;
            case Lucius:
                removePossibleRole(Accolon, possibleSpyRoles);
                break;
        }

        usedRoles.push(role);
        console.log(`Added ${role.name}`);
    }
    
    function removePossibleRole(role, possibleRoles) {
        const roleIndex = possibleRoles.indexOf(role);
        if (roleIndex !== -1) {
            possibleRoles.splice(roleIndex, 1);
        }
    }

    function addRoles() {
        do {
            possibleResistanceRoles = shuffle(possibleResistanceRoles);
            addResistanceRole(possibleResistanceRoles.pop());
            if (usedSpyRoles.length < spyCount) {
                possibleSpyRoles = shuffle(possibleSpyRoles);
                addSpyRole(possibleSpyRoles.pop());
            }
        } while (usedResistanceRoles.length !== resistanceCount && possibleResistanceRoles.length > 0);
    }

    let generatedRoles = null;
    do {
        generatedRoles = [];
        usedResistanceRoles = [Merlin];
        possibleResistanceRoles = getPossibleResistanceRoles();
        usedSpyRoles = [Mordred];
        possibleSpyRoles = getPossibleSpyRoles();

        addRoles();

        if (usedResistanceRoles.length !== resistanceCount) {
            if (settings.bedivere && playerCount > 7) {
                possibleResistanceRoles.push(Bedivere);
            }
            if (settings.titania && playerCount > 7) {
                possibleResistanceRoles.push(Titania);
            }
            addRoles();
        }

        while (usedSpyRoles.length < spyCount) {
            possibleSpyRoles = shuffle(possibleSpyRoles);
            addSpyRole(possibleSpyRoles.pop());
        }

        Array.prototype.push.apply(generatedRoles, usedSpyRoles);
        console.log("\nSpy Roles: %j", usedSpyRoles);
        Array.prototype.push.apply(generatedRoles, usedResistanceRoles);
        console.log("Resistance Roles: %j\n", usedResistanceRoles);
    } while (generatedRoles.length !== playerCount);

    const shuffles = (new Date().getMilliseconds() % 10) + 1;
    for (let i = 0; i < shuffles; i++) {
        generatedRoles = shuffle(generatedRoles);
    }
    return generatedRoles;
}

module.exports = {
    generateRoles,
    Mordred,
    Morgana,
    Maelagant,
    Colgrevance,
    Lucius,
    Accolon,
    Merlin,
    Percival,
    Uther,
    Tristan,
    Iseult,
    Arthur,
    Lancelot,
    Guinevere,
    Puck,
    Jester,
    Galahad,
    Titania,
    Bedivere,
};