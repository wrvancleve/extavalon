const { choice, shuffle, nextBoolean } = require('../utils/random');
const Role = require('./role');
const RandomSample = require('../utils/randomSample');
const RandomAlternative = require('../utils/randomAlternative');

const Mordred = new Role("Mordred", "Spies");
const Morgana = new Role("Morgana", "Spies");
const Maelagant = new Role("Maelagant", "Spies");
const Colgrevance = new Role("Colgrevance", "Spies");
const Accolon = new Role("Accolon", "Spies");
const Cerdic = new Role("Cerdic", "Spies");
const Cynric = new Role("Cynric", "Spies");
const Lucius = new Role("Lucius", "Spies", 8, 12);

const Merlin = new Role("Merlin", "Resistance");
const Arthur = new Role("Arthur", "Resistance");
const Percival = new Role("Percival", "Resistance");
const Uther = new Role("Uther", "Resistance");
const Tristan = new Role("Tristan", "Resistance");
const Iseult = new Role("Iseult", "Resistance");
const Lancelot = new Role("Lancelot", "Resistance");
const Guinevere = new Role("Guinevere", "Resistance", 7, 12);
const Puck = new Role("Puck", "Resistance", 7, 12);
const Jester = new Role("Jester", "Resistance");
const Galahad = new Role("Galahad", "Resistance");
const Titania = new Role("Titania", "Resistance", 8, 12);
const Bedivere = new Role("Bedivere", "Resistance", 8, 12);
const Ector = new Role("Ector", "Resistance", 8, 12);
const Kay = new Role("Kay", "Resistance", 8, 12);
const Gaheris = new Role("Gaheris", "Resistance", 7, 12);
const Geraint = new Role("Geraint", "Resistance", 7, 12);
const SirRobin = new Role("Sir Robin", "Resistance", 8, 12);

