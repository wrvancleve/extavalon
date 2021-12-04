function Role(name, team, minPlayerCount = 5, maxPlayerCount = 12) {
    this.id = Role.nextId++;
    this.name = name;
    this.team = team;
    this.minPlayerCount = minPlayerCount;
    this.maxPlayerCount = maxPlayerCount;
}

Role.prototype.getIdentity = function () {
    return {
        name: this.name,
        team: this.team
    };
}

Role.prototype.getIsPossible = function (playerCount) {
    return playerCount >= this.minPlayerCount && playerCount <= this.maxPlayerCount;
}

Role.nextId = 1;

module.exports = Role;