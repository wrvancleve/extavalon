const Roles = require('../models/roles');
const { choice, shuffle } = require('./random');

function _getPossibleResistanceRoles(playerCount, settings) {
    const possibleResistanceRoles = [
        Roles.Lancelot, Roles.Uther
    ];
    if (settings.bedivere) {
        possibleResistanceRoles.push(Roles.Bedivere);
    }
    if (settings.jester) {
        possibleResistanceRoles.push(Roles.Jester);
    }
    if (settings.galahad) {
        possibleResistanceRoles.push(Roles.Galahad);
    }
    if (settings.lamorak) {
        possibleResistanceRoles.push(Roles.Lamorak);
    }
    if (settings.puck && playerCount > 6) {
        possibleResistanceRoles.push(Roles.Puck);
    }
    if (settings.leon && playerCount > 7) {
        possibleResistanceRoles.push(Roles.Leon);
    }
    if (settings.titania && playerCount > 7) {
        possibleResistanceRoles.push(Roles.Titania);
    }
    if (settings.gawain && playerCount > 7) {
        possibleResistanceRoles.push(Roles.Gawain);
    }
    return possibleResistanceRoles;
}

function _getPossibleSpyRoles(settings) {
    const possibleSpyRoles = [
        Roles.Mordred, Roles.Maelagant, Roles.Colgrevance
    ];
    if (settings.claudas) {
        possibleSpyRoles.push(Roles.Claudas);
    }
    return possibleSpyRoles;
}

function _getAssassinatableRole(playerCount, settings) {
    const possibleAssassinatableRoles = [
        Roles.Merlin, Roles.Tristan, Roles.Arthur
    ];
    if (settings.ector && playerCount > 7) {
        possibleAssassinatableRoles.push(Roles.Ector);
    }

    return choice(shuffle(possibleAssassinatableRoles));
}

function _addRole(role, usedRoles, possibleRoles) {
    usedRoles.push(role);
    for (let blacklistedRole of _getRoleBlacklist(role)) {
        _removePossibleRole(blacklistedRole, possibleRoles);
    }
}

function _getRoleBlacklist(role) {
    switch (role) {
        case Roles.Merlin:
            return [Roles.Galahad];
        case Roles.Percival:
            return [Roles.Leon, Roles.Guinevere, Roles.Bedivere];
        case Roles.Tristan:
            return [Roles.Uther, Roles.Galahad, Roles.Leon];
        case Roles.Uther:
            return [Roles.Galahad, Roles.Leon];
        case Roles.Galahad:
            return [Roles.Uther, Roles.Leon];
        case Roles.Leon:
            return [Roles.Percival, Roles.Uther, Roles.Galahad, Roles.Guinevere];
        case Roles.Lancelot:
            return [Roles.Puck];
        case Roles.Guinevere:
            return [Roles.Percival, Roles.Leon, Roles.Bedivere];
        case Roles.Bedivere:
            return [Roles.Percival, Roles.Guinevere];
        case Roles.Puck:
            return [Roles.Lancelot];
        case Roles.Ector:
            return [Roles.Percival, Roles.Uther, Roles.Galahad, Roles.Leon, Roles.Guinevere];
        case Roles.Lucius:
            return [Roles.Agravain];
        case Roles.Agravain:
            return [Roles.Lucius];
        default:
            return [];
    }
}

function _removePossibleRole(role, possibleRoles) {
    const roleIndex = possibleRoles.indexOf(role);
    if (roleIndex !== -1) {
        possibleRoles.splice(roleIndex, 1);
    }
}

function _addPossibleRole(role, usedRoles, possibleRoles) {
    const usedIndex = usedRoles.indexOf(role);
    if (usedIndex !== -1) {
        return false;
    }

    const possibleIndex = possibleRoles.indexOf(role);
    if (possibleIndex !== -1 && !usedRoles.some(r => _getRoleBlacklist(role).includes(r))) {
        possibleRoles.push(role);
        return true;
    }
    return false;
}

module.exports.getRoles = (resistanceCount, spyCount, settings) => {
    const roles = [];
    const playerCount = resistanceCount + spyCount;
    const usedResistanceRoles = [];
    let possibleResistanceRoles = _getPossibleResistanceRoles(playerCount, settings);
    const usedSpyRoles = [];
    let possibleSpyRoles = _getPossibleSpyRoles(settings);

    const assassinatableRole = _getAssassinatableRole(playerCount, settings);
    _addRole(assassinatableRole, usedResistanceRoles, possibleResistanceRoles);
    if (assassinatableRole !== Roles.Ector) {
        if (settings.lucius) {
            possibleSpyRoles.push(Roles.Lucius);
        }
        if (settings.agravain && playerCount > 7) {
            possibleSpyRoles.push(Roles.Agravain);
        }
        if (settings.accolon && playerCount > 7) {
            possibleSpyRoles.push(Roles.Accolon);
        }

        switch (assassinatableRole) {
            case Roles.Tristan:
                _addRole(Roles.Iseult, usedResistanceRoles, possibleResistanceRoles);
                break;
            case Roles.Merlin:
                _addPossibleRole(Roles.Percival, usedResistanceRoles, possibleResistanceRoles);
                break;
        }
    }

    possibleResistanceRoles = shuffle(possibleResistanceRoles);
    possibleSpyRoles = shuffle(possibleSpyRoles);
    do {
        const resistanceRole = possibleResistanceRoles.pop();
        _addRole(resistanceRole, usedResistanceRoles, possibleResistanceRoles);
        switch (resistanceRole) {
            case Roles.Lancelot:
                if (_addPossibleRole(Roles.Guinevere, usedResistanceRoles, possibleResistanceRoles)) {
                    possibleResistanceRoles = shuffle(possibleResistanceRoles);
                }
                break;
        }

        if (usedSpyRoles.length < spyCount) {
            const spyRole = possibleSpyRoles.pop();
            _addRole(spyRole, usedSpyRoles, possibleSpyRoles);
            switch (spyRole) {
                case Roles.Morgana:
                    if (_addPossibleRole(Roles.Percival, usedResistanceRoles, possibleResistanceRoles)) {
                        possibleResistanceRoles = shuffle(possibleResistanceRoles);
                    }
                    break;
                case Roles.Maelagant:
                    if (_addPossibleRole(Roles.Guinevere, usedResistanceRoles, possibleResistanceRoles)) {
                        possibleResistanceRoles = shuffle(possibleResistanceRoles);
                    }
                    break;
            }
        }
    } while (usedResistanceRoles.length < resistanceCount);

    Array.prototype.push.apply(roles, usedSpyRoles);
    Array.prototype.push.apply(roles, usedResistanceRoles);
    return shuffle(roles);
}