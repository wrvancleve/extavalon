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

function generateRoles(resistanceCount, spyCount, settings) {
    generatedRoles = [];
    playerCount = resistanceCount + spyCount;
    let assassinatableRole = null;
    let usedResistanceRoles = [];
    let possibleResistanceRoles = [];
    let usedSpyRoles = [];
    let possibleSpyRoles = [];

    function getAssassinatableRole() {
        const possibleAssassinatableRoles = [
            Merlin, Tristan, Arthur
        ];
        if (settings.ector && playerCount > 7) {
            possibleAssassinatableRoles.push(Ector);
        }
    
        return choice(shuffle(possibleAssassinatableRoles));
    }

    function getPossibleResistanceRoles(assassinatableRole) {
        const possibleResistanceRoles = [
            Lancelot
        ];
        if (settings.bedivere) {
            possibleResistanceRoles.push(Bedivere);
        }
        if (settings.gareth) {
            possibleResistanceRoles.push(Gareth);
        }
        if (settings.jester) {
            possibleResistanceRoles.push(Jester);
        }
        if (settings.lamorak) {
            possibleResistanceRoles.push(Lamorak);
        }
        if (settings.puck && playerCount > 6) {
            possibleResistanceRoles.push(Puck);
        }
        if (settings.bors && playerCount > 7) {
            possibleResistanceRoles.push(Bors);
        }
        if (settings.gawain && playerCount > 7) {
            possibleResistanceRoles.push(Gawain);
        }
        if (settings.titania && playerCount > 7) {
            possibleResistanceRoles.push(Titania);
        }
        
        if (assassinatableRole !== Ector) {
            possibleResistanceRoles.push(Percival);
            if (settings.guinevere) {
                possibleResistanceRoles.push(Guinevere);
            }

            if (settings.galahad && assassinatableRole === Arthur) {
                possibleResistanceRoles.push(Galahad);
            }

            if (assassinatableRole !== Tristan) {
                possibleResistanceRoles.push(Uther);
                if (settings.leon && playerCount > 7) {
                    possibleResistanceRoles.push(Leon);
                }
            }
        }

        if (assassinatableRole !== Merlin) {
            if (settings.kay && playerCount > 8) {
                possibleResistanceRoles.push(Kay);
            }
        }

        if (assassinatableRole !== Arthur) {
            if (settings.gaheris) {
                possibleResistanceRoles.push(Gaheris);
            }
        }

        return shuffle(possibleResistanceRoles);
    }
    
    function getPossibleSpyRoles(assassinatableRole) {
        const possibleSpyRoles = [
            Mordred, Maelagant, Colgrevance
        ];
        if (settings.claudas) {
            possibleSpyRoles.push(Claudas);
        }

        if (assassinatableRole !== Ector) {
            possibleSpyRoles.push(Morgana);
            if (settings.lucius && playerCount > 7) {
                possibleSpyRoles.push(Lucius);
            }
            if (settings.accolon && playerCount > 7) {
                possibleSpyRoles.push(Accolon);
            }
        }

        return shuffle(possibleSpyRoles);
    }

    function addResistanceRole(role) {
        console.log(`Attempting to add ${role.name}...`);
        switch (role) {
            case Percival:
                const containsMerlin = usedResistanceRoles.includes(Merlin);
                const containsMorgana = usedSpyRoles.includes(Morgana);
                if (!containsMerlin && !containsMorgana) {
                    if (usedSpyRoles.length + 1 < spyCount && possibleSpyRoles.includes(Morgana)) {
                        addRole(Morgana, usedSpyRoles);
                        removePossibleRole(Morgana, possibleSpyRoles);
                    } else {
                        return false;
                    }
                }
                break;
            case Guinevere:
                const containsLancelot = usedResistanceRoles.includes(Lancelot);
                const containsMaelagant = usedSpyRoles.includes(Maelagant);
                if (!containsLancelot && !containsMaelagant) {
                    const maelagantPossible = usedSpyRoles.length + 1 <= spyCount;
                    const lancelotPossible = (usedResistanceRoles.length + 1) <= resistanceCount
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
        let contains
        switch(role) {
            case Percival:
                let containsMerlin = usedResistanceRoles.includes(Merlin);
                let containsMorgana = usedSpyRoles.includes(Morgana);
                if (containsMerlin) {
                    removePossibleRole(Gaheris, possibleResistanceRoles);
                }
                if (containsMorgana) {
                    removePossibleRole(Bedivere, possibleResistanceRoles);
                    removePossibleRole(Gareth, possibleResistanceRoles);
                    removePossibleRole(Kay, possibleResistanceRoles);
                }
                if (containsMerlin && containsMorgana) {
                    removePossibleRole(Guinevere, possibleResistanceRoles);
                }
                removePossibleRole(Leon, possibleResistanceRoles);
                break;
            case Guinevere:
                let containsLancelot = usedResistanceRoles.includes(Lancelot);
                let containsMaelagant = usedSpyRoles.includes(Maelagant);
                if (containsLancelot) {
                    removePossibleRole(Gaheris, possibleResistanceRoles);
                }
                if (containsMaelagant) {
                    removePossibleRole(Bedivere, possibleResistanceRoles);
                    removePossibleRole(Gareth, possibleResistanceRoles);
                    removePossibleRole(Kay, possibleResistanceRoles);
                }
                if (containsLancelot && containsMaelagant) {
                    removePossibleRole(Percival, possibleResistanceRoles);
                    removePossibleRole(Morgana, possibleSpyRoles);
                }
                removePossibleRole(Leon, possibleResistanceRoles);
                break;
            case Leon:
                removePossibleRole(Percival, possibleResistanceRoles);
                removePossibleRole(Kay, possibleResistanceRoles);
                removePossibleRole(Guinevere, possibleResistanceRoles);
                removePossibleRole(Morgana, possibleSpyRoles);
            case Uther:
            case Galahad:
                removePossibleRole(Uther, possibleResistanceRoles);
                removePossibleRole(Galahad, possibleResistanceRoles);
                removePossibleRole(Leon, possibleResistanceRoles);
                break;
            case Lancelot:
            case Puck:
                removePossibleRole(Lancelot, possibleResistanceRoles);
                removePossibleRole(Puck, possibleResistanceRoles);
                break;
            case Bedivere:
            case Gareth:
                removePossibleRole(Bedivere, possibleResistanceRoles);
                removePossibleRole(Gareth, possibleResistanceRoles);
                removePossibleRole(Morgana, possibleSpyRoles);
                if (!usedResistanceRoles.includes(Merlin)) {
                    removePossibleRole(Percival, possibleResistanceRoles);
                }
                if (usedSpyRoles.includes(Maelagant)) {
                    removePossibleRole(Guinevere, possibleResistanceRoles);
                }
                break;
            case Gaheris:
                if (usedResistanceRoles.includes(Merlin)) {
                    removePossibleRole(Percival, possibleResistanceRoles);
                }
                if (usedResistanceRoles.includes(Lancelot)) {
                    removePossibleRole(Guinevere, possibleResistanceRoles);
                }
                break;
            case Maelagant:
                if (usedResistanceRoles.includes(Bedivere)) {
                    removePossibleRole(Guinevere, possibleResistanceRoles);
                }
                break;
            case Morgana:
                removePossibleRole(Bedivere, possibleResistanceRoles);
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

    assassinatableRole = getAssassinatableRole();
    possibleResistanceRoles = getPossibleResistanceRoles(assassinatableRole);
    possibleSpyRoles = getPossibleSpyRoles(assassinatableRole);
    
    addResistanceRole(assassinatableRole);
    if (assassinatableRole === Tristan) {
        addResistanceRole(Iseult);
    }

    do {
        possibleResistanceRoles = shuffle(possibleResistanceRoles);
        addResistanceRole(possibleResistanceRoles.pop());
        if (usedSpyRoles.length < spyCount) {
            possibleSpyRoles = shuffle(possibleSpyRoles);
            addSpyRole(possibleSpyRoles.pop());
        }
    } while (usedResistanceRoles.length < resistanceCount);

    while (usedSpyRoles.length < spyCount) {
        possibleSpyRoles = shuffle(possibleSpyRoles);
        addSpyRole(possibleSpyRoles.pop());
    }

    Array.prototype.push.apply(generatedRoles, usedSpyRoles);
    console.log("\nSpy Roles: %j", usedSpyRoles);
    Array.prototype.push.apply(generatedRoles, usedResistanceRoles);
    console.log("Resistance Roles: %j\n", usedResistanceRoles);
    return shuffle(generatedRoles);
}

module.exports = {
    generateRoles,
    Mordred,
    Morgana,
    Maelagant,
    Colgrevance,
    Lucius,
    Accolon,
    Claudas,
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
    Leon,
    Titania,
    Kay,
    Gareth,
    Gaheris,
    Ector,
    Bedivere,
    Lamorak,
    Bors,
    Gawain
};