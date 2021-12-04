function Affect(name, type, sourceId=null, destinationId=null, valid=true) {
    this.name = name;
    this.type = type;
    this.sourceId = sourceId;
    this.destinationId = destinationId;
    this.valid = valid;
}

Affect.prototype.isSameAffect = function (otherAffect) {
    return otherAffect && this.name === otherAffect.name && this.type === otherAffect.type;
}

Affect.prototype.getKey = function (hideType=false) {
    return {
        name: this.name,
        type: hideType ? "Unknown" : this.type
    };
}

module.exports = Affect;