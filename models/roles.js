const { choice, shuffle, nextBoolean } = require('../utils/random');
const RandomSample = require('../utils/randomSample');

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
const Accolon = {
    name: "Accolon",
    team: "Spies"
};
const Cerdic = {
    name: "Cerdic",
    team: "Spies"
};
const Cynric = {
    name: "Cynric",
    team: "Spies"
};
const Lucius = {
    name: "Lucius",
    team: "Spies"
};

const Merlin = {
    name: "Merlin",
    team: "Resistance"
};
const Arthur = {
    name: "Arthur",
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
const Ector = {
    name: "Ector",
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
const Geraint = {
    name: "Geraint",
    team: "Resistance"
};
const SirRobin = {
    name: "Sir Robin",
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

function generateRoles(resistanceCount, spyCount, gameType, settings, identityPickInformation) {
    const playerCount = resistanceCount + spyCount;
    let resistanceRoles = new Set();
    let spyRoles = new Set();
    do {
        const { requiredResistanceRoles, requiredSpyRoles } = getRequiredRoles(identityPickInformation, playerCount);
        resistanceRoles = getResistanceRoles(requiredResistanceRoles, requiredSpyRoles, resistanceCount, playerCount, settings);
        getAdditionalRequiredSpyRoles(requiredSpyRoles, resistanceRoles, settings);
        spyRoles = getSpyRoles(requiredSpyRoles, resistanceRoles, playerCount, spyCount, settings);
    } while (resistanceRoles.size !== resistanceCount || spyRoles.size !== spyCount);

    return finalizeGeneratedRoles(Array.from(resistanceRoles), Array.from(spyRoles), identityPickInformation, playerCount);
}

function finalizeGeneratedRoles(resistanceRoles, spyRoles, identityPickInformation, playerCount) {
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

    let generatedRoles = [];
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
        case "Cerdic":
            return Cerdic;
        case "Cynric":
            return Cynric;
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
        case "Ector":
            return Ector;
        case "Kay":
            return Kay;
        case "Sir Robin":
            return SirRobin;
        case "Gaheris":
            return Gaheris;
        case "Geraint":
            return Geraint;
        case "Lamorak":
            return Lamorak;
        case "Bors":
            return Bors;
        default:
            return null;
    }
}

function removePossibleRole(role, possibleRoles) {
    const roleIndex = possibleRoles.indexOf(role);
    if (roleIndex !== -1) {
        possibleRoles.splice(roleIndex, 1);
    }
}

function getRequiredRoles(identityPickInformation, playerCount) {
    const requiredResistanceRoles = new Set();
    const requiredSpyRoles = new Set();

    for (let identityPick of identityPickInformation) {
        if (identityPick.type === "Role") {
            switch (identityPick.value) {
                case "Tristan":
                case "Iseult":
                    requiredResistanceRoles.add(Tristan);
                    requiredResistanceRoles.add(Iseult);
                    break;
                case "Galahad":
                    requiredResistanceRoles.add(Galahad);
                    requiredResistanceRoles.add(Arthur);
                    break;
                case "Mordred":
                    requiredSpyRoles.add(Mordred);
                    requiredResistanceRoles.add(Merlin);
                    break;
                case "Morgana":
                    requiredSpyRoles.add(Morgana);
                    requiredResistanceRoles.add(Percival);
                    break;
                case "Cynric":
                    requiredSpyRoles.add(Cynric);
                    requiredResistanceRoles.add(Gaheris);
                    break;
                case "Geraint":
                    requiredResistanceRoles.add(Geraint);
                    requiredSpyRoles.add(Cerdic);
                    break;
                default:
                    const pickedRole = getRoleOfName(identityPick.value);
                    if (pickedRole.team === "Resistance") {
                        requiredResistanceRoles.add(pickedRole);
                    } else {
                        requiredSpyRoles.add(pickedRole);
                    }
                    break;
            }
        }
    }

    return {
        requiredResistanceRoles: requiredResistanceRoles,
        requiredSpyRoles: requiredSpyRoles
    }
}

function getResistanceRoles(requiredResistanceRoles, requiredSpyRoles, resistanceCount, playerCount, settings) {
    const usedResistanceRoles = new Set();
    
    for (let requiredResistanceRole of requiredResistanceRoles.values()) {
        switch (requiredResistanceRole) {
            case Tristan:
            case Iseult:
                usedResistanceRoles.add(Tristan);
                usedResistanceRoles.add(Iseult);
                break;
            case Galahad:
                usedResistanceRoles.add(Galahad);
                usedResistanceRoles.add(Arthur);
                break;
            default:
                usedResistanceRoles.add(requiredResistanceRole);
                break;
        }
    }
    
    for (let assassinatableRole of getResistanceAssassinatableRoles(playerCount, requiredSpyRoles, usedResistanceRoles, settings).values()) {
        usedResistanceRoles.add(assassinatableRole);
    }

    const nonAssassinatableRolesSample = getResistanceNonAssassinatableRolesSample(playerCount, resistanceCount, usedResistanceRoles, settings);
    const nonAssassinatableRolesNeeded = resistanceCount - usedResistanceRoles.size;
    for (let nonAssassinatableRole of nonAssassinatableRolesSample.select(nonAssassinatableRolesNeeded)) {
        usedResistanceRoles.add(nonAssassinatableRole);
    }
    
    return usedResistanceRoles;
}

function getResistanceAssassinatableRoles(playerCount, requiredSpyRoles, usedResistanceRoles, settings) {
    const assassinatableRoles = new Set();
    let assassinatableRolesPresent = 0;
    
    let merlinAlreadyPresent = usedResistanceRoles.has(Merlin);
    if (merlinAlreadyPresent) {
        assassinatableRolesPresent += 1;
    }
    let arthurAlreadyPresent = usedResistanceRoles.has(Arthur);
    if (arthurAlreadyPresent) {
        assassinatableRolesPresent += 1;
    }
    let loversAlreadyPresent = usedResistanceRoles.has(Tristan);
    if (loversAlreadyPresent) {
        assassinatableRolesPresent += 1;
    }
    let ectorAlreadyPresent = usedResistanceRoles.has(Ector);
    if (ectorAlreadyPresent) {
        assassinatableRolesPresent += 1;
    }
    
    const requiredAssassinatableRolesPresent = playerCount > 8 ? 2 : 1;
    while (assassinatableRolesPresent < requiredAssassinatableRolesPresent) {
        if (ectorAlreadyPresent || loversAlreadyPresent || merlinAlreadyPresent) {
            assassinatableRoles.add(Arthur);
            arthurAlreadyPresent = true;
        } else {
            const utherAlreadyPresent = usedResistanceRoles.has(Uther);
            const galahadAlreadyPresent = usedResistanceRoles.has(Galahad);

            const possibleAssassinatableRoles = [Merlin];
            if (!utherAlreadyPresent && !galahadAlreadyPresent) {
                possibleAssassinatableRoles.push(Tristan);
            }
            if (!arthurAlreadyPresent) {
                possibleAssassinatableRoles.push(Arthur);
            }
            if (settings.ector && playerCount > 7 && !utherAlreadyPresent && !galahadAlreadyPresent && !usedResistanceRoles.has(Percival)
                && !usedResistanceRoles.has(Guinevere) && !usedResistanceRoles.has(Kay) && !usedResistanceRoles.has(SirRobin)
                && !requiredSpyRoles.has(Accolon)) {
                possibleAssassinatableRoles.push(Ector);
            }
            
            const nextAssassinatableRole = choice(possibleAssassinatableRoles);
            switch (nextAssassinatableRole) {
                case Merlin:
                    merlinAlreadyPresent = true;
                    break;
                case Tristan:
                    loversAlreadyPresent = true;
                    assassinatableRoles.add(Iseult);
                    break;
                case Arthur:
                    arthurAlreadyPresent = true;
                    break;
                case Ector:
                    ectorAlreadyPresent = true;
                    break;
            }
            assassinatableRoles.add(nextAssassinatableRole);
        }
        
        assassinatableRolesPresent += 1;
    }
    
    return assassinatableRoles;
}

function getResistanceNonAssassinatableRolesSample(playerCount, resistanceCount, usedResistanceRoles, settings) {
    /*
    const nonAssassinatableRoles = new Set();
    const nonAssassinatableRolesNeeded = resistanceCount - usedResistanceRoles.size;
    const nonAssassinatablePossibilities = [];

    const sightPossibilities = getResistanceSightPossibilities(playerCount, resistanceCount, usedResistanceRoles, settings);
    if (sightPossibilities.length > 0) {
        nonAssassinatablePossibilities.push(new RandomSample(sightPossibilities, Math.min(sightPossibilities.length, nonAssassinatableRolesNeeded)));
    }

    const nonSightPossibilities = getResistanceNonSightPossibilities(playerCount, resistanceCount, usedResistanceRoles, settings);
    if (nonSightPossibilities.length > 0) {
        nonAssassinatablePossibilities.push(new RandomSample(nonSightPossibilities, Math.min(nonSightPossibilities.length, nonAssassinatableRolesNeeded)));
    }

    const nonAssassinatableSample = new RandomSample(nonAssassinatablePossibilities, nonAssassinatableRolesNeeded);

    for (let i = 0; i < nonAssassinatableRolesNeeded; i++) {
        nonAssassinatableRoles.add(nonAssassinatableSample.getNextValue());
    }

    return nonAssassinatableRoles;
    */

    const nonAssassinatableRolesSample = new RandomSample();

    if (!usedResistanceRoles.has(Ector)) {
        if (!usedResistanceRoles.has(Iseult)) {
            if (usedResistanceRoles.has(Arthur)) {
                nonAssassinatableRolesSample.addPossibility(Uther);
                nonAssassinatableRolesSample.addPossibility(Galahad);
                nonAssassinatableRolesSample.addDisjunction(new Set([Uther, Galahad]));
            } else {
                nonAssassinatableRolesSample.addPossibility(Uther);
            }
        }

        if (!usedResistanceRoles.has(Percival) && !usedResistanceRoles.has(Guinevere)) {
            nonAssassinatableRolesSample.addPossibility(Percival);
            if (playerCount > 6) {
                nonAssassinatableRolesSample.addPossibility(Guinevere);
                nonAssassinatableRolesSample.addDisjunction(new Set([Percival, Guinevere]));
            }
        }

        if (!usedResistanceRoles.has(Kay) && !usedResistanceRoles.has(SirRobin)) {
            const possibility = [];
            if (settings.kay && playerCount > 7) {
                possibility.push(Kay);
            }
            if (settings.sirrobin && playerCount > 8) {
                possibility.push(SirRobin);
            }
            if (possibility.length > 0) {
                nonAssassinatableRolesSample.addPossibility(possibility);
                if (possibility.length > 1) {
                    nonAssassinatableRolesSample.addDisjunction(new Set(possibility));
                }
            }
        }
    }

    if (playerCount < 7) {
        if (!usedResistanceRoles.has(Lancelot)) {
            nonAssassinatableRolesSample.addPossibility(Lancelot);
        }
        if (!usedResistanceRoles.has(Jester)) {
            nonAssassinatableRolesSample.addPossibility(Jester);
        }
    } else if (playerCount === 7) {
        const puckAlreadyPresent = usedResistanceRoles.has(Puck);
        const lancelotAlreadyPresent = usedResistanceRoles.has(Lancelot);
        const jesterAlreadyPresent = usedResistanceRoles.has(Jester);
        const gaherisAlreadyPresent = usedResistanceRoles.has(Gaheris);
        const geraintAlreadyPresent = usedResistanceRoles.has(Geraint);
        let lancelotPossible = false;
        let puckPossible = false;

        if (!lancelotAlreadyPresent && !gaherisAlreadyPresent && !geraintAlreadyPresent) {
            const possibility = [];
            if (!puckAlreadyPresent) {
                possibility.push(Lancelot);
                lancelotPossible = true;
            }
            if (settings.gaheris) {
                possibility.push(Gaheris);
            }
            if (settings.geraint) {
                possibility.push(Geraint);
            }
            if (possibility.length > 0) {
                nonAssassinatableRolesSample.addPossibility(possibility);
                if (possibility.length > 1) {
                    nonAssassinatableRolesSample.addDisjunction(new Set(possibility));
                }
            }
        }
        
        if (!puckAlreadyPresent && !jesterAlreadyPresent) {
            const possibility = [];
            if (!lancelotAlreadyPresent) {
                possibility.push(Puck);
                puckPossible = true;
            }
            possibility.push(Jester);
            nonAssassinatableRolesSample.addPossibility(possibility);
            if (possibility.length > 1) {
                nonAssassinatableRolesSample.addDisjunction(new Set(possibility));
            }
            if (lancelotPossible && puckPossible) {
                nonAssassinatableRolesSample.addDisjunction(new Set([Lancelot, Puck]));
            }
        }
    } else {
        if (!usedResistanceRoles.has(Bedivere)) {
            nonAssassinatableRolesSample.addPossibility(Bedivere);
        }

        if (settings.lamorak && !usedResistanceRoles.has(Lamorak)) {
            nonAssassinatableRolesSample.addPossibility(Lamorak);
        }

        if (!usedResistanceRoles.has(Puck)) {
            const lancelotAlreadyPresent = usedResistanceRoles.has(Lancelot);
            const jesterAlreadyPresent = usedResistanceRoles.has(Jester);
            let lancelotPossible = false;
            let jesterPossible = false;

            const possibility = [];
            if (!lancelotAlreadyPresent) {
                possibility.push(Lancelot);
                lancelotPossible = true;
            }
            if (!jesterAlreadyPresent) {
                possibility.push(Jester);
                jesterPossible = true;
            }
            if (lancelotPossible && jesterPossible) {
                possibility.push(Puck);
                nonAssassinatableRolesSample.addPossibility(possibility);
                nonAssassinatableRolesSample.addDisjunction(new Set([Jester, Puck]));
                nonAssassinatableRolesSample.addDisjunction(new Set([Lancelot, Puck]));
            } else {
                nonAssassinatableRolesSample.addPossibility(possibility);
            }
        }

        if (settings.gaheris && !usedResistanceRoles.has(Gaheris)) {
            nonAssassinatableRolesSample.addPossibility(Gaheris);
        }
        if (settings.geraint && !usedResistanceRoles.has(Geraint)) {
            nonAssassinatableRolesSample.addPossibility(Geraint);
        }

        if (settings.titania && playerCount >= 10 && !usedResistanceRoles.has(Titania)) {
            nonAssassinatableRolesSample.addPossibility(Titania);
        }
    }

    return nonAssassinatableRolesSample;
}

function getAdditionalRequiredSpyRoles(requiredSpyRoles, usedResistanceRoles, settings) {
    const merlinPresent = usedResistanceRoles.has(Merlin);

    if (!requiredSpyRoles.has(Morgana) && usedResistanceRoles.has(Percival) && !merlinPresent) {
        requiredSpyRoles.add(Morgana);
    }

    if (merlinPresent && !usedResistanceRoles.has(Puck)) {
        requiredSpyRoles.add(Mordred);
    }

    if (!requiredSpyRoles.has(Maelagant) && usedResistanceRoles.has(Guinevere) && !usedResistanceRoles.has(Lancelot)) {
        requiredSpyRoles.add(Maelagant);
    }

    if (!requiredSpyRoles.has(Cerdic) && usedResistanceRoles.has(Geraint)) {
        requiredSpyRoles.add(Cerdic);
    }
}

function getSpyRoles(requiredSpyRoles, usedResistanceRoles, playerCount, spyCount, settings) {
    const usedSpyRoles = new Set();
    for (let requiredSpyRole of requiredSpyRoles.values()) {
        usedSpyRoles.add(requiredSpyRole);
    }

    if (usedSpyRoles.size < spyCount) {
        const spyRolesSample = getSpyRolesSample(playerCount, spyCount, usedSpyRoles, usedResistanceRoles, settings);
        const spyRolesNeeded = spyCount - usedSpyRoles.size;
        for (let spyRole of spyRolesSample.select(spyRolesNeeded)) {
            usedSpyRoles.add(spyRole);
        }
    }

    return usedSpyRoles;
}

function getSpyRolesSample(playerCount, spyCount, usedSpyRoles, usedResistanceRoles, settings) {
    const spyRolesSample = new RandomSample();

    if (!usedSpyRoles.has(Colgrevance)) {
        spyRolesSample.addPossibility(Colgrevance);
    }

    if (!usedSpyRoles.has(Mordred) && usedResistanceRoles.has(Merlin)) {
        spyRolesSample.addPossibility(Mordred);
    }

    if (!usedSpyRoles.has(Morgana) && usedResistanceRoles.has(Percival)) {
        spyRolesSample.addPossibility(Morgana);
    }

    if (!usedSpyRoles.has(Maelagant)) {
        spyRolesSample.addPossibility(Maelagant);
    }

    if (playerCount === 7) {
        if (!usedSpyRoles.has(Cerdic) && !usedSpyRoles.has(Accolon) && !usedSpyRoles.has(Cynric)) {
            const possibility = [];
            if (settings.accolon && !usedResistanceRoles.has(Ector)) {
                possibility.push(Accolon);
            }
            if (settings.cerdic) {
                possibility.push(Cerdic);
            }
            if (settings.cynric) {
                possibility.push(Cynric);
            }
            if (possibility.length > 0) {
                spyRolesSample.addPossibility(possibility);
                if (possibility.length > 1) {
                    spyRolesSample.addDisjunction(new Set(possibility));
                }
            }
        }
    } else if (playerCount > 7) {
        if (settings.cynric && !usedSpyRoles.has(Cynric) && usedResistanceRoles.has(Gaheris)) {
            spyRolesSample.addPossibility(Cynric);
        }

        if (!usedSpyRoles.has(Accolon) && !usedSpyRoles.has(Cerdic)) {
            const possibility = [];
            if (settings.accolon && !usedResistanceRoles.has(Ector)) {
                possibility.push(Accolon);
            }
            if (settings.cerdic) {
                possibility.push(Cerdic);
            }
            if (possibility.length > 0) {
                spyRolesSample.addPossibility(possibility);
                if (possibility.length > 1) {
                    spyRolesSample.addDisjunction(new Set(possibility));
                }
            }
        }

        if (!usedSpyRoles.has(Lucius) && spyRolesSample.size < spyCount - usedSpyRoles.size) {
            spyRolesSample.addPossibility(Lucius);
        }
    }

    return spyRolesSample;
}

module.exports = {
    generateRoles,
    Mordred,
    Morgana,
    Maelagant,
    Colgrevance,
    Lucius,
    Accolon,
    Cerdic,
    Cynric,
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
    Ector,
    Kay,
    SirRobin,
    Gaheris,
    Geraint,
    Lamorak,
    Bors
};