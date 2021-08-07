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

function getRoleOfName(roleName) {
    switch (roleName) {
        case "Mordred":
            return Mordred;
        case "Morgana":
            return Morgana;
        case "Maelagant":
            return Maelagant;
        case "Colgrevance":
            return Colgrevance;
        case "Lucius":
            return Lucius;
        case "Accolon":
            return Accolon;
        case "Merlin":
            return Merlin;
        case "Percival":
            return Percival;
        case "Uther":
            return Uther;
        case "Tristan":
            return Tristan;
        case "Iseult":
            return Iseult;
        case "Arthur":
            return Arthur;
        case "Lancelot":
            return Lancelot;
        case "Guinevere":
            return Guinevere;
        case "Puck":
            return Puck;
        case "Jester":
            return Jester;
        case "Galahad":
            return Galahad;
        case "Titania":
            return Titania;
        case "Bedivere":
            return Bedivere;
        default:
            return null;
    }
}

function generateRoles(resistanceCount, spyCount, settings, identityPickInformation) {
    const playerCount = resistanceCount + spyCount;

    function getRequiredRoles(pickedRoles, requiredResistanceRoles, requiredSpyRoles) {
        for (let pickedRoleName of pickedRoles) {
            switch (pickedRoleName) {
                case "Tristan":
                case "Iseult":
                    requiredResistanceRoles.push(Tristan);
                    requiredResistanceRoles.push(Iseult);
                    break;
                case "Galahad":
                    requiredResistanceRoles.push(Galahad);
                    requiredResistanceRoles.push(Arthur);
                    break;
                case "Mordred":
                    requiredSpyRoles.push(Mordred);
                    requiredResistanceRoles.push(Merlin);
                    break;
                case "Morgana":
                    requiredSpyRoles.push(Morgana);
                    requiredResistanceRoles.push(Percival);
                    break;
                default:
                    const pickedRole = getRoleOfName(pickedRoleName);
                    if (pickedRole.team === "Resistance") {
                        requiredResistanceRoles.push(pickedRole);
                    } else {
                        requiredSpyRoles.push(pickedRole);
                    }
                    break;
            }
        }
    }

    function getResistanceRoles(requiredResistanceRoles) {
        const usedResistanceRoles = [];
        const possibleAssassinatableRoles = [ Merlin, Arthur, Tristan ];
        const usedAssassinatableRoles = [];
        
        for (let requiredResistanceRole of requiredResistanceRoles) {
            switch (requiredResistanceRole) {
                case Merlin:
                case Arthur:
                case Tristan:
                    usedAssassinatableRoles.push(requiredResistanceRole);
                    usedResistanceRoles.push(requiredResistanceRole);
                    removePossibleRole(requiredResistanceRole, possibleAssassinatableRoles);
                    break;
                case Iseult:
                    usedAssassinatableRoles.push(Iseult);
                    usedResistanceRoles.push(Iseult);
                    break;
                case Uther:
                case Galahad:
                    usedResistanceRoles.push(requiredResistanceRole);
                    removePossibleRole(Tristan, possibleAssassinatableRoles);
                    break;
                default:
                    usedResistanceRoles.push(requiredResistanceRole);
                    break;
            }
        }
        
        if (usedAssassinatableRoles.length === 0) {
            const nextAssassinatableRoles = getNextAssassinatableRoles(possibleAssassinatableRoles, usedAssassinatableRoles);
            Array.prototype.push.apply(usedResistanceRoles, nextAssassinatableRoles);
        }        
        if (playerCount > 8) {
            const nextAssassinatableRoles = getNextAssassinatableRoles(possibleAssassinatableRoles, usedAssassinatableRoles);
            Array.prototype.push.apply(usedResistanceRoles, nextAssassinatableRoles);
        }
        
        const possibleResistanceRoles = getPossibleResistanceRoles(usedAssassinatableRoles, requiredResistanceRoles);
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
                        removePossibleRole(Tristan, possibleAssassinatableRoles);
                    }
                    break;
                case Puck:
                    removePossibleRole(Lancelot, possibleResistanceRoles);
                    removePossibleRole(Jester, possibleResistanceRoles);
                    if (playerCount === 8) {
                        const nextAssassinatableRoles = getNextAssassinatableRoles(possibleAssassinatableRoles, usedAssassinatableRoles);
                        if (nextAssassinatableRoles.includes(Tristan)) {
                            removePossibleRole(Uther, possibleResistanceRoles);
                        }
                        Array.prototype.push.apply(usedResistanceRoles, nextAssassinatableRoles);
                    }
                    break;
            }

            usedResistanceRoles.push(newRole);

            if (resistanceCount === 6 && usedResistanceRoles.length === 5 && possibleResistanceRoles.length === 0) {
                if (settings.bedivere && !requiredResistanceRoles.includes(Bedivere) && !requiredResistanceRoles.includes(Titania)) {
                    possibleResistanceRoles.push(Bedivere);
                }
                if (settings.titania && !requiredResistanceRoles.includes(Titania) && !requiredResistanceRoles.includes(Bedivere)) {
                    possibleResistanceRoles.push(Titania);
                }
            }
        } while (usedResistanceRoles.length !== resistanceCount && possibleResistanceRoles.length > 0);

        return usedResistanceRoles;
    }

    function getNextAssassinatableRoles(possibleAssassinatableRoles, usedAssassinatableRoles) {
        const newAssassinatableRoles = [];

        const nextAssassinatableRole = choice(possibleAssassinatableRoles);
        newAssassinatableRoles.push(nextAssassinatableRole);
        removePossibleRole(nextAssassinatableRole, possibleAssassinatableRoles);
        if (nextAssassinatableRole === Tristan) {
            newAssassinatableRoles.push(Iseult);
        }
        
        Array.prototype.push.apply(usedAssassinatableRoles, newAssassinatableRoles);

        return newAssassinatableRoles;
    }

    function getPossibleResistanceRoles(usedAssassinatableRoles, requiredResistanceRoles) {
        const possibleResistanceRoles = [];        
        if (!requiredResistanceRoles.includes(Percival) && !requiredResistanceRoles.includes(Guinevere)) {
            possibleResistanceRoles.push(Percival);
        }
        if (!requiredResistanceRoles.includes(Lancelot) && !requiredResistanceRoles.includes(Puck)) {
            possibleResistanceRoles.push(Lancelot);
        }
        if (!requiredResistanceRoles.includes(Jester) && !requiredResistanceRoles.includes(Puck)) {
            possibleResistanceRoles.push(Jester);
        }

        if (!requiredResistanceRoles.includes(Uther) && !usedAssassinatableRoles.includes(Tristan) && !requiredResistanceRoles.includes(Galahad)) {
            possibleResistanceRoles.push(Uther);
        }

        if (playerCount > 6) {
            if (!requiredResistanceRoles.includes(Guinevere) && !requiredResistanceRoles.includes(Percival)) {
                possibleResistanceRoles.push(Guinevere);
            }
            if (!requiredResistanceRoles.includes(Puck) && !requiredResistanceRoles.includes(Lancelot) && !requiredResistanceRoles.includes(Jester)) {
                possibleResistanceRoles.push(Puck);
            }
        }

        return shuffle(possibleResistanceRoles);
    }

    function getSpyRoles(requiredSpyRoles, usedResistanceRoles) {
        const usedSpyRoles = [];
        let possibleSpyRoles = [Colgrevance];
        
        for (let requiredSpyRole of requiredSpyRoles) {
            switch (requiredSpyRole) {
                case Colgrevance:
                    removePossibleRole(Colgrevance, possibleSpyRoles);
                default:
                    usedSpyRoles.push(requiredSpyRole);
                    break;
            }
        }

        const containsMerlin = usedResistanceRoles.includes(Merlin);
        if (containsMerlin && !requiredSpyRoles.includes(Mordred)) {
            possibleSpyRoles.push(Mordred);
        }
        if (usedResistanceRoles.includes(Percival) && !requiredSpyRoles.includes(Morgana)) {
            if (!containsMerlin) {
                usedSpyRoles.push(Morgana);
            } else {
                possibleSpyRoles.push(Morgana);
            }
        }
        if (!requiredSpyRoles.includes(Maelagant)) {
            if (usedResistanceRoles.includes(Guinevere) && !usedResistanceRoles.includes(Lancelot)) {
                usedSpyRoles.push(Maelagant);
            } else {
                possibleSpyRoles.push(Maelagant);
            }
        }

        if (settings.accolon && playerCount > 6 && !requiredSpyRoles.includes(Accolon) && !requiredSpyRoles.includes(Lucius)) {
            possibleSpyRoles.push(Accolon);
        }
        if (settings.lucius && playerCount > 7 && !requiredSpyRoles.includes(Lucius) && !requiredSpyRoles.includes(Accolon)) {
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
    const requiredResistanceRoles = [];
    const requiredSpyRoles = [];
    const pickedRoles = [];
    
    for (let identityPick of identityPickInformation) {
        if (identityPick.type === "Role") {
            pickedRoles.push(identityPick.value);
        }
    }
    getRequiredRoles(pickedRoles, requiredResistanceRoles, requiredSpyRoles);
    
    do {
        resistanceRoles = getResistanceRoles(requiredResistanceRoles);
        spyRoles = getSpyRoles(requiredSpyRoles, resistanceRoles);
    } while (resistanceRoles.length !== resistanceCount || spyRoles.length !== spyCount);

    const identityPicks = new Map();
    for (let pickDetails of identityPickInformation) {
        let pickedRole = null;
        if (pickDetails.type === "Role") {
            pickedRole = getRoleOfName(pickDetails.value);
        } else {
            if (pickDetails.value === "Resistance") {
                pickedRole = choice(resistanceRoles);
            } else {
                pickedRole = choice(spyRoles);
            }
        }
        identityPicks.set(playerCount - 1 - pickDetails.id, pickedRole);
        removePossibleRole(pickedRole, pickedRole.team === "Resistance" ? resistanceRoles : spyRoles);
    }
    
    Array.prototype.push.apply(generatedRoles, resistanceRoles);
    Array.prototype.push.apply(generatedRoles, spyRoles);
    
    const shuffles = (new Date().getMilliseconds() % 10) + 1;
    for (let i = 0; i < shuffles; i++) {
        generatedRoles = shuffle(generatedRoles);
    }
    
    for (let [index, role] of identityPicks.entries()) {
        generatedRoles.splice(index, 0, role);
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
    Bedivere
};