function generateRoles(resistanceCount, spyCount, settings, identityPickInformation) {
    const playerCount = resistanceCount + spyCount;

    const pickedRoles = [];
    for (let identityPick of identityPickInformation) {
        if (identityPick.type === "Role") {
            pickedRoles.push(identityPick.value);
        }
    }

    const initialRequiredResistanceRoles = [];
    const initialRequiredSpyRoles = [];
    getRequiredRoles(pickedRoles, initialRequiredResistanceRoles, initialRequiredSpyRoles, playerCount);

    let resistanceRoles = [];
    let spyRoles = [];
    do {
        const requiredSpyRoles = Array.from(initialRequiredSpyRoles);
        resistanceRoles = getResistanceRoles(initialRequiredResistanceRoles, resistanceCount, playerCount);
        getNewRequiredSpyRoles(requiredSpyRoles, resistanceRoles);
        spyRoles = getSpyRoles(requiredSpyRoles, resistanceRoles, playerCount, spyCount);
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

function getRequiredRoles(pickedRoles, requiredResistanceRoles, requiredSpyRoles, playerCount) {
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
                if (playerCount < 7 || nextBoolean()) {
                    requiredResistanceRoles.push(Percival);
                } else {
                    requiredResistanceRoles.push(Gaheris);
                }
                break;
            case "Cynric":
                requiredSpyRoles.push(Cynric);
                requiredResistanceRoles.push(Gaheris);
                break;
            case "Geraint":
                requiredResistanceRoles.push(Geraint);
                requiredSpyRoles.push(Cerdic);
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

function getResistanceRoles(requiredResistanceRoles, resistanceCount, playerCount) {
	const usedResistanceRoles = [];
	
	for (let requiredResistanceRole of requiredResistanceRoles) {
		switch (requiredResistanceRole) {
			case Tristan:
			case Iseult:
				usedResistanceRoles.push(Tristan);
				usedResistanceRoles.push(Iseult);
				break;
			case Galahad:
				usedResistanceRoles.push(Galahad);
				usedResistanceRoles.push(Arthur);
				break;
			default:
				usedResistanceRoles.push(requiredResistanceRole);
				break;
		}
	}
	
    for (let assassinatableRole of getResistanceAssassinatableRoles(playerCount, resistanceCount, usedResistanceRoles)) {
        usedResistanceRoles.push(assassinatableRole);
    }

    for (let nonAssassinatableRole of getResistanceNonAssassinatableRoles(playerCount, resistanceCount, usedResistanceRoles)) {
        usedResistanceRoles.push(nonAssassinatableRole);
    }
	
	return usedResistanceRoles;
}

function getResistanceAssassinatableRoles(playerCount, resistanceCount, usedResistanceRoles) {
	const assassinatableRoles = [];
	let assassinatableRolesPresent = 0;
	
	let merlinAlreadyPresent = usedResistanceRoles.includes(Merlin);
	if (merlinAlreadyPresent) {
		assassinatableRolesPresent += 1;
	}
	let arthurAlreadyPresent = usedResistanceRoles.includes(Arthur);
	if (arthurAlreadyPresent) {
		assassinatableRolesPresent += 1;
	}
	let loversAlreadyPresent = usedResistanceRoles.includes(Tristan);
	if (loversAlreadyPresent) {
		assassinatableRolesPresent += 1;
	}
	let ectorAlreadyPresent = usedResistanceRoles.includes(Ector);
	if (ectorAlreadyPresent) {
		assassinatableRolesPresent += 1;
	}
	
	const requiredAssassinatableRolesPresent = playerCount > 8 ? 2 : 1;
	while (assassinatableRolesPresent < requiredAssassinatableRolesPresent) {
		if (ectorAlreadyPresent || loversAlreadyPresent || merlinAlreadyPresent) {
			assassinatableRoles.push(Arthur);
			arthurAlreadyPresent = true;
		} else {
			const possibleAssassinatableRoles = [Merlin, Tristan];
			if (!arthurAlreadyPresent) {
				possibleAssassinatableRoles.push(Arthur);
			}
			if (Ector.getIsPossible(playerCount)) {
				possibleAssassinatableRoles.push(Ector);
			}
			
			const nextAssassinatableRole = choice(possibleAssassinatableRoles);
			switch (nextAssassinatableRole) {
				case Merlin:
					merlinAlreadyPresent = true;
					break;
				case Tristan:
					loversAlreadyPresent = true;
					assassinatableRoles.push(Iseult);
					break;
				case Arthur:
					arthurAlreadyPresent = true;
					break;
				case Ector:
					ectorAlreadyPresent = true;
					break;
			}
			assassinatableRoles.push(nextAssassinatableRole);
		}
		
		assassinatableRolesPresent += 1;
	}
	
	return assassinatableRoles;
}

function getResistanceNonAssassinatableRoles(playerCount, resistanceCount, usedResistanceRoles) {
	const nonAssassinatableRolesNeeded = resistanceCount - usedResistanceRoles.length;
	const nonAssassinatablePossibilities = [];

	const sightPossibilities = getResistanceSightPossibilities(playerCount, resistanceCount, usedResistanceRoles);
	if (sightPossibilities.length > 0) {
		nonAssassinatablePossibilities.push(new RandomSample(sightPossibilities, Math.min(sightPossibilities.length, nonAssassinatableRolesNeeded)));
	}

	const nonSightPossibilities = getResistanceNonSightPossibilities(playerCount, resistanceCount, usedResistanceRoles);
	if (nonSightPossibilities.length > 0) {
		nonAssassinatablePossibilities.push(new RandomSample(nonSightPossibilities, Math.min(nonSightPossibilities.length, nonAssassinatableRolesNeeded)));
	}

	const nonAssassinatableSample = new RandomSample(nonAssassinatablePossibilities, nonAssassinatableRolesNeeded);

	for (let i = 0; i < nonAssassinatableRolesNeeded; i++) {
		usedResistanceRoles.push(nonAssassinatableSample.getNextValue())
	}
}

function getResistanceSightPossibilities(playerCount, resistanceCount, usedResistanceRoles) {
	const sightPossibilities = [];
	
	if (!usedResistanceRoles.includes(Iseult) && !usedResistanceRoles.includes(Ector)) {
		if (usedResistanceRoles.includes(Arthur)) {
			sightPossibilities.push(new RandomAlternative([Uther, Galahad]));
		} else {
			sightPossibilities.push(Uther);
		}
	}

	const percivalAlreadyPresent = usedResistanceRoles.includes(Percival);
	const guinevereAlreadyPresent = usedResistanceRoles.includes(Guinevere);
	if (!percivalAlreadyPresent && !guinevereAlreadyPresent) {
		percivalIsPossible = !usedResistanceRoles.includes(Ector);
		guinevereIsPossible = Guinevere.getIsPossible(playerCount);
		if (percivalIsPossible && !guinevereIsPossible) {
			sightPossibilities.push(Percival);
		} else if (!percivalIsPossible && guinevereIsPossible) {
			sightPossibilities.push(Guinevere);
		} else {
			sightPossibilities.push(new RandomAlternative([Percival, Guinevere]));
		}
	}
	
	return sightPossibilities;
}

function getResistanceNonSightPossibilities(playerCount, resistanceCount, usedResistanceRoles) {
	const nonSightPossibilities = [];

	if (playerCount < 7) {
		if (!usedResistanceRoles.includes(Lancelot)) {
			nonSightPossibilities.push(Lancelot);
		}
		if (!usedResistanceRoles.includes(Jester)) {
			nonSightPossibilities.push(Jester);
		}
	} else if (playerCount === 7) {
		const puckAlreadyPresent = usedResistanceRoles.includes(Puck);
		const gaherisAlreadyPresent = usedResistanceRoles.includes(Gaheris);
		const geraintAlreadyPresent = usedResistanceRoles.includes(Geraint);
		
		if (!puckAlreadyPresent && !gaherisAlreadyPresent && !geraintAlreadyPresent) {
			const lancelotAlreadyPresent = usedResistanceRoles.includes(Lancelot);
			const jesterAlreadyPresent = usedResistanceRoles.includes(Jester);
			
			if (lancelotAlreadyPresent && !jesterAlreadyPresent) {
				nonSightPossibilities.push(Jester);
			} else if (!lancelotAlreadyPresent && jesterAlreadyPresent) {
				nonSightPossibilities.push(Lancelot);
			} else {
				// Create Lancelot/Puck/Jester Sequence
                nonSightPossibilities.push(new RandomAlternative([Puck, [Lancelot, Jester], [Jester, Lancelot]]));
				nonSightPossibilities.push(Gaheris);
				nonSightPossibilities.push(Geraint);
			}
		}
	} else {
		if (!usedResistanceRoles.includes(Puck)) {
			const lancelotAlreadyPresent = usedResistanceRoles.includes(Lancelot);
			const jesterAlreadyPresent = usedResistanceRoles.includes(Jester);
			
			if (lancelotAlreadyPresent && !jesterAlreadyPresent) {
				nonSightPossibilities.push(Jester);
			} else if (!lancelotAlreadyPresent && jesterAlreadyPresent) {
				nonSightPossibilities.push(Lancelot);
			} else {
				// Create Lancelot/Puck/Jester Sequence
                nonSightPossibilities.push(new RandomAlternative([Puck, [Lancelot, Jester], [Jester, Lancelot]]));
			}
		}

		if (!usedResistanceRoles.includes(Gaheris)) {
			nonSightPossibilities.push(Gaheris);
		}
		if (!usedResistanceRoles.includes(Geraint)) {
			nonSightPossibilities.push(Geraint);
		}
		if (!usedResistanceRoles.includes(Kay) && !usedResistanceRoles.includes(Ector)) {
			nonSightPossibilities.push(Kay);
		}
	}
	
	return nonSightPossibilities;
}

function getNewRequiredSpyRoles(requiredSpyRoles, usedResistanceRoles) {
    if (!requiredSpyRoles.includes(Morgana) && usedResistanceRoles.includes(Percival) && !usedResistanceRoles.includes(Merlin)) {
        requiredSpyRoles.push(Morgana);
    }

    if (!requiredSpyRoles.includes(Maelagant) && usedResistanceRoles.includes(Guinevere) && !usedResistanceRoles.includes(Lancelot)) {
        requiredSpyRoles.push(Morgana);
    }

    if (!requiredSpyRoles.includes(Cerdic) && usedResistanceRoles.includes(Geraint)) {
        requiredSpyRoles.push(Cerdic);
    }
}

function getSpyRoles(requiredSpyRoles, usedResistanceRoles, playerCount, spyCount) {
    const usedSpyRoles = [];
    for (let requiredSpyRole of requiredSpyRoles) {
        usedSpyRoles.push(requiredSpyRole);
    }

    if (usedSpyRoles.length < spyCount) {
        const spyPossibilities = getSpyPossibilities(playerCount, spyCount, usedSpyRoles, usedResistanceRoles);
        const spyRolesSample = new RandomSample(spyPossibilities, spyCount - usedSpyRoles.length);

        while(usedSpyRoles.length < spyCount && spyRolesSample.hasNextValue()) {
            usedSpyRoles.push(spyRolesSample.getNextValue());
        }

        if (usedSpyRoles.length < spyCount) {
            usedSpyRoles.push(Lucius);
        }
    }

    return usedSpyRoles;
}

function getSpyPossibilities(playerCount, spyCount, usedSpyRoles, usedResistanceRoles) {
    const possibilities = [];

    if (!usedSpyRoles.includes(Colgrevance)) {
        possibilities.push(Colgrevance);
    }

    if (!usedSpyRoles.includes(Mordred) && usedResistanceRoles.includes(Merlin)) {
        possibilities.push(Mordred);
    }

    const resistanceContainsPercival = usedResistanceRoles.includes(Percival);
    const resistanceContainsGaheris = Gaheris.getIsPossible(playerCount) && usedResistanceRoles.includes(Gaheris);

    if (!usedSpyRoles.includes(Morgana) && (resistanceContainsPercival || resistanceContainsGaheris)) {
        possibilities.push(Morgana);
    }

    if (!usedSpyRoles.includes(Maelagant)) {
        possibilities.push(Maelagant);
    }

    if (playerCount === 7) {
        if (!usedSpyRoles.includes(Cerdic) && !usedSpyRoles.includes(Accolon) && !usedSpyRoles.includes(Cynric)) {
            const sabotageAlternative = new RandomAlternative([Accolon, Cerdic]);
            possibilities.push(new RandomAlternative([Cynric, sabotageAlternative]));
        }
    } else if (playerCount > 7) {
        if (!usedSpyRoles.includes(Cynric)) {
            possibilities.push(Cynric);
        }

        if (!usedSpyRoles.includes(Cerdic) && !usedSpyRoles.includes(Accolon)) {
            possibilities.push(new RandomAlternative([Accolon, Cerdic]));
        }
    }

    return possibilities;
}

module.exports = {
    generateRoles,
    Mordred: Mordred.getIdentity(),
    Morgana: Morgana.getIdentity(),
    Maelagant: Maelagant.getIdentity(),
    Colgrevance: Colgrevance.getIdentity(),
    Lucius: Lucius.getIdentity(),
    Accolon: Accolon.getIdentity(),
    Cerdic: Cerdic.getIdentity(),
    Cynric: Cynric.getIdentity(),
    Merlin: Merlin.getIdentity(),
    Percival: Percival.getIdentity(),
    Uther: Uther.getIdentity(),
    Tristan: Tristan.getIdentity(),
    Iseult: Iseult.getIdentity(),
    Arthur: Arthur.getIdentity(),
    Lancelot: Lancelot.getIdentity(),
    Guinevere: Guinevere.getIdentity(),
    Puck: Puck.getIdentity(),
    Jester: Jester.getIdentity(),
    Galahad: Galahad.getIdentity(),
    Titania: Titania.getIdentity(),
    Bedivere: Bedivere.getIdentity(),
    Ector: Ector.getIdentity(),
    Kay: Kay.getIdentity(),
    SirRobin: SirRobin.getIdentity(),
    Gaheris: Gaheris.getIdentity(),
    Geraint: Geraint.getIdentity()
};