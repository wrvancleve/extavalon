const Affect = require('./affect');
const Roles = require('./roles');

const ResistanceBindAffect = new Affect("Bind", "Resistance");
const ResistanceProtectAffect = new Affect("Protect", "Resistance");
const SpyBindAffect = new Affect("Bind", "Spy");
const SpyProtectAffect = new Affect("Protect", "Spy");

function getAffectForRole(roleName) {
    switch (roleName) {
        case Roles.Cerdic.name:
            return SpyBindAffect;
        case Roles.Cynric.name:
            affect = {name: "Protect", type: "Resistance", valid: true}
            return ResistanceProtectAffect;
        case Roles.Gaheris.name:
            return ResistanceBindAffect;
        case Roles.Geraint.name:
            affect = {name: "Protect", type: "Spy", valid: true}
            return SpyProtectAffect;
        default:
            return null;
    }
}

function isResistanceBind(playerAffect) {
    return playerAffect !== null && playerAffect.name === ResistanceBindAffect.name && playerAffect.type === ResistanceBindAffect.type;
}

function isSpyBind(playerAffect) {
    return playerAffect !== null && playerAffect.name === SpyBindAffect.name && playerAffect.type === SpyBindAffect.type;
}

module.exports = {
    getAffectForRole,
    isResistanceBind,
    isSpyBind,
    ResistanceBindAffect: ResistanceBindAffect,
    ResistanceProtectAffect: ResistanceProtectAffect,
    SpyBindAffect: SpyBindAffect,
    SpyProtectAffect: SpyProtectAffect
};