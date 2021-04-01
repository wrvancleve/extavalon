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

    function getResistanceRoles() {
        const usedResistanceRoles = [];
        const usedAssassinatableRoles = getNextAssassinatableRoles();
        if (playerCount > 8) {
            Array.prototype.push.apply(usedAssassinatableRoles, getNextAssassinatableRoles(usedAssassinatableRoles));
        }
        Array.prototype.push.apply(usedResistanceRoles, usedAssassinatableRoles);
        
        const possibleResistanceRoles = getPossibleResistanceRoles(usedAssassinatableRoles);
        do {
            let newRole = possibleResistanceRoles.pop();
            if (newRole === Uther && settings.galahad && usedAssassinatableRoles.includes(Arthur)) {
                newRole = Galahad;
            }

            switch (newRole) {
                case Percival:
                    removePossibleRole(Guinevere, possibleResistanceRoles);
                    break;
                case Guinevere:
                    removePossibleRole(Percival, possibleResistanceRoles);
                    break;
                case Jester:
                case Lancelot:
                    removePossibleRole(Puck, possibleResistanceRoles);
                    break;
                case Uther:
                case Galahad:
                    if (playerCount === 8) {
                        removePossibleRole(Puck, possibleResistanceRoles);
                    }
                    break;
                case Puck:
                    removePossibleRole(Lancelot, possibleResistanceRoles);
                    removePossibleRole(Jester, possibleResistanceRoles);
                    if (playerCount === 8) {
                        const nextAssassinatableRoles = getNextAssassinatableRoles(usedAssassinatableRoles);
                        if (nextAssassinatableRoles.includes(Tristan)) {
                            removePossibleRole(Uther, possibleResistanceRoles);
                        }
                        Array.prototype.push.apply(usedResistanceRoles, nextAssassinatableRoles);    
                    }
                    break;
            }

            usedResistanceRoles.push(newRole);

            if (resistanceCount === 6 && usedResistanceRoles.length === 5 && possibleResistanceRoles.length === 0) {
                if (settings.bedivere) {
                    possibleResistanceRoles.push(Bedivere);
                }
                if (settings.titania) {
                    possibleResistanceRoles.push(Titania);
                }
            }
        } while (usedResistanceRoles.length !== resistanceCount && possibleResistanceRoles.length > 0);

        return usedResistanceRoles;
    }

    function getNextAssassinatableRoles(usedAssassinatableRoles) {
        const newAssassinatableRoles = [];
        const possibleAssassinatableRoles = [
            Merlin, Arthur, Tristan
        ];

        if (usedAssassinatableRoles) {
            for (let usedAssassinatableRole of usedAssassinatableRoles) {
                removePossibleRole(usedAssassinatableRole, possibleAssassinatableRoles);
            }
        }

        const nextAssassinatableRole = choice(possibleAssassinatableRoles);
        newAssassinatableRoles.push(nextAssassinatableRole);
        if (nextAssassinatableRole === Tristan) {
            newAssassinatableRoles.push(Iseult);
        }

        return newAssassinatableRoles;
    }

    function getPossibleResistanceRoles(usedAssassinatableRoles) {
        const possibleResistanceRoles = [
            Percival, Lancelot, Jester, Guinevere
        ];

        if (!usedAssassinatableRoles.includes(Tristan)) {
            possibleResistanceRoles.push(Uther);
        }

        if (playerCount > 6) {
            possibleResistanceRoles.push(Puck);
        }

        return shuffle(possibleResistanceRoles);
    }

    function getSpyRoles(usedResistanceRoles) {
        const usedSpyRoles = [];
        let possibleSpyRoles = [Colgrevance];

        const containsMerlin = usedResistanceRoles.includes(Merlin);
        if (containsMerlin) {
            possibleSpyRoles.push(Mordred);
        }
        if (usedResistanceRoles.includes(Percival)) {
            if (!containsMerlin) {
                usedSpyRoles.push(Morgana);
            } else {
                possibleSpyRoles.push(Morgana);
            }
        }
        if (usedResistanceRoles.includes(Guinevere) && !usedResistanceRoles.includes(Lancelot)) {
            usedSpyRoles.push(Maelagant);
        } else {
            possibleSpyRoles.push(Maelagant);
        }

        if (settings.accolon && playerCount > 6) {
            possibleSpyRoles.push(Accolon);
        }
        if (settings.lucius && playerCount > 7) {
            possibleSpyRoles.push(Lucius);
        }

        possibleSpyRoles = shuffle(possibleSpyRoles);
        while (usedSpyRoles.length !== spyCount && possibleSpyRoles.length > 0) {
            let newRole = possibleSpyRoles.pop();

            switch (newRole) {
                case Accolon:
                    removePossibleRole(Lucius, possibleSpyRoles);
                    break;
                case Lucius:
                    removePossibleRole(Accolon, possibleSpyRoles);
                    break;
            }

            usedSpyRoles.push(newRole);
        }

        return usedSpyRoles;
    }
    
    function removePossibleRole(role, possibleRoles) {
        const roleIndex = possibleRoles.indexOf(role);
        if (roleIndex !== -1) {
            possibleRoles.splice(roleIndex, 1);
        }
    }

    let generatedRoles = [];
    let resistanceRoles = [];
    let spyRoles = [];
    do {
        resistanceRoles = getResistanceRoles();
        spyRoles = getSpyRoles(resistanceRoles);
    } while (resistanceRoles.length !== resistanceCount || spyRoles.length !== spyCount);

    Array.prototype.push.apply(generatedRoles, resistanceRoles);
    Array.prototype.push.apply(generatedRoles, spyRoles);

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