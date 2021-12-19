const Roles = require('./roles');

const ResistanceBindAffect = {
    name: "Bind",
    type: "Resistance"
};
const ResistanceProtectAffect = {
    name: "Protect",
    type: "Resistance"
};
const SpyBindAffect = {
    name: "Bind",
    type: "Spy"
};
const SpyProtectAffect = {
    name: "Protect", 
    type: "Spy"
};

function getAffectKey(affect) {
    return `${affect.type}${affect.name}`;
}

function getAffectFromRole(roleName) {
    switch (roleName) {
        case Roles.Cerdic.name:
            return SpyBindAffect;
        case Roles.Cynric.name:
            return ResistanceProtectAffect;
        case Roles.Gaheris.name:
            return ResistanceBindAffect;
        case Roles.Geraint.name:
            return SpyProtectAffect;
        default:
            return null;
    }
}

function getAffectFromKey(affectKey) {
    switch (affectKey) {
        case getAffectKey(ResistanceBindAffect):
            return ResistanceBindAffect;
        case getAffectKey(ResistanceProtectAffect):
            return ResistanceProtectAffect;
        case getAffectKey(SpyBindAffect):
            return SpyBindAffect;
        case getAffectKey(SpyProtectAffect):
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

function areEqual(affect1, affect2) {
    return affect1 && affect2 && affect1.name === affect2.name && affect1.type === affect2.type
}

module.exports = {
    getAffectKey,
    getAffectFromRole,
    getAffectFromKey,
    isResistanceBind,
    isSpyBind,
    areEqual,
    ResistanceBindAffect: ResistanceBindAffect,
    ResistanceProtectAffect: ResistanceProtectAffect,
    SpyBindAffect: SpyBindAffect,
    SpyProtectAffect: SpyProtectAffect
};