const Roles = require('../models/roles');
const ResistanceRoleSelections = require('./resistanceRoleSelections');
const ResistanceRolePossibilities = require('./resistanceRolePossibilities');
const { shuffle, sample } = require('./random');

function getSpyRoles(spyCount) {
    return sample([Roles.Mordred, Roles.Morgana, Roles.Maelagant, Roles.Colgrevance], spyCount);
}

function getResistanceRoles(resistanceCount, containsMorgana, settings) {
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
    
    do {
        const usedResistanceRoles = new ResistanceRoleSelections(resistanceCount, containsMorgana);
        const possibleResistanceRoles = new ResistanceRolePossibilities(shuffle(possibleResistanceRolesArray));

        do {
            const currentRole = possibleResistanceRoles.pop();
            if (usedResistanceRoles.add(currentRole)) {
                // eslint-disable-next-line default-case
                switch (currentRole) {
                    case Roles.Percival:
                        if (!containsMorgana) {
                            possibleResistanceRoles.remove(Roles.Merlin);
                        }
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
                        possibleResistanceRoles.remove(Roles.Puck);
                        break;
                    case Roles.Arthur:
                        possibleResistanceRoles.remove(Roles.Jester);
                        break;
                }
            }
        } while (!possibleResistanceRoles.isEmpty() && !usedResistanceRoles.isFull());

        resistanceRoles = usedResistanceRoles.getRoles();
        if (resistanceRoles === null) {
            console.log("Requirements not met")
        }
    } while (resistanceRoles === null);

    return shuffle(resistanceRoles);
}

module.exports.getRoles = (resistanceCount, spyCount, settings) => {
    const roles = [];
    const spyRoles = getSpyRoles(spyCount);
    console.log("Spy Roles: %j", spyRoles);
    Array.prototype.push.apply(roles, spyRoles);
    const resistanceRoles = getResistanceRoles(resistanceCount, spyRoles.includes(Roles.Morgana), settings);
    console.log("Resistance Roles: %j", resistanceRoles);
    Array.prototype.push.apply(roles, resistanceRoles);
    return shuffle(roles);
}