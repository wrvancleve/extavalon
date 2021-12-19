const { choice, shuffle, nextBoolean } = require('../utils/random');
const RandomSample = require('../utils/randomSample');
const RandomAlternative = require('../utils/randomAlternative');

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

function generateRoles(resistanceCount, spyCount, settings, identityPickInformation) {
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
                    if (playerCount < 7 || nextBoolean()) {
                        requiredResistanceRoles.add(Percival);
                    } else {
                        requiredResistanceRoles.add(Gaheris);
                    }
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
	
    for (let assassinatableRole of getResistanceAssassinatableRoles(playerCount, requiredSpyRoles, usedResistanceRoles).values()) {
        usedResistanceRoles.add(assassinatableRole);
    }

    for (let nonAssassinatableRole of getResistanceNonAssassinatableRoles(playerCount, resistanceCount, usedResistanceRoles, settings).values()) {
        usedResistanceRoles.add(nonAssassinatableRole);
    }
	
	return usedResistanceRoles;
}

function getResistanceAssassinatableRoles(playerCount, requiredSpyRoles, usedResistanceRoles) {
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
			if (playerCount > 7 && !utherAlreadyPresent && !galahadAlreadyPresent && !usedResistanceRoles.has(Percival) && !usedResistanceRoles.has(Guinevere)
                && !usedResistanceRoles.has(Kay) && !usedResistanceRoles.has(SirRobin) && !requiredSpyRoles.has(Accolon)) {
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

function getResistanceNonAssassinatableRoles(playerCount, resistanceCount, usedResistanceRoles, settings) {
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
}

function getResistanceSightPossibilities(playerCount, resistanceCount, usedResistanceRoles, settings) {
	const sightPossibilities = [];
	
	if (!usedResistanceRoles.has(Iseult) && !usedResistanceRoles.has(Ector)) {
		if (usedResistanceRoles.has(Arthur)) {
			sightPossibilities.push(new RandomAlternative([Uther, Galahad]));
		} else {
			sightPossibilities.push(Uther);
		}
	}

	const percivalAlreadyPresent = usedResistanceRoles.has(Percival);
	const guinevereAlreadyPresent = usedResistanceRoles.has(Guinevere);
	if (!percivalAlreadyPresent && !guinevereAlreadyPresent) {
		percivalIsPossible = !usedResistanceRoles.has(Ector);
		guinevereIsPossible = playerCount > 6 && percivalIsPossible;
        if (percivalIsPossible && guinevereIsPossible) {
			sightPossibilities.push(new RandomAlternative([Percival, Guinevere]));
		} else if (percivalIsPossible) {
			sightPossibilities.push(Percival);
		} else if (guinevereIsPossible) {
			sightPossibilities.push(Guinevere);
		}
	}
    
    if (settings.bedivere && playerCount >= 10 && !usedResistanceRoles.has(Bedivere)) {
        sightPossibilities.push(Bedivere);
    }
	
	return sightPossibilities;
}

function getResistanceNonSightPossibilities(playerCount, resistanceCount, usedResistanceRoles, settings) {
	const nonSightPossibilities = [];

	if (playerCount < 7) {
		if (!usedResistanceRoles.has(Lancelot)) {
			nonSightPossibilities.push(Lancelot);
		}
		if (!usedResistanceRoles.has(Jester)) {
			nonSightPossibilities.push(Jester);
		}
	} else if (playerCount === 7) {
		const puckAlreadyPresent = usedResistanceRoles.has(Puck);
		const gaherisAlreadyPresent = usedResistanceRoles.has(Gaheris);
		const geraintAlreadyPresent = usedResistanceRoles.has(Geraint);
        const lancelotAlreadyPresent = usedResistanceRoles.has(Lancelot);
		
		if (!puckAlreadyPresent && !gaherisAlreadyPresent && !geraintAlreadyPresent && !lancelotAlreadyPresent) {
            nonSightPossibilities.push(new RandomAlternative([new RandomAlternative([Lancelot, Puck]), Gaheris, Geraint]));
		}

        if (!usedResistanceRoles.has(Jester)) {
            nonSightPossibilities.push(Jester);
        }
	} else {
		if (!usedResistanceRoles.has(Lancelot) && !usedResistanceRoles.has(Puck)) {
			nonSightPossibilities.push(new RandomAlternative([Lancelot, Puck]));
		}
        if (!usedResistanceRoles.has(Jester)) {
            nonSightPossibilities.push(Jester);
        }
		if (!usedResistanceRoles.has(Gaheris)) {
			nonSightPossibilities.push(Gaheris);
		}
		if (!usedResistanceRoles.has(Geraint)) {
			nonSightPossibilities.push(Geraint);
		}
        if (!usedResistanceRoles.has(Ector)) {
            const kayAlreadyPresent = usedResistanceRoles.has(Kay);
            if (playerCount > 8) {
                if (!kayAlreadyPresent && !usedResistanceRoles.has(SirRobin)) {
                    nonSightPossibilities.push(new RandomAlternative([Kay, SirRobin]));
                }
            } else if (!kayAlreadyPresent) {
                nonSightPossibilities.push(Kay);
            }
        }
        if (settings.titania && playerCount >= 10 && !usedResistanceRoles.has(Titania)) {
            nonSightPossibilities.push(Titania);
        }
	}
	
	return nonSightPossibilities;
}

function getAdditionalRequiredSpyRoles(requiredSpyRoles, usedResistanceRoles, settings) {
    const merlinPresent = usedResistanceRoles.has(Merlin);

    if (!requiredSpyRoles.has(Morgana) && usedResistanceRoles.has(Percival) && !merlinPresent) {
        requiredSpyRoles.add(Morgana);
    }

    if (settings.mordred && merlinPresent) {
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
        const spyPossibilities = getSpyPossibilities(playerCount, spyCount, usedSpyRoles, usedResistanceRoles, settings);
        const spyRolesSample = new RandomSample(spyPossibilities, spyCount - usedSpyRoles.size);

        while(usedSpyRoles.size < spyCount && spyRolesSample.hasNextValue()) {
            usedSpyRoles.add(spyRolesSample.getNextValue());
        }

        if (usedSpyRoles.size < spyCount) {
            usedSpyRoles.add(Lucius);
        }
    }

    return usedSpyRoles;
}

function getSpyPossibilities(playerCount, spyCount, usedSpyRoles, usedResistanceRoles, settings) {
    const possibilities = [];

    if (!usedSpyRoles.has(Colgrevance)) {
        possibilities.push(Colgrevance);
    }

    if (!usedSpyRoles.has(Mordred) && usedResistanceRoles.has(Merlin)) {
        possibilities.push(Mordred);
    }

    const resistanceContainsPercival = usedResistanceRoles.has(Percival);
    const resistanceContainsGaheris = playerCount > 6 && usedResistanceRoles.has(Gaheris);

    if (!usedSpyRoles.has(Morgana) && (resistanceContainsPercival || resistanceContainsGaheris)) {
        possibilities.push(Morgana);
    }

    if (!usedSpyRoles.has(Maelagant)) {
        possibilities.push(Maelagant);
    }

    if (playerCount === 7) {
        if (!usedSpyRoles.has(Cerdic) && !usedSpyRoles.has(Accolon) && !usedSpyRoles.has(Cynric)) {
            if (settings.accolon) {
                const sabotageAlternative = new RandomAlternative([Accolon, Cerdic]);
                possibilities.push(new RandomAlternative([Cynric, sabotageAlternative]));
            } else {
                possibilities.push(Cerdic);
            }
            
        }
    } else if (playerCount > 7) {
        if (!usedSpyRoles.has(Cynric) && resistanceContainsGaheris) {
            possibilities.push(Cynric);
        }

        if (!usedSpyRoles.has(Cerdic)) {
            if (!usedResistanceRoles.has(Ector)) {
                if (!usedSpyRoles.has(Accolon)) {
                    if (settings.accolon) {
                        possibilities.push(new RandomAlternative([Accolon, Cerdic]));
                    } else {
                        possibilities.push(Cerdic);
                    }
                }
            } else {
                possibilities.push(Cerdic);
            }
        }
    }

    return possibilities;
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
    Geraint
};