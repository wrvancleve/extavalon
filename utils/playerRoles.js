const Roles = require('../models/roles');
const ResistanceRoleSelections = require('./resistanceRoleSelections');
const SpyRoleSelections = require('./spyRoleSelections');
const RolePossibilities = require('./rolePossibilities');
const { shuffle } = require('./random');

function getSpyRoles(spyCount, playerCount, settings) {
    let spyRoles = null;
    const possibleSpyRolesArray = [
        Roles.Mordred, Roles.Morgana, Roles.Maelagant, Roles.Colgrevance
    ];
    if (settings.lucius) {
        possibleSpyRolesArray.push(Roles.Lucius);
    }
    if (settings.accolon && playerCount > 7) {
        possibleSpyRolesArray.push(Roles.Accolon);
    }

    do {
        const usedSpyRoles = new SpyRoleSelections(spyCount);
        const possibleSpyRoles = new RolePossibilities(shuffle(possibleSpyRolesArray));

        do {
            const currentRole = possibleSpyRoles.pop();
            if (usedSpyRoles.add(currentRole)) {
                // eslint-disable-next-line default-case
                switch (currentRole) {
                    case Roles.Lucius:
                        possibleSpyRoles.remove(Roles.Accolon);
                        break;
                    case Roles.Accolon:
                        possibleSpyRoles.remove(Roles.Lucius);
                        break;
                }
            }
        } while (!possibleSpyRoles.isEmpty() && !usedSpyRoles.isFull());

        spyRoles = usedSpyRoles.getRoles();
    } while (spyRoles === null);

    return shuffle(spyRoles);
}

function getResistanceRoles(resistanceCount, playerCount, containsMorgana, settings) {
    let resistanceRoles = null;
    const possibleResistanceRolesArray = [
        Roles.Merlin, Roles.Percival, Roles.Tristan, 
        Roles.Iseult, Roles.Arthur, Roles.Lancelot
    ];
    if (settings.guinevere) {
        possibleResistanceRolesArray.push(Roles.Guinevere);
    }
    if (settings.puck) {
        possibleResistanceRolesArray.push(Roles.Puck);
    }
    if (settings.jester) {
        possibleResistanceRolesArray.push(Roles.Jester);
    }
    if (settings.galahad) {
        possibleResistanceRolesArray.push(Roles.Galahad);
    }
    if (settings.titania && playerCount > 7) {
        possibleResistanceRolesArray.push(Roles.Titania);
    }
    
    do {
        const usedResistanceRoles = new ResistanceRoleSelections(resistanceCount, containsMorgana);
        const possibleResistanceRoles = new RolePossibilities(shuffle(possibleResistanceRolesArray));
        let leonPossible = settings.leon && playerCount > 7;

        do {
            const currentRole = possibleResistanceRoles.pop();
            if (usedResistanceRoles.add(currentRole)) {
                // eslint-disable-next-line default-case
                switch (currentRole) {
                    case Roles.Percival:
                        if (!containsMorgana) {
                            possibleResistanceRoles.remove(Roles.Merlin);
                        }
                        leonPossible = false;
                        break;
                    case Roles.Guinevere:
                        leonPossible = false;
                        break;
                    case Roles.Lancelot:
                        possibleResistanceRoles.remove(Roles.Puck);
                        break;
                    case Roles.Puck:
                        possibleResistanceRoles.remove(Roles.Lancelot);
                        possibleResistanceRoles.remove(Roles.Jester);
                        break;
                    case Roles.Jester:
                        possibleResistanceRoles.remove(Roles.Arthur);
                        possibleResistanceRoles.remove(Roles.Galahad);
                        possibleResistanceRoles.remove(Roles.Puck);
                        break;
                    case Roles.Galahad:
                        possibleResistanceRoles.remove(Roles.Arthur);
                        possibleResistanceRoles.remove(Roles.Jester);
                        possibleResistanceRoles.remove(Roles.Tristan);
                        possibleResistanceRoles.remove(Roles.Iseult);
                        break;
                    case Roles.Tristan:
                    case Roles.Iseult:
                        possibleResistanceRoles.remove(Roles.Galahad);
                        break;
                    case Roles.Leon:
                        possibleResistanceRoles.remove(Roles.Percival);
                        possibleResistanceRoles.remove(Roles.Guinevere);
                        break;
                    case Roles.Arthur:
                        possibleResistanceRoles.remove(Roles.Jester);
                        break;
                }
            }
        } while (!possibleResistanceRoles.isEmpty() && !usedResistanceRoles.isFull());

        resistanceRoles = usedResistanceRoles.getRoles(leonPossible);
    } while (resistanceRoles === null);

    return shuffle(resistanceRoles);
}

module.exports.getRoles = (resistanceCount, spyCount, settings) => {
    const roles = [];
    const playerCount = resistanceCount + spyCount;
    const spyRoles = getSpyRoles(spyCount, playerCount, settings);
    Array.prototype.push.apply(roles, spyRoles);
    const resistanceRoles = getResistanceRoles(resistanceCount, playerCount, spyRoles.includes(Roles.Morgana), settings);
    Array.prototype.push.apply(roles, resistanceRoles);
    return shuffle(roles);
}