const Affects = require('./affects');

function Proposal(leaderId, team) { 
    this.leader = leaderId;
    this.team = team === undefined ? [] : team;
    this.voteCount = 0;
    this.rejectCount = 0;
    this.votesByPlayerId = new Map();
    this.affectsByPlayerId = new Map();
    this.playerIdByAffect = new Map();
    this.blockedAffects = [];
    this.result = null;
}

Proposal.prototype.updateTeam = function(playerIds) {
    this.team = playerIds;
}

Proposal.prototype.getVote = function(id) {
    return this.votesByPlayerId.get(id);
}

Proposal.prototype.getVotes = function() {
    return this.votesByPlayerId;
}

Proposal.prototype.setVote = function(playerId, vote) {
    const newVote = !this.votesByPlayerId.has(playerId);
    this.votesByPlayerId.set(playerId, vote);
    if (newVote) {
        this.voteCount += 1;
    }
}

Proposal.prototype.hasVoted = function(playerId) {
    return this.votesByPlayerId.has(playerId);
}

Proposal.prototype.toggleAffect = function(sourceId, destinationId, affect) {
    const affectKey = Affects.getAffectKey(affect);

    // Get playerId the affect is currently on and remove it from them
    let currentPlayerIdOfAffect = null;
    if (this.playerIdByAffect.has(affectKey)) {
        currentPlayerIdOfAffect = this.playerIdByAffect.get(affectKey);
        this.playerIdByAffect.delete(affectKey);
        const currentPlayerAffects = this.affectsByPlayerId.get(currentPlayerIdOfAffect);
        if (currentPlayerAffects.length === 1) {
            this.affectsByPlayerId.delete(currentPlayerIdOfAffect);
        } else {
            for (let i = 0; i < currentPlayerAffects.length; i++) {
                if (Affects.areEqual(currentPlayerAffects[i], affect)) {
                    currentPlayerAffects.splice(i, 1);
                    break;
                }
            }
            this.affectsByPlayerId.set(currentPlayerIdOfAffect, currentPlayerAffects);
        }
    }

    if (currentPlayerIdOfAffect !== destinationId) {
        // Affect was assigned to another player
        this.playerIdByAffect.set(affectKey, destinationId);
        let destinationPlayerAffects = null;

        affect.sourceId = sourceId;
        affect.destinationId = destinationId;

        if (this.affectsByPlayerId.has(destinationId)) {
            destinationPlayerAffects = this.affectsByPlayerId.get(destinationId);
            destinationPlayerAffects.push(affect);
        } else {
            destinationPlayerAffects = [affect];
        }
        this.affectsByPlayerId.set(destinationId, destinationPlayerAffects);
    }
}

Proposal.prototype.finalize = function() {
    for (let vote of this.votesByPlayerId.values()){
        if (!vote) {
            this.rejectCount += 1;
        }
    }
    this.result = this.rejectCount < Math.ceil(this.voteCount / 2);

    if (this.result) {
        const finalizedAffectsByPlayerId = new Map();
        this.playerIdByAffect.clear();
        this.blockedAffects = [];

        for (const [playerId, affects] of this.affectsByPlayerId.entries()) {
            const finalizedPlayerAffects = [];
            
            const resistanceProtect = affects.find(affect => Affects.areEqual(Affects.ResistanceProtectAffect, affect));
            const spyProtect = affects.find(affect => Affects.areEqual(Affects.SpyProtectAffect, affect));
            const resistanceBind = affects.find(affect => Affects.areEqual(Affects.ResistanceBindAffect, affect));
            const spyBind = affects.find(affect => Affects.areEqual(Affects.SpyBindAffect, affect));
    
            let resistanceBound = resistanceBind !== undefined;
            let resistanceProtected = false;
            if (resistanceBound && (!resistanceBind.valid || resistanceProtect)) {
                resistanceProtected = true;
                resistanceBound = false;
                this.blockedAffects.push(Affects.getAffectKey(resistanceBind));
            }
    
            let spyBound = spyBind !== undefined;
            let spyProtected = false;
            if (spyBound && (!spyBind.valid || spyProtect)) {
                spyProtected = true;
                spyBound = false;
                this.blockedAffects.push(Affects.getAffectKey(spyBind));
            }
    
            if (resistanceBound && spyBound) {
                resistanceBound = false;
                spyBound = false;
                this.blockedAffects.push(Affects.getAffectKey(resistanceBind));
                this.blockedAffects.push(Affects.getAffectKey(spyBind));
            }
    
            if (resistanceBound) {
                finalizedPlayerAffects.push(resistanceBind);
                this.playerIdByAffect.set(Affects.getAffectKey(resistanceBind), playerId);
            } else if (spyBound) {
                finalizedPlayerAffects.push(spyBind);
                this.playerIdByAffect.set(Affects.getAffectKey(spyBind), playerId);
            }
    
            if (resistanceProtected) {
                if (!resistanceProtect) {
                    if (!resistanceBind.valid) {
                        // Morgana protected
                        finalizedPlayerAffects.push({
                            name: "Protect",
                            type: "Resistance",
                            sourceId: playerId,
                            destinationId: playerId,
                            bindSourceId: resistanceBind.sourceId
                        });
                    } else {
                        // Binds cancelled each other
                        finalizedPlayerAffects.push({
                            name: "Protect",
                            type: "Resistance",
                            sourceId: null,
                            destinationId: playerId,
                            bindSourceId: resistanceBind.sourceId
                        });
                    }
                } else {
                    resistanceProtect.bindSourceId = resistanceBind.sourceId;
                    finalizedPlayerAffects.push(resistanceProtect);
                }
                this.playerIdByAffect.set(Affects.getAffectKey(Affects.ResistanceProtectAffect), playerId);
            }
            if (spyProtected) {
                if (!spyProtect) {
                    // Binds cancelled each other
                    finalizedPlayerAffects.push({
                        name: "Protect",
                        type: "Spy",
                        sourceId: null,
                        destinationId: playerId,
                        bindSourceId: spyBind.sourceId
                    });
                } else {
                    spyProtect.bindSourceId = spyBind.sourceId;
                    finalizedPlayerAffects.push(spyProtect);
                }
                this.playerIdByAffect.set(Affects.getAffectKey(Affects.SpyProtectAffect), playerId);
            }
    
            if (finalizedPlayerAffects.length > 0) {
                finalizedAffectsByPlayerId.set(playerId, finalizedPlayerAffects);
            }
        }

        this.affectsByPlayerId.clear();
        for (const [playerId, affects] of finalizedAffectsByPlayerId.entries()) {
            this.affectsByPlayerId.set(playerId, affects);
        }
    } else {
        this.playerIdByAffect.clear();
        this.affectsByPlayerId.clear();
        this.blockedAffects = [];
    }
}

Proposal.prototype.getBindOnPlayerId = function(playerId) {
    const affects = this.affectsByPlayerId.get(playerId);
    if (affects && affects.length === 1 && affects[0].name === "Bind") {
        // Has only one bind, return it
        return affects[0];
    } else {
        return null;
    }
}

Proposal.prototype.getAffectOnPlayerId = function(playerId) {
    const affects = this.affectsByPlayerId.get(playerId);
    if (affects && affects.length === 1) {
        // Has only one affect, return it
        return affects[0];
    } else {
        return null;
    }
}

Proposal.prototype.hasAffectOnPlayerId = function (playerId, affect) {
    const affectKey = Affects.getAffectKey(affect);
    if (this.playerIdByAffect.has(affectKey)) {
        const playerIdOfAffect = this.playerIdByAffect.get(affectKey);
        if (playerIdOfAffect === playerId) {
            const affectsOnPlayerId = this.affectsByPlayerId.get(playerIdOfAffect);
            for (let affectOnPlayer of affectsOnPlayerId) {
                if (Affects.areEqual(affectOnPlayer, affect)) {
                    return true;
                }
            }
        }
    }

    return false;
}

Proposal.prototype.getUsedAffects = function() {
    const usedAffects = [];
    for (let affect of this.playerIdByAffect.keys()) {
        usedAffects.push(Affects.getAffectFromKey(affect));
    }
    for (let blockedAffect of this.blockedAffects) {
        usedAffects.push(Affects.getAffectFromKey(blockedAffect));
    }
    return usedAffects;
}

module.exports = Proposal;